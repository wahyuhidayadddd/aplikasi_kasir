import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  bg: {
    ...StyleSheet.absoluteFillObject,
  },

  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  logo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    letterSpacing: 1,
  },

  tagline: {
    color: "#E0E7FF",
    marginTop: 6,
  },

  card: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
    color: "#111827",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    marginBottom: 15,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    color: "#111827",
  },

  button: {
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  or: {
    marginHorizontal: 10,
    color: "#9CA3AF",
  },

  register: {
    textAlign: "center",
    color: "#6B7280",
  },
});
export default function LoginScreen({ goRegister }) {
  const router = useRouter();
  const [secure, setSecure] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={["#4F46E5", "#6366F1", "#818CF8"]}
        style={styles.bg}
      />

      {/* Center Content */}
      <View style={styles.centerWrap}>
        {/* Logo / Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>KasirApp</Text>
          <Text style={styles.tagline}>Kelola bisnis lebih mudah</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Masuk</Text>

          {/* Email */}
          <View style={styles.inputBox}>
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
            />
          </View>

          {/* Password */}
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={secure}
              style={styles.input}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Button */}
   <TouchableOpacity
  activeOpacity={0.8}
  onPress={() => router.replace("/home")}
>
  <LinearGradient
    colors={["#4F46E5", "#6366F1"]}
    style={styles.button}
  >
    <Text style={styles.buttonText}>Login</Text>
  </LinearGradient>
</TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerWrap}>
            <View style={styles.line} />
            <Text style={styles.or}>atau</Text>
            <View style={styles.line} />
          </View>

          {/* Register */}
<TouchableOpacity onPress={() => goRegister && goRegister()}>
  <Text style={styles.register}>
    Belum punya akun? <Text style={{ fontWeight: "700" }}>Daftar</Text>
  </Text>
</TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}