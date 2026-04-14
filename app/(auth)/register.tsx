import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
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
  container: { flex: 1 },

  bg: { ...StyleSheet.absoluteFillObject },

  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: width * 0.9,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20,
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
  },

  loginText: {
    textAlign: "center",
    marginTop: 20,
    color: "#4F46E5",
  },
});
export default function RegisterScreen() {
  const router = useRouter();

  const [secure, setSecure] = useState(true);
  const [secure2, setSecure2] = useState(true);

  const [form, setForm] = useState({
    usaha: "",
    nama: "",
    username: "",
    password: "",
    confirm: "",
  });

  const handleRegister = () => {
    if (
      !form.usaha ||
      !form.nama ||
      !form.username ||
      !form.password ||
      !form.confirm
    ) {
      Alert.alert("Error", "Semua field wajib diisi");
      return;
    }

    if (form.password !== form.confirm) {
      Alert.alert("Error", "Password tidak sama");
      return;
    }

    Alert.alert("Sukses", "Akun berhasil dibuat!");
router.replace("/pages/Login");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#4F46E5", "#6366F1"]}
        style={styles.bg}
      />

      <View style={styles.centerWrap}>
        <View style={styles.card}>
          <Text style={styles.title}>Daftar Akun</Text>

          {/* Nama Usaha */}
          <View style={styles.inputBox}>
            <Ionicons name="business-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Nama Usaha"
              style={styles.input}
              onChangeText={(v) => setForm({ ...form, usaha: v })}
            />
          </View>

          {/* Nama Pengguna */}
          <View style={styles.inputBox}>
            <Ionicons name="person-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Nama Pengguna"
              style={styles.input}
              onChangeText={(v) => setForm({ ...form, nama: v })}
            />
          </View>

          {/* Username */}
          <View style={styles.inputBox}>
            <Ionicons name="at-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Username (untuk login)"
              style={styles.input}
              onChangeText={(v) => setForm({ ...form, username: v })}
            />
          </View>

          {/* Password */}
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Password"
              secureTextEntry={secure}
              style={styles.input}
              onChangeText={(v) => setForm({ ...form, password: v })}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Konfirmasi Password */}
          <View style={styles.inputBox}>
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              placeholder="Konfirmasi Password"
              secureTextEntry={secure2}
              style={styles.input}
              onChangeText={(v) => setForm({ ...form, confirm: v })}
            />
            <TouchableOpacity onPress={() => setSecure2(!secure2)}>
              <Ionicons
                name={secure2 ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          {/* Button */}
          <TouchableOpacity onPress={handleRegister}>
            <LinearGradient
              colors={["#4F46E5", "#6366F1"]}
              style={styles.button}
            >
              <Text style={styles.buttonText}>Daftar</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Back ke Login */}
          <TouchableOpacity onPress={() => router.replace("/pages/Login")}>
            <Text style={styles.loginText}>
              Sudah punya akun? Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}