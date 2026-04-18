import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

// ─── COLOR PALETTE ───────────────────────────────────────────────────────────
const C = {
  bg:        "#07111f",
  surface:   "#0d1e33",
  surface2:  "#112240",
  sky:       "#38bdf8",
  skyDim:    "#1a6fa8",
  emerald:   "#4ade80",
  coral:     "#f87171",
  textPri:   "#f0f6ff",
  textSec:   "#7a9bbf",
  textMuted: "#3f6080",
  border:    "#1a3a5c",
  amber:     "#fbbf24",
  purple:    "#a78bfa",
};

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface ReportDataRow {
  label: string;
  value: string;
  color?: string;
}

interface ReportItem {
  id: string;
  icon: string;
  label: string;
  sublabel: string;
  color: string;
  category: string;
  data: ReportDataRow[];
}

// ─── REPORT DATA ─────────────────────────────────────────────────────────────
const REPORTS: ReportItem[] = [
  {
    id: "pembelian",
    icon: "📦",
    label: "Pembelian",
    sublabel: "Transaksi masuk",
    color: C.sky,
    category: "Transaksi",
    data: [
      { label: "Total Pembelian", value: "Rp 48.500.000" },
      { label: "Jumlah Transaksi", value: "134 nota" },
      { label: "Rata-rata per nota", value: "Rp 362.000" },
      { label: "Supplier aktif", value: "12 supplier" },
      { label: "Nilai terbesar", value: "Rp 8.200.000" },
    ],
  },
  {
    id: "penjualan",
    icon: "🛒",
    label: "Penjualan",
    sublabel: "Omzet & transaksi",
    color: C.emerald,
    category: "Transaksi",
    data: [
      { label: "Total Penjualan", value: "Rp 72.300.000", color: C.emerald },
      { label: "Jumlah Transaksi", value: "287 nota" },
      { label: "Rata-rata per nota", value: "Rp 251.900" },
      { label: "Produk terjual", value: "1.842 pcs" },
      { label: "Pelanggan aktif", value: "64 orang" },
    ],
  },
  {
    id: "bayar-supplier",
    icon: "💸",
    label: "Bayar Supplier",
    sublabel: "Pembayaran keluar",
    color: C.coral,
    category: "Pembayaran",
    data: [
      { label: "Total Dibayar", value: "Rp 39.750.000", color: C.coral },
      { label: "Jumlah Transaksi", value: "48 kali" },
      { label: "Rata-rata", value: "Rp 828.000" },
      { label: "Sisa Hutang", value: "Rp 8.750.000", color: C.coral },
      { label: "Supplier dilunasi", value: "9 supplier" },
    ],
  },
  {
    id: "bayar-pelanggan",
    icon: "💰",
    label: "Pembayaran Pelanggan",
    sublabel: "Penerimaan piutang",
    color: C.emerald,
    category: "Pembayaran",
    data: [
      { label: "Total Diterima", value: "Rp 61.400.000", color: C.emerald },
      { label: "Jumlah Transaksi", value: "93 kali" },
      { label: "Rata-rata", value: "Rp 660.000" },
      { label: "Sisa Piutang", value: "Rp 10.900.000", color: C.amber },
      { label: "Pelanggan lunas", value: "38 orang" },
    ],
  },
  {
    id: "pembelian-produk",
    icon: "📋",
    label: "Pembelian Produk",
    sublabel: "Detail per produk",
    color: C.sky,
    category: "Produk",
    data: [
      { label: "Jenis Produk Dibeli", value: "47 SKU" },
      { label: "Volume Terbanyak", value: "Minyak Goreng 2L" },
      { label: "Nilai Terbesar", value: "Rp 12.300.000" },
      { label: "Qty Total", value: "3.841 pcs" },
      { label: "Harga Rata-rata", value: "Rp 12.630/pcs" },
    ],
  },
  {
    id: "produk-terjual",
    icon: "📊",
    label: "Produk Terjual",
    sublabel: "Performa produk",
    color: C.emerald,
    category: "Produk",
    data: [
      { label: "Total SKU Terjual", value: "82 SKU" },
      { label: "Terlaris", value: "Indomie Goreng" },
      { label: "Revenue Terbesar", value: "Rp 9.800.000" },
      { label: "Qty Terjual", value: "5.621 pcs" },
      { label: "Margin Rata-rata", value: "18,4%" },
    ],
  },
  {
    id: "hutang-supplier",
    icon: "🔴",
    label: "Hutang Supplier",
    sublabel: "Kewajiban belum lunas",
    color: C.coral,
    category: "Hutang & Piutang",
    data: [
      { label: "Total Hutang", value: "Rp 8.750.000", color: C.coral },
      { label: "Jumlah Supplier", value: "7 supplier" },
      { label: "Terbesar", value: "Rp 3.200.000", color: C.coral },
      { label: "Jatuh Tempo < 7 hari", value: "Rp 2.100.000", color: C.amber },
      { label: "Sudah Jatuh Tempo", value: "Rp 500.000", color: C.coral },
    ],
  },
  {
    id: "piutang-pelanggan",
    icon: "🟡",
    label: "Piutang Pelanggan",
    sublabel: "Tagihan belum dibayar",
    color: C.amber,
    category: "Hutang & Piutang",
    data: [
      { label: "Total Piutang", value: "Rp 10.900.000", color: C.amber },
      { label: "Jumlah Pelanggan", value: "26 pelanggan" },
      { label: "Terbesar", value: "Rp 4.500.000" },
      { label: "Jatuh Tempo < 7 hari", value: "Rp 3.200.000", color: C.amber },
      { label: "Sudah Jatuh Tempo", value: "Rp 900.000", color: C.coral },
    ],
  },
  {
    id: "jatuh-tempo",
    icon: "⏰",
    label: "Jatuh Tempo",
    sublabel: "Tagihan mendesak",
    color: C.amber,
    category: "Hutang & Piutang",
    data: [
      { label: "Total Mendekati JT", value: "Rp 5.300.000", color: C.amber },
      { label: "Hutang (< 7 hari)", value: "Rp 2.100.000", color: C.coral },
      { label: "Piutang (< 7 hari)", value: "Rp 3.200.000", color: C.emerald },
      { label: "Sudah lewat jatuh tempo", value: "Rp 1.400.000", color: C.coral },
      { label: "Transaksi terdampak", value: "14 nota" },
    ],
  },
  {
    id: "invoice-supplier",
    icon: "🧾",
    label: "Invoice Supplier",
    sublabel: "Tagihan dari supplier",
    color: C.sky,
    category: "Invoice",
    data: [
      { label: "Total Invoice", value: "48 invoice" },
      { label: "Nilai Total", value: "Rp 48.500.000" },
      { label: "Sudah Dibayar", value: "39 invoice", color: C.emerald },
      { label: "Belum Dibayar", value: "9 invoice", color: C.coral },
      { label: "Nilai Belum Bayar", value: "Rp 8.750.000", color: C.coral },
    ],
  },
  {
    id: "invoice-pelanggan",
    icon: "📄",
    label: "Invoice Pelanggan",
    sublabel: "Tagihan ke pelanggan",
    color: C.sky,
    category: "Invoice",
    data: [
      { label: "Total Invoice", value: "93 invoice" },
      { label: "Nilai Total", value: "Rp 72.300.000" },
      { label: "Sudah Lunas", value: "67 invoice", color: C.emerald },
      { label: "Belum Lunas", value: "26 invoice", color: C.coral },
      { label: "Nilai Belum Lunas", value: "Rp 10.900.000", color: C.coral },
    ],
  },
  {
    id: "persediaan",
    icon: "🏭",
    label: "Persediaan",
    sublabel: "Stok saat ini",
    color: C.purple,
    category: "Stok",
    data: [
      { label: "Total SKU", value: "124 produk" },
      { label: "Nilai Persediaan", value: "Rp 94.200.000" },
      { label: "Stok Menipis (<10)", value: "8 produk", color: C.amber },
      { label: "Stok Habis", value: "2 produk", color: C.coral },
      { label: "Perputaran Stok", value: "18 hari" },
    ],
  },
  {
    id: "koreksi-stok",
    icon: "🔧",
    label: "Koreksi Stok",
    sublabel: "Penyesuaian manual",
    color: C.amber,
    category: "Stok",
    data: [
      { label: "Total Koreksi", value: "23 entri" },
      { label: "Selisih Masuk", value: "+142 pcs", color: C.emerald },
      { label: "Selisih Keluar", value: "-87 pcs", color: C.coral },
      { label: "Nilai Dampak", value: "Rp 1.840.000" },
      { label: "Produk terkoreksi", value: "18 SKU" },
    ],
  },
  {
    id: "biaya-pendapatan",
    icon: "📈",
    label: "Biaya & Pendapatan",
    sublabel: "Lain-lain non-dagang",
    color: C.purple,
    category: "Keuangan",
    data: [
      { label: "Pendapatan Lain", value: "Rp 4.200.000", color: C.emerald },
      { label: "Total Biaya Operasional", value: "Rp 7.300.000", color: C.coral },
      { label: "Biaya Terbesar", value: "Sewa Rp 3.000.000" },
      { label: "Biaya Listrik & Air", value: "Rp 850.000" },
      { label: "Net Biaya", value: "-Rp 3.100.000", color: C.coral },
    ],
  },
  {
    id: "arus-kas",
    icon: "💹",
    label: "Arus Kas",
    sublabel: "Cash flow masuk & keluar",
    color: C.emerald,
    category: "Keuangan",
    data: [
      { label: "Kas Masuk", value: "Rp 65.600.000", color: C.emerald },
      { label: "Kas Keluar", value: "Rp 47.050.000", color: C.coral },
      { label: "Net Cash Flow", value: "Rp 18.550.000", color: C.emerald },
      { label: "Saldo Awal", value: "Rp 12.000.000" },
      { label: "Saldo Akhir", value: "Rp 30.550.000", color: C.emerald },
    ],
  },
  {
    id: "laba-rugi",
    icon: "⚖️",
    label: "Laba Rugi",
    sublabel: "Profit & loss periode",
    color: C.emerald,
    category: "Keuangan",
    data: [
      { label: "Penjualan Bersih", value: "Rp 72.300.000" },
      { label: "HPP", value: "Rp 48.500.000", color: C.coral },
      { label: "Laba Kotor", value: "Rp 23.800.000", color: C.emerald },
      { label: "Biaya Operasional", value: "Rp 7.300.000", color: C.coral },
      { label: "Laba Bersih", value: "Rp 16.500.000", color: C.emerald },
    ],
  },
];

const CATEGORIES = [
  "Semua",
  "Transaksi",
  "Pembayaran",
  "Produk",
  "Hutang & Piutang",
  "Invoice",
  "Stok",
  "Keuangan",
];

const PERIODS = [
  "Hari Ini",
  "Minggu Ini",
  "Bulan Ini",
  "Kuartal Ini",
  "Tahun Ini",
  "Custom",
];

// ─── SUMMARY BAR ─────────────────────────────────────────────────────────────
const SummaryBar = () => (
  <View style={styles.summaryRow}>
    {[
      { label: "Laba Bersih", value: "Rp 16,5 Jt", color: C.emerald },
      { label: "Arus Kas", value: "+Rp 18,5 Jt", color: C.sky },
      { label: "Hutang/Piutang", value: "Rp 19,6 Jt", color: C.amber },
    ].map((s) => (
      <View key={s.label} style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>{s.label}</Text>
        <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
      </View>
    ))}
  </View>
);

// ─── CATEGORY TAB ─────────────────────────────────────────────────────────────
interface CategoryTabProps {
  cat: string;
  active: boolean;
  onPress: () => void;
}
const CategoryTab = ({ cat, active, onPress }: CategoryTabProps) => (
  <TouchableOpacity
    style={[styles.tab, active && styles.tabActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{cat}</Text>
  </TouchableOpacity>
);

// ─── REPORT CARD ──────────────────────────────────────────────────────────────
interface ReportCardProps {
  item: ReportItem;
  onPress: () => void;
}
const ReportCard = ({ item, onPress }: ReportCardProps) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
    <View
      style={[
        styles.iconBox,
        { backgroundColor: item.color + "22", borderColor: item.color + "44" },
      ]}
    >
      <Text style={styles.iconText}>{item.icon}</Text>
    </View>
    <View style={styles.cardMid}>
      <Text style={styles.cardLabel}>{item.label}</Text>
      <Text style={styles.cardSub}>{item.sublabel}</Text>
    </View>
    <View style={[styles.chip, { borderColor: item.color + "66" }]}>
      <Text style={[styles.chipText, { color: item.color }]}>Lihat ›</Text>
    </View>
  </TouchableOpacity>
);

// ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
interface DetailModalProps {
  item: ReportItem | null;
  period: string;
  visible: boolean;
  onClose: () => void;
}
const DetailModal = ({ item, period, visible, onClose }: DetailModalProps) => {
  if (!item) return null;

  const barHeights = [40, 65, 50, 80, 55, 90, 70];
  const barDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  const handleExport = () => {
    Alert.alert(
      "Export PDF",
      `Laporan "${item.label}" periode ${period} akan di-export sebagai PDF.\n\nFile akan tersimpan di folder Download.`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Export PDF",
          onPress: () => {
            onClose();
            setTimeout(() => {
              Alert.alert(
                "✅ Berhasil",
                `Laporan_${item.id}_${period.replace(/ /g, "_")}.pdf telah disimpan.`
              );
            }, 400);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <View
              style={[
                styles.modalIconBox,
                {
                  backgroundColor: item.color + "22",
                  borderColor: item.color + "44",
                },
              ]}
            >
              <Text style={{ fontSize: 26 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle}>{item.label}</Text>
              <Text style={styles.modalPeriod}>Periode: {period}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Data rows */}
            {item.data.map((row, idx) => (
              <View key={idx} style={styles.dataRow}>
                <Text style={styles.dataLabel}>{row.label}</Text>
                <Text
                  style={[
                    styles.dataValue,
                    row.color ? { color: row.color } : {},
                  ]}
                >
                  {row.value}
                </Text>
              </View>
            ))}

            {/* Mini chart */}
            <View style={styles.chartBox}>
              <Text style={styles.chartTitle}>📉 Tren — {period}</Text>
              <View style={styles.chartBars}>
                {barHeights.map((h, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bar,
                      {
                        height: h * 0.68,
                        backgroundColor:
                          i === 5 ? item.color : item.color + "44",
                      },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.chartLabels}>
                {barDays.map((d) => (
                  <Text key={d} style={styles.chartDayLabel}>
                    {d}
                  </Text>
                ))}
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={() => Alert.alert("Bagikan", "Laporan akan dibagikan")}
            >
              <Text style={styles.shareBtnText}>⬆ Bagikan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: item.color }]}
              onPress={handleExport}
            >
              <Text style={styles.exportBtnText}>📄 Export PDF</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ─── PERIOD PICKER MODAL ──────────────────────────────────────────────────────
interface PeriodPickerProps {
  visible: boolean;
  active: string;
  onSelect: (p: string) => void;
  onClose: () => void;
}
const PeriodPicker = ({
  visible,
  active,
  onSelect,
  onClose,
}: PeriodPickerProps) => (
  <Modal
    visible={visible}
    animationType="fade"
    transparent
    onRequestClose={onClose}
  >
    <TouchableOpacity
      style={styles.periodOverlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <View style={styles.periodMenu}>
        <Text style={styles.periodMenuTitle}>Pilih Periode</Text>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[
              styles.periodOption,
              active === p && styles.periodOptionActive,
            ]}
            onPress={() => { onSelect(p); onClose(); }}
          >
            <Text
              style={[
                styles.periodOptionText,
                active === p && { color: C.sky, fontWeight: "700" },
              ]}
            >
              {p}
            </Text>
            {active === p && (
              <Text style={{ color: C.sky, fontSize: 14 }}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
export default function Laporan() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activePeriod, setActivePeriod] = useState("Bulan Ini");
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [periodVisible, setPeriodVisible] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = REPORTS.filter((r) => {
    const matchCat =
      activeCategory === "Semua" || r.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      r.label.toLowerCase().includes(q) ||
      r.sublabel.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const openReport = (item: ReportItem) => {
    setSelectedReport(item);
    setDetailVisible(true);
  };

  return (
    <View style={styles.root}>
      {/* ── TOP BAR ── */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.pageTitle}>Laporan</Text>
          <Text style={styles.pageSubtitle}>
            {filtered.length} laporan tersedia
          </Text>
        </View>
        <TouchableOpacity
          style={styles.periodBtn}
          onPress={() => setPeriodVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.periodBtnText}>{activePeriod} ▾</Text>
        </TouchableOpacity>
      </View>

      {/* ── SUMMARY ── */}
      <SummaryBar />

      {/* ── SEARCH ── */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari laporan..."
          placeholderTextColor={C.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Text style={styles.searchClear}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── CATEGORY TABS ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIES.map((cat) => (
          <CategoryTab
            key={cat}
            cat={cat}
            active={activeCategory === cat}
            onPress={() => setActiveCategory(cat)}
          />
        ))}
      </ScrollView>

      {/* ── REPORT LIST ── */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <ReportCard item={item} onPress={() => openReport(item)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 44 }}>📭</Text>
            <Text style={styles.emptyText}>Tidak ada laporan ditemukan</Text>
          </View>
        }
      />

      {/* ── MODALS ── */}
      <DetailModal
        item={selectedReport}
        period={activePeriod}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />

      <PeriodPicker
        visible={periodVisible}
        active={activePeriod}
        onSelect={setActivePeriod}
        onClose={() => setPeriodVisible(false)}
      />
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
  },
  pageTitle: {
    color: C.textPri,
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  pageSubtitle: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  periodBtn: {
    backgroundColor: C.surface2,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  periodBtnText: {
    color: C.sky,
    fontSize: 13,
    fontWeight: "600",
  },

  // SUMMARY
  summaryRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: C.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  summaryLabel: {
    color: C.textMuted,
    fontSize: 10,
    marginBottom: 4,
    textAlign: "center",
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },

  // SEARCH
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: C.textPri,
    fontSize: 14,
  },
  searchClear: {
    color: C.textMuted,
    fontSize: 16,
    paddingHorizontal: 8,
  },

  // CATEGORY TABS
  tabsScroll: {
    marginBottom: 8,
  },
  tabsContent: {
    paddingHorizontal: 16,
    gap: 6,
    paddingBottom: 2,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: {
    backgroundColor: "#1a6fa8",
    borderColor: C.sky,
  },
  tabText: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "500",
  },
  tabTextActive: {
    color: C.sky,
    fontWeight: "700",
  },

  // LIST
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 8,
  },

  // REPORT CARD
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 20,
  },
  cardMid: {
    flex: 1,
  },
  cardLabel: {
    color: C.textPri,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  cardSub: {
    color: C.textMuted,
    fontSize: 12,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // EMPTY
  emptyState: {
    alignItems: "center",
    marginTop: 60,
    gap: 10,
  },
  emptyText: {
    color: C.textMuted,
    fontSize: 14,
  },

  // DETAIL MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: C.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: C.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    color: C.textPri,
    fontSize: 18,
    fontWeight: "700",
  },
  modalPeriod: {
    color: C.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.surface2,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    color: C.textSec,
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginHorizontal: 0,
  },
  dataRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  dataLabel: {
    color: C.textSec,
    fontSize: 13,
    flex: 1,
  },
  dataValue: {
    color: C.textPri,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },

  // CHART
  chartBox: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: C.surface2,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.border,
  },
  chartTitle: {
    color: C.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 5,
    height: 60,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
  },
  chartLabels: {
    flexDirection: "row",
    marginTop: 6,
    gap: 5,
  },
  chartDayLabel: {
    flex: 1,
    textAlign: "center",
    color: C.textMuted,
    fontSize: 10,
  },

  // MODAL FOOTER
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  shareBtnText: {
    color: C.textSec,
    fontSize: 14,
    fontWeight: "600",
  },
  exportBtn: {
    flex: 2,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
  },
  exportBtnText: {
    color: "#07111f",
    fontSize: 14,
    fontWeight: "700",
  },

  // PERIOD PICKER MODAL
  periodOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  periodMenu: {
    backgroundColor: C.surface,
    borderRadius: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
  },
  periodMenuTitle: {
    color: C.textMuted,
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  periodOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  periodOptionActive: {
    backgroundColor: C.surface2,
  },
  periodOptionText: {
    color: C.textSec,
    fontSize: 15,
  },
});