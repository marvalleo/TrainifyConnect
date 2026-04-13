import * as Application from 'expo-application';
import { Platform } from 'react-native';

export async function getDeviceId(): Promise<string> {
  if (Platform.OS === 'android') {
    return Application.getAndroidId();
  } else if (Platform.OS === 'ios') {
    const iosId = await Application.getIosIdForVendorAsync();
    return iosId || 'unknown_ios_device';
  } else {
    return 'unknown_device_type';
  }
}
