import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native';
import MapView, { Marker, LongPressEvent, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { TravelPin } from './src/types';
import { loadPins, savePins } from './src/storage';
import { colors } from './src/theme';
import PinEditor from './src/PinEditor';

const INITIAL_REGION: Region = {
  latitude: -33.45,
  longitude: -70.66,
  latitudeDelta: 60,
  longitudeDelta: 60,
};

export default function App() {
  const [pins, setPins] = useState<TravelPin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TravelPin | null>(null);
  const mapRef = useRef<MapView | null>(null);

  useEffect(() => {
    loadPins().then((p) => {
      setPins(p);
      setLoading(false);
    });
  }, []);

  const persist = (next: TravelPin[]) => {
    setPins(next);
    savePins(next);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      const first = res[0];
      return { country: first?.country ?? undefined, city: first?.city ?? first?.region ?? undefined };
    } catch {
      return { country: undefined, city: undefined };
    }
  };

  const handleLongPress = async (e: LongPressEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const geo = await reverseGeocode(latitude, longitude);
    setEditing({
      id: String(Date.now()),
      title: '',
      note: '',
      status: 'visited',
      latitude,
      longitude,
      country: geo.country,
      city: geo.city,
      createdAt: Date.now(),
    });
  };

  const handleSave = (pin: TravelPin) => {
    const exists = pins.some((p) => p.id === pin.id);
    persist(exists ? pins.map((p) => (p.id === pin.id ? pin : p)) : [...pins, pin]);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    persist(pins.filter((p) => p.id !== id));
    setEditing(null);
  };

  const goToMyLocation = async () => {
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Ubicación', 'Activa el permiso de ubicación para centrar el mapa en dónde estás.');
        return;
      }
      // Primero intenta la última ubicación conocida (instantánea); si no hay, pide una nueva.
      let loc = await Location.getLastKnownPositionAsync();
      if (!loc) {
        loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      }
      if (!loc) {
        Alert.alert('Ubicación', 'No se pudo obtener tu ubicación ahora. Inténtalo de nuevo en unos segundos, al aire libre.');
        return;
      }
      mapRef.current?.animateToRegion({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.3,
        longitudeDelta: 0.3,
      });
    } catch (e) {
      Alert.alert('Ubicación', 'No se pudo obtener tu ubicación. Revisa que el GPS esté activo e inténtalo de nuevo.');
    }
  };

  const stats = useMemo(() => {
    const visited = pins.filter((p) => p.status === 'visited');
    const wishlist = pins.filter((p) => p.status === 'wishlist');
    const countries = new Set(
      visited.map((p) => p.country).filter((c): c is string => !!c)
    );
    return { visited: visited.length, wishlist: wishlist.length, countries: countries.size };
  }, [pins]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        onLongPress={handleLongPress}
      >
        {pins.map((p) => (
          <Marker
            key={p.id}
            coordinate={{ latitude: p.latitude, longitude: p.longitude }}
            pinColor={p.status === 'visited' ? colors.visited : colors.wishlist}
            title={p.title}
            description={p.note}
            onCalloutPress={() => setEditing(p)}
          />
        ))}
      </MapView>

      <SafeAreaView style={styles.header} pointerEvents="box-none">
        <View style={styles.statsCard}>
          <Stat value={stats.visited} label="Visitados" color={colors.visited} />
          <Stat value={stats.countries} label="Países" color={colors.text} />
          <Stat value={stats.wishlist} label="Por visitar" color={colors.wishlist} />
        </View>
        <Text style={styles.hint}>Mantén pulsado el mapa para añadir un lugar</Text>
      </SafeAreaView>

      <TouchableOpacity style={styles.locBtn} onPress={goToMyLocation}>
        <Text style={styles.locBtnText}>📍</Text>
      </TouchableOpacity>

      <PinEditor
        visible={!!editing}
        pin={editing}
        onClose={() => setEditing(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </View>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' },
  header: { position: 'absolute', top: Platform.OS === 'android' ? 30 : 0, left: 0, right: 0, paddingHorizontal: 14 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface + 'ee',
    borderRadius: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textDim, fontSize: 12, marginTop: 2 },
  hint: {
    color: colors.text,
    backgroundColor: colors.surface + 'cc',
    alignSelf: 'center',
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 12,
    overflow: 'hidden',
  },
  locBtn: {
    position: 'absolute',
    right: 18,
    bottom: 36,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  locBtnText: { fontSize: 24 },
});
