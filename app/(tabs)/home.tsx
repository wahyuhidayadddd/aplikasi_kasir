import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Palette ────────────────────────────────────────────────────────────────
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
  accentDim: "rgba(56,189,248,0.1)",
  green: "#4ade80",
  greenDim: "rgba(74,222,128,0.1)",
  amber: "#fbbf24",
  amberDim: "rgba(251,191,36,0.1)",
  pink: "#f472b6",
  pinkDim: "rgba(244,114,182,0.1)",
  purple: "#c084fc",
  purpleDim: "rgba(192,132,252,0.1)",
  cyan: "#22d3ee",
  cyanDim: "rgba(34,211,238,0.1)",
  blue: "#60a5fa",
  blueDim: "rgba(96,165,250,0.1)",
};

// ─── Menu items ──────────────────────────────────────────────────────────────
const menu = [
  {
    title: "Pembelian",
    icon: "shopping-cart",
    color: C.blue,
    bg: C.blueDim,
  },
  {
    title: "Mutasi Stok",
    icon: "inventory",
    color: C.green,
    bg: C.greenDim,
  },
  {
    title: "Master Produk",
    icon: "category",
    color: C.purple,
    bg: C.purpleDim,
  },
  {
    title: "Bayar Supplier",
    icon: "payments",
    color: C.amber,
    bg: C.amberDim,
  },
  {
    title: "Pelanggan Bayar",
    icon: "people",
    color: C.pink,
    bg: C.pinkDim,
  },
  {
    title: "Rekapan",
    icon: "bar-chart",
    color: C.cyan,
    bg: C.cyanDim,
  },
];

// ─── Main ────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View
        style={{
          backgroundColor: C.surface,
          paddingHorizontal: 20,
          paddingTop: 52,
          paddingBottom: 20,
          borderBottomWidth: 0.5,
          borderBottomColor: C.border,
        }}
      >
        {/* Top row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          {/* Avatar + greeting */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: C.accentDim,
                borderWidth: 1.5,
                borderColor: C.accent,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{ color: C.accent, fontSize: 14, fontWeight: "600" }}
              >
                AD
              </Text>
            </View>
            <View>
              <Text style={{ color: C.textMuted, fontSize: 11 }}>
                Selamat datang kembali wahyu citut 👋
              </Text>
              <Text
                style={{
                  color: C.textPrimary,
                  fontSize: 17,
                  fontWeight: "700",
                  marginTop: 1,
                }}
              >
                Dashboard
              </Text>
            </View>
          </View>

          {/* Notification bell */}
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              backgroundColor: C.surfaceHover,
              borderWidth: 0.5,
              borderColor: C.border,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="notifications-none" size={20} color={C.textSecondary} />
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                width: 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: "#f43f5e",
                borderWidth: 1.5,
                borderColor: C.surface,
              }}
            />
          </View>
        </View>

        {/* Stat chips row */}
        <View style={{ flexDirection: "row", gap: 8 }}>
          <StatChip label="Hari Ini" value="Rp 2,5jt" valueColor={C.accent} />
          <StatChip label="Lunas" value="12 trx" valueColor={C.green} />
          <StatChip label="Pending" value="5 trx" valueColor={C.amber} />
        </View>
      </View>

      {/* ── Scrollable Body ── */}
      <ScrollView
        style={{ paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Menu Utama */}
        <SectionLabel text="Menu Utama" />

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 20,
          }}
        >
          {menu.map((item, i) => (
            <MenuCard key={i} item={item} />
          ))}
        </View>

        {/* Section: Penjualan */}
        <SectionLabel text="Penjualan Hari Ini" />

        <View
          style={{
            backgroundColor: C.surface,
            borderRadius: 20,
            padding: 18,
            borderWidth: 0.5,
            borderColor: C.border,
            marginBottom: 12,
          }}
        >
          {/* Top: amount + date */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 14,
            }}
          >
            <View>
              <Text style={{ color: C.textMuted, fontSize: 11, marginBottom: 4 }}>
                Total penjualan
              </Text>
              <Text
                style={{
                  color: C.textPrimary,
                  fontSize: 26,
                  fontWeight: "700",
                  letterSpacing: -0.5,
                }}
              >
                Rp 2.500.000
              </Text>
              {/* Growth badge */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  marginTop: 6,
                  alignSelf: "flex-start",
                  backgroundColor: C.greenDim,
                  borderRadius: 6,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <MaterialIcons name="trending-up" size={12} color={C.green} />
                <Text style={{ color: C.green, fontSize: 11, fontWeight: "600" }}>
                  +14% dari kemarin
                </Text>
              </View>
            </View>

            <View
              style={{
                backgroundColor: C.surfaceHover,
                borderRadius: 8,
                borderWidth: 0.5,
                borderColor: C.borderMuted,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text style={{ color: C.textMuted, fontSize: 10 }}>
                15 Apr 2026
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View
            style={{
              height: 0.5,
              backgroundColor: C.borderMuted,
              marginBottom: 12,
            }}
          />

          {/* Rows */}
          <SalesRow
            label="Lunas"
            sub="12 transaksi"
            amount="Rp 1.800.000"
            color={C.green}
          />
          <SalesRow
            label="Belum Lunas"
            sub="5 transaksi"
            amount="Rp 700.000"
            color={C.amber}
          />

          {/* Progress bar */}
          <View style={{ marginTop: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <Text style={{ color: C.textMuted, fontSize: 10 }}>
                Tingkat pelunasan
              </Text>
              <Text style={{ color: C.textSecondary, fontSize: 10 }}>72%</Text>
            </View>
            <View
              style={{
                height: 5,
                backgroundColor: C.borderMuted,
                borderRadius: 99,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  width: "72%",
                  height: "100%",
                  borderRadius: 99,
                  backgroundColor: C.accent,
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatChip({ label, value, valueColor }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: C.surfaceHover,
        borderRadius: 12,
        borderWidth: 0.5,
        borderColor: C.borderMuted,
        paddingHorizontal: 10,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: C.textMuted, fontSize: 10, marginBottom: 3 }}>
        {label}
      </Text>
      <Text style={{ color: valueColor, fontSize: 13, fontWeight: "700" }}>
        {value}
      </Text>
    </View>
  );
}

function SectionLabel({ text }) {
  return (
    <Text
      style={{
        color: C.textMuted,
        fontSize: 10,
        fontWeight: "700",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginTop: 18,
        marginBottom: 10,
      }}
    >
      {text}
    </Text>
  );
}

function MenuCard({ item }) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={{
        width: "47.5%",
        backgroundColor: C.surface,
        borderRadius: 18,
        padding: 14,
        borderWidth: 0.5,
        borderColor: C.border,
        gap: 10,
      }}
    >
      {/* Icon bubble */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 13,
          backgroundColor: item.bg,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 0.5,
          borderColor: item.color + "33",
        }}
      >
        <MaterialIcons name={item.icon} size={20} color={item.color} />
      </View>

      <Text
        style={{
          color: C.textPrimary,
          fontSize: 13,
          fontWeight: "600",
          letterSpacing: 0.1,
        }}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
}

function SalesRow({ label, sub, amount, color }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
      }}
    >
      <View>
        <Text style={{ color: C.textPrimary, fontSize: 13, fontWeight: "500" }}>
          {label}
        </Text>
        <Text style={{ color: C.textMuted, fontSize: 10, marginTop: 2 }}>
          {sub}
        </Text>
      </View>
      <Text style={{ color: color, fontSize: 13, fontWeight: "700" }}>
        {amount}
      </Text>
    </View>
  );
}