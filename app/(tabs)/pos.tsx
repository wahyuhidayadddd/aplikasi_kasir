import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
export default function POSScreen() {

  const [items, setItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newProduct, setNewProduct] = useState({
  name: "",
  price: "",
  qty: 1,
  note: "",
  barcode: "",
  tipeModal: "Harga Beli",
  pantauStok: true,
  stokMinimal: "0",
  stokAwal: "0",
   image: null,
  });
  // KAMERA STATE
  const [scanModal, setScanModal] = useState(false);


const [permission, requestPermission] = useCameraPermissions();
const [cameraType, setCameraType] = useState("back");
const [variantModal, setVariantModal] = useState(false);
const [grosirModal, setGrosirModal] = useState(false);
const [variants, setVariants] = useState([]);
const [variantInput, setVariantInput] = useState({
  name: "",
  price: "",
});
const handleBarCodeScanned = ({ data }) => {
  if (scanModal) {
    setNewProduct({
      ...newProduct,
      barcode: data,
    });
    setScanModal(false);
  }
};
const [grosirs, setGrosirs] = useState([]);
const [grosirInput, setGrosirInput] = useState({
  min: 1,
  price: "",
});
//logikan izin kamera
const requestCameraPermission = async () => {
  const res = await requestPermission();

  if (!res.granted) {
    alert("Izin kamera ditolak!");
    return;
  }

  setScanModal(true);
};
const addItem = () => {
  if (newProduct.name.trim() !== "" && newProduct.price.trim() !== "") {
    setItems([
      ...items,
      {
        ...newProduct,
        variants,
        grosirs,
        id: Date.now().toString(),
      },
    ]);

    // RESET SEMUA
    setNewProduct({
      name: "",
      price: "",
      qty: 1,
      note: "",
      barcode: "",
      tipeModal: "Harga Beli",
      pantauStok: true,
      stokMinimal: "0",
      stokAwal: "0",
      image: null,
    });

    setVariants([]);
    setGrosirs([]);

    setModalVisible(false);
  }
};
  // STATE NGELOLA FOTO
  const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (!result.canceled) {
    setNewProduct({
      ...newProduct,
      image: result.assets[0].uri,
    });
  }
};

const takePhoto = async () => {
  let result = await ImagePicker.launchCameraAsync({
    quality: 0.7,
  });

  if (!result.canceled) {
    setNewProduct({
      ...newProduct,
      image: result.assets[0].uri,
    });
  }
};
  return (
    <View style={{ flex: 1, backgroundColor: "#0f172a" }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: "#1e293b",
          paddingTop: 50,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        {/* Top Action */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
         <TouchableOpacity style={iconBox} onPress={requestCameraPermission}>
  <MaterialIcons name="qr-code" size={20} color="#fff" />
</TouchableOpacity>

          <View style={searchBox}>
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput
              placeholder="Cari produk..."
              placeholderTextColor="#94a3b8"
              style={{ marginLeft: 8, color: "#fff", flex: 1 }}
            />
          </View>

          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={iconBox}>
              <MaterialIcons name="qr-code" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={iconBox} onPress={() => setModalVisible(true)}>
              <MaterialIcons name="add" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={iconBox}>
              <Ionicons name="settings" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={{ flex: 1, padding: 16, paddingBottom: 80 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <TouchableOpacity style={filterBtn}>
            <Text style={{ color: "#fff" }}>Semua</Text>
          </TouchableOpacity>

          <Ionicons name="grid" size={22} color="#94a3b8" />
        </View>

        {items.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 80 }}>
            <Ionicons name="cube-outline" size={60} color="#334155" />
            <Text style={{ color: "#94a3b8", marginTop: 10 }}>
              Data tidak ditemukan
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View
                style={{
                  backgroundColor: "#1e293b",
                  padding: 14,
                  borderRadius: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: "#334155",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>{item.name}</Text>
                <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                  Harga: Rp {item.price} / pcs
                </Text>
                <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                  Jumlah: {item.qty}
                </Text>
                {item.note ? (
                  <Text style={{ color: "#94a3b8", marginTop: 4 }}>
                    Keterangan: {item.note}
                  </Text>
                ) : null}
              </View>
            )}
          />
        )}
      </View>

      {/* Bottom Cart */}
      <View
        style={{
          backgroundColor: "#1e293b",
          padding: 12,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#3b82f6",
            padding: 16,
            borderRadius: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>
            {items.length} Items
          </Text>
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            Rp {items.reduce((sum, item) => sum + item.qty * parseInt(item.price || "0"), 0).toLocaleString()}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal untuk Tambah Produk */}
<Modal visible={modalVisible} animationType="slide">
  <View style={{ flex: 1, backgroundColor: "#0f172a" }}>

    {/* Header */}
    <View style={{
      backgroundColor: "#1e293b",
      paddingTop: 50,
      paddingBottom: 16,
      paddingHorizontal: 16,
      flexDirection: "row",
      alignItems: "center"
    }}>
      <TouchableOpacity onPress={() => setModalVisible(false)}>
        <Ionicons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      <Text style={{
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 10
      }}>
        Tambah Produk
      </Text>
    </View>

    {/* 🔥 SCROLLVIEW */}
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >

      {/* FOTO */}
<TouchableOpacity
  onPress={pickImage}
  onLongPress={takePhoto}
  style={{ alignItems: "center", marginBottom: 16 }}
>  
  <View style={{
    width: 120,
    height: 120,
    backgroundColor: "#1e293b",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
    overflow: "hidden"
  }}>
    
    {newProduct.image ? (
      <Image
        source={{ uri: newProduct.image }}
        style={{ width: "100%", height: "100%" }}
      />
    ) : (
      <Ionicons name="image-outline" size={40} color="#64748b" />
    )}

  </View>

  <Text style={{ marginTop: 8, color: "#94a3b8" }}>
    {newProduct.image ? "Ganti Foto" : "Tambah Foto Produk"}
  </Text>

</TouchableOpacity>

      {/* NAMA */}
      <Text style={labelDark}>Nama Produk *</Text>
      <TextInput
        style={inputDark}
        placeholder="Nama produk..."
        placeholderTextColor="#64748b"
        value={newProduct.name}
        onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
      />

      {/* HARGA + QTY */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={labelDark}>Harga</Text>
          <TextInput
            style={inputDark}
            keyboardType="numeric"
            placeholder="Rp0"
            placeholderTextColor="#64748b"
            value={newProduct.price}
            onChangeText={(text) =>
              setNewProduct({ ...newProduct, price: text.replace(/[^0-9]/g, "") })
            }
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={labelDark}>Qty</Text>
          <View style={qtyBox}>
            <TouchableOpacity onPress={() =>
              setNewProduct({
                ...newProduct,
                qty: newProduct.qty > 1 ? newProduct.qty - 1 : 1,
              })
            }>
              <Text style={qtyBtn}>-</Text>
            </TouchableOpacity>

            <Text style={{ color: "#fff" }}>{newProduct.qty}</Text>

            <TouchableOpacity onPress={() =>
              setNewProduct({
                ...newProduct,
                qty: newProduct.qty + 1,
              })
            }>
              <Text style={qtyBtn}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
{/* BARCODE INPUT */}
<Text style={labelDark}>Barcode</Text>
<View style={{ flexDirection: "row", gap: 10 }}>
  <TextInput
    style={[inputDark, { flex: 1 }]}
    placeholder="Scan / input barcode"
    placeholderTextColor="#64748b"
    value={newProduct.barcode}
    onChangeText={(text) =>
      setNewProduct({ ...newProduct, barcode: text })
    }
  />

  <TouchableOpacity
    onPress={requestCameraPermission}
    style={{
      backgroundColor: "#3b82f6",
      padding: 12,
      borderRadius: 10,
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <MaterialIcons name="qr-code-scanner" size={20} color="#fff" />
  </TouchableOpacity>
</View>
      {/* BARCODE */}
<Modal visible={scanModal} animationType="slide">
  <View style={{ flex: 1, backgroundColor: "#000" }}>

    {/* CAMERA */}
    <CameraView
      style={{ flex: 1 }}
      facing={cameraType === "back" ? "back" : "front"}
      onBarcodeScanned={handleBarCodeScanned}
    />

    {/* OVERLAY SCANNER */}
    <View style={overlayContainer}>
      <View style={overlayTop} />

      <View style={{ flexDirection: "row" }}>
        <View style={overlaySide} />

        {/* KOTAK SCAN */}
        <View style={scanBox} />

        <View style={overlaySide} />
      </View>

      <View style={overlayBottom} />
    </View>

    {/* UI BAWAH */}
    <View style={{
      position: "absolute",
      bottom: 0,
      width: "100%",
      padding: 20,
      backgroundColor: "rgba(0,0,0,0.6)"
    }}>
      
      <TouchableOpacity
        onPress={() =>
          setCameraType(cameraType === "back" ? "front" : "back")
        }
        style={{
          backgroundColor: "#1e293b",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 10
        }}
      >
        <Text style={{ color: "#fff" }}>Switch Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setScanModal(false)}
        style={{
          backgroundColor: "#ef4444",
          padding: 14,
          borderRadius: 12,
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff" }}>Tutup</Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>

      {/* KETERANGAN */}
      <Text style={labelDark}>Keterangan</Text>
      <TextInput
        style={[inputDark, { height: 80 }]}
        multiline
        placeholder="Keterangan..."
        placeholderTextColor="#64748b"
        value={newProduct.note}
        onChangeText={(text) =>
          setNewProduct({ ...newProduct, note: text })
        }
      />

      {/* SWITCH */}
      <View style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 12
      }}>
        <Text style={labelDark}>Pantau Stok</Text>
        <TouchableOpacity
          onPress={() =>
            setNewProduct({
              ...newProduct,
              pantauStok: !newProduct.pantauStok,
            })
          }
          style={{
            width: 50,
            height: 26,
            borderRadius: 20,
            backgroundColor: newProduct.pantauStok ? "#3b82f6" : "#334155",
            justifyContent: "center",
            padding: 3
          }}
        >
          <View style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: "#fff",
            alignSelf: newProduct.pantauStok ? "flex-end" : "flex-start"
          }} />
        </TouchableOpacity>
      </View>

      {/* STOK */}
      <Text style={labelDark}>Stok Minimal</Text>
      <TextInput
        style={inputDark}
        keyboardType="numeric"
        value={newProduct.stokMinimal}
        onChangeText={(text) =>
          setNewProduct({
            ...newProduct,
            stokMinimal: text.replace(/[^0-9]/g, ""),
          })
        }
      />

      <Text style={labelDark}>Stok Awal</Text>
      <TextInput
        style={inputDark}
        keyboardType="numeric"
        value={newProduct.stokAwal}
        onChangeText={(text) =>
          setNewProduct({
            ...newProduct,
            stokAwal: text.replace(/[^0-9]/g, ""),
          })
        }
      />

      {/* TOTAL */}
      <Text style={labelDark}>Total Modal</Text>
      <TextInput
        style={[inputDark, { color: "#94a3b8" }]}
        editable={false}
        value={`Rp ${
          (
            parseInt(newProduct.stokAwal || "0") *
            parseInt(newProduct.price || "0")
          ).toLocaleString()
        }`}
      />

<TouchableOpacity style={outlineBtnDark} onPress={() => setVariantModal(true)}>
  <Text style={{ color: "#94a3b8" }}>
    + Tambah Varian Harga
  </Text>
</TouchableOpacity>

{/* LIST VARIAN */}
{variants.length > 0 && (
  <View style={{ marginTop: 10 }}>
    <Text style={{ color: "#fff", fontWeight: "600" }}>Varian:</Text>

    {variants.map((v, i) => (
      <View
        key={i}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1e293b",
          padding: 10,
          borderRadius: 10,
          marginTop: 6,
        }}
      >
        <View>
          <Text style={{ color: "#fff" }}>{v.name}</Text>
          <Text style={{ color: "#94a3b8" }}>
            Rp {parseInt(v.price || 0).toLocaleString()}
          </Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          {/* EDIT */}
          <TouchableOpacity
            onPress={() => {
              setVariantInput(v);
              setVariantModal(true);
              setVariants(variants.filter((_, index) => index !== i));
            }}
          >
            <Ionicons name="create-outline" size={20} color="#38bdf8" />
          </TouchableOpacity>

          {/* DELETE */}
          <TouchableOpacity
            onPress={() =>
              setVariants(variants.filter((_, index) => index !== i))
            }
            style={{ marginLeft: 10 }}
          >
            <Ionicons name="close" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </View>
)}

<TouchableOpacity style={outlineBtnDark} onPress={() => setGrosirModal(true)}>
  <Text style={{ color: "#94a3b8" }}>
    + Tambah Harga Grosir
  </Text>
</TouchableOpacity>

{/* LIST GROSIR */}
{grosirs.length > 0 && (
  <View style={{ marginTop: 10 }}>
    <Text style={{ color: "#fff", fontWeight: "600" }}>Grosir:</Text>

    {grosirs.map((g, i) => (
      <View
        key={i}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#1e293b",
          padding: 10,
          borderRadius: 10,
          marginTop: 6,
        }}
      >
        <View>
          <Text style={{ color: "#fff" }}>Min {g.min}</Text>
          <Text style={{ color: "#94a3b8" }}>
            Rp {parseInt(g.price || 0).toLocaleString()}
          </Text>
        </View>

        <View style={{ flexDirection: "row" }}>
          {/* EDIT */}
          <TouchableOpacity
            onPress={() => {
              setGrosirInput(g);
              setGrosirModal(true);
              setGrosirs(grosirs.filter((_, index) => index !== i));
            }}
          >
            <Ionicons name="create-outline" size={20} color="#38bdf8" />
          </TouchableOpacity>

          {/* DELETE */}
          <TouchableOpacity
            onPress={() =>
              setGrosirs(grosirs.filter((_, index) => index !== i))
            }
            style={{ marginLeft: 10 }}
          >
            <Ionicons name="close" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </View>
)}
<Modal visible={grosirModal} transparent animationType="slide">
  <View style={{
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)"
  }}>
    <View style={{
      backgroundColor: "#0f172a",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16
    }}>
      
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
        Harga Grosir
      </Text>

      <Text style={labelDark}>Minimal</Text>
      <View style={qtyBox}>
        <TouchableOpacity onPress={() =>
          setGrosirInput({
            ...grosirInput,
            min: grosirInput.min > 1 ? grosirInput.min - 1 : 1,
          })
        }>
          <Text style={qtyBtn}>-</Text>
        </TouchableOpacity>

        <Text style={{ color: "#fff" }}>{grosirInput.min}</Text>

        <TouchableOpacity onPress={() =>
          setGrosirInput({
            ...grosirInput,
            min: grosirInput.min + 1,
          })
        }>
          <Text style={qtyBtn}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={labelDark}>Harga</Text>
      <TextInput
        style={inputDark}
        keyboardType="numeric"
        value={grosirInput.price}
        onChangeText={(text) =>
          setGrosirInput({
            ...grosirInput,
            price: text.replace(/[^0-9]/g, ""),
          })
        }
      />

      {/* BUTTON */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <TouchableOpacity
          style={{ flex: 1, padding: 14 }}
          onPress={() => setGrosirModal(false)}
        >
          <Text style={{ color: "#94a3b8", textAlign: "center" }}>
            Batal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#3b82f6",
            padding: 14,
            borderRadius: 10
          }}
          onPress={() => {
            setGrosirs([...grosirs, grosirInput]);
            setGrosirInput({ min: 1, price: "" });
            setGrosirModal(false);
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Simpan
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
</Modal>
<Modal visible={variantModal} transparent animationType="slide">
  <View style={{
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)"
  }}>
    <View style={{
      backgroundColor: "#0f172a",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 16
    }}>
      
      <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
        Varian Harga
      </Text>

      <Text style={labelDark}>Nama Varian</Text>
      <TextInput
        style={inputDark}
        value={variantInput.name}
        onChangeText={(text) =>
          setVariantInput({ ...variantInput, name: text })
        }
      />

      <Text style={labelDark}>Harga</Text>
      <TextInput
        style={inputDark}
        keyboardType="numeric"
        value={variantInput.price}
        onChangeText={(text) =>
          setVariantInput({
            ...variantInput,
            price: text.replace(/[^0-9]/g, ""),
          })
        }
      />

      {/* BUTTON */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <TouchableOpacity
          style={{ flex: 1, padding: 14 }}
          onPress={() => setVariantModal(false)}
        >
          <Text style={{ color: "#94a3b8", textAlign: "center" }}>
            Batal
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "#3b82f6",
            padding: 14,
            borderRadius: 10
          }}
          onPress={() => {
            setVariants([...variants, variantInput]);
            setVariantInput({ name: "", price: "" });
            setVariantModal(false);
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Simpan
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  </View>
</Modal>
    </ScrollView>

    {/* FOOTER FIX */}
    <View style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      padding: 16,
      backgroundColor: "#0f172a",
      borderTopWidth: 1,
      borderColor: "#1e293b"
    }}>
      <TouchableOpacity
        style={{
          backgroundColor: "#3b82f6",
          padding: 16,
          borderRadius: 12,
          alignItems: "center"
        }}
        onPress={addItem}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          Simpan
        </Text>
      </TouchableOpacity>
    </View>

  </View>
</Modal>
    </View>
  );
}


const iconBox = {
  backgroundColor: "#334155",
  padding: 10,
  borderRadius: 10,
  marginHorizontal: 4,
};

const searchBox = {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#0f172a",
  paddingHorizontal: 10,
  paddingVertical: 8,
  borderRadius: 12,
  marginHorizontal: 8,
};

const filterBtn = {
  backgroundColor: "#3b82f6",
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 12,
};

const inputStyle = {
  borderWidth: 1,
  borderColor: "#334155",
  backgroundColor: "#1e293b",
  padding: 12,
  borderRadius: 8,
  marginTop: 12,
  color: "#fff",
};
const labelDark = {
  marginTop: 12,
  marginBottom: 6,
  fontSize: 13,
  color: "#94a3b8",
};

const inputDark = {
  backgroundColor: "#1e293b",
  borderWidth: 1,
  borderColor: "#334155",
  borderRadius: 10,
  padding: 12,
  color: "#fff",
};

const outlineBtnDark = {
  marginTop: 12,
  borderWidth: 1,
  borderColor: "#334155",
  padding: 14,
  borderRadius: 12,
  alignItems: "center",
  backgroundColor: "#1e293b"
};

const qtyBox = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "#1e293b",
  borderRadius: 10,
  paddingHorizontal: 10,
  borderWidth: 1,
  borderColor: "#334155",
  height: 45
};

const qtyBtn = {
  color: "#3b82f6",
  fontSize: 20,
  paddingHorizontal: 10
};
const overlayContainer = {
  position: "absolute",
  width: "100%",
  height: "100%",
};

const overlayTop = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
};

const overlayBottom = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
};

const overlaySide = {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.6)",
};

const scanBox = {
  width: 250,
  height: 250,
  borderWidth: 2,
  borderColor: "#fff",
  borderRadius: 12,
  justifyContent: "center",
};