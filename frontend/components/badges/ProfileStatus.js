import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { toTitle } from "../../utils/format";

export default function ProfileStatus({ skinType, onPress }) {
  const completed = Boolean(skinType);

  const icon = completed ? "checkmark-circle" : "alert-circle";
  const text = completed
    ? `Profile · ${toTitle(skinType)} skin`
    : "Complete your profile";

  const gradient = completed ? ["#D0F2E2", "#ECFDF6"] : ["#FFF4D9", "#FFF9EE"];

  const textColor = completed ? "#116C4E" : "#8B6D00";

  return (
    <TouchableOpacity
      style={styles.shadow}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient colors={gradient} style={styles.pill}>
        <Ionicons name={icon} size={18} color={textColor} />
        <Text style={[styles.text, { color: textColor }]} numberOfLines={1}>
          {text}
        </Text>
        {!completed && (
          <Ionicons
            name="chevron-forward"
            size={18}
            color={textColor}
            style={{ marginLeft: 2 }}
          />
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  shadow: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginTop: 18,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 15,
    borderRadius: 30,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
    maxWidth: 220,
  },
});
