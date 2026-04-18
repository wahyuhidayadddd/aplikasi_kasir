import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// IMPORT PICKER-NYA DISINI
import DateTimePicker from '@react-native-community/datetimepicker';

const C = {
  bg: "#07111f",
  surface: "#0d1e33",
  surfaceHover: "#112240",
  border: "#1a3558",
  textPrimary: "#f0f6ff",
  textSecondary: "#7a9bbf",
  textMuted: "#3f6080",
  accent: "#38bdf8",
  green: "#4ade80",
  red: "#f87171",
};

export default function BiayaScreen() {
  const insets = useSafeAreaInsets();
  const [isModalVisible, setModalVisible] = useState(false);
  
  // State Tanggal (Date Object)
  const [dateStart, setDateStart] = useState(new Date());
  const [dateEnd, setDateEnd] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  // State Form
  const [type, setType] = useState<"biaya" | "pendapatan">("biaya");
  const [nominal, setNominal] = useState("");
  const [isLabaRugi, setIsLabaRugi] = useState(true);

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || (showPicker === 'start' ? dateStart : dateEnd);
    setShowPicker(null); // Tutup picker setelah pilih
    if (showPicker === 'start') setDateStart(currentDate);
    if (showPicker === 'end') setDateEnd(currentDate);
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Biaya & Pendapatan</Text>
          <Text style={styles.headerSub}>Atur pengeluaran & pemasukan lain</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="add" size={28} color={C.bg} />
        </TouchableOpacity>
      </View>

      {/* ── RANGE SELECTOR (BISA DIKLIK) ── */}
      <View style={styles.rangeContainer}>
        <Text style={styles.labelSection}>Filter Waktu (Date & Time)</Text>
        <View style={styles.rangePicker}>
          <TouchableOpacity 
            style={styles.dateBox} 
            onPress={() => setShowPicker('start')}
          >
            <MaterialIcons name="timer" size={16} color={C.accent} />
            <View>
              <Text style={styles.dateLabel}>Mulai Dari</Text>
              <Text style={styles.dateValue}>{formatFullDate(dateStart)}</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.dateBox} 
            onPress={() => setShowPicker('end')}
          >
            <MaterialIcons name="update" size={16} color={C.accent} />
            <View>
              <Text style={styles.dateLabel}>Sampai Ke</Text>
              <Text style={styles.dateValue}>{formatFullDate(dateEnd)}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Render Picker kalau showPicker tidak null */}
      {showPicker && (
        <DateTimePicker
          value={showPicker === 'start' ? dateStart : dateEnd}
          mode="datetime" // INI BIAR BISA PILIH TANGGAL + JAM
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour={true}
          onChange={onDateChange}
        />
      )}

      {/* ── SUMMARY ── */}
      <View style={styles.content}>
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderColor: C.red + "33" }]}>
            <Text style={styles.summaryLabel}>Total Biaya</Text>
            <Text style={[styles.summaryValue, { color: C.red }]}>Rp 0</Text>
          </View>
          <View style={[styles.summaryCard, { borderColor: C.green + "33" }]}>
            <Text style={styles.summaryLabel}>Total Pendapatan</Text>
            <Text style={[styles.summaryValue, { color: C.green }]}>Rp 0</Text>
          </View>
        </View>

        {/* ── EMPTY STATE ── */}
        <View style={styles.emptyContainer}>
          <MaterialIcons name="history-toggle-off" size={60} color={C.border} />
          <Text style={styles.emptyTitle}>Data Tidak Ditemukan</Text>
          <Text style={styles.emptySub}>Sesuaikan range waktu di atas.</Text>
        </View>
      </View>

      {/* ── MODAL TAMBAH (Fokus ke Nominal) ── */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Catat Transaksi</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.typeRow}>
                <TouchableOpacity style={[styles.typeBtn, type === "biaya" && { backgroundColor: C.red }]} onPress={() => setType("biaya")}>
                  <Text style={[styles.typeBtnText, type === "biaya" && { color: "#fff" }]}>Biaya</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.typeBtn, type === "pendapatan" && { backgroundColor: C.green }]} onPress={() => setType("pendapatan")}>
                  <Text style={[styles.typeBtnText, type === "pendapatan" && { color: "#fff" }]}>Pendapatan</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Nominal (Wajib) *</Text>
                <TextInput 
                  style={styles.nominalInput}
                  placeholder="Rp 0"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numeric"
                  value={nominal}
                  onChangeText={setNominal}
                  autoFocus
                />
              </View>

              <View style={styles.switchBox}>
                <View>
                  <Text style={styles.switchTitle}>Masuk Laba Rugi</Text>
                  <Text style={styles.switchSub}>Pengaruhi profit bersih otomatis</Text>
                </View>
                <Switch value={isLabaRugi} onValueChange={setIsLabaRugi} trackColor={{ false: C.border, true: C.accent }} />
              </View>

              <TouchableOpacity style={styles.btnSimpan} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnSimpanText}>SIMPAN DATA</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: C.textPrimary },
  headerSub: { fontSize: 12, color: C.textMuted },
  addBtn: { width: 50, height: 50, borderRadius: 15, backgroundColor: C.accent, alignItems: "center", justifyContent: "center" },
  
  rangeContainer: { paddingHorizontal: 20, marginBottom: 15 },
  labelSection: { fontSize: 10, fontWeight: "bold", color: C.textMuted, marginBottom: 8, letterSpacing: 1 },
  rangePicker: { backgroundColor: C.surface, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: C.border },
  dateBox: { paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 12 },
  dateLabel: { fontSize: 10, color: C.textMuted, textTransform: "uppercase" },
  dateValue: { fontSize: 14, fontWeight: "700", color: C.textPrimary, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 8, opacity: 0.5 },

  content: { flex: 1, paddingHorizontal: 20 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: C.surface, padding: 15, borderRadius: 15, borderWidth: 1 },
  summaryLabel: { fontSize: 11, color: C.textMuted },
  summaryValue: { fontSize: 15, fontWeight: "bold", marginTop: 4 },

  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 50 },
  emptyTitle: { color: C.textPrimary, fontSize: 16, fontWeight: "bold", marginTop: 15 },
  emptySub: { color: C.textMuted, fontSize: 13, marginTop: 5 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: C.surface, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHandle: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 10, alignSelf: "center", marginBottom: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: C.textPrimary },
  
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 20, backgroundColor: C.bg, padding: 5, borderRadius: 12 },
  typeBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  typeBtnText: { fontWeight: "bold", color: C.textMuted },
  
  inputBox: { marginBottom: 20 },
  inputLabel: { fontSize: 12, color: C.textMuted, marginBottom: 8 },
  nominalInput: { backgroundColor: C.bg, borderRadius: 12, padding: 15, fontSize: 24, fontWeight: "bold", color: C.textPrimary, borderWidth: 1, borderColor: C.border },

  switchBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.bg, padding: 15, borderRadius: 15, marginBottom: 25 },
  switchTitle: { color: C.textPrimary, fontWeight: "bold" },
  switchSub: { color: C.textMuted, fontSize: 11 },

  btnSimpan: { backgroundColor: C.accent, paddingVertical: 18, borderRadius: 15, alignItems: "center" },
  btnSimpanText: { color: C.bg, fontWeight: "bold", fontSize: 16 }
});