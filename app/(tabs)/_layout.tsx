import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#64748b",

      }}
    >
      {/* 1. BERANDA */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Beranda",
          tabBarIcon: ({ color, size }) => ( 
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />

      {/* 2. POS */}
      <Tabs.Screen
        name="pos"
        options={{
          title: "Pos",
          tabBarIcon: ({ color }) => (
            <Ionicons name="cart-outline" size={22} color={color} />
          ),
        }}
      />

      {/* 3. BIAYA */}
      <Tabs.Screen
        name="biaya"
        options={{
          title: "Biaya",
          tabBarIcon: ({ color }) => (
            <Ionicons name="wallet-outline" size={22} color={color} />
          ),
        }}
      />

      {/* 4. LAPORAN */}
      <Tabs.Screen
        name="laporan"
        options={{
          title: "Laporan",
          tabBarIcon: ({ color }) => (
            <Ionicons name="bar-chart-outline" size={22} color={color} />
          ),
        }}
      />

      {/* 5. PENGATURAN */}
      <Tabs.Screen
        name="pengaturan"
        options={{
          title: "Pengaturan",
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}