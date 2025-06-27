import { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import PrimaryButton from "../components/buttons/PrimaryButton";
import AnimatedBackground from "../components/background/AnimatedBackground";
import { AuthContext } from "../context/AuthContext";
import useAsync from "../hooks/useAsync";
import PasswordInput from "../components/inputs/PasswordInput";

export default function Register() {
  const navigation = useNavigation();
  const { register } = useContext(AuthContext);

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    gender: "",
    age: "",
    email: "",
    password: "",
  });

  const [open, setOpen] = useState(false);
  const [items] = useState([
    { label: "Male", value: "MALE" },
    { label: "Female", value: "FEMALE" },
    { label: "Non‑binary", value: "NON_BINARY" },
    { label: "Other", value: "OTHER" },
  ]);

  const set = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const {
    run: doRegister,
    loading,
    error,
    reset: resetError,
  } = useAsync(async () => {
    await register({ ...form, age: Number(form.age) });
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Registration failed", error.message ?? "Try again.");
      resetError();
    }
  }, [error, resetError]);

  const stepOneValid =
    form.firstName && form.lastName && form.gender && form.age;
  const stepTwoValid = form.email && form.password;

  const next = () => {
    if (!stepOneValid) return Alert.alert("Fill in all fields please");
    setStep(2);
  };

  const submit = () => {
    if (!stepTwoValid) return Alert.alert("Fill in email and password");
    doRegister();
  };

  return (
    <>
      <AnimatedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <KeyboardAwareScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          extraScrollHeight={100}
        >
          <Image source={require("../assets/logo.png")} style={styles.logo} />

          {step === 1 ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="First name"
                value={form.firstName}
                onChangeText={set("firstName")}
              />
              <TextInput
                style={styles.input}
                placeholder="Last name"
                value={form.lastName}
                onChangeText={set("lastName")}
              />

              <View style={styles.inputDropdown}>
                <DropDownPicker
                  open={open}
                  value={form.gender}
                  items={items}
                  setOpen={setOpen}
                  setValue={(fn) => {
                    const v = fn(form.gender);
                    set("gender")(v);
                    return v;
                  }}
                  placeholder="Select gender…"
                  style={styles.dropdown}
                  listMode="SCROLLVIEW"
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Age"
                keyboardType="number-pad"
                maxLength={3}
                value={form.age}
                onChangeText={(t) => set("age")(t.replace(/[^0-9]/g, ""))}
              />

              <PrimaryButton title="Next" onPress={next} />
            </>
          ) : (
            <>
              <TextInput
                style={styles.input}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={set("email")}
              />

              <PasswordInput
                value={form.password}
                onChangeText={set("password")}
                style={{ width: "80%" }}
              />

              <PrimaryButton
                title="Register"
                onPress={submit}
                loading={loading}
                style={{ marginVertical: 8 }}
              />

              <TouchableOpacity onPress={() => setStep(1)}>
                <Text style={styles.link}>← Back</Text>
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.footer}>
            Already have an account?{" "}
            <Text
              style={styles.link}
              onPress={() => navigation.navigate("Login")}
            >
              Login here
            </Text>
          </Text>
        </KeyboardAwareScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 10,
  },
  logo: { width: 260, height: 180, resizeMode: "contain", marginBottom: 20 },

  input: {
    width: "80%",
    padding: 15,
    marginBottom: 10,
    borderWidth: 0.5,
    borderRadius: 6,
    backgroundColor: "rgba(230,210,255,0.25)",
  },
  inputDropdown: { width: "80%", marginBottom: 10 },
  dropdown: { backgroundColor: "rgba(230,210,255,0.25)" },

  btn: {
    backgroundColor: "rgba(230,210,255,0.45)",
    borderWidth: 0.5,
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: "center",
    marginVertical: 8,
  },
  btnText: { fontSize: 16, fontWeight: "700" },

  link: { color: "purple", fontWeight: "600", textDecorationLine: "underline" },
  footer: { marginTop: 20, fontSize: 14, color: "#555", textAlign: "center" },
});
