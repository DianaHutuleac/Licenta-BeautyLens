import { TouchableOpacity, ActivityIndicator, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./buttonStyles";

export default function PrimaryButton({
  title,
  onPress,
  loading,
  icon,
  style,
}) {
  return (
    <TouchableOpacity
      style={[styles.primary, loading && { opacity: 0.6 }, style]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={20} color="#fff" />}
          <Text style={styles.primaryText}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
