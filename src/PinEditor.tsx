import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { TravelPin, PinStatus } from './types';
import { colors } from './theme';

interface Props {
  visible: boolean;
  pin: TravelPin | null;
  onClose: () => void;
  onSave: (pin: TravelPin) => void;
  onDelete: (id: string) => void;
}

export default function PinEditor({ visible, pin, onClose, onSave, onDelete }: Props) {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<PinStatus>('visited');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (pin) {
      setTitle(pin.title);
      setNote(pin.note);
      setStatus(pin.status);
      setPhotoUri(pin.photoUri);
    }
  }, [pin]);

  if (!pin) return null;

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso', 'Necesito acceso a tus fotos para adjuntar una imagen.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.6,
    });
    if (!res.canceled && res.assets.length > 0) {
      setPhotoUri(res.assets[0].uri);
    }
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Falta el nombre', 'Ponle un nombre al lugar.');
      return;
    }
    onSave({ ...pin, title: title.trim(), note: note.trim(), status, photoUri });
  };

  const confirmDelete = () => {
    Alert.alert('Eliminar', `¿Borrar "${pin.title || 'este lugar'}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(pin.id) },
    ]);
  };

  const place = [pin.city, pin.country].filter(Boolean).join(', ');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.heading}>{pin.title ? 'Editar lugar' : 'Nuevo lugar'}</Text>
            {place ? <Text style={styles.sub}>{place}</Text> : null}
            <Text style={styles.coords}>
              {pin.latitude.toFixed(4)}, {pin.longitude.toFixed(4)}
            </Text>

            <View style={styles.statusRow}>
              <StatusButton
                label="Visitado"
                active={status === 'visited'}
                color={colors.visited}
                onPress={() => setStatus('visited')}
              />
              <StatusButton
                label="Por visitar"
                active={status === 'wishlist'}
                color={colors.wishlist}
                onPress={() => setStatus('wishlist')}
              />
            </View>

            <Text style={styles.label}>Nombre</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Ej: Machu Picchu"
              placeholderTextColor={colors.textDim}
            />

            <Text style={styles.label}>Nota</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={note}
              onChangeText={setNote}
              placeholder="Recuerdos, fecha, con quién fuiste…"
              placeholderTextColor={colors.textDim}
              multiline
            />

            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photo} />
            ) : null}
            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
              <Text style={styles.photoBtnText}>
                {photoUri ? '📷 Cambiar foto' : '📷 Añadir foto'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Guardar</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.cancel}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete}>
                <Text style={styles.delete}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function StatusButton({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.statusBtn,
        { borderColor: color },
        active && { backgroundColor: color },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.statusText, active && { color: '#06141c', fontWeight: '700' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '88%',
  },
  heading: { color: colors.text, fontSize: 20, fontWeight: '700' },
  sub: { color: colors.primary, marginTop: 2, fontSize: 14 },
  coords: { color: colors.textDim, marginTop: 2, fontSize: 12 },
  statusRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statusBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statusText: { color: colors.text, fontSize: 14 },
  label: { color: colors.textDim, marginTop: 16, marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  photo: { width: '100%', height: 170, borderRadius: 12, marginTop: 14 },
  photoBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoBtnText: { color: colors.text, fontSize: 14 },
  saveBtn: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#06141c', fontSize: 16, fontWeight: '700' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 8,
  },
  cancel: { color: colors.textDim, fontSize: 15 },
  delete: { color: colors.danger, fontSize: 15, fontWeight: '600' },
});
