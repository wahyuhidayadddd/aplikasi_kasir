import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

const { width: SW } = Dimensions.get("window");

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const C = {
  bg: "#060d18",
  surface: "#0c1626",
  card: "#111f33",
  cardHover: "#162840",
  border: "#1a2f4a",
  borderLight: "#1e3a5c",
  accent: "#0ea5e9",
  accentDark: "#0369a1",
  accentDim: "rgba(14,165,233,0.12)",
  accentBorder: "rgba(14,165,233,0.3)",
  success: "#10b981",
  successDim: "rgba(16,185,129,0.12)",
  danger: "#f43f5e",
  dangerDim: "rgba(244,63,94,0.12)",
  gold: "#f59e0b",
  goldDim: "rgba(245,158,11,0.12)",
  purple: "#a855f7",
  purpleDim: "rgba(168,85,247,0.12)",
  text: "#e8f4fd",
  textSec: "#7fa8c9",
  muted: "#3d6080",
  white: "#ffffff",
};

// ─── INIT DATA ────────────────────────────────────────────────────────────────
// Kategori tidak hardcode — kosong, user yang isi
const INIT_KATEGORI = [];

// Satuan default — bisa ditambah/hapus user
const INIT_SATUAN = [
  { id: "sat1", nama: "pcs" },
  { id: "sat2", nama: "dos" },
  { id: "sat3", nama: "bal" },
  { id: "sat4", nama: "kg" },
  { id: "sat5", nama: "liter" },
  { id: "sat6", nama: "lusin" },
];

// Info toko default
const INIT_TOKO = {
  nama: "Nama Toko Anda",
  alamat: "Alamat Toko Anda",
  telp: "",
  penerima: "Pimpinan",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);

const formatDate = (d) => {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  if (isNaN(date)) return d;
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const fmtRp = (n) => `Rp ${Number(n || 0).toLocaleString("id-ID")}`;

// ─── INVOICE HTML ─────────────────────────────────────────────────────────────
const buildReceiptHTML = (items, checkout, totalHarga, docType = "STRUK", toko = INIT_TOKO) => {
  const diskon = parseInt(checkout.diskon || "0");
  const pajak = parseInt(checkout.pajak || "0");
  const ongkir = parseInt(checkout.ongkir || "0");
  const grandTotal = totalHarga - diskon + pajak + ongkir;
  const rows = items.map(it =>
    `<tr>
      <td>${it.name || it.nama}</td>
      <td style="text-align:center">${it.qty}</td>
      <td style="text-align:center">${it.satuan || "pcs"}</td>
      <td style="text-align:right">${fmtRp(parseInt(it.price || it.harga || 0))}</td>
      <td style="text-align:right">${fmtRp(it.qty * parseInt(it.price || it.harga || 0))}</td>
    </tr>`
  ).join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
  <style>
    body{font-family:Arial,sans-serif;font-size:13px;padding:24px;color:#111;max-width:600px;margin:0 auto}
    h2{text-align:center;margin:0 0 2px;font-size:18px}
    .toko-info{text-align:center;color:#555;margin-bottom:12px}
    hr{border:none;border-top:1px dashed #aaa;margin:12px 0}
    table{width:100%;border-collapse:collapse}
    th{border-bottom:2px solid #333;padding:6px 4px;text-align:left;font-size:12px;background:#f5f5f5}
    td{padding:6px 4px;vertical-align:top;border-bottom:1px solid #eee}
    .total-row td{font-weight:bold;font-size:14px;border-top:2px solid #333;border-bottom:none}
    .footer{text-align:center;margin-top:16px;font-size:12px;color:#888}
    .sign-area{margin-top:32px;text-align:right;font-size:13px}
  </style></head><body>
  <h2>${toko.nama}</h2>
  <div class="toko-info">${toko.alamat}${toko.telp ? "<br/>Telp: " + toko.telp : ""}</div>
  <hr/>
  <h3 style="text-align:center;margin:4px 0">${docType === "INVOICE" ? "INVOICE" : "STRUK PENJUALAN"}</h3>
  ${checkout.invoiceNo ? `<p style="text-align:center;margin:2px 0">No: <b>${checkout.invoiceNo}</b></p>` : ""}
  <p style="text-align:center;margin:2px 0;color:#555">Tanggal: ${formatDate(checkout.tanggal || new Date())}</p>
  ${checkout.pelanggan ? `<p style="text-align:center;margin:2px 0">Kepada: <b>${checkout.pelanggan}</b></p>` : ""}
  ${checkout.meja ? `<p style="text-align:center;margin:2px 0">Meja: ${checkout.meja}</p>` : ""}
  <hr/>
  <table>
    <tr><th>Nama Barang</th><th style="text-align:center">Qty</th><th style="text-align:center">Sat.</th><th style="text-align:right">Harga Satuan</th><th style="text-align:right">Total</th></tr>
    ${rows}
    <tr><td colspan="4" style="text-align:right;padding-top:8px">Subtotal</td><td style="text-align:right;padding-top:8px">${fmtRp(totalHarga)}</td></tr>
    ${diskon ? `<tr><td colspan="4" style="text-align:right;color:#e33">Diskon</td><td style="text-align:right;color:#e33">- ${fmtRp(diskon)}</td></tr>` : ""}
    ${pajak ? `<tr><td colspan="4" style="text-align:right">Pajak</td><td style="text-align:right">+ ${fmtRp(pajak)}</td></tr>` : ""}
    ${ongkir ? `<tr><td colspan="4" style="text-align:right">Ongkir</td><td style="text-align:right">+ ${fmtRp(ongkir)}</td></tr>` : ""}
    <tr class="total-row"><td colspan="4" style="text-align:right">TOTAL</td><td style="text-align:right">${fmtRp(grandTotal)}</td></tr>
  </table>
  <hr/>
  <p class="footer">Status: ${checkout.status === "lunas" ? "✓ LUNAS" : "⏳ BELUM BAYAR"}</p>
  ${checkout.jatuhTempo ? `<p class="footer">Jatuh Tempo: ${formatDate(checkout.jatuhTempo)}</p>` : ""}
  ${checkout.keterangan ? `<p class="footer">Catatan: ${checkout.keterangan}</p>` : ""}
  <div class="sign-area">
    <p>Hormat kami,</p>
    <br/><br/>
    <p><b>${toko.penerima || toko.nama}</b></p>
  </div>
  <p class="footer" style="margin-top:20px">Terima kasih atas kepercayaan Anda!</p>
  </body></html>`;
};

// ─── WHATSAPP INVOICE ─────────────────────────────────────────────────────────
const buildWAText = (trx, toko) => {
  const garis = "─".repeat(30);
  const garisT = "═".repeat(30);
  let msg = `*${toko.nama}*\n${toko.alamat}${toko.telp ? "\nTelp: " + toko.telp : ""}\n`;
  msg += `${garisT}\n`;
  msg += `*${trx.docType === "INVOICE" ? "INVOICE" : "STRUK PENJUALAN"}*\n`;
  if (trx.invoiceNo) msg += `No: *${trx.invoiceNo}*\n`;
  msg += `Tanggal: ${formatDate(trx.tanggal)}\n`;
  if (trx.pelanggan) msg += `Kepada: *${trx.pelanggan}*\n`;
  msg += `${garis}\n`;
  (trx.items || []).forEach(it => {
    const harga = parseInt(it.price || it.harga || 0);
    msg += `${it.name || it.nama}\n`;
    msg += `  ${fmtRp(harga)} x ${it.qty} ${it.satuan || "pcs"} = *${fmtRp(it.qty * harga)}*\n`;
  });
  msg += `${garis}\n`;
  const sub = trx.subtotal || 0;
  const dis = parseInt(trx.diskon || 0);
  const pjk = parseInt(trx.pajak || 0);
  const ong = parseInt(trx.ongkir || 0);
  if (sub !== trx.grandTotal) {
    msg += `Subtotal : ${fmtRp(sub)}\n`;
    if (dis > 0) msg += `Diskon   : -${fmtRp(dis)}\n`;
    if (pjk > 0) msg += `Pajak    : +${fmtRp(pjk)}\n`;
    if (ong > 0) msg += `Ongkir   : +${fmtRp(ong)}\n`;
  }
  msg += `${garisT}\n`;
  msg += `*TOTAL    : ${fmtRp(trx.grandTotal)}*\n`;
  msg += `${garisT}\n`;
  msg += `Status: ${trx.status === "lunas" ? "✅ LUNAS" : "⏳ BELUM BAYAR"}`;
  if (trx.jatuhTempo && trx.status !== "lunas") msg += `\nJatuh Tempo: ${formatDate(trx.jatuhTempo)}`;
  if (trx.keterangan) msg += `\nCatatan: ${trx.keterangan}`;
  msg += `\n\nHormat kami,\n*${toko.penerima || toko.nama}*\n\nTerima kasih! 🙏`;
  return msg;
};

const shareToWhatsApp = (trx, toko) => {
  const msg = buildWAText(trx, toko || INIT_TOKO);
  const phone = trx.waNumber ? trx.waNumber.replace(/[^0-9]/g, "") : "";
  const url = phone
    ? `https://wa.me/${phone.startsWith("0") ? "62" + phone.slice(1) : phone}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  Linking.openURL(url).catch(() => Alert.alert("Gagal", "Tidak dapat membuka WhatsApp."));
};

// ─── STOK STATUS ─────────────────────────────────────────────────────────────
const getStokStatus = (p) => {
  if (!p.pantauStok) return null;
  if (p.stok === 0) return { color: C.danger, bg: C.dangerDim, border: C.danger + "44", label: "Habis" };
  if (p.stok <= p.stokMinimal) return { color: C.gold, bg: C.goldDim, border: C.gold + "44", label: `${p.stok} sisa` };
  return { color: C.success, bg: C.successDim, border: C.success + "44", label: `${p.stok} stok` };
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function POSScreen() {
  const [activeTab, setActiveTab] = useState("kasir");
  const [searchQuery, setSearchQuery] = useState("");

  // ── MASTER DATA (user-managed)
  const [tokoInfo, setTokoInfo] = useState(INIT_TOKO);
  const [satuanList, setSatuanList] = useState(INIT_SATUAN);
  const [kategoriList, setKategoriList] = useState(INIT_KATEGORI);
  const [catalogProducts, setCatalogProducts] = useState([]);

  // active category filter
  const [activeCategory, setActiveCategory] = useState("semua");

  // Cart state
  const [cartItems, setCartItems] = useState([]);
  const [cartModal, setCartModal] = useState(false);
  const [checkout, setCheckout] = useState({
    diskon: "", pajak: "", ongkir: "",
    tanggal: todayStr(), jatuhTempo: "",
    pelanggan: "", waNumber: "", meja: "", sales: "", keterangan: "",
    status: "belum_bayar", invoiceNo: "", docType: "STRUK",
    tipeBayar: "langsung",
  });

  // Modals — original
  const [addProductModal, setAddProductModal] = useState(false);
  const [quickModal, setQuickModal] = useState(false);
  const [scanModal, setScanModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [variantModal, setVariantModal] = useState(false);
  const [grosirModal, setGrosirModal] = useState(false);
  const [productDetailModal, setProductDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Modals — NEW
  const [kategoriModal, setKategoriModal] = useState(false);
  const [editKategoriModal, setEditKategoriModal] = useState(false);
  const [editKategoriTarget, setEditKategoriTarget] = useState(null);
  const [satuanModal, setSatuanModal] = useState(false);
  const [tokoModal, setTokoModal] = useState(false);
  const [editProdukModal, setEditProdukModal] = useState(false);
  const [editProdukTarget, setEditProdukTarget] = useState(null);

  // NEW form states
  const [newKategori, setNewKategori] = useState({ nama: "", ikon: "🗂️" });
  const [editKategoriForm, setEditKategoriForm] = useState({ nama: "", ikon: "" });
  const [newSatuan, setNewSatuan] = useState("");
  const [editTokoForm, setEditTokoForm] = useState({ ...INIT_TOKO });
  const [editProdukForm, setEditProdukForm] = useState({});

  // New product form (original + satuan + kategoriId)
  const [newProduct, setNewProduct] = useState({
    name: "", price: "", stok: "0", stokMinimal: "5", note: "", barcode: "",
    kategoriId: "", satuanId: "sat1", emoji: "📦", pantauStok: true, image: null,
  });
  const [variants, setVariants] = useState([]);
  const [grosirs, setGrosirs] = useState([]);
  const [variantInput, setVariantInput] = useState({ name: "", price: "" });
  const [grosirInput, setGrosirInput] = useState({ min: 1, price: "" });

  // Quick add
  const [quickProduct, setQuickProduct] = useState({ name: "", price: "", qty: 1, note: "", satuanId: "sat1" });

  // Transactions
  const [transactions, setTransactions] = useState([]);
  const [selectedTrx, setSelectedTrx] = useState(null);
  const [editTrx, setEditTrx] = useState(null);
  const [filterStatus, setFilterStatus] = useState("semua");
  const [isPrinting, setIsPrinting] = useState(false);

  const [permission, requestPermission] = useCameraPermissions();
  const [cameraType, setCameraType] = useState("back");

  // Computed
  const totalHarga = cartItems.reduce((s, i) => s + i.qty * parseInt(i.price || "0"), 0);
  const diskon = parseInt(checkout.diskon || "0");
  const pajak = parseInt(checkout.pajak || "0");
  const ongkir = parseInt(checkout.ongkir || "0");
  const grandTotal = totalHarga - diskon + pajak + ongkir;

  const piutangList = transactions.filter(t => t.status === "belum_bayar" && !t.isDraft);
  const draftList = transactions.filter(t => t.isDraft);
  const riwayatList = transactions.filter(t => !t.isDraft && !t.isRefund);

  // Category filter: "semua" + semua kategori user
  const filteredProducts = catalogProducts.filter(p => {
    const catOk = activeCategory === "semua" || p.kategoriId === activeCategory;
    const searchOk = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return catOk && searchOk;
  });

  const getSatuanNama = (id) => satuanList.find(s => s.id === id)?.nama || "pcs";
  const getKategoriNama = (id) => {
    const k = kategoriList.find(k => k.id === id);
    return k ? `${k.ikon} ${k.nama}` : "";
  };

  const nextInvoiceNo = () => {
    const nums = transactions.map(t => { const m = (t.invoiceNo || "").match(/(\d+)$/); return m ? parseInt(m[1]) : 0; });
    const max = nums.length ? Math.max(...nums) : 0;
    return `INV-${String(max + 1).padStart(4, "0")}`;
  };

  // ════════════════════════════════════════════════════════════════════════════
  // ── KATEGORI CRUD
  // ════════════════════════════════════════════════════════════════════════════
  const tambahKategori = () => {
    if (!newKategori.nama.trim()) return Alert.alert("Nama kategori wajib diisi");
    setKategoriList(prev => [...prev, { id: uid(), nama: newKategori.nama.trim(), ikon: newKategori.ikon || "🗂️" }]);
    setNewKategori({ nama: "", ikon: "🗂️" });
    setKategoriModal(false);
  };

  const simpanEditKategori = () => {
    if (!editKategoriForm.nama.trim()) return Alert.alert("Nama kategori wajib diisi");
    setKategoriList(prev => prev.map(k =>
      k.id === editKategoriTarget.id
        ? { ...k, nama: editKategoriForm.nama.trim(), ikon: editKategoriForm.ikon }
        : k
    ));
    setEditKategoriModal(false);
    setEditKategoriTarget(null);
  };

  const hapusKategori = (id) => {
    const ada = catalogProducts.some(p => p.kategoriId === id);
    if (ada) return Alert.alert("Tidak Bisa Hapus", "Masih ada produk di kategori ini.\nHapus produknya dulu.");
    Alert.alert("Hapus Kategori", "Yakin ingin menghapus kategori ini?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => setKategoriList(prev => prev.filter(k => k.id !== id)) },
    ]);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // ── SATUAN CRUD
  // ════════════════════════════════════════════════════════════════════════════
  const tambahSatuan = () => {
    if (!newSatuan.trim()) return;
    const ada = satuanList.find(s => s.nama.toLowerCase() === newSatuan.trim().toLowerCase());
    if (ada) return Alert.alert("Sudah ada satuan dengan nama tersebut");
    setSatuanList(prev => [...prev, { id: uid(), nama: newSatuan.trim() }]);
    setNewSatuan("");
  };

  const hapusSatuan = (id) => {
    const dipakai = catalogProducts.some(p => p.satuanId === id);
    if (dipakai) return Alert.alert("Tidak Bisa Hapus", "Satuan ini masih digunakan produk.");
    Alert.alert("Hapus Satuan", "Yakin?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => setSatuanList(prev => prev.filter(s => s.id !== id)) },
    ]);
  };

  // ════════════════════════════════════════════════════════════════════════════
  // ── PRODUK CRUD
  // ════════════════════════════════════════════════════════════════════════════
  const addProduct = () => {
    if (!newProduct.name.trim() || !newProduct.price.trim()) {
      Alert.alert("Lengkapi Data", "Nama dan harga wajib diisi.");
      return;
    }
    const satNama = getSatuanNama(newProduct.satuanId);
    const prod = {
      id: `p${uid()}`,
      name: newProduct.name,
      price: newProduct.price,
      stok: parseInt(newProduct.stok || "0"),
      stokMinimal: parseInt(newProduct.stokMinimal || "5"),
      note: newProduct.note,
      barcode: newProduct.barcode,
      kategoriId: newProduct.kategoriId,
      satuanId: newProduct.satuanId,
      satuan: satNama,
      emoji: newProduct.emoji || "📦",
      pantauStok: newProduct.pantauStok,
      image: newProduct.image,
      variants: [...variants],
      grosirs: [...grosirs],
    };
    setCatalogProducts(prev => [prod, ...prev]);
    setNewProduct({ name: "", price: "", stok: "0", stokMinimal: "5", note: "", barcode: "", kategoriId: "", satuanId: "sat1", emoji: "📦", pantauStok: true, image: null });
    setVariants([]); setGrosirs([]);
    setAddProductModal(false);
    Alert.alert("Berhasil", `${prod.name} ditambahkan ke katalog.`);
  };

  const simpanEditProduk = () => {
    if (!editProdukForm.name?.trim() || !editProdukForm.price) {
      return Alert.alert("Lengkapi Data", "Nama dan harga wajib diisi.");
    }
    const satNama = getSatuanNama(editProdukForm.satuanId);
    setCatalogProducts(prev => prev.map(p =>
      p.id === editProdukTarget.id
        ? { ...p, ...editProdukForm, satuan: satNama }
        : p
    ));
    setEditProdukModal(false);
    setEditProdukTarget(null);
    Alert.alert("Tersimpan", "Produk berhasil diperbarui.");
  };

  const hapusProduk = (id) => {
    Alert.alert("Hapus Produk", "Yakin ingin menghapus produk ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus", style: "destructive", onPress: () => {
          setCatalogProducts(prev => prev.filter(p => p.id !== id));
          setProductDetailModal(false);
        }
      },
    ]);
  };

  // ── Cart actions
  const addToCart = (product) => {
    if (product.pantauStok && product.stok === 0) {
      Alert.alert("Stok Habis", `${product.name} sudah tidak tersedia.`);
      return;
    }
    setCartItems(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) {
        if (product.pantauStok && ex.qty >= product.stok) {
          Alert.alert("Stok Tidak Cukup", `Stok ${product.name} hanya ${product.stok}.`);
          return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, {
        id: product.id, name: product.name, price: product.price,
        qty: 1, note: product.note, image: product.image, emoji: product.emoji,
        satuan: product.satuan || getSatuanNama(product.satuanId),
      }];
    });
  };

  const updateCartQty = (id, delta) => {
    setCartItems(prev =>
      prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)
        .filter(i => i.qty > 0)
    );
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const getCartQty = (id) => { const it = cartItems.find(i => i.id === id); return it ? it.qty : 0; };

  // ── Save transaction
  const saveTrx = (isDraft = false) => {
    const isCicilan = checkout.tipeBayar === "cicilan";
    const statusFinal = isDraft ? "belum_bayar" : (isCicilan ? checkout.status : "lunas");
    const trx = {
      id: Date.now().toString(),
      items: cartItems.map(i => ({ ...i })),
      subtotal: totalHarga,
      diskon: checkout.diskon,
      pajak: checkout.pajak,
      ongkir: checkout.ongkir,
      grandTotal,
      tanggal: checkout.tanggal || todayStr(),
      jatuhTempo: isCicilan ? checkout.jatuhTempo : "",
      pelanggan: checkout.pelanggan,
      waNumber: checkout.waNumber,
      meja: checkout.meja,
      sales: checkout.sales,
      keterangan: checkout.keterangan,
      status: statusFinal,
      docType: checkout.docType || "STRUK",
      invoiceNo: checkout.docType === "INVOICE"
        ? (checkout.invoiceNo || nextInvoiceNo())
        : nextInvoiceNo(),
      tipeBayar: checkout.tipeBayar || "langsung",
      isDraft,
      isRefund: false,
      payments: [],
    };
    if (!isDraft) {
      cartItems.forEach(ci => {
        setCatalogProducts(prev => prev.map(p =>
          p.id === ci.id && p.pantauStok ? { ...p, stok: Math.max(0, p.stok - ci.qty) } : p
        ));
      });
    }
    setTransactions(prev => [trx, ...prev]);
    return trx;
  };

  const handleProses = () => {
    if (cartItems.length === 0) { Alert.alert("Keranjang Kosong", "Tambahkan produk terlebih dahulu."); return; }
    const isCicilan = checkout.tipeBayar === "cicilan";
    Alert.alert(
      "Konfirmasi Pembayaran",
      `Total: ${fmtRp(grandTotal)}\nJenis: ${isCicilan ? "Cicilan" : "Langsung"}\nStatus: ${isCicilan ? checkout.status === "lunas" ? "Lunas" : "Belum Bayar" : "Lunas"}${isCicilan && checkout.jatuhTempo ? "\nJatuh Tempo: " + formatDate(checkout.jatuhTempo) : ""}`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Proses", onPress: () => {
            const trx = saveTrx(false);
            setCartItems([]);
            setCheckout({
              diskon: "", pajak: "", ongkir: "", tanggal: todayStr(), jatuhTempo: "",
              pelanggan: "", waNumber: "", meja: "", sales: "", keterangan: "",
              status: "belum_bayar", invoiceNo: "", docType: "STRUK", tipeBayar: "langsung",
            });
            setCartModal(false);
            Alert.alert(
              "Transaksi Berhasil! 🎉",
              `Invoice ${trx.invoiceNo}\nTotal: ${fmtRp(trx.grandTotal)}\n\nKirim invoice ke WhatsApp?`,
              [
                { text: "Nanti", style: "cancel" },
                { text: "Kirim WA", onPress: () => shareToWhatsApp(trx, tokoInfo) },
              ]
            );
          }
        },
      ]
    );
  };

  const handleDraft = () => {
    if (cartItems.length === 0) { Alert.alert("Keranjang Kosong"); return; }
    saveTrx(true);
    setCartItems([]);
    setCartModal(false);
    Alert.alert("Draft Tersimpan", "Transaksi disimpan sebagai draft.");
  };

  const loadDraft = (trx) => {
    setCartItems(trx.items.map(i => ({ ...i })));
    setCheckout({
      diskon: trx.diskon || "", pajak: trx.pajak || "", ongkir: trx.ongkir || "",
      tanggal: trx.tanggal || todayStr(), jatuhTempo: trx.jatuhTempo || "",
      pelanggan: trx.pelanggan || "", waNumber: trx.waNumber || "",
      meja: trx.meja || "", sales: trx.sales || "",
      keterangan: trx.keterangan || "", status: trx.status || "belum_bayar",
      invoiceNo: trx.invoiceNo || "", docType: trx.docType || "STRUK",
      tipeBayar: trx.tipeBayar || "langsung",
    });
    setTransactions(prev => prev.filter(t => t.id !== trx.id));
    setActiveTab("kasir");
    setCartModal(true);
  };

  const bayarPiutang = (trx, jumlah) => {
    setTransactions(prev => prev.map(t => {
      if (t.id !== trx.id) return t;
      const payments = [...(t.payments || []), { tanggal: todayStr(), jumlah: parseInt(jumlah) }];
      const totalBayar = payments.reduce((s, p) => s + p.jumlah, 0);
      return { ...t, payments, status: totalBayar >= t.grandTotal ? "lunas" : "belum_bayar" };
    }));
  };

  const handleRefund = (trx) => {
    Alert.alert("Konfirmasi Refund", `Refund transaksi ${fmtRp(trx.grandTotal)}?`, [
      { text: "Batal", style: "cancel" },
      {
        text: "Refund", style: "destructive", onPress: () => {
          const refundTrx = {
            ...trx, id: Date.now().toString(), tanggal: todayStr(), isRefund: true, isDraft: false,
            invoiceNo: `REF-${trx.invoiceNo || trx.id.slice(-4)}`,
            keterangan: `Refund dari transaksi ${trx.invoiceNo || trx.id.slice(-6)}`, status: "lunas",
          };
          setTransactions(prev => [refundTrx, ...prev]);
          setDetailModal(false);
          Alert.alert("Refund Berhasil");
        }
      },
    ]);
  };

  const hapusTrx = (trx) => {
    Alert.alert("Hapus Transaksi", "Yakin ingin menghapus?", [
      { text: "Batal", style: "cancel" },
      { text: "Hapus", style: "destructive", onPress: () => { setTransactions(prev => prev.filter(t => t.id !== trx.id)); setDetailModal(false); } }
    ]);
  };

  const saveEdit = () => {
    setTransactions(prev => prev.map(t => t.id === editTrx.id ? { ...editTrx } : t));
    setEditModal(false);
    setDetailModal(false);
    Alert.alert("Tersimpan", "Transaksi berhasil diperbarui.");
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!res.canceled) setNewProduct(p => ({ ...p, image: res.assets[0].uri }));
  };

  const takePhoto = async () => {
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!res.canceled) setNewProduct(p => ({ ...p, image: res.assets[0].uri }));
  };

  const requestCameraPermission = async () => {
    const res = await requestPermission();
    if (!res.granted) { Alert.alert("Izin Ditolak", "Izin kamera diperlukan."); return; }
    setScanModal(true);
  };

  const handleBarCodeScanned = ({ data }) => {
    setNewProduct(p => ({ ...p, barcode: data }));
    setScanModal(false);
  };

  const handlePrint = async (trxData) => {
    setIsPrinting(true);
    try {
      const itemsData = trxData ? trxData.items : cartItems;
      const checkoutData = trxData || checkout;
      const totalData = trxData ? trxData.subtotal : totalHarga;
      const html = buildReceiptHTML(itemsData, checkoutData, totalData, checkoutData.docType, tokoInfo);
      await Print.printAsync({ html });
    } catch (e) { Alert.alert("Gagal Print"); }
    finally { setIsPrinting(false); }
  };

  const handleSharePDF = async (trxData) => {
    setIsPrinting(true);
    try {
      const itemsData = trxData ? trxData.items : cartItems;
      const checkoutData = trxData || checkout;
      const totalData = trxData ? trxData.subtotal : totalHarga;
      const html = buildReceiptHTML(itemsData, checkoutData, totalData, checkoutData.docType, tokoInfo);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
    } catch (e) { Alert.alert("Gagal membuat PDF"); }
    finally { setIsPrinting(false); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── RENDER KASIR ─────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderKasir = () => (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={S.header}>
        <View style={S.headerTop}>
          <View>
            <Text style={S.appTitle}>{tokoInfo.nama}</Text>
            <Text style={S.appSub}>Point of Sale · {checkout.docType}</Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={S.iconBtn} onPress={requestCameraPermission}>
              <MaterialIcons name="qr-code-scanner" size={20} color={C.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[S.iconBtn, { borderColor: C.purple + "66" }]}
              onPress={() => setCheckout(c => ({
                ...c,
                docType: c.docType === "INVOICE" ? "STRUK" : "INVOICE",
                invoiceNo: c.docType === "INVOICE" ? "" : nextInvoiceNo(),
              }))}>
              <MaterialIcons name="receipt-long" size={20} color={C.purple} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[S.iconBtn, { backgroundColor: C.accent, borderColor: C.accent }]}
              onPress={() => setAddProductModal(true)}>
              <MaterialIcons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
        <View style={S.searchBar}>
          <Ionicons name="search" size={15} color={C.muted} />
          <TextInput
            style={S.searchInput}
            placeholder="Cari produk di katalog..."
            placeholderTextColor={C.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {cartItems.length > 0 && (
            <View style={S.searchBadge}>
              <Text style={S.searchBadgeText}>{cartItems.reduce((s, i) => s + i.qty, 0)}</Text>
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={S.statsRow}>
          <StatPill label="Item" value={cartItems.length.toString()} color={C.accent} />
          <View style={S.statDivider} />
          <StatPill label="Subtotal" value={fmtRp(totalHarga)} color={C.success} />
          <View style={S.statDivider} />
          <StatPill label="Grand Total" value={fmtRp(grandTotal)} color={C.gold} />
        </View>
      </View>

      {/* Category Chips — dari kategoriList user */}
      <View style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 4 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => setActiveCategory("semua")}
            style={[S.chip, activeCategory === "semua" && S.chipActive]}>
            <Text style={[S.chipText, activeCategory === "semua" && S.chipTextActive]}>Semua</Text>
          </TouchableOpacity>
          {kategoriList.map(kat => (
            <TouchableOpacity
              key={kat.id}
              onPress={() => setActiveCategory(kat.id)}
              style={[S.chip, activeCategory === kat.id && S.chipActive]}>
              <Text style={[S.chipText, activeCategory === kat.id && S.chipTextActive]}>
                {kat.ikon} {kat.nama}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <View style={S.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
          <Text style={S.emptyTitle}>
            {catalogProducts.length === 0 ? "Belum Ada Produk" : "Produk Tidak Ditemukan"}
          </Text>
          <Text style={S.emptyDesc}>
            {catalogProducts.length === 0
              ? "Tambah produk pertama kamu lewat tombol +"
              : "Coba kata kunci lain atau kategori berbeda"}
          </Text>
          <TouchableOpacity style={S.emptyBtn} onPress={() => setAddProductModal(true)}>
            <MaterialIcons name="add" size={16} color="#fff" />
            <Text style={S.emptyBtnText}>Tambah Produk Baru</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={p => p.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 130 }}
          columnWrapperStyle={{ gap: 10 }}
          renderItem={({ item }) => {
            const stok = getStokStatus(item);
            const qtyInCart = getCartQty(item.id);
            const katNama = getKategoriNama(item.kategoriId);
            return (
              <TouchableOpacity
                style={S.productCard}
                onPress={() => { setSelectedProduct(item); setProductDetailModal(true); }}
                onLongPress={() => addToCart(item)}
                activeOpacity={0.85}>
                <View style={S.productImgWrap}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={S.productImg} />
                  ) : (
                    <View style={S.productEmojiBox}>
                      <Text style={{ fontSize: 40 }}>{item.emoji || "📦"}</Text>
                    </View>
                  )}
                  {stok && (
                    <View style={[S.stokBadge, { backgroundColor: stok.bg, borderColor: stok.border }]}>
                      <Text style={[S.stokBadgeText, { color: stok.color }]}>{stok.label}</Text>
                    </View>
                  )}
                  {qtyInCart > 0 && (
                    <View style={S.cartQtyBadge}>
                      <Text style={S.cartQtyBadgeText}>{qtyInCart}</Text>
                    </View>
                  )}
                </View>
                <View style={S.productInfo}>
                  <Text style={S.productName} numberOfLines={2}>{item.name}</Text>
                  {katNama ? <Text style={S.productCategory}>{katNama}</Text> : null}
                  <Text style={S.productPrice}>{fmtRp(parseInt(item.price || 0))}</Text>
                  <Text style={{ color: C.muted, fontSize: 10, marginBottom: 2 }}>
                    / {item.satuan || getSatuanNama(item.satuanId)}
                  </Text>
                  {item.note ? <Text style={S.productNote} numberOfLines={1}>{item.note}</Text> : null}
                  {qtyInCart > 0 ? (
                    <View style={S.qtyRow}>
                      <TouchableOpacity style={S.qtyBtn} onPress={() => updateCartQty(item.id, -1)}>
                        <Text style={S.qtyBtnTxt}>−</Text>
                      </TouchableOpacity>
                      <Text style={S.qtyVal}>{qtyInCart}</Text>
                      <TouchableOpacity style={S.qtyBtn} onPress={() => addToCart(item)}>
                        <Text style={S.qtyBtnTxt}>+</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[S.addBtn, item.stok === 0 && item.pantauStok && { backgroundColor: C.dangerDim, borderColor: C.danger + "44" }]}
                      onPress={() => addToCart(item)}
                      disabled={item.stok === 0 && item.pantauStok}>
                      <MaterialIcons
                        name={item.stok === 0 && item.pantauStok ? "remove-shopping-cart" : "add-shopping-cart"}
                        size={14}
                        color={item.stok === 0 && item.pantauStok ? C.danger : C.accent}
                      />
                      <Text style={[S.addBtnText, item.stok === 0 && item.pantauStok && { color: C.danger }]}>
                        {item.stok === 0 && item.pantauStok ? "Habis" : "+ Keranjang"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Bottom Action Bar */}
      <View style={S.bottomBar}>
        <TouchableOpacity style={S.quickAddBtn} onPress={() => setQuickModal(true)}>
          <MaterialIcons name="bolt" size={22} color={C.gold} />
          <Text style={{ color: C.gold, fontSize: 10, fontWeight: "700", marginTop: 1 }}>Cepat</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[S.checkoutBtn, cartItems.length === 0 && { opacity: 0.5 }]}
          onPress={() => { if (cartItems.length === 0) { Alert.alert("Keranjang Kosong"); return; } setCartModal(true); }}
          activeOpacity={0.85}>
          <View>
            <Text style={S.checkoutBtnSub}>{cartItems.reduce((s, i) => s + i.qty, 0)} item · {cartItems.length} produk</Text>
            <Text style={S.checkoutBtnTotal}>{fmtRp(grandTotal)}</Text>
          </View>
          <View style={S.checkoutBtnRight}>
            <Ionicons name="receipt-outline" size={16} color={C.accent} />
            <Text style={{ color: C.accent, fontSize: 11, fontWeight: "700" }}>Bayar</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── RENDER RIWAYAT ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderRiwayat = () => {
    const filtered = riwayatList.filter(t => filterStatus === "semua" || t.status === filterStatus);
    return (
      <View style={{ flex: 1 }}>
        <View style={S.header}>
          <View style={S.headerTop}>
            <View>
              <Text style={S.appTitle}>Riwayat Transaksi</Text>
              <Text style={S.appSub}>{riwayatList.length} total transaksi</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {[["semua", "Semua"], ["lunas", "Lunas"], ["belum_bayar", "Belum Bayar"]].map(([k, l]) => (
              <TouchableOpacity key={k} onPress={() => setFilterStatus(k)} style={[S.chip, filterStatus === k && S.chipActive]}>
                <Text style={[S.chipText, filterStatus === k && S.chipTextActive]}>{l}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {filtered.length === 0 ? (
          <View style={S.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🧾</Text>
            <Text style={S.emptyTitle}>Belum Ada Riwayat</Text>
            <Text style={S.emptyDesc}>Selesaikan transaksi dari kasir</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={t => t.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 90 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => { setSelectedTrx(item); setDetailModal(true); }} style={S.trxCard}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <Text style={S.trxName} numberOfLines={1}>{item.pelanggan || "Pelanggan Umum"}</Text>
                      {item.isRefund && <View style={[S.docBadge, { backgroundColor: C.dangerDim, borderColor: C.danger + "44" }]}><Text style={{ color: C.danger, fontSize: 9, fontWeight: "700" }}>REFUND</Text></View>}
                      {item.tipeBayar === "cicilan" && <View style={[S.docBadge, { backgroundColor: C.goldDim, borderColor: C.gold + "44" }]}><Text style={{ color: C.gold, fontSize: 9, fontWeight: "700" }}>CICILAN</Text></View>}
                    </View>
                    <Text style={S.trxMeta}>
                      {formatDate(item.tanggal)} · {item.items?.length || 0} produk · {item.invoiceNo}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={S.trxTotal}>{fmtRp(item.grandTotal)}</Text>
                    <View style={[S.statusBadge, item.status === "lunas" ? S.badgePaid : S.badgeUnpaid, { marginTop: 4 }]}>
                      <Text style={[S.statusText, { color: item.status === "lunas" ? C.success : C.gold }]}>
                        {item.status === "lunas" ? "Lunas" : "Belum Bayar"}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── RENDER PIUTANG ───────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderPiutang = () => {
    const totalPiutang = piutangList.reduce((s, t) => {
      const bayar = (t.payments || []).reduce((x, p) => x + p.jumlah, 0);
      return s + (t.grandTotal - bayar);
    }, 0);
    return (
      <View style={{ flex: 1 }}>
        <View style={S.header}>
          <View style={S.headerTop}>
            <View>
              <Text style={S.appTitle}>Piutang</Text>
              <Text style={S.appSub}>{piutangList.length} belum lunas</Text>
            </View>
          </View>
          <View style={S.piutangSummary}>
            <Ionicons name="alert-circle" size={28} color={C.gold} />
            <View style={{ marginLeft: 12 }}>
              <Text style={{ color: C.muted, fontSize: 12 }}>Total Piutang</Text>
              <Text style={{ color: C.gold, fontWeight: "700", fontSize: 22 }}>{fmtRp(totalPiutang)}</Text>
            </View>
          </View>
        </View>
        {piutangList.length === 0 ? (
          <View style={S.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
            <Text style={S.emptyTitle}>Tidak Ada Piutang</Text>
            <Text style={S.emptyDesc}>Semua transaksi sudah lunas</Text>
          </View>
        ) : (
          <FlatList
            data={piutangList}
            keyExtractor={t => t.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 10, gap: 10, paddingBottom: 90 }}
            renderItem={({ item }) => {
              const bayar = (item.payments || []).reduce((s, p) => s + p.jumlah, 0);
              const sisa = item.grandTotal - bayar;
              const pct = Math.min(100, (bayar / item.grandTotal) * 100);
              return (
                <TouchableOpacity onPress={() => { setSelectedTrx(item); setDetailModal(true); }} style={S.trxCard}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={S.trxName} numberOfLines={1}>{item.pelanggan || "Pelanggan Umum"}</Text>
                      <Text style={S.trxMeta}>
                        {formatDate(item.tanggal)}{item.jatuhTempo ? ` · Jatuh: ${formatDate(item.jatuhTempo)}` : ""}
                      </Text>
                      {item.waNumber ? <Text style={{ color: C.accent, fontSize: 11, marginTop: 2 }}>WA: {item.waNumber}</Text> : null}
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ color: C.danger, fontWeight: "700", fontSize: 15 }}>{fmtRp(sisa)}</Text>
                      <Text style={{ color: C.muted, fontSize: 11 }}>dari {fmtRp(item.grandTotal)}</Text>
                    </View>
                  </View>
                  <View style={{ height: 4, backgroundColor: C.border, borderRadius: 2, marginBottom: 5 }}>
                    <View style={{ height: 4, width: `${pct}%`, backgroundColor: C.success, borderRadius: 2 }} />
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
                    <Text style={{ color: C.muted, fontSize: 10 }}>Dibayar {fmtRp(bayar)}</Text>
                    <Text style={{ color: C.muted, fontSize: 10 }}>{Math.round(pct)}%</Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                      style={[S.smallBtn, { flex: 1, backgroundColor: C.successDim, borderColor: C.success + "44" }]}
                      onPress={() => Alert.prompt(
                        "Bayar Piutang",
                        `Sisa: ${fmtRp(sisa)}`,
                        [{ text: "Batal", style: "cancel" }, { text: "Bayar", onPress: (v) => bayarPiutang(item, v || sisa) }],
                        "plain-text", sisa.toString(), "numeric"
                      )}>
                      <Ionicons name="cash-outline" size={13} color={C.success} />
                      <Text style={{ color: C.success, fontSize: 12, fontWeight: "600" }}>Bayar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[S.smallBtn, { flex: 1, backgroundColor: "#25D36622", borderColor: "#25D36644" }]}
                      onPress={() => shareToWhatsApp(item, tokoInfo)}>
                      <Ionicons name="logo-whatsapp" size={13} color="#25D366" />
                      <Text style={{ color: "#25D366", fontSize: 12, fontWeight: "600" }}>WA</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    );
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── RENDER DRAFT ─────────────────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderDraft = () => (
    <View style={{ flex: 1 }}>
      <View style={S.header}>
        <View style={S.headerTop}>
          <View>
            <Text style={S.appTitle}>Draft</Text>
            <Text style={S.appSub}>{draftList.length} draft tersimpan</Text>
          </View>
        </View>
      </View>
      {draftList.length === 0 ? (
        <View style={S.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📝</Text>
          <Text style={S.emptyTitle}>Belum Ada Draft</Text>
          <Text style={S.emptyDesc}>Simpan transaksi sebagai draft{"\n"}agar bisa dilanjutkan nanti</Text>
        </View>
      ) : (
        <FlatList
          data={draftList}
          keyExtractor={t => t.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 14, gap: 10, paddingBottom: 90 }}
          renderItem={({ item }) => (
            <View style={S.trxCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={S.trxName} numberOfLines={1}>{item.pelanggan || "Draft Tanpa Nama"}</Text>
                  <Text style={S.trxMeta}>{formatDate(item.tanggal)} · {item.items?.length || 0} produk</Text>
                </View>
                <Text style={S.trxTotal}>{fmtRp(item.grandTotal)}</Text>
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity style={[S.smallBtn, { flex: 1, backgroundColor: C.accentDim, borderColor: C.accentBorder }]} onPress={() => loadDraft(item)}>
                  <Ionicons name="play-outline" size={14} color={C.accent} />
                  <Text style={{ color: C.accent, fontSize: 12, fontWeight: "600" }}>Lanjutkan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[S.smallBtn, { backgroundColor: C.dangerDim, borderColor: C.danger + "44" }]}
                  onPress={() => Alert.alert("Hapus Draft", "Yakin?", [
                    { text: "Batal", style: "cancel" },
                    { text: "Hapus", style: "destructive", onPress: () => setTransactions(prev => prev.filter(t => t.id !== item.id)) }
                  ])}>
                  <Ionicons name="trash-outline" size={14} color={C.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // ─── RENDER PENGATURAN (NEW TAB) ──────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════════════════════
  const renderPengaturan = () => (
    <View style={{ flex: 1 }}>
      <View style={S.header}>
        <View style={S.headerTop}>
          <View>
            <Text style={S.appTitle}>Pengaturan</Text>
            <Text style={S.appSub}>Kelola toko, kategori & satuan</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14, gap: 14, paddingBottom: 90 }}>

        {/* ── INFO TOKO */}
        <Text style={S.sectionHead}>Informasi Toko</Text>
        <View style={S.inputGroup}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 15 }}>{tokoInfo.nama}</Text>
              <Text style={{ color: C.textSec, fontSize: 12, marginTop: 2 }}>{tokoInfo.alamat}</Text>
              {tokoInfo.telp ? <Text style={{ color: C.muted, fontSize: 12 }}>Telp: {tokoInfo.telp}</Text> : null}
              <Text style={{ color: C.muted, fontSize: 12 }}>Penerima: {tokoInfo.penerima}</Text>
            </View>
            <TouchableOpacity
              onPress={() => { setEditTokoForm({ ...tokoInfo }); setTokoModal(true); }}
              style={[S.iconBtn, { borderColor: C.goldDim }]}>
              <Ionicons name="create-outline" size={18} color={C.gold} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── KATEGORI */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={S.sectionHead}>Kategori Produk</Text>
          <TouchableOpacity
            onPress={() => { setNewKategori({ nama: "", ikon: "🗂️" }); setKategoriModal(true); }}
            style={[S.iconBtn, { backgroundColor: C.accent, borderColor: C.accent }]}>
            <MaterialIcons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        {kategoriList.length === 0 ? (
          <View style={[S.inputGroup, { paddingVertical: 16, alignItems: "center" }]}>
            <Text style={{ color: C.muted, fontSize: 13 }}>Belum ada kategori. Tap + untuk menambah.</Text>
          </View>
        ) : (
          <View style={S.inputGroup}>
            {kategoriList.map((kat, idx) => (
              <View key={kat.id}>
                {idx > 0 && <View style={S.divider} />}
                <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{kat.ikon}</Text>
                  <Text style={{ flex: 1, color: C.text, fontSize: 14, fontWeight: "600" }}>{kat.nama}</Text>
                  <Text style={{ color: C.muted, fontSize: 11, marginRight: 10 }}>
                    {catalogProducts.filter(p => p.kategoriId === kat.id).length} produk
                  </Text>
                  <TouchableOpacity
                    onPress={() => { setEditKategoriTarget(kat); setEditKategoriForm({ nama: kat.nama, ikon: kat.ikon }); setEditKategoriModal(true); }}
                    style={{ marginRight: 8 }}>
                    <Ionicons name="create-outline" size={18} color={C.gold} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => hapusKategori(kat.id)}>
                    <Ionicons name="trash-outline" size={18} color={C.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ── SATUAN */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={S.sectionHead}>Satuan Produk</Text>
          <TouchableOpacity
            onPress={() => setSatuanModal(true)}
            style={[S.iconBtn, { backgroundColor: C.accent, borderColor: C.accent }]}>
            <MaterialIcons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={[S.inputGroup, { paddingVertical: 12, paddingHorizontal: 14 }]}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {satuanList.map(sat => (
              <View key={sat.id} style={S.satuanChip}>
                <Text style={{ color: C.text, fontSize: 13, fontWeight: "600" }}>{sat.nama}</Text>
                <TouchableOpacity onPress={() => hapusSatuan(sat.id)} style={{ marginLeft: 8 }}>
                  <Ionicons name="close-circle" size={16} color={C.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* ── PRODUK */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={S.sectionHead}>Daftar Produk ({catalogProducts.length})</Text>
          <TouchableOpacity
            onPress={() => setAddProductModal(true)}
            style={[S.iconBtn, { backgroundColor: C.accent, borderColor: C.accent }]}>
            <MaterialIcons name="add" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
        {catalogProducts.length === 0 ? (
          <View style={[S.inputGroup, { paddingVertical: 16, alignItems: "center" }]}>
            <Text style={{ color: C.muted, fontSize: 13 }}>Belum ada produk.</Text>
          </View>
        ) : (
          <View style={S.inputGroup}>
            {catalogProducts.map((prod, idx) => {
              const katNama = getKategoriNama(prod.kategoriId);
              return (
                <View key={prod.id}>
                  {idx > 0 && <View style={S.divider} />}
                  <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 12 }}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{prod.emoji || "📦"}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.text, fontSize: 14, fontWeight: "600" }}>{prod.name}</Text>
                      <Text style={{ color: C.accent, fontSize: 12 }}>
                        {fmtRp(parseInt(prod.price || 0))} / {prod.satuan || getSatuanNama(prod.satuanId)}
                      </Text>
                      {katNama ? <Text style={{ color: C.muted, fontSize: 11 }}>{katNama}</Text> : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => { setEditProdukTarget(prod); setEditProdukForm({ ...prod }); setEditProdukModal(true); }}
                      style={{ marginRight: 8 }}>
                      <Ionicons name="create-outline" size={18} color={C.gold} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => hapusProduk(prod.id)}>
                      <Ionicons name="trash-outline" size={18} color={C.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );

  // ─── TABS ─────────────────────────────────────────────────────────────────
  const tabs = [
    { key: "kasir", icon: "calculator-outline", label: "Kasir" },
    { key: "riwayat", icon: "time-outline", label: "Riwayat", count: riwayatList.length },
    { key: "piutang", icon: "alert-circle-outline", label: "Piutang", count: piutangList.length },
    { key: "draft", icon: "document-text-outline", label: "Draft", count: draftList.length },
    { key: "pengaturan", icon: "settings-outline", label: "Setting" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {activeTab === "kasir" && renderKasir()}
      {activeTab === "riwayat" && renderRiwayat()}
      {activeTab === "piutang" && renderPiutang()}
      {activeTab === "draft" && renderDraft()}
      {activeTab === "pengaturan" && renderPengaturan()}

      {/* Tab Bar */}
      <View style={S.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity key={t.key} style={S.tabItem} onPress={() => setActiveTab(t.key)}>
            <View style={{ position: "relative" }}>
              <Ionicons name={t.icon} size={22} color={activeTab === t.key ? C.accent : C.muted} />
              {t.count > 0 && (
                <View style={S.tabBadge}>
                  <Text style={S.tabBadgeText}>{t.count > 99 ? "99+" : t.count}</Text>
                </View>
              )}
            </View>
            <Text style={[S.tabLabel, { color: activeTab === t.key ? C.accent : C.muted }]}>{t.label}</Text>
            {activeTab === t.key && <View style={S.tabIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* ══════════════════════════════════════════════════════════════════════
          NEW MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── MODAL: Info Toko */}
      <Modal visible={tokoModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <ModalHeader title="Informasi Toko" onBack={() => setTokoModal(false)} />
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
            <Text style={S.fieldLabel}>Nama Toko</Text>
            <TextInput style={S.input} value={editTokoForm.nama}
              onChangeText={t => setEditTokoForm(f => ({ ...f, nama: t }))}
              placeholder="Nama toko..." placeholderTextColor={C.muted} />
            <Text style={S.fieldLabel}>Alamat</Text>
            <TextInput style={[S.input, { height: 72, textAlignVertical: "top" }]} multiline
              value={editTokoForm.alamat}
              onChangeText={t => setEditTokoForm(f => ({ ...f, alamat: t }))}
              placeholder="Alamat toko..." placeholderTextColor={C.muted} />
            <Text style={S.fieldLabel}>Nomor Telepon</Text>
            <TextInput style={S.input} value={editTokoForm.telp}
              onChangeText={t => setEditTokoForm(f => ({ ...f, telp: t }))}
              placeholder="08xxxxxxxxxx" placeholderTextColor={C.muted} keyboardType="phone-pad" />
            <Text style={S.fieldLabel}>Penerima (untuk tanda tangan invoice)</Text>
            <TextInput style={S.input} value={editTokoForm.penerima}
              onChangeText={t => setEditTokoForm(f => ({ ...f, penerima: t }))}
              placeholder="Nama penerima / jabatan..." placeholderTextColor={C.muted} />
          </ScrollView>
          <View style={S.modalFooter}>
            <TouchableOpacity style={S.saveFullBtn} onPress={() => { setTokoInfo({ ...editTokoForm }); setTokoModal(false); Alert.alert("Tersimpan", "Info toko berhasil diperbarui."); }}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={S.saveFullBtnText}>Simpan Info Toko</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Tambah Kategori */}
      <Modal visible={kategoriModal} transparent animationType="slide">
        <View style={S.sheet}>
          <View style={S.sheetInner}>
            <View style={S.sheetHandle} />
            <Text style={S.sheetTitle}>Tambah Kategori</Text>
            <Text style={S.fieldLabel}>Ikon / Emoji</Text>
            <TextInput style={S.input} value={newKategori.ikon}
              onChangeText={t => setNewKategori(f => ({ ...f, ikon: t }))}
              placeholder="🗂️" placeholderTextColor={C.muted} />
            <Text style={S.fieldLabel}>Nama Kategori *</Text>
            <TextInput style={S.input} value={newKategori.nama}
              onChangeText={t => setNewKategori(f => ({ ...f, nama: t }))}
              placeholder="Contoh: Makanan, Minuman..." placeholderTextColor={C.muted} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setKategoriModal(false)}>
                <Text style={S.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.saveBtn} onPress={tambahKategori}>
                <Text style={S.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Edit Kategori */}
      <Modal visible={editKategoriModal} transparent animationType="slide">
        <View style={S.sheet}>
          <View style={S.sheetInner}>
            <View style={S.sheetHandle} />
            <Text style={S.sheetTitle}>Edit Kategori</Text>
            <Text style={S.fieldLabel}>Ikon / Emoji</Text>
            <TextInput style={S.input} value={editKategoriForm.ikon}
              onChangeText={t => setEditKategoriForm(f => ({ ...f, ikon: t }))}
              placeholder="🗂️" placeholderTextColor={C.muted} />
            <Text style={S.fieldLabel}>Nama Kategori *</Text>
            <TextInput style={S.input} value={editKategoriForm.nama}
              onChangeText={t => setEditKategoriForm(f => ({ ...f, nama: t }))}
              placeholder="Nama kategori..." placeholderTextColor={C.muted} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setEditKategoriModal(false)}>
                <Text style={S.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.saveBtn} onPress={simpanEditKategori}>
                <Text style={S.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Tambah Satuan */}
      <Modal visible={satuanModal} transparent animationType="slide">
        <View style={S.sheet}>
          <View style={S.sheetInner}>
            <View style={S.sheetHandle} />
            <Text style={S.sheetTitle}>Tambah Satuan</Text>
            <Text style={{ color: C.textSec, fontSize: 12, marginBottom: 12 }}>Contoh: pcs, dos, bal, lusin, karton, kg, liter...</Text>
            <Text style={S.fieldLabel}>Nama Satuan</Text>
            <TextInput style={S.input} value={newSatuan}
              onChangeText={setNewSatuan}
              placeholder="Nama satuan..." placeholderTextColor={C.muted} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setSatuanModal(false)}>
                <Text style={S.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={S.saveBtn} onPress={() => { tambahSatuan(); setSatuanModal(false); }}>
                <Text style={S.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Edit Produk */}
      <Modal visible={editProdukModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <ModalHeader title="Edit Produk" onBack={() => { setEditProdukModal(false); setEditProdukTarget(null); }} />
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            <Text style={S.fieldLabel}>Nama Produk *</Text>
            <TextInput style={S.input} value={editProdukForm.name}
              onChangeText={t => setEditProdukForm(f => ({ ...f, name: t }))}
              placeholder="Nama produk..." placeholderTextColor={C.muted} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1.5 }}>
                <Text style={S.fieldLabel}>Harga (Rp) *</Text>
                <TextInput style={S.input} keyboardType="numeric" value={editProdukForm.price}
                  onChangeText={t => setEditProdukForm(f => ({ ...f, price: t.replace(/[^0-9]/g, "") }))}
                  placeholder="0" placeholderTextColor={C.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.fieldLabel}>Emoji</Text>
                <TextInput style={S.input} value={editProdukForm.emoji}
                  onChangeText={t => setEditProdukForm(f => ({ ...f, emoji: t }))}
                  placeholder="📦" placeholderTextColor={C.muted} />
              </View>
            </View>

            <Text style={S.fieldLabel}>Satuan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 4 }}>
              {satuanList.map(sat => (
                <TouchableOpacity key={sat.id}
                  onPress={() => setEditProdukForm(f => ({ ...f, satuanId: sat.id, satuan: sat.nama }))}
                  style={[S.chip, editProdukForm.satuanId === sat.id && S.chipActive]}>
                  <Text style={[S.chipText, editProdukForm.satuanId === sat.id && S.chipTextActive]}>{sat.nama}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={S.fieldLabel}>Kategori</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 4 }}>
              <TouchableOpacity
                onPress={() => setEditProdukForm(f => ({ ...f, kategoriId: "" }))}
                style={[S.chip, !editProdukForm.kategoriId && S.chipActive]}>
                <Text style={[S.chipText, !editProdukForm.kategoriId && S.chipTextActive]}>Tanpa Kategori</Text>
              </TouchableOpacity>
              {kategoriList.map(kat => (
                <TouchableOpacity key={kat.id}
                  onPress={() => setEditProdukForm(f => ({ ...f, kategoriId: kat.id }))}
                  style={[S.chip, editProdukForm.kategoriId === kat.id && S.chipActive]}>
                  <Text style={[S.chipText, editProdukForm.kategoriId === kat.id && S.chipTextActive]}>
                    {kat.ikon} {kat.nama}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={S.fieldLabel}>Keterangan</Text>
            <TextInput style={[S.input, { height: 72, textAlignVertical: "top" }]} multiline
              value={editProdukForm.note}
              onChangeText={t => setEditProdukForm(f => ({ ...f, note: t }))}
              placeholder="Deskripsi produk..." placeholderTextColor={C.muted} />

            <View style={S.switchRow}>
              <View>
                <Text style={{ color: C.text, fontWeight: "600", fontSize: 14 }}>Pantau Stok</Text>
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Lacak jumlah stok produk</Text>
              </View>
              <TouchableOpacity
                onPress={() => setEditProdukForm(f => ({ ...f, pantauStok: !f.pantauStok }))}
                style={[S.toggle, editProdukForm.pantauStok && S.toggleOn]}>
                <View style={[S.toggleThumb, editProdukForm.pantauStok && S.toggleThumbOn]} />
              </TouchableOpacity>
            </View>

            {editProdukForm.pantauStok && (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Stok Saat Ini</Text>
                  <TextInput style={S.input} keyboardType="numeric"
                    value={String(editProdukForm.stok || "0")}
                    onChangeText={t => setEditProdukForm(f => ({ ...f, stok: parseInt(t.replace(/[^0-9]/g, "") || "0") }))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Stok Minimal</Text>
                  <TextInput style={S.input} keyboardType="numeric"
                    value={String(editProdukForm.stokMinimal || "5")}
                    onChangeText={t => setEditProdukForm(f => ({ ...f, stokMinimal: parseInt(t.replace(/[^0-9]/g, "") || "5") }))} />
                </View>
              </View>
            )}

            {/* Hapus produk */}
            <TouchableOpacity
              onPress={() => hapusProduk(editProdukTarget?.id)}
              style={[S.outlineBtn, { borderColor: C.danger + "55", marginTop: 20 }]}>
              <Ionicons name="trash-outline" size={18} color={C.danger} />
              <Text style={{ color: C.danger, marginLeft: 8, fontWeight: "600" }}>Hapus Produk Ini</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={S.modalFooter}>
            <TouchableOpacity style={S.saveFullBtn} onPress={simpanEditProduk}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={S.saveFullBtnText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ══════════════════════════════════════════════════════════════════════
          ORIGINAL MODALS (unchanged, only enhanced with satuan/kategori)
      ══════════════════════════════════════════════════════════════════════ */}

      {/* ── PRODUCT DETAIL MODAL */}
      <Modal visible={productDetailModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <ModalHeader title="Detail Produk" onBack={() => setProductDetailModal(false)} />
          {selectedProduct && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
              <View style={{ alignItems: "center", marginBottom: 20 }}>
                <View style={[S.productEmojiBox, { width: 120, height: 120, borderRadius: 24 }]}>
                  {selectedProduct.image
                    ? <Image source={{ uri: selectedProduct.image }} style={{ width: 120, height: 120, borderRadius: 24 }} />
                    : <Text style={{ fontSize: 60 }}>{selectedProduct.emoji || "📦"}</Text>}
                </View>
              </View>
              <Text style={{ color: C.text, fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 4 }}>{selectedProduct.name}</Text>
              <Text style={{ color: C.accent, fontSize: 20, fontWeight: "700", textAlign: "center", marginBottom: 2 }}>
                {fmtRp(parseInt(selectedProduct.price || 0))}
              </Text>
              <Text style={{ color: C.muted, fontSize: 13, textAlign: "center", marginBottom: 12 }}>
                / {selectedProduct.satuan || getSatuanNama(selectedProduct.satuanId)}
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginBottom: 16 }}>
                {selectedProduct.kategoriId && (
                  <View style={[S.chip, { backgroundColor: C.accentDim, borderColor: C.accentBorder }]}>
                    <Text style={[S.chipText, { color: C.accent }]}>{getKategoriNama(selectedProduct.kategoriId)}</Text>
                  </View>
                )}
                {selectedProduct.pantauStok && getStokStatus(selectedProduct) && (
                  <View style={[S.chip, { backgroundColor: getStokStatus(selectedProduct).bg, borderColor: getStokStatus(selectedProduct).border }]}>
                    <Text style={[S.chipText, { color: getStokStatus(selectedProduct).color }]}>{getStokStatus(selectedProduct).label}</Text>
                  </View>
                )}
              </View>
              {selectedProduct.note ? (
                <View style={[S.inputGroup, { padding: 14, marginBottom: 16 }]}>
                  <Text style={{ color: C.textSec, fontSize: 14 }}>{selectedProduct.note}</Text>
                </View>
              ) : null}
              <View style={S.inputGroup}>
                <InfoRow label="Satuan" value={selectedProduct.satuan || getSatuanNama(selectedProduct.satuanId)} />
                <View style={S.divider} />
                <InfoRow label="Pantau Stok" value={selectedProduct.pantauStok ? "Ya" : "Tidak"} />
                {selectedProduct.pantauStok && <>
                  <View style={S.divider} />
                  <InfoRow label="Stok Saat Ini" value={`${selectedProduct.stok} unit`} color={getStokStatus(selectedProduct)?.color} />
                  <View style={S.divider} />
                  <InfoRow label="Stok Minimal" value={`${selectedProduct.stokMinimal} unit`} />
                </>}
                {selectedProduct.barcode ? <>
                  <View style={S.divider} />
                  <InfoRow label="Barcode" value={selectedProduct.barcode} />
                </> : null}
              </View>
              {/* Edit shortcut */}
              <TouchableOpacity
                style={[S.outlineBtn, { marginTop: 16, borderColor: C.gold + "55" }]}
                onPress={() => {
                  setEditProdukTarget(selectedProduct);
                  setEditProdukForm({ ...selectedProduct });
                  setProductDetailModal(false);
                  setEditProdukModal(true);
                }}>
                <Ionicons name="create-outline" size={18} color={C.gold} />
                <Text style={{ color: C.gold, marginLeft: 8, fontWeight: "600" }}>Edit Produk Ini</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[S.outlineBtn, { marginTop: 8, borderColor: C.danger + "55" }]}
                onPress={() => hapusProduk(selectedProduct.id)}>
                <Ionicons name="trash-outline" size={18} color={C.danger} />
                <Text style={{ color: C.danger, marginLeft: 8, fontWeight: "600" }}>Hapus Produk Ini</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
          {selectedProduct && (
            <View style={S.modalFooter}>
              {getCartQty(selectedProduct.id) > 0 ? (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity style={[S.saveFullBtn, { flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border }]} onPress={() => updateCartQty(selectedProduct.id, -1)}>
                    <Text style={{ color: C.text, fontWeight: "700", fontSize: 20 }}>−</Text>
                  </TouchableOpacity>
                  <View style={[S.saveFullBtn, { flex: 1, backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder }]}>
                    <Text style={{ color: C.accent, fontWeight: "700", fontSize: 16 }}>{getCartQty(selectedProduct.id)} di keranjang</Text>
                  </View>
                  <TouchableOpacity style={[S.saveFullBtn, { flex: 1 }]} onPress={() => addToCart(selectedProduct)}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 20 }}>+</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={S.saveFullBtn} onPress={() => { addToCart(selectedProduct); setProductDetailModal(false); }}>
                  <MaterialIcons name="add-shopping-cart" size={20} color="#fff" />
                  <Text style={S.saveFullBtnText}>Tambah ke Keranjang</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Modal>

      {/* ── CART / CHECKOUT MODAL (enhanced dengan cicilan) */}
      <Modal visible={cartModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <ModalHeader title={checkout.docType === "INVOICE" ? "Invoice" : "Detail Transaksi"} onBack={() => setCartModal(false)} />
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
            {/* Doc type toggle */}
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
              {[["STRUK", "Struk", "document-text"], ["INVOICE", "Invoice", "receipt"]].map(([k, l, ic]) => (
                <TouchableOpacity key={k}
                  onPress={() => setCheckout(c => ({ ...c, docType: k, invoiceNo: k === "INVOICE" ? nextInvoiceNo() : "" }))}
                  style={[S.statusToggle, checkout.docType === k && { backgroundColor: C.accentDim, borderColor: C.accent }]}>
                  <Ionicons name={ic} size={16} color={checkout.docType === k ? C.accent : C.muted} />
                  <Text style={[S.statusToggleText, checkout.docType === k && { color: C.accent }]}>{l}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {checkout.docType === "INVOICE" && (
              <View style={[S.inputGroup, { marginBottom: 14 }]}>
                <FieldRow label="No. Invoice" value={checkout.invoiceNo} onChangeText={t => setCheckout(c => ({ ...c, invoiceNo: t }))} placeholder="INV-0001" />
              </View>
            )}

            {/* Summary */}
            <View style={S.summaryCard}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: C.muted, fontSize: 12 }}>{cartItems.length} Produk · {cartItems.reduce((s, i) => s + i.qty, 0)} item</Text>
                <View style={[S.statusBadge, checkout.status === "lunas" ? S.badgePaid : S.badgeUnpaid]}>
                  <Text style={[S.statusText, { color: checkout.status === "lunas" ? C.success : C.gold }]}>
                    {checkout.status === "lunas" ? "Lunas" : "Belum Bayar"}
                  </Text>
                </View>
              </View>
              <Text style={S.summaryTotal}>{fmtRp(grandTotal)}</Text>
              <View style={{ borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 }}>
                <BRow label="Subtotal" value={fmtRp(totalHarga)} />
                {diskon > 0 && <BRow label="Diskon" value={`- ${fmtRp(diskon)}`} color={C.danger} />}
                {pajak > 0 && <BRow label="Pajak" value={`+ ${fmtRp(pajak)}`} />}
                {ongkir > 0 && <BRow label="Ongkir" value={`+ ${fmtRp(ongkir)}`} />}
              </View>
            </View>

            {/* Cart Items */}
            <Text style={S.sectionHead}>Produk</Text>
            <View style={S.inputGroup}>
              {cartItems.map((item, idx) => (
                <View key={item.id}>
                  {idx > 0 && <View style={S.divider} />}
                  <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }}>
                    <Text style={{ fontSize: 20, marginRight: 10 }}>{item.emoji || "📦"}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: C.text, fontSize: 13 }} numberOfLines={1}>{item.name}</Text>
                      <Text style={{ color: C.muted, fontSize: 11 }}>{item.satuan || "pcs"}</Text>
                    </View>
                    <Text style={{ color: C.textSec, fontSize: 13, marginHorizontal: 8 }}>x{item.qty}</Text>
                    <Text style={{ color: C.accent, fontSize: 13, fontWeight: "600" }}>
                      {fmtRp(item.qty * parseInt(item.price || 0))}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Biaya */}
            <Text style={S.sectionHead}>Biaya Tambahan</Text>
            <View style={S.inputGroup}>
              <FieldRow label="Diskon (Rp)" value={checkout.diskon} onChangeText={t => setCheckout(c => ({ ...c, diskon: t }))} keyboardType="numeric" />
              <View style={S.divider} />
              <FieldRow label="Pajak (Rp)" value={checkout.pajak} onChangeText={t => setCheckout(c => ({ ...c, pajak: t }))} keyboardType="numeric" />
              <View style={S.divider} />
              <FieldRow label="Ongkos Kirim" value={checkout.ongkir} onChangeText={t => setCheckout(c => ({ ...c, ongkir: t }))} keyboardType="numeric" />
            </View>

            {/* Info Transaksi */}
            <Text style={S.sectionHead}>Informasi Transaksi</Text>
            <View style={S.inputGroup}>
              <FieldRow label="Tanggal" value={checkout.tanggal} onChangeText={t => setCheckout(c => ({ ...c, tanggal: t }))} placeholder="YYYY-MM-DD" />
              <View style={S.divider} />
              <FieldRow label="Pelanggan" value={checkout.pelanggan} onChangeText={t => setCheckout(c => ({ ...c, pelanggan: t }))} placeholder="Nama pelanggan" />
              <View style={S.divider} />
              <FieldRow label="No. WA" value={checkout.waNumber} onChangeText={t => setCheckout(c => ({ ...c, waNumber: t }))} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" />
              <View style={S.divider} />
              <FieldRow label="No. Meja" value={checkout.meja} onChangeText={t => setCheckout(c => ({ ...c, meja: t }))} placeholder="Kosongkan jika tidak ada" />
              <View style={S.divider} />
              <FieldRow label="Sales" value={checkout.sales} onChangeText={t => setCheckout(c => ({ ...c, sales: t }))} placeholder="Nama sales" />
            </View>

            {/* Catatan */}
            <Text style={S.sectionHead}>Catatan</Text>
            <TextInput style={[S.input, { height: 80, textAlignVertical: "top" }]} multiline
              placeholder="Tambahkan catatan transaksi..." placeholderTextColor={C.muted}
              value={checkout.keterangan} onChangeText={t => setCheckout(c => ({ ...c, keterangan: t }))} />

            {/* ── JENIS PEMBAYARAN (NEW) */}
            <Text style={S.sectionHead}>Jenis Pembayaran</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => setCheckout(c => ({ ...c, tipeBayar: "langsung", status: "lunas" }))}
                style={[S.statusToggle, checkout.tipeBayar === "langsung" && { backgroundColor: C.successDim, borderColor: C.success }]}>
                <Ionicons name="cash-outline" size={18} color={checkout.tipeBayar === "langsung" ? C.success : C.muted} />
                <Text style={[S.statusToggleText, checkout.tipeBayar === "langsung" && { color: C.success }]}>Langsung</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setCheckout(c => ({ ...c, tipeBayar: "cicilan", status: "belum_bayar" }))}
                style={[S.statusToggle, checkout.tipeBayar === "cicilan" && { backgroundColor: C.goldDim, borderColor: C.gold }]}>
                <Ionicons name="time-outline" size={18} color={checkout.tipeBayar === "cicilan" ? C.gold : C.muted} />
                <Text style={[S.statusToggleText, checkout.tipeBayar === "cicilan" && { color: C.gold }]}>Cicilan</Text>
              </TouchableOpacity>
            </View>

            {/* Jatuh tempo — hanya kalau cicilan */}
            {checkout.tipeBayar === "cicilan" && (
              <>
                <View style={[S.inputGroup, { marginBottom: 10 }]}>
                  <FieldRow
                    label="Jatuh Tempo"
                    value={checkout.jatuhTempo}
                    onChangeText={t => setCheckout(c => ({ ...c, jatuhTempo: t }))}
                    placeholder="YYYY-MM-DD" />
                </View>
                <Text style={S.sectionHead}>Status Cicilan</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setCheckout(c => ({ ...c, status: "lunas" }))}
                    style={[S.statusToggle, checkout.status === "lunas" && { backgroundColor: C.successDim, borderColor: C.success }]}>
                    <Ionicons name="checkmark-circle" size={18} color={checkout.status === "lunas" ? C.success : C.muted} />
                    <Text style={[S.statusToggleText, checkout.status === "lunas" && { color: C.success }]}>Lunas</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCheckout(c => ({ ...c, status: "belum_bayar" }))}
                    style={[S.statusToggle, checkout.status === "belum_bayar" && { backgroundColor: C.goldDim, borderColor: C.gold }]}>
                    <Ionicons name="time" size={18} color={checkout.status === "belum_bayar" ? C.gold : C.muted} />
                    <Text style={[S.statusToggleText, checkout.status === "belum_bayar" && { color: C.gold }]}>Belum Bayar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={S.cartFooter}>
            <TouchableOpacity style={S.printBtn} onPress={() => handlePrint()} disabled={isPrinting}>
              <Ionicons name="print" size={18} color={C.accent} />
              <Text style={S.printBtnText}>{isPrinting ? "..." : "Print"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[S.printBtn, { borderColor: "#128C7E44", backgroundColor: "#128C7E22" }]}
              onPress={() => shareToWhatsApp({ ...checkout, items: cartItems, grandTotal, subtotal: totalHarga }, tokoInfo)}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={[S.printBtnText, { color: "#25D366" }]}>WA</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.draftBtn} onPress={handleDraft}>
              <Ionicons name="save-outline" size={16} color={C.textSec} />
              <Text style={S.draftBtnText}>Draft</Text>
            </TouchableOpacity>
            <TouchableOpacity style={S.bayarBtn} onPress={handleProses}>
              <Text style={S.bayarBtnText}>Proses</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── ADD PRODUCT MODAL (enhanced dengan satuan & kategori) */}
      <Modal visible={addProductModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <ModalHeader title="Tambah Produk Baru" onBack={() => setAddProductModal(false)} />
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
            {/* Photo */}
            <View style={{ alignItems: "center", marginBottom: 16 }}>
              <TouchableOpacity onPress={pickImage} onLongPress={takePhoto} activeOpacity={0.8}>
                <View style={S.photoBox}>
                  {newProduct.image
                    ? <Image source={{ uri: newProduct.image }} style={{ width: "100%", height: "100%", borderRadius: 16 }} />
                    : <View style={{ alignItems: "center" }}>
                      <Text style={{ fontSize: 32 }}>{newProduct.emoji || "📦"}</Text>
                      <Text style={{ color: C.muted, fontSize: 11, marginTop: 4 }}>Ganti Foto</Text>
                    </View>}
                </View>
              </TouchableOpacity>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 6 }}>Tap = galeri · Tekan lama = kamera</Text>
            </View>

            <Text style={S.fieldLabel}>Nama Produk *</Text>
            <TextInput style={S.input} placeholder="Nama produk..." placeholderTextColor={C.muted}
              value={newProduct.name} onChangeText={t => setNewProduct(p => ({ ...p, name: t }))} />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1.5 }}>
                <Text style={S.fieldLabel}>Harga (Rp) *</Text>
                <TextInput style={S.input} keyboardType="numeric" placeholder="0"
                  placeholderTextColor={C.muted} value={newProduct.price}
                  onChangeText={t => setNewProduct(p => ({ ...p, price: t.replace(/[^0-9]/g, "") }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.fieldLabel}>Emoji</Text>
                <TextInput style={S.input} placeholder="📦"
                  placeholderTextColor={C.muted} value={newProduct.emoji}
                  onChangeText={t => setNewProduct(p => ({ ...p, emoji: t }))} />
              </View>
            </View>

            {/* SATUAN — dari satuanList user */}
            <Text style={S.fieldLabel}>Satuan</Text>
            {satuanList.length === 0 ? (
              <TouchableOpacity onPress={() => setSatuanModal(true)} style={[S.outlineBtn, { marginBottom: 4 }]}>
                <Text style={{ color: C.accent, fontWeight: "600" }}>+ Tambah Satuan di Pengaturan</Text>
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 4 }}>
                {satuanList.map(sat => (
                  <TouchableOpacity key={sat.id}
                    onPress={() => setNewProduct(p => ({ ...p, satuanId: sat.id }))}
                    style={[S.chip, newProduct.satuanId === sat.id && S.chipActive]}>
                    <Text style={[S.chipText, newProduct.satuanId === sat.id && S.chipTextActive]}>{sat.nama}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* KATEGORI — dari kategoriList user */}
            <Text style={S.fieldLabel}>Kategori</Text>
            {kategoriList.length === 0 ? (
              <TouchableOpacity onPress={() => { setAddProductModal(false); setKategoriModal(true); }} style={[S.outlineBtn, { marginBottom: 4 }]}>
                <Text style={{ color: C.purple, fontWeight: "600" }}>+ Buat Kategori Dulu</Text>
              </TouchableOpacity>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 4 }}>
                <TouchableOpacity
                  onPress={() => setNewProduct(p => ({ ...p, kategoriId: "" }))}
                  style={[S.chip, !newProduct.kategoriId && S.chipActive]}>
                  <Text style={[S.chipText, !newProduct.kategoriId && S.chipTextActive]}>Tanpa Kategori</Text>
                </TouchableOpacity>
                {kategoriList.map(kat => (
                  <TouchableOpacity key={kat.id}
                    onPress={() => setNewProduct(p => ({ ...p, kategoriId: kat.id }))}
                    style={[S.chip, newProduct.kategoriId === kat.id && S.chipActive]}>
                    <Text style={[S.chipText, newProduct.kategoriId === kat.id && S.chipTextActive]}>
                      {kat.ikon} {kat.nama}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={S.fieldLabel}>Barcode</Text>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput style={[S.input, { flex: 1 }]} placeholder="Scan / ketik barcode"
                placeholderTextColor={C.muted} value={newProduct.barcode}
                onChangeText={t => setNewProduct(p => ({ ...p, barcode: t }))} />
              <TouchableOpacity onPress={requestCameraPermission} style={S.scanBtn}>
                <MaterialIcons name="qr-code-scanner" size={22} color={C.accent} />
              </TouchableOpacity>
            </View>

            <Text style={S.fieldLabel}>Keterangan</Text>
            <TextInput style={[S.input, { height: 72, textAlignVertical: "top" }]} multiline
              placeholder="Deskripsi produk..." placeholderTextColor={C.muted}
              value={newProduct.note} onChangeText={t => setNewProduct(p => ({ ...p, note: t }))} />

            {/* Pantau Stok Toggle */}
            <View style={S.switchRow}>
              <View>
                <Text style={{ color: C.text, fontWeight: "600", fontSize: 14 }}>Pantau Stok</Text>
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Lacak jumlah stok produk</Text>
              </View>
              <TouchableOpacity
                onPress={() => setNewProduct(p => ({ ...p, pantauStok: !p.pantauStok }))}
                style={[S.toggle, newProduct.pantauStok && S.toggleOn]}>
                <View style={[S.toggleThumb, newProduct.pantauStok && S.toggleThumbOn]} />
              </TouchableOpacity>
            </View>

            {newProduct.pantauStok && (
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Stok Awal</Text>
                  <TextInput style={S.input} keyboardType="numeric" value={newProduct.stok}
                    onChangeText={t => setNewProduct(p => ({ ...p, stok: t.replace(/[^0-9]/g, "") }))} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={S.fieldLabel}>Stok Minimal</Text>
                  <TextInput style={S.input} keyboardType="numeric" value={newProduct.stokMinimal}
                    onChangeText={t => setNewProduct(p => ({ ...p, stokMinimal: t.replace(/[^0-9]/g, "") }))} />
                </View>
              </View>
            )}

            {newProduct.price && newProduct.stok && parseInt(newProduct.stok) > 0 && (
              <View style={S.totalModalCard}>
                <Text style={{ color: C.muted, fontSize: 13 }}>Total Modal</Text>
                <Text style={{ color: C.accent, fontWeight: "700", fontSize: 16 }}>
                  {fmtRp(parseInt(newProduct.stok || "0") * parseInt(newProduct.price || "0"))}
                </Text>
              </View>
            )}

            {/* Variant */}
            <TouchableOpacity style={S.outlineBtn} onPress={() => setVariantModal(true)}>
              <Ionicons name="add-circle-outline" size={18} color={C.accent} />
              <Text style={{ color: C.accent, marginLeft: 8, fontWeight: "600" }}>Tambah Varian Harga</Text>
            </TouchableOpacity>
            {variants.map((v, i) => (
              <View key={i} style={[S.tagRow, { marginTop: 6 }]}>
                <View style={[S.tagDot, { backgroundColor: C.accent }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: "600", fontSize: 13 }}>{v.name}</Text>
                  <Text style={{ color: C.muted, fontSize: 12 }}>{fmtRp(parseInt(v.price || 0))}</Text>
                </View>
                <TouchableOpacity onPress={() => setVariants(p => p.filter((_, idx) => idx !== i))}>
                  <Ionicons name="close-circle" size={18} color={C.danger} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Grosir */}
            <TouchableOpacity style={[S.outlineBtn, { marginTop: 8 }]} onPress={() => setGrosirModal(true)}>
              <Ionicons name="pricetag-outline" size={18} color={C.gold} />
              <Text style={{ color: C.gold, marginLeft: 8, fontWeight: "600" }}>Tambah Harga Grosir</Text>
            </TouchableOpacity>
            {grosirs.map((g, i) => (
              <View key={i} style={[S.tagRow, { marginTop: 6 }]}>
                <View style={[S.tagDot, { backgroundColor: C.gold }]} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.text, fontWeight: "600", fontSize: 13 }}>Min {g.min} {getSatuanNama(newProduct.satuanId)}</Text>
                  <Text style={{ color: C.muted, fontSize: 12 }}>{fmtRp(parseInt(g.price || 0))}</Text>
                </View>
                <TouchableOpacity onPress={() => setGrosirs(p => p.filter((_, idx) => idx !== i))}>
                  <Ionicons name="close-circle" size={18} color={C.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
          <View style={S.modalFooter}>
            <TouchableOpacity style={S.saveFullBtn} onPress={addProduct}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={S.saveFullBtnText}>Simpan Produk ke Katalog</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Variant Modal */}
      <Modal visible={variantModal} transparent animationType="slide">
        <View style={S.sheet}>
          <View style={S.sheetInner}>
            <View style={S.sheetHandle} />
            <Text style={S.sheetTitle}>Varian Harga</Text>
            <Text style={S.fieldLabel}>Nama Varian</Text>
            <TextInput style={S.input} placeholder="cth: Merah, L, XL" placeholderTextColor={C.muted}
              value={variantInput.name} onChangeText={t => setVariantInput(v => ({ ...v, name: t }))} />
            <Text style={S.fieldLabel}>Harga</Text>
            <TextInput style={S.input} keyboardType="numeric" placeholder="Rp 0" placeholderTextColor={C.muted}
              value={variantInput.price} onChangeText={t => setVariantInput(v => ({ ...v, price: t.replace(/[^0-9]/g, "") }))} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setVariantModal(false)}><Text style={S.cancelBtnText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={S.saveBtn} onPress={() => { setVariants(p => [...p, variantInput]); setVariantInput({ name: "", price: "" }); setVariantModal(false); }}>
                <Text style={S.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Grosir Modal */}
      <Modal visible={grosirModal} transparent animationType="slide">
        <View style={S.sheet}>
          <View style={S.sheetInner}>
            <View style={S.sheetHandle} />
            <Text style={S.sheetTitle}>Harga Grosir</Text>
            <Text style={S.fieldLabel}>Minimal Pembelian</Text>
            <View style={S.qtyBox}>
              <TouchableOpacity onPress={() => setGrosirInput(g => ({ ...g, min: Math.max(1, g.min - 1) }))} style={{ padding: 10 }}>
                <Text style={{ color: C.accent, fontSize: 22, fontWeight: "300" }}>−</Text>
              </TouchableOpacity>
              <Text style={{ color: C.text, fontWeight: "700", fontSize: 16 }}>{grosirInput.min}</Text>
              <TouchableOpacity onPress={() => setGrosirInput(g => ({ ...g, min: g.min + 1 }))} style={{ padding: 10 }}>
                <Text style={{ color: C.accent, fontSize: 22, fontWeight: "300" }}>+</Text>
              </TouchableOpacity>
            </View>
            <Text style={S.fieldLabel}>Harga Grosir</Text>
            <TextInput style={S.input} keyboardType="numeric" placeholder="Rp 0" placeholderTextColor={C.muted}
              value={grosirInput.price} onChangeText={t => setGrosirInput(g => ({ ...g, price: t.replace(/[^0-9]/g, "") }))} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setGrosirModal(false)}><Text style={S.cancelBtnText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={S.saveBtn} onPress={() => { setGrosirs(p => [...p, grosirInput]); setGrosirInput({ min: 1, price: "" }); setGrosirModal(false); }}>
                <Text style={S.saveBtnText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Quick Add Modal (enhanced dengan satuan) */}
      <Modal visible={quickModal} transparent animationType="slide">
        <View style={S.sheet}>
          <View style={S.sheetInner}>
            <View style={S.sheetHandle} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 4 }}>
              <View>
                <Text style={S.sheetTitle}>Produk Cepat</Text>
                <Text style={{ color: C.muted, fontSize: 12, marginTop: 2 }}>Tambah tanpa simpan ke katalog</Text>
              </View>
              <Text style={{ color: C.accent, fontWeight: "700", fontSize: 18 }}>
                {fmtRp(quickProduct.qty * parseInt(quickProduct.price || "0"))}
              </Text>
            </View>
            <Text style={S.fieldLabel}>Nama Produk</Text>
            <TextInput style={S.input} placeholder="Nama produk..." placeholderTextColor={C.muted}
              value={quickProduct.name} onChangeText={t => setQuickProduct(p => ({ ...p, name: t }))} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1.5 }}>
                <Text style={S.fieldLabel}>Harga / satuan</Text>
                <TextInput style={S.input} keyboardType="numeric" placeholder="Rp 0" placeholderTextColor={C.muted}
                  value={quickProduct.price} onChangeText={t => setQuickProduct(p => ({ ...p, price: t.replace(/[^0-9]/g, "") }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={S.fieldLabel}>Qty</Text>
                <View style={S.qtyBox}>
                  <TouchableOpacity onPress={() => setQuickProduct(p => ({ ...p, qty: Math.max(1, p.qty - 1) }))} style={{ padding: 8 }}>
                    <Text style={{ color: C.accent, fontSize: 20, fontWeight: "300" }}>−</Text>
                  </TouchableOpacity>
                  <Text style={{ color: C.text, fontWeight: "700", fontSize: 15 }}>{quickProduct.qty}</Text>
                  <TouchableOpacity onPress={() => setQuickProduct(p => ({ ...p, qty: p.qty + 1 }))} style={{ padding: 8 }}>
                    <Text style={{ color: C.accent, fontSize: 20, fontWeight: "300" }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <Text style={S.fieldLabel}>Satuan</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 4 }}>
              {satuanList.map(sat => (
                <TouchableOpacity key={sat.id}
                  onPress={() => setQuickProduct(p => ({ ...p, satuanId: sat.id }))}
                  style={[S.chip, quickProduct.satuanId === sat.id && S.chipActive]}>
                  <Text style={[S.chipText, quickProduct.satuanId === sat.id && S.chipTextActive]}>{sat.nama}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={S.fieldLabel}>Keterangan</Text>
            <TextInput style={[S.input, { height: 56 }]} multiline placeholder="Opsional..." placeholderTextColor={C.muted}
              value={quickProduct.note} onChangeText={t => setQuickProduct(p => ({ ...p, note: t }))} />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
              <TouchableOpacity style={S.cancelBtn} onPress={() => setQuickModal(false)}><Text style={S.cancelBtnText}>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={S.saveBtn} onPress={() => {
                if (!quickProduct.name.trim()) { Alert.alert("Nama diperlukan"); return; }
                const satNama = getSatuanNama(quickProduct.satuanId);
                setCartItems(prev => [...prev, {
                  id: `q${Date.now()}`, name: quickProduct.name,
                  price: quickProduct.price || "0", qty: quickProduct.qty,
                  note: quickProduct.note, emoji: "⚡", satuan: satNama,
                }]);
                setQuickProduct({ name: "", price: "", qty: 1, note: "", satuanId: satuanList[0]?.id || "sat1" });
                setQuickModal(false);
              }}>
                <Ionicons name="add-circle" size={16} color="#fff" />
                <Text style={S.saveBtnText}>Tambahkan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Transaction Detail Modal (enhanced dengan WA invoice & bayar piutang) */}
      <Modal visible={detailModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <ModalHeader title={selectedTrx?.isRefund ? "Detail Refund" : "Detail Transaksi"} onBack={() => setDetailModal(false)} />
          {selectedTrx && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 110 }}>
              {/* Invoice Preview */}
              <View style={[S.summaryCard, { backgroundColor: "#fff" }]}>
                <Text style={{ color: "#111", fontWeight: "700", fontSize: 18, textAlign: "center" }}>{tokoInfo.nama}</Text>
                <Text style={{ color: "#555", fontSize: 12, textAlign: "center" }}>{tokoInfo.alamat}</Text>
                {tokoInfo.telp ? <Text style={{ color: "#555", fontSize: 12, textAlign: "center" }}>Telp: {tokoInfo.telp}</Text> : null}
                <View style={{ height: 1, backgroundColor: "#ddd", marginVertical: 10 }} />
                <Text style={{ color: "#111", fontWeight: "700", fontSize: 15, marginBottom: 4 }}>
                  {selectedTrx.docType === "INVOICE" ? "INVOICE" : "STRUK PENJUALAN"}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#555", fontSize: 12 }}>No:</Text>
                  <Text style={{ color: "#111", fontSize: 12, fontWeight: "600" }}>{selectedTrx.invoiceNo}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#555", fontSize: 12 }}>Tanggal:</Text>
                  <Text style={{ color: "#111", fontSize: 12 }}>{formatDate(selectedTrx.tanggal)}</Text>
                </View>
                {selectedTrx.pelanggan ? (
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: "#555", fontSize: 12 }}>Kepada:</Text>
                    <Text style={{ color: "#111", fontSize: 12, fontWeight: "600" }}>{selectedTrx.pelanggan}</Text>
                  </View>
                ) : null}
                <View style={{ height: 1, backgroundColor: "#ddd", marginVertical: 8 }} />
                {/* Table header */}
                <View style={{ flexDirection: "row", marginBottom: 4 }}>
                  <Text style={{ flex: 3, color: "#888", fontSize: 11, fontWeight: "700" }}>NAMA BARANG</Text>
                  <Text style={{ flex: 1, color: "#888", fontSize: 11, textAlign: "center" }}>QTY</Text>
                  <Text style={{ flex: 1, color: "#888", fontSize: 11, textAlign: "center" }}>SAT.</Text>
                  <Text style={{ flex: 2, color: "#888", fontSize: 11, textAlign: "right" }}>HARGA</Text>
                  <Text style={{ flex: 2, color: "#888", fontSize: 11, textAlign: "right" }}>TOTAL</Text>
                </View>
                {selectedTrx.items?.map((item, idx) => {
                  const harga = parseInt(item.price || item.harga || 0);
                  return (
                    <View key={idx}>
                      <View style={{ flexDirection: "row", paddingVertical: 4 }}>
                        <Text style={{ flex: 3, color: "#111", fontSize: 12 }} numberOfLines={2}>{item.name || item.nama}</Text>
                        <Text style={{ flex: 1, color: "#444", fontSize: 12, textAlign: "center" }}>{item.qty}</Text>
                        <Text style={{ flex: 1, color: "#888", fontSize: 12, textAlign: "center" }}>{item.satuan || "pcs"}</Text>
                        <Text style={{ flex: 2, color: "#444", fontSize: 12, textAlign: "right" }}>{fmtRp(harga)}</Text>
                        <Text style={{ flex: 2, color: "#111", fontSize: 12, fontWeight: "600", textAlign: "right" }}>{fmtRp(item.qty * harga)}</Text>
                      </View>
                      {idx < selectedTrx.items.length - 1 && <View style={{ height: 1, backgroundColor: "#f0f0f0" }} />}
                    </View>
                  );
                })}
                <View style={{ height: 1, backgroundColor: "#ddd", marginTop: 8, marginBottom: 6 }} />
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#555", fontSize: 12 }}>Subtotal</Text>
                  <Text style={{ color: "#111", fontSize: 12 }}>{fmtRp(selectedTrx.subtotal)}</Text>
                </View>
                {parseInt(selectedTrx.diskon) > 0 && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: "#555", fontSize: 12 }}>Diskon</Text>
                    <Text style={{ color: "#e33", fontSize: 12 }}>-{fmtRp(parseInt(selectedTrx.diskon))}</Text>
                  </View>
                )}
                {parseInt(selectedTrx.pajak) > 0 && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ color: "#555", fontSize: 12 }}>Pajak</Text>
                    <Text style={{ color: "#111", fontSize: 12 }}>+{fmtRp(parseInt(selectedTrx.pajak))}</Text>
                  </View>
                )}
                <View style={{ height: 2, backgroundColor: "#333", marginVertical: 6 }} />
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ color: "#111", fontWeight: "700", fontSize: 15 }}>TOTAL</Text>
                  <Text style={{ color: "#111", fontWeight: "700", fontSize: 15 }}>{fmtRp(selectedTrx.grandTotal)}</Text>
                </View>
                <View style={{ height: 1, backgroundColor: "#ddd", marginTop: 8, marginBottom: 8 }} />
                <Text style={{ color: selectedTrx.status === "lunas" ? "#16a34a" : "#d97706", fontSize: 13, fontWeight: "700", textAlign: "center" }}>
                  {selectedTrx.status === "lunas" ? "✅ LUNAS" : "⏳ BELUM LUNAS"}
                </Text>
                {selectedTrx.jatuhTempo && selectedTrx.status !== "lunas" && (
                  <Text style={{ color: "#888", fontSize: 11, textAlign: "center" }}>Jatuh Tempo: {formatDate(selectedTrx.jatuhTempo)}</Text>
                )}
                {selectedTrx.keterangan ? <Text style={{ color: "#888", fontSize: 11, textAlign: "center", marginTop: 4 }}>Catatan: {selectedTrx.keterangan}</Text> : null}
                <View style={{ height: 1, backgroundColor: "#ddd", marginTop: 10, marginBottom: 10 }} />
                <Text style={{ color: "#888", fontSize: 12, textAlign: "right" }}>Hormat kami,</Text>
                <Text style={{ color: "#111", fontWeight: "700", fontSize: 13, textAlign: "right", marginTop: 24 }}>{tokoInfo.penerima || tokoInfo.nama}</Text>
              </View>

              {/* Riwayat pembayaran */}
              {selectedTrx.payments?.length > 0 && (
                <>
                  <Text style={S.sectionHead}>Riwayat Pembayaran</Text>
                  <View style={S.inputGroup}>
                    {selectedTrx.payments.map((p, idx) => (
                      <View key={idx}>
                        {idx > 0 && <View style={S.divider} />}
                        <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 }}>
                          <Text style={{ color: C.muted, fontSize: 13 }}>{formatDate(p.tanggal)}</Text>
                          <Text style={{ color: C.success, fontWeight: "600", fontSize: 13 }}>+{fmtRp(p.jumlah)}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {/* Aksi */}
              <Text style={S.sectionHead}>Aksi</Text>
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity style={[S.actionBtn, { flex: 1 }]} onPress={() => handlePrint(selectedTrx)}>
                    <Ionicons name="print-outline" size={18} color={C.accent} />
                    <Text style={{ color: C.accent, fontWeight: "600" }}>Print</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[S.actionBtn, { flex: 1 }]} onPress={() => handleSharePDF(selectedTrx)}>
                    <Ionicons name="share-outline" size={18} color={C.purple} />
                    <Text style={{ color: C.purple, fontWeight: "600" }}>PDF</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={[S.actionBtn, { backgroundColor: "#128C7E22", borderColor: "#128C7E44" }]}
                  onPress={() => shareToWhatsApp(selectedTrx, tokoInfo)}>
                  <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
                  <Text style={{ color: "#25D366", fontWeight: "600" }}>
                    Kirim Invoice ke WhatsApp{selectedTrx.waNumber ? ` (${selectedTrx.waNumber})` : ""}
                  </Text>
                </TouchableOpacity>
                {!selectedTrx.isRefund && (
                  <TouchableOpacity
                    style={[S.actionBtn, { backgroundColor: C.goldDim, borderColor: C.gold + "44" }]}
                    onPress={() => { setEditTrx({ ...selectedTrx }); setEditModal(true); }}>
                    <Ionicons name="create-outline" size={18} color={C.gold} />
                    <Text style={{ color: C.gold, fontWeight: "600" }}>Edit Transaksi</Text>
                  </TouchableOpacity>
                )}
                {selectedTrx.status === "belum_bayar" && !selectedTrx.isDraft && (
                  <TouchableOpacity
                    style={[S.actionBtn, { backgroundColor: C.successDim, borderColor: C.success + "44" }]}
                    onPress={() => {
                      const bayar = (selectedTrx.payments || []).reduce((s, p) => s + p.jumlah, 0);
                      const sisa = selectedTrx.grandTotal - bayar;
                      Alert.prompt(
                        "Bayar Piutang",
                        `Sisa: ${fmtRp(sisa)}`,
                        [{ text: "Batal", style: "cancel" }, { text: "Bayar", onPress: (v) => { bayarPiutang(selectedTrx, v || sisa); setDetailModal(false); } }],
                        "plain-text", sisa.toString(), "numeric"
                      );
                    }}>
                    <Ionicons name="cash-outline" size={18} color={C.success} />
                    <Text style={{ color: C.success, fontWeight: "600" }}>Bayar Piutang</Text>
                  </TouchableOpacity>
                )}
                {!selectedTrx.isRefund && !selectedTrx.isDraft && (
                  <TouchableOpacity
                    style={[S.actionBtn, { backgroundColor: C.dangerDim, borderColor: C.danger + "44" }]}
                    onPress={() => handleRefund(selectedTrx)}>
                    <Ionicons name="return-down-back-outline" size={18} color={C.danger} />
                    <Text style={{ color: C.danger, fontWeight: "600" }}>Refund Transaksi</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[S.actionBtn, { backgroundColor: C.dangerDim, borderColor: C.danger + "44" }]}
                  onPress={() => hapusTrx(selectedTrx)}>
                  <Ionicons name="trash-outline" size={18} color={C.danger} />
                  <Text style={{ color: C.danger, fontWeight: "600" }}>Hapus Transaksi</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={editModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <ModalHeader title="Edit Transaksi" onBack={() => setEditModal(false)} />
          {editTrx && (
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
              <Text style={S.sectionHead}>Informasi</Text>
              <View style={S.inputGroup}>
                <FieldRow label="Pelanggan" value={editTrx.pelanggan} onChangeText={t => setEditTrx(e => ({ ...e, pelanggan: t }))} placeholder="Nama pelanggan" />
                <View style={S.divider} />
                <FieldRow label="No. WA" value={editTrx.waNumber} onChangeText={t => setEditTrx(e => ({ ...e, waNumber: t }))} placeholder="08xxxxxxxxxx" keyboardType="phone-pad" />
                <View style={S.divider} />
                <FieldRow label="Jatuh Tempo" value={editTrx.jatuhTempo} onChangeText={t => setEditTrx(e => ({ ...e, jatuhTempo: t }))} placeholder="YYYY-MM-DD" />
              </View>
              <Text style={S.sectionHead}>Biaya</Text>
              <View style={S.inputGroup}>
                <FieldRow label="Diskon (Rp)" value={editTrx.diskon} onChangeText={t => setEditTrx(e => ({ ...e, diskon: t }))} keyboardType="numeric" />
                <View style={S.divider} />
                <FieldRow label="Pajak (Rp)" value={editTrx.pajak} onChangeText={t => setEditTrx(e => ({ ...e, pajak: t }))} keyboardType="numeric" />
                <View style={S.divider} />
                <FieldRow label="Ongkir" value={editTrx.ongkir} onChangeText={t => setEditTrx(e => ({ ...e, ongkir: t }))} keyboardType="numeric" />
              </View>
              <Text style={S.sectionHead}>Catatan</Text>
              <TextInput style={[S.input, { height: 80, textAlignVertical: "top" }]} multiline
                placeholder="Catatan..." placeholderTextColor={C.muted}
                value={editTrx.keterangan} onChangeText={t => setEditTrx(e => ({ ...e, keterangan: t }))} />
              <Text style={S.sectionHead}>Status</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() => setEditTrx(e => ({ ...e, status: "lunas" }))}
                  style={[S.statusToggle, editTrx.status === "lunas" && { backgroundColor: C.successDim, borderColor: C.success }]}>
                  <Ionicons name="checkmark-circle" size={18} color={editTrx.status === "lunas" ? C.success : C.muted} />
                  <Text style={[S.statusToggleText, editTrx.status === "lunas" && { color: C.success }]}>Lunas</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEditTrx(e => ({ ...e, status: "belum_bayar" }))}
                  style={[S.statusToggle, editTrx.status === "belum_bayar" && { backgroundColor: C.goldDim, borderColor: C.gold }]}>
                  <Ionicons name="time" size={18} color={editTrx.status === "belum_bayar" ? C.gold : C.muted} />
                  <Text style={[S.statusToggleText, editTrx.status === "belum_bayar" && { color: C.gold }]}>Belum Bayar</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
          <View style={S.modalFooter}>
            <TouchableOpacity style={S.saveFullBtn} onPress={saveEdit}>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={S.saveFullBtnText}>Simpan Perubahan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Scan Modal */}
      <Modal visible={scanModal} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          <CameraView style={{ flex: 1 }} facing={cameraType} onBarcodeScanned={handleBarCodeScanned} />
          <View style={{ position: "absolute", width: "100%", height: "100%" }}>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
            <View style={{ flexDirection: "row" }}>
              <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
              <View style={{ width: 240, height: 240, borderWidth: 2, borderColor: C.accent, borderRadius: 16 }} />
              <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
            </View>
            <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
          </View>
          <View style={{ position: "absolute", top: Platform.OS === "ios" ? 60 : 40, width: "100%", alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Scan Barcode</Text>
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>Arahkan kamera ke barcode</Text>
          </View>
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === "ios" ? 36 : 20, backgroundColor: "rgba(0,0,0,0.75)", gap: 10 }}>
            <TouchableOpacity
              onPress={() => setCameraType(c => c === "back" ? "front" : "back")}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "rgba(255,255,255,0.1)", padding: 14, borderRadius: 12 }}>
              <Ionicons name="camera-reverse-outline" size={20} color="#fff" />
              <Text style={{ color: "#fff" }}>Balik Kamera</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setScanModal(false)}
              style={{ backgroundColor: C.danger, padding: 14, borderRadius: 12, alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────
function ModalHeader({ title, onBack }) {
  return (
    <View style={S.modalHeader}>
      <TouchableOpacity onPress={onBack} style={S.backBtn}>
        <Ionicons name="arrow-back" size={20} color={C.text} />
      </TouchableOpacity>
      <Text style={S.modalTitle}>{title}</Text>
      <View style={{ width: 40 }} />
    </View>
  );
}

function BRow({ label, value, color }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
      <Text style={{ color: C.textSec, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: color || C.textSec, fontSize: 12, fontWeight: "500" }}>{value}</Text>
    </View>
  );
}

function FieldRow({ label, value, onChangeText, keyboardType = "default", placeholder = "" }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 11 }}>
      <Text style={{ color: C.muted, fontSize: 13, width: 110 }}>{label}</Text>
      <TextInput
        style={{ flex: 1, color: C.text, fontSize: 14, textAlign: "right" }}
        value={value} onChangeText={onChangeText} keyboardType={keyboardType}
        placeholder={placeholder} placeholderTextColor={C.muted} />
    </View>
  );
}

function InfoRow({ label, value, color }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", paddingVertical: 11 }}>
      <Text style={{ color: C.muted, fontSize: 13, width: 130 }}>{label}</Text>
      <Text style={{ flex: 1, color: color || C.text, fontSize: 14, textAlign: "right", fontWeight: "500" }}>{value}</Text>
    </View>
  );
}

function StatPill({ label, value, color }) {
  return (
    <View style={{ flex: 1, alignItems: "center", paddingVertical: 10 }}>
      <Text style={{ color, fontWeight: "700", fontSize: 13 }} numberOfLines={1}>{value}</Text>
      <Text style={{ color: C.muted, fontSize: 10, marginTop: 1 }}>{label}</Text>
    </View>
  );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
const S = {
  header: {
    backgroundColor: C.surface,
    paddingTop: Platform.OS === "ios" ? 52 : 36,
    paddingHorizontal: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    gap: 10,
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  appTitle: { color: C.text, fontSize: 18, fontWeight: "700" },
  appSub: { color: C.muted, fontSize: 11, marginTop: 1 },

  searchBar: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.card, borderRadius: 12,
    paddingHorizontal: 12, height: 40,
    borderWidth: 1, borderColor: C.border, gap: 8,
  },
  searchInput: { flex: 1, color: C.text, fontSize: 13 },
  searchBadge: { backgroundColor: C.accent, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  searchBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },

  statsRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.border, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: C.border, marginVertical: 8 },

  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  chipActive: { backgroundColor: C.accent, borderColor: C.accent },
  chipText: { color: C.muted, fontSize: 12 },
  chipTextActive: { color: "#fff", fontWeight: "700" },

  productCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: "hidden",
  },
  productImgWrap: { position: "relative" },
  productImg: { width: "100%", height: 110 },
  productEmojiBox: { width: "100%", height: 110, backgroundColor: C.surface, justifyContent: "center", alignItems: "center" },
  stokBadge: { position: "absolute", top: 8, left: 8, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  stokBadgeText: { fontSize: 10, fontWeight: "700" },
  cartQtyBadge: { position: "absolute", top: 8, right: 8, backgroundColor: C.accent, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  cartQtyBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  productInfo: { padding: 10 },
  productName: { color: C.text, fontWeight: "600", fontSize: 13, marginBottom: 2, lineHeight: 18 },
  productCategory: { color: C.muted, fontSize: 10, marginBottom: 2 },
  productPrice: { color: C.accent, fontSize: 13, fontWeight: "700", marginBottom: 1 },
  productNote: { color: C.muted, fontSize: 10, marginBottom: 6 },

  qtyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6, backgroundColor: C.surface, borderRadius: 10, borderWidth: 1, borderColor: C.border, overflow: "hidden" },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: C.accentDim },
  qtyBtnTxt: { color: C.accent, fontSize: 18, fontWeight: "300" },
  qtyVal: { color: C.text, fontWeight: "700", fontSize: 13, minWidth: 24, textAlign: "center" },

  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4,
    marginTop: 6, paddingVertical: 7, borderRadius: 10,
    backgroundColor: C.accentDim, borderWidth: 1, borderColor: C.accentBorder,
  },
  addBtnText: { color: C.accent, fontSize: 11, fontWeight: "700" },

  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 80 },
  emptyTitle: { color: C.text, fontSize: 17, fontWeight: "700", marginBottom: 6 },
  emptyDesc: { color: C.muted, fontSize: 13, textAlign: "center", lineHeight: 20, marginBottom: 20 },
  emptyBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.accent, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: "#fff", fontWeight: "700" },

  bottomBar: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", padding: 12, paddingBottom: Platform.OS === "ios" ? 28 : 14,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
    gap: 10, alignItems: "center",
  },
  quickAddBtn: { width: 58, height: 58, borderRadius: 16, backgroundColor: C.goldDim, borderWidth: 1, borderColor: C.gold + "44", justifyContent: "center", alignItems: "center" },
  checkoutBtn: {
    flex: 1, height: 58, backgroundColor: C.accentDark, borderRadius: 16,
    flexDirection: "row", alignItems: "center", paddingHorizontal: 16, justifyContent: "space-between",
  },
  checkoutBtnSub: { color: "rgba(255,255,255,0.6)", fontSize: 11 },
  checkoutBtnTotal: { color: "#fff", fontWeight: "700", fontSize: 17 },
  checkoutBtnRight: { alignItems: "center", gap: 2, backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },

  tabBar: {
    flexDirection: "row", backgroundColor: C.surface,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingBottom: Platform.OS === "ios" ? 24 : 8, paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: "center", gap: 3, position: "relative" },
  tabLabel: { fontSize: 10, fontWeight: "600" },
  tabBadge: { position: "absolute", top: -4, right: -8, backgroundColor: C.danger, borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1, minWidth: 16, alignItems: "center" },
  tabBadgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  tabIndicator: { position: "absolute", bottom: -8, width: 4, height: 4, borderRadius: 2, backgroundColor: C.accent },

  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, justifyContent: "center", alignItems: "center" },

  modalHeader: {
    backgroundColor: C.surface, paddingTop: Platform.OS === "ios" ? 54 : 40,
    paddingBottom: 14, paddingHorizontal: 16,
    flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderBottomColor: C.border,
  },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, justifyContent: "center", alignItems: "center" },
  modalTitle: { flex: 1, textAlign: "center", color: C.text, fontSize: 16, fontWeight: "700" },
  modalFooter: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 14, paddingBottom: Platform.OS === "ios" ? 30 : 14, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.border },
  saveFullBtn: { flexDirection: "row", backgroundColor: C.accent, borderRadius: 14, padding: 16, justifyContent: "center", alignItems: "center", gap: 8 },
  saveFullBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  summaryCard: { backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.border, padding: 18, marginBottom: 20 },
  summaryTotal: { color: C.text, fontWeight: "700", fontSize: 28, marginTop: 4, marginBottom: 10 },

  sectionHead: { color: C.muted, fontSize: 10, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 20, marginBottom: 8 },
  inputGroup: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 14 },
  divider: { height: 1, backgroundColor: C.border },

  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 12, padding: 13, color: C.text, fontSize: 14, marginBottom: 0 },
  fieldLabel: { marginTop: 14, marginBottom: 6, fontSize: 11, color: C.muted, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: "600" },

  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  badgePaid: { backgroundColor: C.successDim, borderColor: C.success + "44" },
  badgeUnpaid: { backgroundColor: C.goldDim, borderColor: C.gold + "44" },
  statusText: { fontSize: 11, fontWeight: "600" },

  statusToggle: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 13, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
  statusToggleText: { color: C.muted, fontWeight: "600", fontSize: 13 },

  cartFooter: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    padding: 14, paddingBottom: Platform.OS === "ios" ? 30 : 14,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
    flexDirection: "row", gap: 8, alignItems: "center",
  },
  printBtn: { alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.accentBorder, backgroundColor: C.accentDim },
  printBtnText: { color: C.accent, fontSize: 11, fontWeight: "600" },
  draftBtn: { alignItems: "center", justifyContent: "center", gap: 3, paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  draftBtnText: { color: C.textSec, fontSize: 11, fontWeight: "600" },
  bayarBtn: { flex: 1, backgroundColor: C.accent, borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  bayarBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  sheet: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.65)" },
  sheetInner: { backgroundColor: C.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: Platform.OS === "ios" ? 38 : 22, borderTopWidth: 1, borderTopColor: C.border },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: "center", marginBottom: 18 },
  sheetTitle: { color: C.text, fontSize: 16, fontWeight: "700", marginBottom: 4 },

  cancelBtn: { flex: 1, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: "center", backgroundColor: C.card },
  cancelBtnText: { color: C.textSec, fontWeight: "600" },
  saveBtn: { flex: 2, backgroundColor: C.accent, borderRadius: 12, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  saveBtnText: { color: "#fff", fontWeight: "700" },

  trxCard: { backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 14 },
  trxName: { color: C.text, fontWeight: "600", fontSize: 14 },
  trxMeta: { color: C.muted, fontSize: 11, marginTop: 2 },
  trxTotal: { color: C.accent, fontWeight: "700", fontSize: 15 },
  docBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },

  smallBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: C.border },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },

  piutangSummary: { flexDirection: "row", alignItems: "center", backgroundColor: C.goldDim, borderRadius: 14, borderWidth: 1, borderColor: C.gold + "44", padding: 14 },

  photoBox: { width: 110, height: 110, backgroundColor: C.card, borderRadius: 18, borderWidth: 2, borderColor: C.border, borderStyle: "dashed", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  scanBtn: { width: 46, height: 46, backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.accentBorder, justifyContent: "center", alignItems: "center" },

  switchRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border, padding: 14, marginTop: 14 },
  toggle: { width: 48, height: 26, borderRadius: 13, backgroundColor: C.border, justifyContent: "center", padding: 3 },
  toggleOn: { backgroundColor: C.accent },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#fff", alignSelf: "flex-start" },
  toggleThumbOn: { alignSelf: "flex-end" },

  totalModalCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: C.accentDim, borderRadius: 12, borderWidth: 1, borderColor: C.accentBorder, padding: 14, marginTop: 12 },
  outlineBtn: { flexDirection: "row", alignItems: "center", marginTop: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: C.border, backgroundColor: C.card },
  tagRow: { flexDirection: "row", alignItems: "center", backgroundColor: C.card, borderRadius: 10, borderWidth: 1, borderColor: C.border, padding: 12, gap: 10 },
  tagDot: { width: 8, height: 8, borderRadius: 4 },
  qtyBox: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: C.card, borderRadius: 12, paddingHorizontal: 4, borderWidth: 1, borderColor: C.border, height: 46 },

  // NEW
  satuanChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: C.card, borderWidth: 1, borderColor: C.border },
};