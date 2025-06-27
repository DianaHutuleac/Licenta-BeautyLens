// components/layout/ActionRow.js
import { View, StyleSheet } from "react-native";
import CircleButton from "../buttons/CircleButton";

export default function ActionRow({ onCamera, onGallery }) {
  return (
    <View style={styles.row}>
      <CircleButton icon="camera" onPress={onCamera} />
      <CircleButton icon="images" onPress={onGallery} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 16, marginVertical: 12 },
});
