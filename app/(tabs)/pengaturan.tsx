import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── KONFIGURASI WARNA ───────────────────────────────────────────────────────
const C = {
  bg: "#07111f",
  surface: "#0d1e33",
  surfaceHover: "#112240",
  border: "#1a3558",
  borderMuted: "#0f2542",
  textPrimary: "#f0f6ff",
  textSecondary: "#7a9bbf",
  textMuted: "#3f6080",
  accent: "#38bdf8",
  accentDim: "rgba(56,189,248,0.10)",
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.10)",
  amber: "#fbbf24",
  amberDim: "rgba(251,191,36,0.10)",
  purple: "#c084fc",
  purpleDim: "rgba(192,132,252,0.10)",
  red: "#f87171",
  redDim: "rgba(248,113,113,0.10)",
};

// ─── DATA MODAL ──────────────────────────────────────────────────────────────
type Field = { label: string; placeholder: string; secure?: boolean; defaultValue?: string };
type ModalConfig = { key: string; title: string; subtitle: string; fields: Field[]; buttonLabel: string; danger?: boolean; icon: any };

const MODALS: Record<string, ModalConfig> = {
  outlet: { key: "outlet", title: "Nama Outlet", subtitle: "Nama ini akan muncul di struk belanja.", fields: [{ label: "Nama Outlet", placeholder: "Toko Jaya Makmur", defaultValue: "Toko Jaya Makmur" }], buttonLabel: "Simpan Perubahan", icon: "storefront" },
  username: { key: "username", title: "Ganti Username", subtitle: "Gunakan nama unik untuk identitas login.", fields: [{ label: "Username", placeholder: "ahmadjaya", defaultValue: "ahmadjaya" }], buttonLabel: "Simpan Username", icon: "alternate-email" },
  nama: { key: "nama", title: "Profil Pengguna", subtitle: "Informasi nama lengkap akun kamu.", fields: [{ label: "Nama Depan", placeholder: "Ahmad", defaultValue: "Ahmad" }, { label: "Nama Belakang", placeholder: "Jaya Pratama", defaultValue: "Jaya Pratama" }], buttonLabel: "Simpan Nama", icon: "person-outline" },
  telepon: { key: "telepon", title: "Nomor Telepon", subtitle: "Untuk keamanan dan verifikasi akun.", fields: [{ label: "No. HP", placeholder: "+62 812-xxxx", defaultValue: "+62 812-3456-7890" }], buttonLabel: "Verifikasi Nomor", icon: "phone-iphone" },
  email: { key: "email", title: "Email Akun", subtitle: "Alamat email utama untuk pemulihan.", fields: [{ label: "Email", placeholder: "ahmad@email.com", defaultValue: "ahmad@email.com" }], buttonLabel: "Simpan Email", icon: "mail-outline" },
  password: { key: "password", title: "Keamanan", subtitle: "Ubah password secara berkala agar aman.", fields: [{ label: "Password Lama", placeholder: "••••••••", secure: true }, { label: "Password Baru", placeholder: "••••••••", secure: true }], buttonLabel: "Update Password", icon: "lock-outline" },
  logout: { key: "logout", title: "Keluar Sesi", subtitle: "Apakah kamu yakin ingin keluar dari aplikasi?", fields: [], buttonLabel: "Ya, Keluar", danger: true, icon: "logout" },
};

// ─── KOMPONEN BARIS (ROW) ────────────────────────────────────────────────────
function Row({ icon, iconColor, iconBg, title, subtitle, onPress, rightElement, last }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  // Handler animasi tekan (Fix Error: useNativeDriver: false untuk warna/bg)
  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 0.96, useNativeDriver: false }),
      Animated.timing(bgAnim, { toValue: 1, duration: 100, useNativeDriver: false }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: false }),
      Animated.timing(bgAnim, { toValue: 0, duration: 150, useNativeDriver: false }),
    ]).start();
  };

  const bgColor = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [C.surface, C.surfaceHover],
  });

  const content = (
    <Animated.View style={[styles.row, last && styles.rowLast, { transform: [{ scale }], backgroundColor: bgColor }]}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg, borderColor: iconColor + "33" }]}>
        <MaterialIcons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      {rightElement || (onPress && <MaterialIcons name="chevron-right" size={20} color={C.textMuted} />)}
    </Animated.View>
  );

  return onPress ? (
    <TouchableWithoutFeedback onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      {content}
    </TouchableWithoutFeedback>
  ) : content;
}

// ─── KOMPONEN MODAL ──────────────────────────────────────────────────────────
function BottomModal({ config, visible, onClose }: { config: ModalConfig | null; visible: boolean; onClose: () => void }) {
  const slideAnim = useRef(new Animated.Value(600)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : 600,
      useNativeDriver: true,
      damping: 25,
      stiffness: 200,
    }).start();
  }, [visible]);

  if (!config) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalSheet, { transform: [{ translateY: slideAnim }] }]}>
              <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeader}>
                  <View style={[styles.modalIconWrap, config.danger ? { backgroundColor: C.redDim } : { backgroundColor: C.accentDim }]}>
                    <MaterialIcons name={config.icon} size={24} color={config.danger ? C.red : C.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalTitle}>{config.title}</Text>
                    <Text style={styles.modalSub}>{config.subtitle}</Text>
                  </View>
                </View>

                {config.fields.map((f, i) => (
                  <View key={i} style={styles.fieldWrap}>
                    <Text style={styles.fieldLabel}>{f.label}</Text>
                    <TextInput style={styles.input} placeholder={f.placeholder} placeholderTextColor={C.textMuted} secureTextEntry={f.secure} defaultValue={f.defaultValue} selectionColor={C.accent} />
                  </View>
                ))}

                <TouchableOpacity style={[styles.saveBtn, config.danger && { backgroundColor: C.redDim, borderColor: C.red + "44" }]} onPress={onClose}>
                  <Text style={[styles.saveBtnText, config.danger && { color: C.red }]}>{config.buttonLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onClose} style={styles.cancelBtn}><Text style={styles.cancelText}>Batal</Text></TouchableOpacity>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── SCREEN UTAMA ────────────────────────────────────────────────────────────
export default function PengaturanScreen() {
  const [modalKey, setModalKey] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(true);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <View style={styles.avatarWrap}><Text style={styles.avatarText}>AJ</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerGreet}>Profil Saya</Text>
          <Text style={styles.headerName}>Ahmad Jaya Pratama</Text>
        </View>
        <View style={styles.premiumBadge}>
          <MaterialIcons name="verified" size={12} color={C.accent} />
          <Text style={styles.premiumText}>Premium</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Outlet & Toko</Text>
        <View style={styles.card}>
          <Row icon="storefront" iconColor={C.green} iconBg={C.greenDim} title="Nama Outlet" subtitle="Toko Jaya Makmur" onPress={() => setModalKey("outlet")} last />
        </View>

        <Text style={styles.sectionLabel}>Akun & Keamanan</Text>
        <View style={styles.card}>
          <Row icon="alternate-email" iconColor={C.accent} iconBg={C.accentDim} title="Username" subtitle="@ahmadjaya" onPress={() => setModalKey("username")} />
          <Row icon="person-outline" iconColor={C.purple} iconBg={C.purpleDim} title="Nama Lengkap" subtitle="Ahmad Jaya Pratama" onPress={() => setModalKey("nama")} />
          <Row icon="phone-iphone" iconColor={C.amber} iconBg={C.amberDim} title="Nomor Telepon" subtitle="+62 812-3456-7890" onPress={() => setModalKey("telepon")} />
          <Row icon="mail-outline" iconColor={C.accent} iconBg={C.accentDim} title="Email" subtitle="ahmad@email.com" onPress={() => setModalKey("email")} />
          <Row icon="lock-outline" iconColor={C.amber} iconBg={C.amberDim} title="Ganti Password" subtitle="Terakhir diubah 30 hari lalu" onPress={() => setModalKey("password")} last />
        </View>


        <TouchableOpacity style={styles.logoutBtn} onPress={() => setModalKey("logout")}>
          <MaterialIcons name="logout" size={18} color={C.red} />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Versi Aplikasi 2.4.1</Text>
      </ScrollView>

      <BottomModal config={modalKey ? MODALS[modalKey] : null} visible={!!modalKey} onClose={() => setModalKey(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 0.5, borderBottomColor: C.border },
  avatarWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: C.accentDim, borderWidth: 1.5, borderColor: C.accent, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 16, fontWeight: "bold", color: C.accent },
  headerGreet: { fontSize: 12, color: C.textMuted },
  headerName: { fontSize: 18, fontWeight: "bold", color: C.textPrimary },
  premiumBadge: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.accentDim, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 0.5, borderColor: C.accent + "44" },
  premiumText: { fontSize: 12, fontWeight: "bold", color: C.accent },
  scroll: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, fontWeight: "bold", textTransform: "uppercase", color: C.textMuted, marginTop: 28, marginBottom: 10, marginLeft: 4, letterSpacing: 1 },
  card: { backgroundColor: C.surface, borderRadius: 24, borderWidth: 0.5, borderColor: C.border, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 0.5, borderBottomColor: C.borderMuted },
  rowLast: { borderBottomWidth: 0 },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 0.5 },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: C.textPrimary },
  rowSub: { fontSize: 12, color: C.textMuted, marginTop: 2 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 16, borderRadius: 20, borderWidth: 0.5, borderColor: C.red + "44", backgroundColor: C.redDim, marginTop: 35 },
  logoutText: { fontSize: 15, fontWeight: "bold", color: C.red },
  versionText: { textAlign: "center", color: C.textMuted, fontSize: 12, marginTop: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, borderTopWidth: 1, borderColor: C.border },
  modalHandle: { width: 40, height: 5, backgroundColor: C.border, borderRadius: 10, alignSelf: "center", marginBottom: 25 },
  modalHeader: { flexDirection: "row", gap: 15, marginBottom: 25 },
  modalIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: C.textPrimary },
  modalSub: { fontSize: 13, color: C.textSecondary, lineHeight: 18 },
  fieldWrap: { marginBottom: 18 },
  fieldLabel: { fontSize: 12, fontWeight: "bold", color: C.textMuted, marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: C.surfaceHover, borderRadius: 14, padding: 15, color: C.textPrimary, borderWidth: 1, borderColor: C.border, fontSize: 15 },
  saveBtn: { backgroundColor: C.accent, borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 10 },
  saveBtnText: { fontWeight: "bold", color: "#000", fontSize: 16 },
  cancelBtn: { alignItems: "center", paddingVertical: 15, marginTop: 5 },
  cancelText: { color: C.textMuted, fontSize: 15 },
});