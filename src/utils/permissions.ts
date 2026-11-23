import { Alert, Linking } from 'react-native';
import { Camera } from 'expo-camera';

/**
 * Checks current camera permission status without triggering a prompt
 */
export async function checkCameraPermission(): Promise<boolean> {
  try {
    const res = await Camera.getCameraPermissionsAsync();
    return res.granted;
  } catch (error) {
    console.warn('Error checking camera permission:', error);
    return false;
  }
}

/**
 * Requests camera permission with contextual explanation
 */
export async function requestCameraPermission(): Promise<boolean> {
  try {
    const res = await Camera.requestCameraPermissionsAsync();
    return res.granted;
  } catch (error) {
    console.warn('Error requesting camera permission:', error);
    return false;
  }
}

/**
 * Shows a user-friendly alert when camera permission is denied,
 * offering a direct button to open the device Settings screen.
 */
export function showCameraPermissionAlert(onCancel?: () => void): void {
  Alert.alert(
    'Camera Permission Required',
    'Luma Torch requires access to the camera to operate the physical LED flashlight hardware.\n\nYour privacy is respected: Luma Torch never takes photos or records videos.',
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings().catch(() => {
            Alert.alert('Unable to open Settings', 'Please open system settings manually to grant camera access.');
          });
        },
      },
    ]
  );
}
