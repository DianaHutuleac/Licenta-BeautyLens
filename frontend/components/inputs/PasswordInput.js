import { useState } from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PasswordInput({
  value,
  onChangeText,
  placeholder = "Password",
  style,
  ...rest
}) {
  const [show, setShow] = useState(false);

  return (
    <View style={[styles.wrap, style]}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        secureTextEntry={!show}
        value={value}
        onChangeText={onChangeText}
        {...rest}
      />
      <TouchableOpacity style={styles.eye} onPress={() => setShow((s) => !s)}>
        <Ionicons name={show ? "eye-off" : "eye"} size={20} color="#5b2a86" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    position: "relative",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 15,
    paddingRight: 45,
    borderWidth: 0.5,
    borderRadius: 6,
    backgroundColor: "rgba(230,210,255,0.25)",
  },
  eye: {
    position: "absolute",
    right: 15,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
});
