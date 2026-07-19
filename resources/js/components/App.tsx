import { useState, useEffect, useCallback, useRef } from "react";
import {
    LayoutDashboard, Users, Scissors, ShoppingBag, CreditCard,
    TrendingDown, BarChart2, Settings as SettingsIcon, LogOut, Bell,
    Search, Plus, X, Printer, MessageCircle, Phone, MapPin,
    Clock, Calendar, Eye, Edit2, Trash2, Download, ChevronRight,
    Wallet, TrendingUp, User, Package, CheckCircle2, Save,
    Banknote, Smartphone, Send, FileText,
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { api, loginApi, logoutApi } from "../lib/api";

type User = { id: string | number; name: string; email: string };




// ─── Types ───────────────────────────────────────────────────────────────────

type Page =
    | "login" | "dashboard" | "customers" | "services"
    | "orders" | "new-transaction" | "order-detail"
    | "payment" | "expenses" | "reports" | "settings";

type OrderStatus = "Menunggu" | "Diproses" | "Finishing" | "Selesai" | "Sudah Diambil";

interface Order {
    id: string; invoice: string; customer: string; phone: string;
    clothingType: string; service: string; status: OrderStatus;
    deadline: string; price: number; dp: number; discount: number;
    notes: string; createdAt: string;
}

interface Customer {
    id: string; name: string; phone: string; address: string;
    notes: string; totalOrders: number; lastVisit: string;
}

interface Service {
    id: string; name: string; price: number; estimatedDays: number;
    status: "Aktif" | "Nonaktif";
}

interface Expense {
    id: string; date: string; category: string; description: string; amount: number;
}

// Map UI status label <-> backend status key
const STATUS_TO_BACKEND: Record<OrderStatus, string> = {
    "Menunggu": "pending",
    "Diproses": "processing",
    "Finishing": "finishing",
    "Selesai": "completed",
    "Sudah Diambil": "paid",
};

const STATUS_FLOW: OrderStatus[] = ["Menunggu", "Diproses", "Finishing", "Selesai", "Sudah Diambil"];

// ─── Mock-free constants still needed for visuals ─────────────────────────────

const QR_GRID = [1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0];

const PIE_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const STATUS_CFG: Record<OrderStatus, { bg: string; text: string; dot: string }> = {
    "Menunggu": { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
    "Diproses": { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    "Finishing": { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500" },
    "Selesai": { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    "Sudah Diambil": { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
    const c = STATUS_CFG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
            {status}
        </span>
    );
}

function InputField({ label, children }: { label: string; children: any }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            {children}
        </div>
    );
}


const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";
const readonlyClass = "w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm bg-gray-50 text-gray-500";

// ─── Modals ───────────────────────────────────────────────────────────────────

function Backdrop({ children }: { children: any }) {

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 flex items-center justify-center p-4">
            {children}
        </div>
    );
}

function CustomerDetailModal({ customer, orders, onClose }: {
    customer: Customer; orders: Order[]; onClose: () => void;
}) {
    const custOrders = orders.filter(o => o.customer === customer.name);
    return (
        <Backdrop>
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Detail Pelanggan</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={17} className="text-gray-500" />
                    </button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <User size={24} className="text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{customer.name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">{customer.totalOrders} pesanan total</p>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                            <Phone size={15} className="text-gray-400 shrink-0" />
                            <span className="text-gray-700">{customer.phone}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin size={15} className="text-gray-400 shrink-0 mt-0.5" />
                            <span className="text-gray-700">{customer.address}</span>
                        </div>
                    </div>
                    {customer.notes && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                            <p className="text-xs font-semibold text-amber-700 mb-1">Catatan</p>
                            <p className="text-sm text-amber-800">{customer.notes}</p>
                        </div>
                    )}
                    {custOrders.length > 0 && (
                        <div>
                            <h4 className="text-sm font-bold text-gray-900 mb-2.5">Riwayat Pesanan</h4>
                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                {custOrders.map(o => (
                                    <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm">
                                        <div>
                                            <p className="font-semibold text-gray-900">{o.invoice}</p>
                                            <p className="text-gray-500 text-xs mt-0.5">{o.service} — {o.clothingType}</p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={o.status} />
                                            <p className="text-xs text-gray-400 mt-1">{o.createdAt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Backdrop>
    );
}

function WhatsAppModal({ order, sending, onSend, onClose }: {
    order: Order; sending: boolean; onSend: () => void; onClose: () => void;
}) {
    return (
        <Backdrop>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-500 rounded-xl flex items-center justify-center">
                            <MessageCircle size={17} className="text-white" />
                        </div>
                        <h2 className="text-base font-bold text-gray-900">Kirim Notifikasi WhatsApp?</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={17} className="text-gray-500" />
                    </button>
                </div>
                <div className="p-6">
                    <div className="bg-[#E7F8E9] rounded-2xl p-4 text-sm text-gray-800 leading-relaxed mb-4 shadow-inner">
                        <p>Halo {order.customer},</p>
                        <br />
                        <p>Pesanan Anda dengan nomor <strong>{order.invoice}</strong> telah selesai dikerjakan dan siap diambil.</p>
                        <br />
                        <p>Terima kasih telah menggunakan jasa SIMJAHIT.</p>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">
                        Pesan akan dikirim ke:{" "}
                        <span className="font-semibold text-gray-600">{order.phone}</span>
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onSend}
                            disabled={sending}
                            className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            <Send size={14} />
                            {sending ? "Mengirim..." : "Kirim WhatsApp"}
                        </button>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}

function ReceiptModal({ order, onClose }: { order: Order; onClose: () => void }) {
    const total = order.price - order.discount;
    const remaining = total - order.dp;
    const handlePrint = () => window.print();
    return (
        <Backdrop>
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Pratinjau Nota Thermal</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                            <Printer size={13} />
                            Cetak
                        </button>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                            <X size={17} className="text-gray-500" />
                        </button>
                    </div>
                </div>
                <div className="p-6 bg-gray-100">
                    <div className="w-[240px] bg-white font-mono text-[11px] mx-auto shadow-lg rounded-sm">
                        <div className="p-4">
                            <div className="text-center mb-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-2">
                                    <Scissors size={14} className="text-white" />
                                </div>
                                <p className="font-bold text-sm tracking-widest text-gray-900">SIMJAHIT</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">Jasa Jahit & Permak Pakaian</p>
                                <p className="text-gray-400 text-[10px]">Jl. Sudirman No. 45, Bandung</p>
                                <p className="text-gray-400 text-[10px]">Telp: 022-1234567</p>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2.5" />
                            <div className="space-y-1 mb-2">
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500">No. Invoice</span>
                                    <span className="font-bold text-right">{order.invoice}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500">Tanggal</span>
                                    <span>{order.createdAt}</span>
                                </div>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2.5" />
                            <div className="mb-2">
                                <p className="font-bold text-gray-900 mb-1">Pelanggan:</p>
                                <p className="text-gray-800">{order.customer}</p>
                                <p className="text-gray-500">{order.phone}</p>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2.5" />
                            <div className="space-y-1 mb-2">
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500">Pakaian</span>
                                    <span className="text-right">{order.clothingType}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500">Layanan</span>
                                    <span className="text-right">{order.service}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500">Deadline</span>
                                    <span>{order.deadline}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500">Status</span>
                                    <span className="font-bold">{order.status}</span>
                                </div>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2.5" />
                            <div className="space-y-1 mb-2">
                                <div className="flex justify-between gap-2">
                                    <span className="text-gray-500">Harga</span>
                                    <span>{fmt(order.price)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between gap-2 text-red-500">
                                        <span>Diskon</span>
                                        <span>-{fmt(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between gap-2 font-bold">
                                    <span>Total</span>
                                    <span>{fmt(total)}</span>
                                </div>
                                <div className="flex justify-between gap-2 text-green-600">
                                    <span>DP Dibayar</span>
                                    <span>{fmt(order.dp)}</span>
                                </div>
                                {remaining > 0 ? (
                                    <div className="flex justify-between gap-2 font-bold text-red-500">
                                        <span>Sisa</span>
                                        <span>{fmt(remaining)}</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between gap-2 font-bold text-green-600">
                                        <span>Status Bayar</span>
                                        <span>LUNAS</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-2.5" />
                            <div className="flex justify-center my-3">
                                <div className="w-14 h-14 border border-gray-400 p-1">
                                    <div className="grid grid-cols-6 gap-px">
                                        {QR_GRID.map((v, i) => (
                                            <div key={i} className={`w-1.5 h-1.5 ${v ? "bg-gray-900" : "bg-white"}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center text-gray-400 text-[10px] leading-relaxed">
                                <p className="font-semibold text-gray-700 mb-0.5">Terima kasih atas kepercayaan Anda!</p>
                                <p>Barang tidak diambil lebih dari 30 hari</p>
                                <p>menjadi tanggung jawab pemilik.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}

// ─── Customer Form Modal ──────────────────────────────────────────────────────

function CustomerFormModal({ initial, onSave, onClose }: {
    initial?: Customer; onSave: (data: any) => void; onClose: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [phone, setPhone] = useState(initial?.phone ?? "");
    const [address, setAddress] = useState(initial?.address ?? "");
    const [notes, setNotes] = useState(initial?.notes ?? "");

    return (
        <Backdrop>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">{initial ? "Edit Pelanggan" : "Tambah Pelanggan"}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={17} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <InputField label="Nama"><input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="Nama pelanggan" /></InputField>
                    <InputField label="Nomor WhatsApp"><input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" /></InputField>
                    <InputField label="Alamat"><textarea className={`${inputClass} resize-none`} rows={2} value={address} onChange={e => setAddress(e.target.value)} /></InputField>
                    <InputField label="Catatan"><textarea className={`${inputClass} resize-none`} rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan khusus" /></InputField>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
                        <button onClick={() => onSave({ name, phone, address, notes })} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={14} />Simpan</button>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}

// ─── Service Form Modal ───────────────────────────────────────────────────────

function ServiceFormModal({ initial, onSave, onClose }: {
    initial?: Service; onSave: (data: any) => void; onClose: () => void;
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [price, setPrice] = useState(initial ? String(initial.price) : "");
    const [estimatedDays, setEstimatedDays] = useState(initial ? String(initial.estimatedDays) : "1");
    const [status, setStatus] = useState<"Aktif" | "Nonaktif">(initial?.status ?? "Aktif");

    return (
        <Backdrop>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">{initial ? "Edit Layanan" : "Tambah Layanan"}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={17} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <InputField label="Nama Layanan"><input className={inputClass} value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Pendekkan Celana" /></InputField>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Harga (Rp)"><input type="number" className={inputClass} value={price} onChange={e => setPrice(e.target.value)} /></InputField>
                        <InputField label="Estimasi (hari)"><input type="number" className={inputClass} value={estimatedDays} onChange={e => setEstimatedDays(e.target.value)} /></InputField>
                    </div>
                    <InputField label="Status">
                        <select className={inputClass} value={status} onChange={e => setStatus(e.target.value as "Aktif" | "Nonaktif")}>
                            <option value="Aktif">Aktif</option>
                            <option value="Nonaktif">Nonaktif</option>
                        </select>
                    </InputField>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
                        <button onClick={() => onSave({ name, price: Number(price) || 0, estimatedDays: Number(estimatedDays) || 1, status })} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={14} />Simpan</button>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}

// ─── Expense Form Modal ───────────────────────────────────────────────────────

function ExpenseFormModal({ initial, onSave, onClose }: {
    initial?: Expense; onSave: (data: any) => void; onClose: () => void;
}) {
    const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
    const [category, setCategory] = useState(initial?.category ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    const [amount, setAmount] = useState(initial ? String(initial.amount) : "");

    return (
        <Backdrop>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">{initial ? "Edit Pengeluaran" : "Tambah Pengeluaran"}</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={17} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Tanggal"><input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} /></InputField>
                        <InputField label="Kategori"><input className={inputClass} value={category} onChange={e => setCategory(e.target.value)} placeholder="Benang, Listrik, ..." /></InputField>
                    </div>
                    <InputField label="Deskripsi"><input className={inputClass} value={description} onChange={e => setDescription(e.target.value)} placeholder="Keterangan" /></InputField>
                    <InputField label="Jumlah (Rp)"><input type="number" className={inputClass} value={amount} onChange={e => setAmount(e.target.value)} /></InputField>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
                        <button onClick={() => onSave({ date, category, description, amount: Number(amount) || 0 })} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-2"><Save size={14} />Simpan</button>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}

// ─── Payment Modal ────────────────────────────────────────────────────────────

function PaymentModal({ order, onSave, onClose }: {
    order: Order; onSave: (data: any) => void; onClose: () => void;
}) {
    const total = order.price - order.discount;
    const remaining = Math.max(0, total - order.dp);
    const [type, setType] = useState<"down_payment" | "remaining_payment" | "full_payment">(remaining > 0 ? "remaining_payment" : "full_payment");
    const [amount, setAmount] = useState(String(remaining));
    const [method, setMethod] = useState<"cash" | "transfer" | "ewallet">("cash");
    const [notes, setNotes] = useState("");

    return (
        <Backdrop>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">Catat Pembayaran</h2>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X size={17} className="text-gray-500" /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-gray-50 rounded-xl p-3 text-sm flex justify-between">
                        <span className="text-gray-500">Sisa tagihan</span>
                        <span className="font-bold text-red-500">{fmt(remaining)}</span>
                    </div>
                    <InputField label="Jenis Pembayaran">
                        <select className={inputClass} value={type} onChange={e => setType(e.target.value as any)}>
                            <option value="down_payment">Uang Muka (DP)</option>
                            <option value="remaining_payment">Sisa Pembayaran</option>
                            <option value="full_payment">Lunas Penuh</option>
                        </select>
                    </InputField>
                    <InputField label="Jumlah (Rp)"><input type="number" className={inputClass} value={amount} onChange={e => setAmount(e.target.value)} /></InputField>
                    <InputField label="Metode">
                        <select className={inputClass} value={method} onChange={e => setMethod(e.target.value as any)}>
                            <option value="cash">Tunai</option>
                            <option value="transfer">Transfer</option>
                            <option value="ewallet">E-Wallet</option>
                        </select>
                    </InputField>
                    <InputField label="Catatan"><input className={inputClass} value={notes} onChange={e => setNotes(e.target.value)} /></InputField>
                    <div className="flex gap-3 pt-1">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
                        <button onClick={() => onSave({ type, amount: Number(amount) || 0, payment_method: method, notes })} className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 flex items-center justify-center gap-2"><Banknote size={14} />Bayar</button>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ title, message, onConfirm, onClose }: {
    title: string; message: string; onConfirm: () => void; onClose: () => void;
}) {
    return (
        <Backdrop>
            <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
                <div className="p-6">
                    <h2 className="text-base font-bold text-gray-900 mb-1">{title}</h2>
                    <p className="text-sm text-gray-500">{message}</p>
                    <div className="flex gap-3 mt-5">
                        <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Batal</button>
                        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600">Hapus</button>
                    </div>
                </div>
            </div>
        </Backdrop>
    );
}

// ─── Page: Login ──────────────────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (payload: { username: string; password: string }) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (

        <div className="min-h-screen flex">
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#0F2544] via-[#1a3a6b] to-[#0F2544] items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute border border-white/30 rounded-full"
                            style={{
                                width: `${(i + 1) * 150}px`,
                                height: `${(i + 1) * 150}px`,
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                            }}
                        />
                    ))}
                </div>
                <div className="relative text-center text-white">
                    <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                        <Scissors size={36} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-bold mb-3 tracking-tight">SIMJAHIT</h1>
                    <p className="text-blue-200 text-lg mb-8">Sistem Informasi Manajemen</p>
                    <p className="text-blue-200/70 text-sm leading-relaxed max-w-xs mx-auto">
                        Kelola jasa jahit dan permak pakaian Anda dengan mudah, cepat, dan profesional.
                    </p>
                    <div className="mt-10 grid grid-cols-3 gap-4 text-sm text-blue-100/70">
                        {["Catat Pesanan", "Kelola Pembayaran", "Cetak Nota"].map(f => (
                            <div key={f} className="bg-white/10 rounded-xl p-3 text-center text-xs">{f}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-sm">
                    <div className="lg:hidden flex justify-center mb-8">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Scissors size={24} className="text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Selamat Datang</h2>
                    <p className="text-gray-500 text-sm mb-8">Masuk ke akun SIMJAHIT Anda</p>

                    <form
                        onSubmit={e => { e.preventDefault(); onLogin({ username, password }); }}
                        className="space-y-4"
                    >
                        <InputField label="Username">
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="Masukkan username"
                                className={inputClass}
                            />
                        </InputField>
                        <InputField label="Password">
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Masukkan password"
                                className={inputClass}
                            />
                        </InputField>
                        <button
                            type="submit"
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 active:scale-[0.98] transition-all shadow-sm shadow-blue-200 mt-2"
                        >
                            Masuk ke Sistem
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-400 mt-8">
                        © 2026 SIMJAHIT · Versi 1.0
                    </p>
                </div>
            </div>
        </div>
    );
}

// ─── Page: Dashboard ─────────────────────────────────────────────────────────

function DashboardPage({ orders, setPage, setSelectedOrder, setShowWhatsApp, onEditOrder, onDeleteOrder }: {
    orders: Order[];
    setPage: (p: Page) => void;
    setSelectedOrder: (o: Order) => void;
    setShowWhatsApp: (v: boolean) => void;
    onEditOrder: (o: Order) => void;
    onDeleteOrder: (o: Order) => void;
}) {
    const today = new Date().toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7);
    const todayOrders = orders.filter(o => o.createdAt === today);
    const inProgress = orders.filter(o => ["Diproses", "Finishing", "Menunggu"].includes(o.status));
    const done = orders.filter(o => o.status === "Selesai");
    const notPickedUp = orders.filter(o => o.status === "Selesai");
    const todayRevenue = todayOrders.reduce((s, o) => s + o.dp, 0);
    const monthlyRevenue = orders.filter(o => o.createdAt.startsWith(monthPrefix)).reduce((s, o) => s + (o.price - o.discount), 0);

    const stats = [
        { icon: ShoppingBag, label: "Total Pesanan Hari Ini", value: String(todayOrders.length), sub: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), color: "bg-blue-500" },
        { icon: Clock, label: "Sedang Diproses", value: String(inProgress.length), sub: "Menunggu + Diproses + Finishing", color: "bg-amber-500" },
        { icon: CheckCircle2, label: "Pesanan Selesai", value: String(done.length), sub: "Siap diambil pelanggan", color: "bg-green-500" },
        { icon: Package, label: "Belum Diambil", value: String(notPickedUp.length), sub: "Perlu notifikasi", color: "bg-red-400" },
        { icon: Wallet, label: "Pendapatan Hari Ini", value: fmt(todayRevenue), sub: "Dari uang muka", color: "bg-indigo-500" },
        { icon: TrendingUp, label: "Pendapatan Bulan Ini", value: fmt(monthlyRevenue), sub: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }), color: "bg-purple-500" },
    ];

    // Build 6-month revenue/expense trend from orders
    const monthLabels: string[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthLabels.push(d.toLocaleDateString("id-ID", { month: "short" }));
    }
    const REVENUE_DATA = monthLabels.map((m, idx) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
        const prefix = d.toISOString().slice(0, 7);
        const pendapatan = orders.filter(o => o.createdAt.startsWith(prefix)).reduce((s, o) => s + (o.price - o.discount), 0);
        return { month: m, pendapatan, pengeluaran: 0 };
    });

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-3 gap-4">
                {stats.map(stat => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={stat.label}
                            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-0.5 leading-none">{stat.value}</p>
                            <p className="text-sm font-semibold text-gray-700 mt-1.5">{stat.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{stat.sub}</p>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-bold text-gray-900">Grafik Pendapatan</h3>
                            <p className="text-xs text-gray-400 mt-0.5">Pendapatan 6 bulan terakhir</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Pendapatan</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                        <AreaChart data={REVENUE_DATA} margin={{ left: -10, right: 5 }}>
                            <defs>
                                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} />
                            <Tooltip
                                formatter={(v: number) => [fmt(v), "Pendapatan"]}
                                contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                            />
                            <Area type="monotone" dataKey="pendapatan" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-0.5">Layanan Terlaris</h3>
                    <p className="text-xs text-gray-400 mb-4">Periode ini</p>
                    {(() => {
                        const counts: Record<string, number> = {};
                        orders.forEach(o => { counts[o.service] = (counts[o.service] || 0) + 1; });
                        const TOP = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
                            .map(([name, jumlah]) => ({ name, jumlah }));
                        if (TOP.length === 0) return <p className="text-sm text-gray-400">Belum ada data.</p>;
                        return (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={TOP} layout="vertical" margin={{ left: 0, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748B" }} axisLine={false} tickLine={false} width={85} />
                                    <Tooltip formatter={(v: number) => [`${v} pesanan`]} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                                    <Bar dataKey="jumlah" fill="#3B82F6" radius={[0, 5, 5, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        );
                    })()}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Pesanan Terbaru</h3>
                    <button
                        onClick={() => setPage("orders")}
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                    >
                        Lihat Semua <ChevronRight size={14} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-50">
                                {["Invoice", "Pelanggan", "Jenis Pakaian", "Layanan", "Status", "Deadline", "Aksi"].map(h => (
                                    <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {orders.slice(0, 6).map(o => (
                                <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3.5 text-sm font-bold text-blue-600">{o.invoice}</td>
                                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{o.customer}</td>
                                    <td className="px-5 py-3.5 text-sm text-gray-600">{o.clothingType}</td>
                                    <td className="px-5 py-3.5 text-sm text-gray-600">{o.service}</td>
                                    <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                                    <td className="px-5 py-3.5 text-sm text-gray-600">{o.deadline}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => { setSelectedOrder(o); setPage("order-detail"); }}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={15} />
                                            </button>
                                            <button
                                                onClick={() => onEditOrder(o)}
                                                className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => onDeleteOrder(o)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                            {o.status === "Selesai" && (
                                                <button
                                                    onClick={() => { setSelectedOrder(o); setShowWhatsApp(true); }}
                                                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Kirim WhatsApp"
                                                >
                                                    <MessageCircle size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">Belum ada pesanan.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// ─── Page: Customers ──────────────────────────────────────────────────────────

function CustomersPage({ customers, orders, onAdd, onEdit, onDelete, onShowDetail }: {
    customers: Customer[];
    orders: Order[];
    onAdd: () => void;
    onEdit: (c: Customer) => void;
    onDelete: (c: Customer) => void;
    onShowDetail: (c: Customer) => void;
}) {
    const [search, setSearch] = useState("");
    const filtered = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari nama atau nomor WhatsApp..."
                        className={inputClass}
                    />
                </div>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors ml-auto">
                    <Plus size={15} />
                    Tambah Pelanggan
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm text-gray-500">{filtered.length} pelanggan</p>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            {["Nama", "Nomor WhatsApp", "Alamat", "Total Pesanan", "Terakhir Datang", "Aksi"].map(h => (
                                <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(c => (
                            <tr key={c.id} className="hover:bg-blue-50/30 transition-colors">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                            <User size={13} className="text-blue-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-600">{c.phone}</td>
                                <td className="px-5 py-4 text-sm text-gray-500 max-w-[200px] truncate">{c.address}</td>
                                <td className="px-5 py-4">
                                    <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold">{c.totalOrders}</span>
                                </td>
                                <td className="px-5 py-4 text-sm text-gray-500">{c.lastVisit}</td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => onShowDetail(c)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye size={14} /></button>
                                        <button onClick={() => onEdit(c)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                                        <button onClick={() => onDelete(c)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">Tidak ada pelanggan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Page: Services ───────────────────────────────────────────────────────────

function ServicesPage({ services, onAdd, onEdit, onDelete }: {
    services: Service[];
    onAdd: () => void;
    onEdit: (s: Service) => void;
    onDelete: (s: Service) => void;
}) {
    const active = services.filter(s => s.status === "Aktif").length;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm shadow-sm">
                        <span className="text-gray-500">Aktif: </span>
                        <span className="font-bold text-green-600">{active}</span>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm shadow-sm">
                        <span className="text-gray-500">Nonaktif: </span>
                        <span className="font-bold text-gray-400">{services.length - active}</span>
                    </div>
                </div>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Plus size={15} />
                    Tambah Layanan
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {["No", "Nama Layanan", "Harga", "Estimasi Waktu", "Status", "Aksi"].map(h => (
                                <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {services.map((s, i) => (
                            <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                                <td className="px-5 py-4 text-sm text-gray-400 font-medium">{i + 1}</td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                                            <Scissors size={13} className="text-blue-500" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{s.name}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className="text-sm font-bold text-gray-900">{fmt(s.price)}</span>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                        <Clock size={13} className="text-gray-400" />
                                        {s.estimatedDays} hari kerja
                                    </div>
                                </td>
                                <td className="px-5 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.status === "Aktif" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.status === "Aktif" ? "bg-green-500" : "bg-gray-300"}`} />
                                        {s.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => onEdit(s)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                                        <button onClick={() => onDelete(s)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {services.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-gray-400">Belum ada layanan.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Page: Orders ─────────────────────────────────────────────────────────────

function OrdersPage({ orders, setPage, setSelectedOrder, onDelete }: {
    orders: Order[];
    setPage: (p: Page) => void;
    setSelectedOrder: (o: Order) => void;
    onDelete: (o: Order) => void;
}) {
    const [activeTab, setActiveTab] = useState("Semua");
    const [search, setSearch] = useState("");

    const tabs = ["Semua", "Menunggu", "Diproses", "Finishing", "Selesai", "Sudah Diambil"];

    const filtered = orders.filter(o => {
        const matchTab = activeTab === "Semua" || o.status === activeTab;
        const matchSearch = o.invoice.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Cari invoice atau nama pelanggan..."
                        className={inputClass}
                    />
                </div>
                <button
                    onClick={() => setPage("new-transaction")}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors ml-auto"
                >
                    <Plus size={15} />
                    Pesanan Baru
                </button>
            </div>

            <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
                {tabs.map(t => {
                    const count = t === "Semua" ? orders.length : orders.filter(o => o.status === t).length;
                    return (
                        <button
                            key={t}
                            onClick={() => setActiveTab(t)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === t ? "bg-blue-600 text-white shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {t}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === t ? "bg-blue-500 text-blue-100" : "bg-gray-100 text-gray-400"}`}>
                                {count}
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100 bg-gray-50/50">
                            {["Invoice", "Pelanggan", "Jenis Pakaian", "Layanan", "Status", "Deadline", "Total", "Aksi"].map(h => (
                                <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(o => (
                            <tr key={o.id} className="hover:bg-blue-50/30 transition-colors cursor-pointer" onClick={() => { setSelectedOrder(o); setPage("order-detail"); }}>
                                <td className="px-5 py-3.5 text-sm font-bold text-blue-600">{o.invoice}</td>
                                <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{o.customer}</td>
                                <td className="px-5 py-3.5 text-sm text-gray-600">{o.clothingType}</td>
                                <td className="px-5 py-3.5 text-sm text-gray-600">{o.service}</td>
                                <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                                <td className="px-5 py-3.5 text-sm text-gray-600">{o.deadline}</td>
                                <td className="px-5 py-3.5 text-sm font-bold text-gray-900">{fmt(o.price - o.discount)}</td>
                                <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => { setSelectedOrder(o); setPage("order-detail"); }}
                                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Eye size={14} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(o)}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-gray-400 text-sm">Tidak ada pesanan ditemukan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page: New Transaction ────────────────────────────────────────────────────

function NewTransactionPage({ services, customers, setPage, onCreate }: {
    services: Service[];
    customers: Customer[];
    setPage: (p: Page) => void;
    onCreate: (data: any) => Promise<void>;
}) {
    const [customerId, setCustomerId] = useState("");
    const [clothingType, setClothingType] = useState("");
    const [serviceId, setServiceId] = useState("");
    const [qty, setQty] = useState(1);
    const [deadline, setDeadline] = useState(new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10));
    const [notes, setNotes] = useState("");
    const [discount, setDiscount] = useState(0);
    const [dp, setDp] = useState(0);
    const [saving, setSaving] = useState(false);

    const cust = customers.find(c => String(c.id) === String(customerId));
    const svc = services.find(s => String(s.id) === String(serviceId));
    const subtotal = svc ? svc.price * qty : 0;
    const total = Math.max(0, subtotal - discount);
    const remaining = Math.max(0, total - dp);

    const handleSave = async () => {
        if (!customerId || !serviceId || !clothingType) {
            alert("Lengkapi data pelanggan, jenis pakaian, dan layanan.");
            return;
        }
        setSaving(true);
        try {
            await onCreate({
                customer_id: Number(customerId),
                order_date: new Date().toISOString().slice(0, 10),
                deadline,
                notes,
                discount,
                down_payment: dp,
                items: [{
                    item_name: svc!.name,
                    category: clothingType,
                    price: svc!.price,
                    quantity: qty,
                }],
            });
            setPage("orders");
        } catch (e: any) {
            alert("Gagal menyimpan: " + (e?.message || "terjadi kesalahan"));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">1</span>
                        Data Pelanggan
                    </h3>
                    <div className="space-y-4">
                        <InputField label="Pilih Pelanggan">
                            <select value={customerId} onChange={e => setCustomerId(e.target.value)} className={inputClass}>
                                <option value="">-- Pilih pelanggan yang sudah terdaftar --</option>
                                {customers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
                                ))}
                            </select>
                        </InputField>
                        {cust && (
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Nomor WhatsApp"><input value={cust.phone} readOnly className={readonlyClass} /></InputField>
                                <InputField label="Alamat"><input value={cust.address} readOnly className={readonlyClass} /></InputField>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">2</span>
                        Data Pesanan
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Jenis Pakaian">
                            <input
                                type="text"
                                value={clothingType}
                                onChange={e => setClothingType(e.target.value)}
                                placeholder="Contoh: Celana Jeans, Kemeja..."
                                className={inputClass}
                            />
                        </InputField>
                        <InputField label="Jumlah (pcs)">
                            <input
                                type="number"
                                value={qty}
                                onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                                min={1}
                                className={inputClass}
                            />
                        </InputField>
                        <InputField label="Jenis Layanan">
                            <select value={serviceId} onChange={e => setServiceId(e.target.value)} className={inputClass}>
                                <option value="">-- Pilih layanan --</option>
                                {services.filter(s => s.status === "Aktif").map(s => (
                                    <option key={s.id} value={s.id}>{s.name} — {fmt(s.price)}</option>
                                ))}
                            </select>
                        </InputField>
                        <InputField label="Deadline">
                            <input
                                type="date"
                                value={deadline}
                                onChange={e => setDeadline(e.target.value)}
                                className={inputClass}
                            />
                        </InputField>
                        <div className="col-span-2">
                            <InputField label="Catatan">
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Catatan khusus untuk pesanan ini..."
                                    rows={2}
                                    className={`${inputClass} resize-none`}
                                />
                            </InputField>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2.5">
                        <span className="w-6 h-6 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shrink-0">3</span>
                        Ringkasan
                    </h3>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-semibold">{fmt(subtotal)}</span>
                        </div>
                        <InputField label="Diskon">
                            <input
                                type="number"
                                value={discount}
                                onChange={e => setDiscount(Math.max(0, Number(e.target.value)))}
                                className={inputClass}
                            />
                        </InputField>
                        <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                            <span>Total</span>
                            <span>{fmt(total)}</span>
                        </div>
                        <InputField label="Uang Muka (DP)">
                            <input
                                type="number"
                                value={dp}
                                onChange={e => setDp(Math.max(0, Number(e.target.value)))}
                                className={inputClass}
                            />
                        </InputField>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Sisa Pembayaran</span>
                            <span className={`font-bold ${remaining > 0 ? "text-red-500" : "text-green-600"}`}>
                                {remaining > 0 ? fmt(remaining) : "LUNAS"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setPage("orders")}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        <Save size={14} />
                        {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page: Order Detail ───────────────────────────────────────────────────────

function OrderDetailPage({ order, setPage, setShowWhatsApp, setShowReceipt, onAdvanceStatus, onPay }: {
    order: Order;
    setPage: (p: Page) => void;
    setShowWhatsApp: (v: boolean) => void;
    setShowReceipt: (v: boolean) => void;
    onAdvanceStatus: () => void;
    onPay: () => void;
}) {
    const total = order.price - order.discount;
    const remaining = total - order.dp;
    const idx = STATUS_FLOW.indexOf(order.status);
    const nextStatus = idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            <button
                onClick={() => setPage("orders")}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
                <ChevronRight size={14} className="rotate-180" />
                Kembali ke Pesanan
            </button>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-gray-900">{order.invoice}</h2>
                            <StatusBadge status={order.status} />
                        </div>
                        <p className="text-sm text-gray-500">Dibuat pada {order.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onPay}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Banknote size={14} />
                            Bayar
                        </button>
                        <button
                            onClick={setShowReceipt.bind(null, true) as any}
                            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <Printer size={14} />
                            Nota
                        </button>
                        {order.status === "Selesai" && (
                            <button
                                onClick={setShowWhatsApp.bind(null, true) as any}
                                className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-colors"
                            >
                                <MessageCircle size={14} />
                                WhatsApp
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Informasi Pelanggan</h3>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User size={18} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{order.customer}</p>
                                <p className="text-sm text-gray-500">{order.phone}</p>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">Informasi Pesanan</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Jenis Pakaian</span>
                                <span className="font-medium">{order.clothingType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Layanan</span>
                                <span className="font-medium">{order.service}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Deadline</span>
                                <span className="font-medium">{order.deadline}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {order.notes && (
                    <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3.5">
                        <p className="text-xs font-semibold text-amber-700 mb-1">Catatan</p>
                        <p className="text-sm text-amber-800">{order.notes}</p>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Rincian Pembayaran</h3>
                    <div className="space-y-2 text-sm max-w-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Harga</span>
                            <span>{fmt(order.price)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-red-500">
                                <span>Diskon</span>
                                <span>-{fmt(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                            <span>Total</span>
                            <span>{fmt(total)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                            <span>DP Dibayar</span>
                            <span>{fmt(order.dp)}</span>
                        </div>
                        <div className={`flex justify-between font-bold pt-2 border-t border-gray-100 ${remaining > 0 ? "text-red-500" : "text-green-600"}`}>
                            <span>Sisa</span>
                            <span>{remaining > 0 ? fmt(remaining) : "LUNAS"}</span>
                        </div>
                    </div>
                </div>

                {nextStatus && (
                    <div className="mt-6">
                        <button
                            onClick={onAdvanceStatus}
                            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 size={15} />
                            Tandai sebagai: {nextStatus}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Page: Expenses ───────────────────────────────────────────────────────────

function ExpensesPage({ expenses, onAdd, onEdit, onDelete }: {
    expenses: Expense[];
    onAdd: () => void;
    onEdit: (e: Expense) => void;
    onDelete: (e: Expense) => void;
}) {
    const total = expenses.reduce((s, e) => s + e.amount, 0);

    const byCategory: Record<string, number> = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const EXPENSE_PIE_DATA = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm shadow-sm">
                    <span className="text-gray-500">Total Pengeluaran: </span>
                    <span className="font-bold text-red-500">{fmt(total)}</span>
                </div>
                <button onClick={onAdd} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Plus size={15} />
                    Tambah Pengeluaran
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                {["Tanggal", "Kategori", "Deskripsi", "Jumlah", "Aksi"].map(h => (
                                    <th key={h} className="text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {expenses.map(e => (
                                <tr key={e.id} className="hover:bg-gray-50/60 transition-colors">
                                    <td className="px-5 py-3.5 text-sm text-gray-600">{e.date}</td>
                                    <td className="px-5 py-3.5">
                                        <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">{e.category}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-sm text-gray-600">{e.description}</td>
                                    <td className="px-5 py-3.5 text-sm font-bold text-red-500">{fmt(e.amount)}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => onEdit(e)} className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
                                            <button onClick={() => onDelete(e)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">Belum ada pengeluaran.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-0.5">Kategori Pengeluaran</h3>
                    <p className="text-xs text-gray-400 mb-4">Semua periode</p>
                    {EXPENSE_PIE_DATA.length === 0 ? (
                        <p className="text-sm text-gray-400">Belum ada data.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={EXPENSE_PIE_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {EXPENSE_PIE_DATA.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {EXPENSE_PIE_DATA.map((d, i) => (
                                    <div key={d.name} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[i] }} />
                                            {d.name}
                                        </span>
                                        <span className="font-semibold">{fmt(d.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Page: Reports ────────────────────────────────────────────────────────────

function ReportsPage({ orders, expenses }: { orders: Order[]; expenses: Expense[] }) {
    const now = new Date();
    const monthLabels: string[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        monthLabels.push(d.toLocaleDateString("id-ID", { month: "short" }));
    }
    const REVENUE_DATA = monthLabels.map((m, idx) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - idx), 1);
        const prefix = d.toISOString().slice(0, 7);
        const pendapatan = orders.filter(o => o.createdAt.startsWith(prefix)).reduce((s, o) => s + (o.price - o.discount), 0);
        const pengeluaran = expenses.filter(e => e.date.startsWith(prefix)).reduce((s, e) => s + e.amount, 0);
        return { month: m, pendapatan, pengeluaran };
    });

    const totalPendapatan = REVENUE_DATA.reduce((s, d) => s + d.pendapatan, 0);
    const totalPengeluaran = REVENUE_DATA.reduce((s, d) => s + d.pengeluaran, 0);

    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.service] = (counts[o.service] || 0) + 1; });
    const TOP_SERVICES_DATA = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, jumlah]) => ({ name, jumlah }));

    const byCategory: Record<string, number> = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const EXPENSE_PIE_DATA = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: "Total Pendapatan", value: fmt(totalPendapatan), sub: "6 bulan terakhir", color: "bg-blue-500", icon: TrendingUp },
                    { label: "Total Pengeluaran", value: fmt(totalPengeluaran), sub: "6 bulan terakhir", color: "bg-red-400", icon: TrendingDown },
                    { label: "Total Pesanan", value: String(orders.length), sub: "Semua periode", color: "bg-green-500", icon: ShoppingBag },
                    { label: "Rata-rata Pesanan", value: orders.length ? (totalPendapatan / orders.length).toFixed(0) : "0", sub: "Per pesanan", color: "bg-purple-500", icon: BarChart2 },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color}`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900 mb-0.5 leading-none">{s.value}</p>
                            <p className="text-sm font-semibold text-gray-700 mt-1.5">{s.label}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900">Grafik Pendapatan Tahunan</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Pendapatan vs Pengeluaran</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Pendapatan</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />Pengeluaran</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={REVENUE_DATA} margin={{ left: -10, right: 5 }}>
                        <defs>
                            <linearGradient id="gRev2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="gExp2" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F87171" stopOpacity={0.12} />
                                <stop offset="95%" stopColor="#F87171" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} />
                        <Tooltip
                            formatter={(v: number, name: string) => [fmt(v), name === "pendapatan" ? "Pendapatan" : "Pengeluaran"]}
                            contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E2E8F0", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                        />
                        <Area type="monotone" dataKey="pendapatan" stroke="#3B82F6" strokeWidth={2.5} fill="url(#gRev2)" />
                        <Area type="monotone" dataKey="pengeluaran" stroke="#F87171" strokeWidth={2} fill="url(#gExp2)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Layanan Terlaris</h3>
                    {TOP_SERVICES_DATA.length === 0 ? <p className="text-sm text-gray-400">Belum ada data.</p> : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={TOP_SERVICES_DATA} layout="vertical" margin={{ left: 0, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: "#64748B" }} axisLine={false} tickLine={false} width={110} />
                                <Tooltip formatter={(v: number) => [`${v} pesanan`]} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                                <Bar dataKey="jumlah" fill="#3B82F6" radius={[0, 5, 5, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-4">Kategori Pengeluaran</h3>
                    {EXPENSE_PIE_DATA.length === 0 ? <p className="text-sm text-gray-400">Belum ada data.</p> : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={EXPENSE_PIE_DATA} dataKey="value" innerRadius={40} outerRadius={75} paddingAngle={3}>
                                        {EXPENSE_PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #E2E8F0" }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {EXPENSE_PIE_DATA.map((d, i) => (
                                    <div key={d.name} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[i] }} />
                                            {d.name}
                                        </span>
                                        <span className="font-semibold">{fmt(d.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                    <Download size={14} />
                    Export Laporan
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                    <Printer size={14} />
                    Cetak
                </button>
            </div>
        </div>
    );
}

// ─── Page: Settings ───────────────────────────────────────────────────────────

function SettingsPage() {
    const [storeName, setStoreName] = useState("SIMJAHIT");
    const [address, setAddress] = useState("Jl. Sudirman No. 45, Bandung");
    const [phone, setPhone] = useState("022-1234567");
    const [wa, setWa] = useState("081234567890");
    const [notif1, setNotif1] = useState(true);
    const [notif2, setNotif2] = useState(true);
    const [notif3, setNotif3] = useState(false);

    const save = () => {
        localStorage.setItem("simjahit_settings", JSON.stringify({ storeName, address, phone, wa, notif1, notif2, notif3 }));
        alert("Pengaturan disimpan.");
    };

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Profil Toko</h3>
                <div className="space-y-4">
                    <InputField label="Nama Toko"><input className={inputClass} value={storeName} onChange={e => setStoreName(e.target.value)} /></InputField>
                    <InputField label="Alamat"><textarea className={`${inputClass} resize-none`} rows={2} value={address} onChange={e => setAddress(e.target.value)} /></InputField>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Nomor Telepon"><input className={inputClass} value={phone} onChange={e => setPhone(e.target.value)} /></InputField>
                        <InputField label="Nomor WhatsApp"><input className={inputClass} value={wa} onChange={e => setWa(e.target.value)} /></InputField>
                    </div>
                    <button onClick={save} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Simpan Perubahan</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-4">Pengaturan Notifikasi</h3>
                <div className="space-y-3">
                    {[
                        ["Kirim notifikasi WhatsApp saat pesanan selesai", notif1, setNotif1],
                        ["Kirim pengingat deadline otomatis", notif2, setNotif2],
                        ["Notifikasi stok bahan habis", notif3, setNotif3],
                    ].map(([label, val, setter], i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" checked={val as boolean} onChange={e => (setter as any)(e.target.checked)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                            <span className="text-sm text-gray-700">{label as string}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

// ─── Toast Component ─────────────────────────────────────────────────────────
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    const icon = type === "success" ? "✓" : "✕";
    const iconBg = type === "success" ? "bg-emerald-500" : "bg-red-400";
    const border = type === "success" ? "border-l-emerald-500" : "border-l-red-400";
    return (
        <div className={`fixed top-5 right-5 z-[100] transition-all duration-300 ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
            <div className={`flex items-center gap-3.5 bg-white border-l-4 ${border} border border-gray-100 rounded-xl shadow-lg px-5 py-3.5 min-w-[320px]`}>
                <div className={`w-7 h-7 ${iconBg} rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {icon}
                </div>
                <p className="text-sm text-gray-800 font-medium flex-1">{message}</p>
                <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="p-0.5 text-gray-300 hover:text-gray-500 transition-colors shrink-0">
                    <X size={14} />
                </button>
            </div>
        </div>
    );
}

export default function App() {
    const [page, setPage] = useState<Page>("login");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showCustomerDetail, setShowCustomerDetail] = useState(false);
    const [showWhatsApp, setShowWhatsApp] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(false);
    const [waSending, setWaSending] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Modal states
    const [customerModal, setCustomerModal] = useState<{ open: boolean; editing?: Customer }>({ open: false });
    const [serviceModal, setServiceModal] = useState<{ open: boolean; editing?: Service }>({ open: false });
    const [expenseModal, setExpenseModal] = useState<{ open: boolean; editing?: Expense }>({ open: false });
    const [paymentModal, setPaymentModal] = useState(false);
    const [confirm, setConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [c, o, s, e] = await Promise.all([
                api.getCustomers(),
                api.getOrders(),
                api.getServices(),
                api.getExpenses(),
            ]);
            setCustomers(c);
            setOrders(o);
            setServices(s);
            setExpenses(e);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const [user, setUser] = useState<{ id: string | number; name: string; email: string } | null>(null);

    const handleLogin = async (payload: { username: string; password: string }) => {
        try {
            const res = await loginApi(payload);
            setUser(res.user);
            setPage("dashboard");
            loadAll();
        } catch (e: any) {
            alert(e?.message || "Login gagal");
        }
    };

    // ── Customer handlers
    const saveCustomer = async (data: any) => {
        try {
            if (customerModal.editing) {
                await api.updateCustomer(customerModal.editing.id, data);
                setToast({ message: "Pelanggan berhasil diperbarui!", type: "success" });
            } else {
                await api.createCustomer(data);
                setToast({ message: "Pelanggan berhasil ditambahkan!", type: "success" });
            }
            setCustomerModal({ open: false });
            await loadAll();
        } catch (e: any) {
            setToast({ message: e?.message || "Gagal menyimpan pelanggan. Periksa kembali data.", type: "error" });
        }
    };
    const deleteCustomer = (c: Customer) => {
        setConfirm({
            title: "Hapus Pelanggan",
            message: `Yakin hapus ${c.name}? Pesanan terkait juga akan terhapus.`,
            onConfirm: async () => { await api.deleteCustomer(c.id); setConfirm(null); await loadAll(); setToast({ message: "Pelanggan berhasil dihapus!", type: "success" }); },
        });
    };

    // ── Service handlers
    const saveService = async (data: any) => {
        try {
            if (serviceModal.editing) {
                await api.updateService(serviceModal.editing.id, data);
                setToast({ message: "Layanan berhasil diperbarui!", type: "success" });
            } else {
                await api.createService(data);
                setToast({ message: "Layanan berhasil ditambahkan!", type: "success" });
            }
            setServiceModal({ open: false });
            await loadAll();
        } catch (e: any) {
            setToast({ message: e?.message || "Gagal menyimpan layanan.", type: "error" });
        }
    };
    const deleteService = (s: Service) => {
        setConfirm({
            title: "Hapus Layanan",
            message: `Yakin hapus layanan "${s.name}"?`,
            onConfirm: async () => { await api.deleteService(s.id); setConfirm(null); await loadAll(); setToast({ message: "Layanan berhasil dihapus!", type: "success" }); },
        });
    };

    // ── Expense handlers
    const saveExpense = async (data: any) => {
        try {
            if (expenseModal.editing) {
                await api.updateExpense(expenseModal.editing.id, data);
                setToast({ message: "Pengeluaran berhasil diperbarui!", type: "success" });
            } else {
                await api.createExpense(data);
                setToast({ message: "Pengeluaran berhasil ditambahkan!", type: "success" });
            }
            setExpenseModal({ open: false });
            await loadAll();
        } catch (e: any) {
            setToast({ message: e?.message || "Gagal menyimpan pengeluaran.", type: "error" });
        }
    };
    const deleteExpense = (e: Expense) => {
        setConfirm({
            title: "Hapus Pengeluaran",
            message: `Yakin hapus pengeluaran "${e.description || e.category}"?`,
            onConfirm: async () => { await api.deleteExpense(e.id); setConfirm(null); await loadAll(); setToast({ message: "Pengeluaran berhasil dihapus!", type: "success" }); },
        });
    };

    // ── Order handlers
    const createOrder = async (data: any) => {
        await api.createOrder(data);
        await loadAll();
    };
    const deleteOrder = (o: Order) => {
        setConfirm({
            title: "Hapus Pesanan",
            message: `Yakin hapus pesanan ${o.invoice}?`,
            onConfirm: async () => {
                await api.deleteOrder(o.id);
                setConfirm(null);
                if (selectedOrder?.id === o.id) setSelectedOrder(null);
                await loadAll();
            },
        });
    };
    const advanceStatus = async () => {
        if (!selectedOrder) return;
        const idx = STATUS_FLOW.indexOf(selectedOrder.status);
        if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
        const next = STATUS_FLOW[idx + 1];
        await api.updateOrderStatus(selectedOrder.id, STATUS_TO_BACKEND[next]);
        await loadAll();
        const updated = orders.find(o => o.id === selectedOrder.id);
        // refresh selected from latest loaded state
        setSelectedOrder((prev) => prev ? { ...prev, status: next } : prev);
    };
    const savePayment = async (data: any) => {
        if (!selectedOrder) return;
        await api.createPayment(selectedOrder.id, data);
        setPaymentModal(false);
        await loadAll();
    };

    // ── WhatsApp
    const sendWhatsApp = async () => {
        if (!selectedOrder) return;
        setWaSending(true);
        try {
            const res = await api.sendWhatsApp(selectedOrder.id);
            alert(res?.message || "WhatsApp dikirim.");
        } catch (e: any) {
            alert("Gagal mengirim: " + (e?.message || "terjadi kesalahan"));
        } finally {
            setWaSending(false);
            setShowWhatsApp(false);
        }
    };

    const navItems: { icon: (props: { size?: number; className?: string }) => any; label: string; page: Page }[] = [
        { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
        { icon: ShoppingBag, label: "Pesanan", page: "orders" },
        { icon: Users, label: "Pelanggan", page: "customers" },
        { icon: Scissors, label: "Layanan", page: "services" },
        { icon: TrendingDown, label: "Pengeluaran", page: "expenses" },
        { icon: BarChart2, label: "Laporan", page: "reports" },
        { icon: SettingsIcon, label: "Pengaturan", page: "settings" },
    ];


    if (page === "login") {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] flex">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-[#0F2544] transition-all duration-200 flex flex-col shrink-0`}>
                <div className="p-4 flex items-center gap-3 border-b border-white/10">
                    <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0">
                        <Scissors size={18} className="text-white" />
                    </div>
                    {sidebarOpen && (
                        <div className="min-w-0">
                            <p className="text-white font-bold text-sm leading-tight">SIMJAHIT</p>
                            <p className="text-blue-200 text-[10px]">Manajemen Jahit</p>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-3 space-y-1">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = page === item.page;
                        return (
                            <button
                                key={item.page}
                                onClick={() => setPage(item.page)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-blue-600 text-white shadow-sm" : "text-blue-200/70 hover:bg-white/10 hover:text-white"}`}
                                title={item.label}
                            >
                                <Icon size={18} className="shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-white/10">
                    <button
                        onClick={() => setPage("login")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-200/70 hover:bg-white/10 hover:text-white transition-all"
                        title="Keluar"
                    >
                        <LogOut size={18} className="shrink-0" />
                        {sidebarOpen && <span>Keluar</span>}
                    </button>
                </div>

                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-3 border-t border-white/10 text-blue-200/50 hover:text-white transition-colors text-xs text-center"
                >
                    {sidebarOpen ? "◀" : "▶"}
                </button>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Bar */}
                <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between">
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">
                            {page === "dashboard" && "Dashboard"}
                            {page === "orders" && "Pesanan"}
                            {page === "new-transaction" && "Pesanan Baru"}
                            {page === "order-detail" && "Detail Pesanan"}
                            {page === "customers" && "Pelanggan"}
                            {page === "services" && "Layanan"}
                            {page === "expenses" && "Pengeluaran"}
                            {page === "reports" && "Laporan"}
                            {page === "settings" && "Pengaturan"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                <User size={14} className="text-white" />
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold text-gray-900 leading-tight">Admin</p>
                                <p className="text-xs text-gray-400">SIMJAHIT</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 overflow-y-auto">
                    {loading && <p className="text-sm text-gray-400 mb-3">Memuat data...</p>}
                    {page === "dashboard" && (
                        <DashboardPage
                            orders={orders}
                            setPage={setPage}
                            setSelectedOrder={setSelectedOrder}
                            setShowWhatsApp={setShowWhatsApp}
                            onEditOrder={(o) => { setSelectedOrder(o); setPage("new-transaction"); }}
                            onDeleteOrder={deleteOrder}
                        />
                    )}
                    {page === "customers" && (
                        <CustomersPage
                            customers={customers}
                            orders={orders}
                            onAdd={() => setCustomerModal({ open: true })}
                            onEdit={(c) => setCustomerModal({ open: true, editing: c })}
                            onDelete={deleteCustomer}
                            onShowDetail={(c) => { setSelectedCustomer(c); setShowCustomerDetail(true); }}
                        />
                    )}
                    {page === "services" && (
                        <ServicesPage
                            services={services}
                            onAdd={() => setServiceModal({ open: true })}
                            onEdit={(s) => setServiceModal({ open: true, editing: s })}
                            onDelete={deleteService}
                        />
                    )}
                    {page === "orders" && (
                        <OrdersPage
                            orders={orders}
                            setPage={setPage}
                            setSelectedOrder={setSelectedOrder}
                            onDelete={deleteOrder}
                        />
                    )}
                    {page === "new-transaction" && (
                        <NewTransactionPage
                            services={services}
                            customers={customers}
                            setPage={setPage}
                            onCreate={createOrder}
                        />
                    )}
                    {page === "order-detail" && selectedOrder && (
                        <OrderDetailPage
                            order={selectedOrder}
                            setPage={setPage}
                            setShowWhatsApp={setShowWhatsApp}
                            setShowReceipt={setShowReceipt}
                            onAdvanceStatus={advanceStatus}
                            onPay={() => setPaymentModal(true)}
                        />
                    )}
                    {page === "expenses" && (
                        <ExpensesPage
                            expenses={expenses}
                            onAdd={() => setExpenseModal({ open: true })}
                            onEdit={(e) => setExpenseModal({ open: true, editing: e })}
                            onDelete={deleteExpense}
                        />
                    )}
                    {page === "reports" && <ReportsPage orders={orders} expenses={expenses} />}
                    {page === "settings" && <SettingsPage />}
                </main>
            </div>

            {/* Modals */}
            {showCustomerDetail && selectedCustomer && (
                <CustomerDetailModal
                    customer={selectedCustomer}
                    orders={orders}
                    onClose={() => setShowCustomerDetail(false)}
                />
            )}
            {showWhatsApp && selectedOrder && (
                <WhatsAppModal
                    order={selectedOrder}
                    sending={waSending}
                    onSend={sendWhatsApp}
                    onClose={() => setShowWhatsApp(false)}
                />
            )}
            {showReceipt && selectedOrder && (
                <ReceiptModal
                    order={selectedOrder}
                    onClose={() => setShowReceipt(false)}
                />
            )}
            {customerModal.open && (
                <CustomerFormModal
                    initial={customerModal.editing}
                    onSave={saveCustomer}
                    onClose={() => setCustomerModal({ open: false })}
                />
            )}
            {serviceModal.open && (
                <ServiceFormModal
                    initial={serviceModal.editing}
                    onSave={saveService}
                    onClose={() => setServiceModal({ open: false })}
                />
            )}
            {expenseModal.open && (
                <ExpenseFormModal
                    initial={expenseModal.editing}
                    onSave={saveExpense}
                    onClose={() => setExpenseModal({ open: false })}
                />
            )}
            {paymentModal && selectedOrder && (
                <PaymentModal
                    order={selectedOrder}
                    onSave={savePayment}
                    onClose={() => setPaymentModal(false)}
                />
            )}
            {confirm && (
                <ConfirmModal
                    title={confirm.title}
                    message={confirm.message}
                    onConfirm={confirm.onConfirm}
                    onClose={() => setConfirm(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
