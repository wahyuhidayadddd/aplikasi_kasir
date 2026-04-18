import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
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

// Color Palette
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

interface Transaction {
  id: string;
  type: "biaya" | "pendapatan";
  nominal: number;
  note: string;
  isLabaRugi: boolean;
  createdAt: Date;
}

export default function BiayaScreen() {
  const insets = useSafeAreaInsets();
  
  // ── STATE CRUD ──
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isModalVisible, setModalVisible] = useState(false);
  
  // State Form
  const [type, setType] = useState<"biaya" | "pendapatan">("biaya");
  const [nominal, setNominal] = useState("");
  const [note, setNote] = useState("");
  const [isLabaRugi, setIsLabaRugi] = useState(true);

  // Filter Tanggal
  const [dateStart, setDateStart] = useState(new Date(new Date().setHours(0,0,0,0)));
  const [dateEnd, setDateEnd] = useState(new Date());
  const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

  // ── LOGIC ──
  const addTransaction = () => {
    if (!nominal || isNaN(Number(nominal))) {
      return Alert.alert("Error", "Masukkan nominal yang valid");
    }

    const newTrx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      nominal: Number(nominal),
      note: note || (type === 'biaya' ? 'Pengeluaran' : 'Pemasukan'),
      isLabaRugi,
      createdAt: new Date(),
    };

    setTransactions([newTrx, ...transactions]);
    setModalVisible(false);
    setNominal("");
    setNote("");
  };

  const deleteTransaction = (id: string) => {
    Alert.alert("Hapus Data", "Yakin ingin menghapus catatan ini?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Hapus", 
        style: "destructive", 
        onPress: () => setTransactions(transactions.filter(t => t.id !== id)) 
      },
    ]);
  };

  const totalBiaya = transactions
    .filter(t => t.type === 'biaya')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPendapatan = transactions
    .filter(t => t.type === 'pendapatan')
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const formatCurrency = (num: number) => {
    return "Rp " + num.toLocaleString('id-ID');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cash Flow</Text>
          <Text style={styles.headerSub}>Kelola keuanganmu dengan rapi</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <MaterialIcons name="add" size={28} color={C.bg} />
        </TouchableOpacity>
      </View>

      {/* ── SUMMARY CARD ── */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: C.red + "33" }]}>
          <Text style={styles.summaryLabel}>Total Biaya</Text>
          <Text style={[styles.summaryValue, { color: C.red }]}>{formatCurrency(totalBiaya)}</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: C.green + "33" }]}>
          <Text style={styles.summaryLabel}>Total Pendapatan</Text>
          <Text style={[styles.summaryValue, { color: C.green }]}>{formatCurrency(totalPendapatan)}</Text>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={styles.labelSection}>RIWAYAT TRANSAKSI</Text>
        
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="history-toggle-off" size={60} color={C.border} />
              <Text style={styles.emptyTitle}>Belum ada transaksi</Text>
              <Text style={styles.emptySub}>Klik tombol + untuk menambah data</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.trxItem}>
              <View style={[styles.iconCircle, { backgroundColor: item.type === 'biaya' ? C.red + '20' : C.green + '20' }]}>
                <MaterialIcons 
                  name={item.type === 'biaya' ? "call-made" : "call-received"} 
                  size={20} 
                  color={item.type === 'biaya' ? C.red : C.green} 
                />
              </View>
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.trxNote}>{item.note}</Text>
                <Text style={styles.trxDate}>
                  {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.isLabaRugi ? 'Laba Rugi' : 'Non-LR'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.trxAmount, { color: item.type === 'biaya' ? C.red : C.green }]}>
                  {item.type === 'biaya' ? '-' : '+'} {formatCurrency(item.nominal)}
                </Text>
                <TouchableOpacity onPress={() => deleteTransaction(item.id)} style={styles.delBtn}>
                  <MaterialIcons name="delete-outline" size={18} color={C.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>

      {/* ── MODAL ADD ── */}
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
                <TouchableOpacity 
                    style={[styles.typeBtn, type === "biaya" && { backgroundColor: C.red }]} 
                    onPress={() => setType("biaya")}>
                  <Text style={[styles.typeBtnText, type === "biaya" && { color: "#fff" }]}>Biaya</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.typeBtn, type === "pendapatan" && { backgroundColor: C.green }]} 
                    onPress={() => setType("pendapatan")}>
                  <Text style={[styles.typeBtnText, type === "pendapatan" && { color: "#fff" }]}>Pendapatan</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Nominal *</Text>
                <TextInput 
                  style={styles.nominalInput}
                  placeholder="Rp 0"
                  placeholderTextColor={C.textMuted}
                  keyboardType="numeric"
                  value={nominal}
                  onChangeText={setNominal}
                />
              </View>

              <View style={styles.inputBox}>
                <Text style={styles.inputLabel}>Keterangan</Text>
                <TextInput 
                  style={[styles.nominalInput, { fontSize: 16, paddingVertical: 12 }]}
                  placeholder="Contoh: Bayar Listrik"
                  placeholderTextColor={C.textMuted}
                  value={note}
                  onChangeText={setNote}
                />
              </View>

              <View style={styles.switchBox}>
                <View>
                  <Text style={styles.switchTitle}>Masuk Laba Rugi</Text>
                  <Text style={styles.switchSub}>Pengaruhi profit bersih otomatis</Text>
                </View>
                <Switch 
                    value={isLabaRugi} 
                    onValueChange={setIsLabaRugi} 
                    trackColor={{ false: C.border, true: C.accent }} 
                />
              </View>

              <TouchableOpacity style={styles.btnSimpan} onPress={addTransaction}>
                <Text style={styles.btnSimpanText}>SIMPAN TRANSAKSI</Text>
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
  headerTitle: { fontSize: 24, fontWeight: "800", color: C.textPrimary },
  headerSub: { fontSize: 13, color: C.textMuted },
  addBtn: { width: 56, height: 56, borderRadius: 18, backgroundColor: C.accent, alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: C.accent, shadowOpacity: 0.3, shadowRadius: 10 },
  
  summaryRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 25 },
  summaryCard: { flex: 1, backgroundColor: C.surface, padding: 16, borderRadius: 20, borderWidth: 1 },
  summaryLabel: { fontSize: 11, color: C.textMuted, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "800" },

  listSection: { flex: 1, paddingHorizontal: 20 },
  labelSection: { fontSize: 11, fontWeight: "bold", color: C.textMuted, marginBottom: 15, letterSpacing: 1.5 },
  
  trxItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, padding: 14, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: C.border },
  iconCircle: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  trxNote: { fontSize: 15, fontWeight: '700', color: C.textPrimary },
  trxDate: { fontSize: 11, color: C.textMuted, marginTop: 2 },
  trxAmount: { fontSize: 14, fontWeight: '800' },
  delBtn: { marginTop: 5, padding: 4 },

  emptyContainer: { alignItems: "center", justifyContent: "center", marginTop: 60 },
  emptyTitle: { color: C.textPrimary, fontSize: 16, fontWeight: "bold", marginTop: 15 },
  emptySub: { color: C.textMuted, fontSize: 13, marginTop: 5 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: C.surface, borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, maxHeight: '85%' },
  modalHandle: { width: 40, height: 4, backgroundColor: C.border, borderRadius: 10, alignSelf: "center", marginBottom: 20 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 25 },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: C.textPrimary },
  
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 25, backgroundColor: C.bg, padding: 6, borderRadius: 15 },
  typeBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  typeBtnText: { fontWeight: "bold", color: C.textMuted },
  
  inputBox: { marginBottom: 20 },
  inputLabel: { fontSize: 12, fontWeight: '600', color: C.textMuted, marginBottom: 8, marginLeft: 4 },
  nominalInput: { backgroundColor: C.bg, borderRadius: 15, padding: 16, fontSize: 22, fontWeight: "bold", color: C.textPrimary, borderWidth: 1, borderColor: C.border },

  switchBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.bg, padding: 18, borderRadius: 20, marginBottom: 30 },
  switchTitle: { color: C.textPrimary, fontWeight: "bold" },
  switchSub: { color: C.textMuted, fontSize: 11, marginTop: 2 },

  btnSimpan: { backgroundColor: C.accent, paddingVertical: 18, borderRadius: 20, alignItems: "center", shadowColor: C.accent, shadowOpacity: 0.2, shadowRadius: 10, elevation: 3 },
  btnSimpanText: { color: C.bg, fontWeight: "900", fontSize: 16, letterSpacing: 1 }
});