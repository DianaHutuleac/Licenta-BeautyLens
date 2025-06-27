import { useState, useEffect } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AnimatedBackground from "../components/background/AnimatedBackground";
import PasswordInput from "../components/inputs/PasswordInput";
import PrimaryButton from "../components/buttons/PrimaryButton";
import useAsync from "../hooks/useAsync";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const navigation = useNavigation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  const {
    run: handleLogin,
    loading,
    error,
    reset: resetError,
  } = useAsync(() => login(email, pwd));

  useEffect(() => {
    if (error) {
      Alert.alert("Login failed", error.message ?? "Unknown error");
      resetError();
    }
  }, [error, resetError]);

  return (
    <>
      <AnimatedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Image source={require("../assets/logo.png")} style={styles.logo} />

          <TextInput
            style={styles.emailInput}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <PasswordInput
            value={pwd}
            onChangeText={setPwd}
            style={{ width: "80%" }}
          />

          <PrimaryButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: 12 }}
          />

          <Text style={styles.footer}>
            Don't have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Register")}
            >
              Register here
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: { width: 300, height: 200, resizeMode: "contain", marginBottom: 25 },

  emailInput: {
    width: "80%",
    padding: 15,
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 6,
    backgroundColor: "rgba(230,210,255,0.25)",
  },

  link: {
    color: "#5b2a86",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  footer: { marginTop: 20, fontSize: 14, color: "#555", textAlign: "center" },
});
