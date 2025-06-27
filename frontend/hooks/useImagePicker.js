import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export default function useImagePicker() {
    const [photo, setPhoto] = useState(null);

    const pick = async (source) => {
        const perm = source === 'camera'
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (perm.status !== 'granted') {
            Alert.alert('Permission needed', 'Allow camera or gallery access.');
            return;
        }

        const result = source === 'camera'
            ? await ImagePicker.launchCameraAsync({ allowsEditing: false })
            : await ImagePicker.launchImageLibraryAsync({ allowsEditing: false });

        if (!result.canceled) setPhoto(result.assets[0].uri);
    };

    return { photo, setPhoto, pick };
}
