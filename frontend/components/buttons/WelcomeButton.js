import { TouchableOpacity, Text, View } from "react-native";
import styles from "./buttonStyles";

export default function WelcomeButton({ title, onPress, style, textStyle }) {
  return (
    <TouchableOpacity style={[styles.welcomeButton, style]} onPress={onPress}>
      <View style={styles.row}>
        <Text style={[styles.welcomeText, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}
