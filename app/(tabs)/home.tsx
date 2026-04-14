import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#1e293b",
          paddingHorizontal: 20,
          paddingTop: 50,
          paddingBottom: 20,
          borderBottomLeftRadius: 28,
          borderBottomRightRadius: 28,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>
          Dashboard
        </Text>
        <Text style={{ color: "#94a3b8", marginTop: 4 }}>
          Welcome back 👋
        </Text>
      </View>

<ScrollView
  style={{ paddingHorizontal: 16 }}
  contentContainerStyle={{ paddingBottom: 120 }} // 🔥 wajib
>
        <Text style={{ color: "#cbd5f5", marginTop: 16, marginBottom: 10 }}>
          Menu Utama
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {menu.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                width: "48%",
                backgroundColor: "#1e293b",
                padding: 14,
                borderRadius: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: "#334155",
              }}
            >
              <View
                style={{
                  backgroundColor: item.color,
                  padding: 10,
                  borderRadius: 10,
                  alignSelf: "flex-start",
                }}
              >
                {item.icon}
              </View>

              <Text style={{ color: "#e2e8f0", marginTop: 10 }}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Penjualan */}
        <View
          style={{
            backgroundColor: "#1e293b",
            borderRadius: 20,
            padding: 16,
            marginTop: 10,
            borderWidth: 1,
            borderColor: "#334155",
          }}
        >
          <Text style={{ color: "#e2e8f0", marginBottom: 10 }}>
            Penjualan Hari Ini
          </Text>

          <Text style={{ color: "#38bdf8", fontSize: 20, fontWeight: "700" }}>
            Rp 2.500.000
          </Text>

          <View style={{ marginTop: 12 }}>
            <Row label="Lunas" value="12" amount="Rp 1.800.000" color="#22c55e" />
            <Row label="Belum Lunas" value="5" amount="Rp 700.000" color="#f59e0b" />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({ label, value, amount, color }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
      <View>
        <Text style={{ color: "#e2e8f0" }}>{label}</Text>
        <Text style={{ color: "#94a3b8", fontSize: 12 }}>
          {value} transaksi
        </Text>
      </View>

      <Text style={{ color: color, fontWeight: "700" }}>
        {amount}
      </Text>
    </View>
  );
}


const menu = [
  {
    title: "Pembelian",
    color: "#3b82f6",
    icon: <MaterialIcons name="shopping-cart" size={20} color="#fff" />,
  },
  {
    title: "Mutasi Stok",
    color: "#22c55e",
    icon: <MaterialIcons name="inventory" size={20} color="#fff" />,
  },
  {
    title: "Master Produk",

    color: "#a855f7",
    icon: <MaterialIcons name="category" size={20} color="#fff" />,
  },
  {
    title: "Bayar Supplier",
    color: "#f59e0b",
    icon: <MaterialIcons name="payments" size={20} color="#fff" />,
  },
  {
    title: "Pelanggan Bayar",
    color: "#ec4899",
    icon: <MaterialIcons name="people" size={20} color="#fff" />,
  },
  {
    title: "Rekapan",
    color: "#06b6d4",
    icon: <MaterialIcons name="bar-chart" size={20} color="#fff" />,
  },
];