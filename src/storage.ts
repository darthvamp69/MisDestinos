import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelPin } from './types';

const KEY = '@pin_travel/pins/v1';

export async function loadPins(): Promise<TravelPin[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? (data as TravelPin[]) : [];
  } catch (e) {
    console.warn('loadPins failed', e);
    return [];
  }
}

export async function savePins(pins: TravelPin[]): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(pins));
  } catch (e) {
    console.warn('savePins failed', e);
  }
}
