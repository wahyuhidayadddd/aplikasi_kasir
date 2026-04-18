import { MaterialIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

// ─── KONFIGURASI WARNA ──────────────────────────────────────────────────────
const C = {
  bg: "#07111f",
  surface: "#0d1e33",
  border: "#1a3558",
  textPrimary: "#f0f6ff",
  textSecondary: "#7a9bbf",
  textMuted: "#3f6080",
  accent: "#38bdf8",
  green: "#4ade80",
  amber: "#fbbf24",
  red: "#f87171",
  white: "#ffffff",
};

// ─── DATA DUMMY UNTUK PRESENTASI ───────────────────────────────────────────
const INITIAL_SUPPLIERS = [
  { id: 1, name: "PT. Sinar Jaya Abadi", inv: "INV/2026/0401", total: 5200000, status: "Pending" },
  { id: 2, name: "CV. Makmur Sentosa", inv: "INV/2026/0405", total: 1850000, status: "Pending" },
  { id: 3, name: "Distributor Sembako Medan", inv: "INV/2026/0410", total: 3400000, status: "Pending" },
];

export default function App() {
  return (
    <SafeAreaProvider>
      <MainNavigator />
    </SafeAreaProvider>
  );
}

function MainNavigator() {
  const [screen, setScreen] = useState("Home");
  const insets = useSafeAreaInsets();

  const renderContent = () => {
    switch (screen) {
      case "Home": return <HomeScreen nav={setScreen} />;
      case "Mutasi": return <MutasiScreen onBack={() => setScreen("Home")} />;
      case "Supplier": return <SupplierScreen onBack={() => setScreen("Home")} />;
      case "Rekapan": return <RekapanScreen onBack={() => setScreen("Home")} />;
      default: return <HomeScreen nav={setScreen} />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top }}>
      <StatusBar barStyle="light-content" />
      {renderContent()}
    </View>
  );
}

// ─── 1. HOME SCREEN ────────────────────────────────────────────────────────
function HomeScreen({ nav }) {
  return (
    <ScrollView style={styles.flex}>
      <View style={styles.header}>
        <View style={styles.avatarRow}>
          <View style={styles.avatar}><Text style={{color: C.accent, fontWeight: '700'}}>W</Text></View>
          <View>
            <Text style={styles.greet}>Halo, Wahyu 👋</Text>
            <Text style={styles.brand}>Owner Dashboard</Text>
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.statGrid}>
          <StatBox label="Omzet" val="Rp 2.5jt" col={C.accent} />
          <StatBox label="Lunas" val="12 Trx" col={C.green} />
          <StatBox label="Pending" val="5 Trx" col={C.amber} />
        </View>

        <Text style={styles.label}>MENU MANAJEMEN</Text>
        <View style={styles.menuGrid}>
          <MenuBtn label="Mutasi Stok" icon="inventory" col={C.green} onPress={() => nav("Mutasi")} />
          <MenuBtn label="Bayar Supplier" icon="payments" col={C.amber} onPress={() => nav("Supplier")} />
          <MenuBtn label="Rekapan" icon="bar-chart" col={C.accent} onPress={() => nav("Rekapan")} />
        </View>

        <Text style={styles.label}>PENJUALAN TERAKHIR</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Rp 2.500.000</Text>
          <Text style={{color: C.textMuted, fontSize: 12}}>Total Penjualan Hari Ini</Text>
          <View style={styles.hr} />
          <Row label="Tunai" val="Rp 1.800.000" />
          <Row label="Transfer" val="Rp 700.000" />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── 2. MUTASI STOK SCREEN (AKTIF) ─────────────────────────────────────────
function MutasiScreen({ onBack }) {
  const [tab, setTab] = useState("masuk");
  const handleSimpan = () => Alert.alert("Sukses", `Data mutasi stok ${tab} berhasil disimpan!`);

  return (
    <View style={styles.flex}>
      <Header title="Mutasi Stok" onBack={onBack} />
      <ScrollView style={styles.container}>
        <View style={styles.tabBar}>
          <TouchableOpacity style={[styles.tab, tab === "masuk" && {backgroundColor: C.green}]} onPress={() => setTab("masuk")}>
            <Text style={[styles.tabText, tab === "masuk" && {color: C.bg}]}>STOK MASUK</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tab, tab === "keluar" && {backgroundColor: C.red}]} onPress={() => setTab("keluar")}>
            <Text style={[styles.tabText, tab === "keluar" && {color: C.white}]}>STOK KELUAR</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Input label="Cari Nama Barang" placeholder="Contoh: Beras Premium" />
          <Input label="Jumlah / Qty" placeholder="0" keyboard="numeric" />
          <Input label="Keterangan" placeholder="Contoh: Retur Supplier / Barang Rusak" multiline />
          <TouchableOpacity 
            style={[styles.btnFull, {backgroundColor: tab === "masuk" ? C.green : C.red}]}
            onPress={handleSimpan}
          >
            <Text style={styles.btnFullText}>KONFIRMASI MUTASI</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── 3. BAYAR SUPPLIER SCREEN (AKTIF) ──────────────────────────────────────
function SupplierScreen({ onBack }) {
  const [data, setData] = useState(INITIAL_SUPPLIERS);

  const bayar = (id, name) => {
    Alert.alert("Konfirmasi", `Bayar tagihan ke ${name}?`, [
      { text: "Batal" },
      { text: "Ya, Bayar", onPress: () => {
        setData(data.filter(item => item.id !== id));
        Alert.alert("Berhasil", "Pembayaran telah dicatat.");
      }}
    ]);
  };

  return (
    <View style={styles.flex}>
      <Header title="Bayar Supplier" onBack={onBack} />
      <ScrollView style={styles.container}>
        <View style={[styles.card, {backgroundColor: C.amber}]}>
          <Text style={{color: '#000', fontWeight: '600'}}>Total Hutang</Text>
          <Text style={{color: '#000', fontSize: 28, fontWeight: 'bold'}}>Rp 10.450.000</Text>
        </View>

        <Text style={styles.label}>DAFTAR TAGIHAN PENDING</Text>
        {data.length > 0 ? data.map(item => (
          <View key={item.id} style={styles.itemCard}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSub}>{item.inv}</Text>
              </View>
              <View style={styles.badge}><Text style={styles.badgeText}>PENDING</Text></View>
            </View>
            <View style={styles.hr} />
            <View style={styles.rowBetween}>
              <Text style={styles.itemPrice}>Rp {item.total.toLocaleString()}</Text>
              <TouchableOpacity style={styles.btnPay} onPress={() => bayar(item.id, item.name)}>
                <Text style={styles.btnPayText}>BAYAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        )) : (
          <View style={{alignItems: 'center', marginTop: 40}}>
            <MaterialIcons name="check-circle" size={50} color={C.green} />
            <Text style={{color: C.textMuted, marginTop: 10}}>Semua tagihan lunas!</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── 4. REKAPAN SCREEN ──────────────────────────────────────────────────────
function RekapanScreen({ onBack }) {
  return (
    <View style={styles.flex}>
      <Header title="Laporan Rekapan" onBack={onBack} />
      <ScrollView style={styles.container}>
        <View style={styles.statGrid}>
          <View style={[styles.statChip, {backgroundColor: C.surface}]}>
            <Text style={styles.statLabel}>Laba Bersih</Text>
            <Text style={[styles.statVal, {color: C.green}]}>Rp 12.4jt</Text>
          </View>
          <View style={[styles.statChip, {backgroundColor: C.surface}]}>
            <Text style={styles.statLabel}>Total Pengeluaran</Text>
            <Text style={[styles.statVal, {color: C.red}]}>Rp 3.1jt</Text>
          </View>
        </View>

        <Text style={styles.label}>TOP PRODUK TERLARIS</Text>
        <View style={styles.card}>
          <Row label="1. Kopi Gula Aren" val="145 Unit" />
          <Row label="2. Indomie Double" val="98 Unit" />
          <Row label="3. Es Teh Manis" val="82 Unit" />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── HELPER COMPONENTS ─────────────────────────────────────────────────────
const Header = ({ title, onBack }) => (
  <View style={styles.headerSub}>
    <TouchableOpacity onPress={onBack}><MaterialIcons name="arrow-back" size={26} color={C.white} /></TouchableOpacity>
    <Text style={styles.headerSubTitle}>{title}</Text>
    <View style={{width: 26}} />
  </View>
);

const MenuBtn = ({ label, icon, col, onPress }) => (
  <TouchableOpacity style={styles.menuCard} onPress={onPress}>
    <View style={[styles.iconCircle, {backgroundColor: col + '20', borderColor: col + '40'}]}>
      <MaterialIcons name={icon} size={24} color={col} />
    </View>
    <Text style={styles.menuLabel}>{label}</Text>
  </TouchableOpacity>
);

const StatBox = ({ label, val, col }) => (
  <View style={styles.statChip}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statVal, {color: col}]}>{val}</Text>
  </View>
);

const Row = ({ label, val }) => (
  <View style={styles.rowBetween}>
    <Text style={{color: C.textSecondary}}>{label}</Text>
    <Text style={{color: C.white, fontWeight: 'bold'}}>{val}</Text>
  </View>
);

const Input = ({ label, placeholder, keyboard, multiline }) => (
  <View style={{marginBottom: 15}}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput 
      style={[styles.inputField, multiline && {height: 80, textAlignVertical: 'top'}]}
      placeholder={placeholder}
      placeholderTextColor={C.textMuted}
      keyboardType={keyboard || 'default'}
      multiline={multiline}
    />
  </View>
);

// ─── STYLES ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { padding: 20 },
  header: { padding: 20, backgroundColor: C.surface, borderBottomWidth: 1, borderColor: C.border },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.accent + '20', borderWidth: 1, borderColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  greet: { color: C.textMuted, fontSize: 12 },
  brand: { color: C.white, fontSize: 18, fontWeight: 'bold' },
  statGrid: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  statChip: { flex: 1, backgroundColor: C.surface, padding: 15, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  statLabel: { color: C.textMuted, fontSize: 10 },
  statVal: { fontSize: 15, fontWeight: 'bold', marginTop: 4 },
  label: { color: C.textMuted, fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginTop: 25, marginBottom: 15 },
  menuGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  menuCard: { width: '31%', backgroundColor: C.surface, padding: 15, borderRadius: 20, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  iconCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  menuLabel: { color: C.white, fontSize: 10, fontWeight: '600', textAlign: 'center' },
  card: { backgroundColor: C.surface, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: C.border },
  cardTitle: { color: C.white, fontSize: 26, fontWeight: 'bold' },
  hr: { height: 1, backgroundColor: C.border, marginVertical: 15 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  headerSub: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerSubTitle: { color: C.white, fontSize: 20, fontWeight: 'bold' },
  tabBar: { flexDirection: 'row', backgroundColor: C.surface, padding: 5, borderRadius: 15, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabText: { fontWeight: 'bold', fontSize: 12, color: C.textMuted },
  inputLabel: { color: C.textSecondary, fontSize: 12, marginBottom: 8 },
  inputField: { backgroundColor: C.bg, borderRadius: 12, padding: 15, color: C.white, borderWidth: 1, borderColor: C.border },
  btnFull: { marginTop: 10, padding: 18, borderRadius: 15, alignItems: 'center' },
  btnFullText: { fontWeight: 'bold', letterSpacing: 1 },
  itemCard: { backgroundColor: C.surface, padding: 18, borderRadius: 22, marginBottom: 15, borderWidth: 1, borderColor: C.border },
  itemTitle: { color: C.white, fontWeight: 'bold', fontSize: 16 },
  itemSub: { color: C.textMuted, fontSize: 12 },
  itemPrice: { color: C.white, fontSize: 18, fontWeight: 'bold' },
  badge: { backgroundColor: C.amber + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: C.amber },
  badgeText: { color: C.amber, fontSize: 10, fontWeight: 'bold' },
  btnPay: { backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  btnPayText: { color: C.bg, fontWeight: 'bold', fontSize: 13 },
});