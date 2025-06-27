// src/components/buttons/CircleButton.js
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./buttonStyles";

export default function CircleButton({
  icon,
  onPress,
  size = 24,
  color = "#4B007D",
}) {
  return (
    <TouchableOpacity style={styles.circle} onPress={onPress}>
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}
