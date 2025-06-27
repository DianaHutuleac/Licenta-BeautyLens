import { View, Image, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AnimatedBackground from "../components/background/AnimatedBackground";
import WelcomeButton from "../components/buttons/WelcomeButton";

export default function Welcome() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <AnimatedBackground />

      <View style={styles.content}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />

        <WelcomeButton
          title="Sign in"
          variant="welcome"
          onPress={() => navigation.navigate("Login")}
          style={styles.btn}
        />

        <WelcomeButton
          title="Register"
          variant="welcome"
          onPress={() => navigation.navigate("Register")}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: { width: 300, height: 200, resizeMode: "contain", marginBottom: 40 },
  btn: { width: "50%", marginVertical: 8 },
});
