# Mis Destinos

App móvil personal (iOS/Android) tipo *Pin Traveler*: un **mapa del mundo** donde
marcas los lugares que has **visitado** y los que quieres visitar (**wishlist**),
con **foto**, **nota** y **estadísticas** (visitados, países, por visitar).

Todo se guarda **en tu teléfono** (AsyncStorage). Sin servidor, sin cuenta, sin costo.
App independiente — no tiene relación con ningún otro proyecto.

## Stack

- **Expo / React Native** (SDK 58, TypeScript)
- `react-native-maps` — mapa + marcadores
- `expo-location` — "mi ubicación" + país/ciudad del pin (reverse geocoding)
- `expo-image-picker` — foto del lugar
- `@react-native-async-storage/async-storage` — guardado local

## Instalar en tu iPhone con Xcode (tienes Mac)

Requisitos en el Mac (una vez): **Xcode**, **Node 18+**, **CocoaPods**
(`sudo gem install cocoapods`), y tu **Apple ID** en Xcode → Settings → Accounts.

```bash
git clone https://github.com/darthvamp69/MisDestinos.git
cd MisDestinos
npm install
# conecta el iPhone por cable USB, luego:
npx expo run:ios --device
```

- Compila e **instala la app con su ícono** en el iPhone conectado.
- Si pide **Team** para firmar: elige tu Apple ID (el gratuito sirve). El bundle id
  es `com.josemarinao.pintravel` (cámbialo si Xcode pide uno único).
- Primera vez en el iPhone: **Ajustes → General → VPN y gestión de dispositivos** →
  confía en tu certificado de desarrollador.

> Con Apple ID **gratuito** la app dura **7 días** (vuelves a correr el comando para
> renovar). Con cuenta **Apple Developer** (99 USD/año) dura 1 año y puedes subirla
> a TestFlight / App Store.
>
> **Mapa en iOS:** usa **Apple Maps**, no necesita API key.

## Probar sin compilar (opcional, Expo Go)

```bash
npm install
npx expo start
```
Escanea el QR con **Expo Go** (mismo WiFi) y corre al instante.

## Uso

- **Mantén pulsado** el mapa para crear un lugar.
- Elige **Visitado** / **Por visitar**, nombre, nota y foto → **Guardar**.
- Toca un pin y su globo para **editar/borrar**.
- Botón 📍 centra el mapa en tu ubicación.

## Estructura

```
App.tsx            Pantalla principal: mapa, estadísticas, botón ubicación
src/types.ts       Modelo del pin
src/storage.ts     Guardado/carga local
src/PinEditor.tsx  Modal para crear/editar/borrar un lugar
src/theme.ts       Colores
```
