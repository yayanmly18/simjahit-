import React, { useState, useEffect, useCallback, useRef, ChangeEvent, MouseEvent as ReactMouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard, Users, Scissors, ShoppingBag, CreditCard,
    TrendingDown, BarChart2, Settings as SettingsIcon, LogOut, Bell,
    Search, Plus, X, Printer, MessageCircle, Phone, MapPin,
    Clock, Calendar, Eye, Edit2, Trash2, Download, ChevronRight,
    Wallet, TrendingUp, User, Package, CheckCircle2, Save,
    Banknote, Smartphone, Send, FileText, CheckCheck, Trash,
    BellRing, BellOff, Lock, Fingerprint, Sparkles,
} from "lucide-react";
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { QRCodeSVG } from "qrcode.react";
import { api, loginApi, logoutApi, authStorage } from "../lib/api";

type User = { id: string | number; name: string; email: string };

// ─── Types ───────────────────────────────────────────────────────────────────

type Page =
    | "login" | "dashboard" | "customers" | "services"
    | "orders" | "new-transaction" | "order-detail"
    | "payment" | "expenses" | "reports" | "settings"
    | "priority-recommendations";

type OrderStatus = "Menunggu" | "Diproses" | "Finishing" | "Selesai" | "Sudah Diambil";

interface Order {
    id: string; invoice: string; customer: string; phone: string;
    clothingType: string; service: string; status: OrderStatus;
    deadline: string; price: number; dp: number; discount: number;
    notes: string; createdAt: string;
    items?: Array<{
        id: string;
        item_name: string;
        category: string;
        price: number;
        quantity: number;
        color?: string;
        size?: string;
        notes?: string;
    }>;
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

// ─── ClickHouse Design Constants ──────────────────────────────────────────────

const CH = {
    primary: "#faff69",
    primaryActive: "#e6eb52",
    canvas: "#0a0a0a",
    surfaceCard: "#1a1a1a",
    surfaceElevated: "#242424",
    surfaceSoft: "#121212",
    onDark: "#ffffff",
    body: "#cccccc",
    bodyStrong: "#e6e6e6",
    muted: "#888888",
    mutedSoft: "#5a5a5a",
    hairline: "#2a2a2a",
    hairlineStrong: "#3a3a3a",
    emerald: "#22c55e",
    rose: "#ef4444",
    blue: "#3b82f6",
};

const PIE_COLORS = [CH.primary, CH.muted, CH.blue, CH.emerald, CH.rose, CH.mutedSoft];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const STATUS_CFG: Record<OrderStatus, { bg: string; text: string; dot: string; border: string }> = {
    "Menunggu": { bg: "bg-ch-surface-card", text: "text-ch-muted", dot: "bg-ch-muted", border: "border-ch-hairline" },
    "Diproses": { bg: "bg-ch-surface-card", text: "text-ch-primary", dot: "bg-ch-primary", border: "border-ch-primary" },
    "Finishing": { bg: "bg-ch-surface-card", text: "text-ch-body-strong", dot: "bg-ch-body-strong", border: "border-ch-hairline" },
    "Selesai": { bg: "bg-ch-surface-card", text: "text-ch-accent-emerald", dot: "bg-ch-accent-emerald", border: "border-ch-accent-emerald" },
    "Sudah Diambil": { bg: "bg-ch-surface-card", text: "text-ch-muted", dot: "bg-ch-muted", border: "border-ch-hairline" },
};

function StatusBadge({ status }: { status: OrderStatus }) {
    const c = STATUS_CFG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} ${c.border} border`}>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.dot}`} />
            {status}
        </span>
    );
}

function InputField({ label, children }: { label: string; children: any }) {
    return (
        <div>
            <label className="block text-sm font-medium text-ch-body-strong mb-1">{label}</label>
            {children}
        </div>
    );
}

// ─── ClickHouse Button Components ─────────────────────────────────────────────

function ChButtonPrimary({ children, className = "", disabled, ...props }: any) {
    return (
        <button
            className={`ch-btn-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
}

function ChButtonSecondary({ children, className = "", ...props }: any) {
    return (
        <button className={`ch-btn-secondary ${className}`} {...props}>
            {children}
        </button>
    );
}

function ChButtonOutline({ children, className = "", ...props }: any) {
    return (
        <button className={`ch-btn-outline ${className}`} {...props}>
            {children}
        </button>
    );
}

function ChButtonSmall({ children, className = "", ...props }: any) {
    return (
        <button className={`ch-btn-sm ch-btn-primary ${className}`} {...props}>
            {children}
        </button>
    );
}

function ChButtonDanger({ children, className = "", ...props }: any) {
    return (
        <button className={`ch-btn-danger ${className}`} {...props}>
            {children}
        </button>
    );
}

function ChIconButton({ children, className = "", ...props }: any) {
    return (
        <button className={`ch-btn-icon ${className}`} {...props}>
            {children}
        </button>
    );
}

// ─── ClickHouse Card Components ───────────────────────────────────────────────

function ChCard({ children, className = "", ...props }: any) {
    return (
        <div className={`ch-card ${className}`} {...props}>
            {children}
        </div>
    );
}

function ChCardHeader({ children, className = "" }: any) {
    return (
        <div className={`ch-card-header ${className}`}>
            {children}
        </div>
    );
}

function ChCardBody({ children, className = "" }: any) {
    return (
        <div className={`ch-card-body ${className}`}>
            {children}
        </div>
    );
}

// ─── ClickHouse Table ─────────────────────────────────────────────────────────

function ChTable({ children, className = "" }: any) {
    return (
        <div className="overflow-x-auto">
            <table className={`ch-table ${className}`}>
                {children}
            </table>
        </div>
    );
}

function ChTableHead({ children, className = "" }: any) {
    return <thead className={className}>{children}</thead>;
}

function ChTableBody({ children, className = "" }: any) {
    return <tbody className={className}>{children}</tbody>;
}

function ChTableRow({ children, className = "", onClick }: any) {
    return (
        <tr className={`cursor-pointer ${className}`} onClick={onClick}>
            {children}
        </tr>
    );
}

function ChTableHeader({ children, className = "" }: any) {
    return <th className={className}>{children}</th>;
}

function ChTableData({ children, className = "" }: any) {
    return <td className={className}>{children}</td>;
}

// ─── ClickHouse Filter Chip ───────────────────────────────────────────────────

function ChFilterChip({ children, active = false, count, onClick, className = "" }: any) {
    return (
        <button
            onClick={onClick}
            className={`ch-filter-chip ${active ? 'active' : ''} ${className}`}
        >
            {children}
            {count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-ch-surface-elevated text-ch-body' : 'bg-ch-surface-soft text-ch-muted'}`}>
                    {count}
                </span>
            )}
        </button>
    );
}

// ─── ClickHouse Modal ─────────────────────────────────────────────────────────

function ChBackdrop({ children }: { children: any }) {
    return (
        <div className="ch-backdrop">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
            >
                {children}
            </motion.div>
        </div>
    );
}

function ChModal({ children, className = "" }: any) {
    return (
        <div className={`ch-modal ${className}`}>
            {children}
        </div>
    );
}

function ChModalHeader({ children, onClose }: any) {
    return (
        <div className="flex items-center justify-between px-6 py-4 border-b border-ch-hairline">
            <h3 className="text-base font-semibold text-ch-on-dark">{children}</h3>
            {onClose && (
                <ChIconButton onClick={onClose}>
                    <X size={16} />
                </ChIconButton>
            )}
        </div>
    );
}

function ChModalBody({ children, className = "" }: any) {
    return (
        <div className={`p-6 space-y-4 ${className}`}>
            {children}
        </div>
    );
}

function ChModalFooter({ children, className = "" }: any) {
    return (
        <div className={`px-6 py-4 border-t border-ch-hairline flex gap-3 ${className}`}>
            {children}
        </div>
    );
}

// ─── ClickHouse Filter Pills Row ──────────────────────────────────────────────

function ChFilterPills({ tabs, activeTab, onTabChange, className = "" }: any) {
    return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
            {tabs.map((tab: any) => {
                const isActive = (typeof tab === 'string' ? tab : tab.key) === activeTab;
                const label = typeof tab === 'string' ? tab : tab.label;
                const count = tab.count;
                return (
                    <ChFilterChip
                        key={typeof tab === 'string' ? tab : tab.key}
                        active={isActive}
                        count={count}
                        onClick={() => onTabChange(typeof tab === 'string' ? tab : tab.key)}
                    >
                        {label}
                    </ChFilterChip>
                );
            })}
        </div>
    );
}

// ─── ClickHouse Stat Card ─────────────────────────────────────────────────────

function ChStat({ icon: Icon, label, value, sub, yellow = false }: any) {
    return (
        <div className="ch-stat">
            <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${yellow ? 'bg-ch-primary text-ch-on-primary' : 'bg-ch-surface-elevated text-ch-on-dark'}`}>
                    <Icon size={18} />
                </div>
            </div>
            <p className={`text-[32px] font-bold leading-none mb-1 ${yellow ? 'text-ch-primary' : 'text-ch-on-dark'}`}>{value}</p>
            <p className="text-sm font-medium text-ch-body-strong">{label}</p>
            {sub && <p className="text-xs text-ch-muted mt-1">{sub}</p>}
        </div>
    );
}

// ─── ClickHouse Search Input ──────────────────────────────────────────────────

function ChSearchInput({ value, onChange, placeholder = "Cari...", className = "" }: any) {
    return (
        <div className={`relative ${className}`} style={{ height: 40 }}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ zIndex: 5 }}>
                <Search size={16} className="text-ch-muted" />
            </div>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="ch-search-input"
            />
        </div>
    );
}

// ─── ClickHouse Badge ─────────────────────────────────────────────────────────

function ChBadge({ children, yellow = false }: any) {
    if (yellow) {
        return <span className="ch-badge-yellow">{children}</span>;
    }
    return <span className="ch-badge">{children}</span>;
}

// ─── Modals ───────────────────────────────────────────────────────────────────

function CustomerDetailModal({ customer, orders, onClose }: {
    customer: Customer; orders: Order[]; onClose: () => void;
}) {
    const custOrders = orders.filter(o => o.customer === customer.name);
    return (
        <ChBackdrop>
            <ChModal className="max-w-lg">
                <ChModalHeader onClose={onClose}>Detail Pelanggan</ChModalHeader>
                <ChModalBody>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-ch-surface-elevated rounded-lg flex items-center justify-center shrink-0">
                            <User size={24} className="text-ch-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-ch-on-dark text-lg leading-tight">{customer.name}</h3>
                            <p className="text-sm text-ch-muted mt-0.5">{customer.totalOrders} pesanan total</p>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-sm">
                            <Phone size={15} className="text-ch-muted shrink-0" />
                            <span className="text-ch-body">{customer.phone}</span>
                        </div>
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin size={15} className="text-ch-muted shrink-0 mt-0.5" />
                            <span className="text-ch-body">{customer.address}</span>
                        </div>
                    </div>
                    {customer.notes && (
                        <div className="bg-ch-surface-soft rounded-lg p-3.5">
                            <p className="text-xs font-medium text-ch-muted mb-1">Catatan</p>
                            <p className="text-sm text-ch-body">{customer.notes}</p>
                        </div>
                    )}
                    {custOrders.length > 0 && (
                        <div>
                            <h4 className="text-sm font-semibold text-ch-on-dark mb-2.5">Riwayat Pesanan</h4>
                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                {custOrders.map(o => (
                                    <div key={o.id} className="flex items-center justify-between p-3 bg-ch-surface-soft rounded-lg text-sm">
                                        <div>
                                            <p className="font-semibold text-ch-on-dark">{o.invoice}</p>
                                            <p className="text-ch-muted text-xs mt-0.5">{o.service} — {o.clothingType}</p>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={o.status} />
                                            <p className="text-xs text-ch-muted mt-1">{o.createdAt}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </ChModalBody>
                <ChModalFooter className="justify-end">
                    <ChButtonOutline onClick={onClose}>Tutup</ChButtonOutline>
                </ChModalFooter>
            </ChModal>
        </ChBackdrop>
    );
}

function WhatsAppModal({ order, sending, onSend, onClose }: {
    order: Order; sending: boolean; onSend: () => void; onClose: () => void;
}) {
    return (
        <ChBackdrop>
            <ChModal className="max-w-md">
                <ChModalHeader onClose={onClose}>
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-ch-accent-emerald rounded-lg flex items-center justify-center">
                            <MessageCircle size={17} className="text-white" />
                        </div>
                        <span>Kirim Notifikasi WhatsApp?</span>
                    </div>
                </ChModalHeader>
                <ChModalBody>
                    <div className="bg-ch-surface-soft rounded-lg p-4 text-sm text-ch-body leading-relaxed mb-4">
                        <p>Halo {order.customer},</p>
                        <br />
                        <p>Pesanan Anda dengan nomor <strong className="text-ch-on-dark">{order.invoice}</strong> telah selesai dikerjakan dan siap diambil.</p>
                        <br />
                        <p>Terima kasih telah menggunakan jasa A.Y.A Tailor.</p>
                    </div>
                    <p className="text-xs text-ch-muted mb-5">
                        Pesan akan dikirim ke:{" "}
                        <span className="font-medium text-ch-on-dark">{order.phone}</span>
                    </p>
                </ChModalBody>
                <ChModalFooter>
                    <ChButtonOutline onClick={onClose} className="flex-1">Batal</ChButtonOutline>
                    <ChButtonPrimary onClick={onSend} disabled={sending} className="flex-1">
                        <Send size={14} />
                        {sending ? "Mengirim..." : "Kirim WhatsApp"}
                    </ChButtonPrimary>
                </ChModalFooter>
            </ChModal>
        </ChBackdrop>
    );
}

function ReceiptModal({ order, onClose }: { order: Order; onClose: () => void }) {
    const total = order.price - order.discount;
    const remaining = total - order.dp;
    const handlePrint = () => window.print();
    const [orderItems, setOrderItems] = useState<Order["items"]>(order.items || []);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<{ storeName: string; address: string; phone: string; whatsapp: string } | null>(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                const detail = await api.getOrder(order.id);
                setOrderItems(detail.items || []);
            } catch (err) {
                console.error('Failed to load order items:', err);
                setOrderItems(order.items || []);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetail();
    }, [order.id]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await api.getSettings();
                if (data) {
                    setSettings({
                        storeName: data.storeName || "A.Y.A Tailor",
                        address: data.address || "Jl. Sudirman No. 45, Bandung",
                        phone: data.phone || "022-1234567",
                        whatsapp: data.whatsapp || "081234567890",
                    });
                }
            } catch (err) {
                console.error('Failed to load settings:', err);
            }
        };
        fetchSettings();
    }, []);

    if (loading) {
        return (
            <ChBackdrop>
                <ChModal className="max-w-sm">
                    <ChModalBody>
                        <p className="text-sm text-ch-muted">Memuat data nota...</p>
                    </ChModalBody>
                </ChModal>
            </ChBackdrop>
        );
    }

    return (
        <ChBackdrop>
            <ChModal>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-ch-hairline">
                    <h3 className="text-base font-semibold text-ch-on-dark">Pratinjau Nota Thermal</h3>
                    <div className="flex items-center gap-2">
                        <ChButtonSmall onClick={handlePrint}>
                            <Printer size={13} />
                            Cetak
                        </ChButtonSmall>
                        <ChIconButton onClick={onClose}>
                            <X size={16} />
                        </ChIconButton>
                    </div>
                </div>
                <div className="p-6 bg-ch-surface-soft">
                    <style>{`
                        @media print {
                            @page { size: 80mm auto; margin: 0; padding: 0; }
                            body * { visibility: hidden; }
                            .receipt-print-area, .receipt-print-area * { visibility: visible; }
                            .receipt-print-area { position: absolute; left: 0; top: 0; width: 80mm; padding: 5mm; }
                        }
                    `}</style>
                    <div className="receipt-print-area w-[80mm] bg-white font-mono text-[10px] mx-auto shadow-lg">
                        <div className="p-3">
                            <div className="text-center mb-2">
                                <div className="w-10 h-10 mx-auto mb-1 overflow-hidden rounded-lg">
                                    <img src="/logo.png" alt={settings?.storeName || "A.Y.A Tailor"} className="w-full h-full object-contain" />
                                </div>
                                <p className="font-bold text-xs tracking-wider text-gray-900">{settings?.storeName || "A.Y.A Tailor"}</p>
                                <p className="text-gray-500 text-[9px]">Jasa Jahit & Permak Pakaian</p>
                                <p className="text-gray-400 text-[9px]">{settings?.address || "Jl. Sudirman No. 45, Bandung"}</p>
                                <p className="text-gray-400 text-[9px]">Telp: {settings?.phone || "022-1234567"}</p>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            <div className="space-y-0.5 mb-1.5">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">No. Invoice</span>
                                    <span className="font-bold text-[9px]">{order.invoice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tanggal</span>
                                    <span className="text-[9px]">{order.createdAt}</span>
                                </div>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            <div className="mb-1.5">
                                <p className="text-gray-900 text-[9px] font-bold mb-0.5">Pelanggan:</p>
                                <p className="text-gray-800 text-[9px]">{order.customer}</p>
                                <p className="text-gray-500 text-[9px]">{order.phone}</p>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            {orderItems.length > 0 ? (
                                <div className="mb-1.5">
                                    <p className="text-gray-900 text-[9px] font-bold mb-1">Daftar Item:</p>
                                    {orderItems.map((item, index) => (
                                        <div key={item.id || index} className="mb-1.5 pb-1.5 border-b border-gray-100 last:border-0">
                                            <div className="flex justify-between gap-1 mb-0.5">
                                                <span className="text-gray-600 text-[9px] font-semibold">Item {index + 1}:</span>
                                                <span className="text-gray-800 text-[9px] font-medium text-right flex-1 ml-1">{item.item_name}</span>
                                            </div>
                                            <div className="flex justify-between gap-1 text-[9px]">
                                                <span className="text-gray-500 ml-3">{item.category}</span>
                                            </div>
                                            <div className="flex justify-between gap-1 text-[9px]">
                                                <span className="text-gray-500 ml-3">Qty: {item.quantity} pcs</span>
                                                <span className="text-gray-700">{fmt(item.price * item.quantity)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-0.5 mb-1.5">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-[9px]">Pakaian</span>
                                        <span className="text-gray-800 text-[9px]">{order.clothingType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-[9px]">Layanan</span>
                                        <span className="text-gray-800 text-[9px]">{order.service}</span>
                                    </div>
                                </div>
                            )}
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            <div className="space-y-0.5 mb-1.5">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-[9px]">Deadline</span>
                                    <span className="text-[9px]">{order.deadline}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-[9px]">Status</span>
                                    <span className="font-bold text-[9px]">{order.status}</span>
                                </div>
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            <div className="space-y-0.5 mb-1.5">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 text-[9px]">Harga</span>
                                    <span className="text-[9px]">{fmt(order.price)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between text-red-500">
                                        <span className="text-[9px]">Diskon</span>
                                        <span className="text-[9px]">-{fmt(order.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold">
                                    <span className="text-[9px]">Total</span>
                                    <span className="text-[9px]">{fmt(total)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
                                    <span className="text-[9px]">DP Dibayar</span>
                                    <span className="text-[9px]">{fmt(order.dp)}</span>
                                </div>
                                {remaining > 0 ? (
                                    <div className="flex justify-between font-bold text-red-500">
                                        <span className="text-[9px]">Sisa</span>
                                        <span className="text-[9px]">{fmt(remaining)}</span>
                                    </div>
                                ) : (
                                    <div className="flex justify-between font-bold text-green-600">
                                        <span className="text-[9px]">Status Bayar</span>
                                        <span className="text-[9px]">LUNAS</span>
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-dashed border-gray-300 my-1.5" />
                            <div className="flex justify-center my-2">
                                <div className="w-16 h-16">
                                    <QRCodeSVG
                                        value={`${window.location.origin}/track/${encodeURIComponent(order.invoice)}`}
                                        size={64}
                                        level="M"
                                        includeMargin={false}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                    />
                                </div>
                            </div>
                            <div className="text-center text-gray-400 text-[9px] leading-relaxed">
                                <p className="font-semibold text-gray-700 mb-0.5">Terima kasih atas kepercayaan Anda!</p>
                                <p>Barang tidak diambil lebih dari 30 hari</p>
                                <p>menjadi tanggung jawab pemilik.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </ChModal>
        </ChBackdrop>
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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Nama wajib diisi";
        const phoneClean = phone.replace(/[^0-9]/g, '');
        if (!phoneClean) newErrors.phone = "Nomor WhatsApp wajib diisi";
        else if (phoneClean.length < 12) newErrors.phone = "Nomor WhatsApp minimal 12 digit";
        else if (!phoneClean.startsWith('62')) newErrors.phone = "Nomor WhatsApp harus diawali 62 (contoh: 628xxx)";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({ name, phone, address, notes });
    };

    return (
        <ChBackdrop>
            <ChModal className="max-w-md">
                <ChModalHeader onClose={onClose}>
                    {initial ? "Edit Pelanggan" : "Tambah Pelanggan"}
                </ChModalHeader>
                <ChModalBody>
                    <InputField label={<>Nama <span className="text-ch-accent-rose">*</span></>}>
                        <input className={`ch-input ${errors.name ? 'border-ch-accent-rose' : ''}`} value={name} onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }} placeholder="Nama pelanggan" />
                        {errors.name && <p className="text-xs text-ch-accent-rose mt-1">{errors.name}</p>}
                    </InputField>
                    <InputField label={<>Nomor WhatsApp <span className="text-ch-accent-rose">*</span></>}>
                        <input className={`ch-input ${errors.phone ? 'border-ch-accent-rose' : ''}`} value={phone} onChange={e => { setPhone(e.target.value); setErrors(prev => ({ ...prev, phone: '' })); }} placeholder="628xxxxxxxxxx" />
                        {errors.phone && <p className="text-xs text-ch-accent-rose mt-1">{errors.phone}</p>}
                    </InputField>
                    <InputField label="Alamat"><textarea className="ch-textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} placeholder="Alamat lengkap" /></InputField>
                    <InputField label="Catatan"><textarea className="ch-textarea" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan khusus" /></InputField>
                </ChModalBody>
                <ChModalFooter>
                    <ChButtonOutline onClick={onClose} className="flex-1">Batal</ChButtonOutline>
                    <ChButtonPrimary onClick={handleSave} className="flex-1">
                        <Save size={14} />Simpan
                    </ChButtonPrimary>
                </ChModalFooter>
            </ChModal>
        </ChBackdrop>
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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Nama layanan wajib diisi";
        if (!price || Number(price) <= 0) newErrors.price = "Harga harus diisi dan lebih dari 0";
        if (!estimatedDays || Number(estimatedDays) <= 0) newErrors.estimatedDays = "Estimasi hari wajib diisi";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({ name, price: Number(price), estimatedDays: Number(estimatedDays), status });
    };

    return (
        <ChBackdrop>
            <ChModal className="max-w-md">
                <ChModalHeader onClose={onClose}>
                    {initial ? "Edit Layanan" : "Tambah Layanan"}
                </ChModalHeader>
                <ChModalBody>
                    <InputField label={<>Nama Layanan <span className="text-ch-accent-rose">*</span></>}>
                        <input className={`ch-input ${errors.name ? 'border-ch-accent-rose' : ''}`} value={name} onChange={e => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }} placeholder="Contoh: Pendekkan Celana" />
                        {errors.name && <p className="text-xs text-ch-accent-rose mt-1">{errors.name}</p>}
                    </InputField>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label={<>Harga (Rp) <span className="text-ch-accent-rose">*</span></>}>
                            <input type="number" className={`ch-input ${errors.price ? 'border-ch-accent-rose' : ''}`} value={price} onChange={e => { setPrice(e.target.value); setErrors(prev => ({ ...prev, price: '' })); }} />
                            {errors.price && <p className="text-xs text-ch-accent-rose mt-1">{errors.price}</p>}
                        </InputField>
                        <InputField label={<>Estimasi (hari) <span className="text-ch-accent-rose">*</span></>}>
                            <input type="number" className={`ch-input ${errors.estimatedDays ? 'border-ch-accent-rose' : ''}`} value={estimatedDays} onChange={e => { setEstimatedDays(e.target.value); setErrors(prev => ({ ...prev, estimatedDays: '' })); }} />
                            {errors.estimatedDays && <p className="text-xs text-ch-accent-rose mt-1">{errors.estimatedDays}</p>}
                        </InputField>
                    </div>
                    <InputField label="Status">
                        <select className="ch-select" value={status} onChange={e => setStatus(e.target.value as "Aktif" | "Nonaktif")}>
                            <option value="Aktif">Aktif</option>
                            <option value="Nonaktif">Nonaktif</option>
                        </select>
                    </InputField>
                </ChModalBody>
                <ChModalFooter>
                    <ChButtonOutline onClick={onClose} className="flex-1">Batal</ChButtonOutline>
                    <ChButtonPrimary onClick={handleSave} className="flex-1">
                        <Save size={14} />Simpan
                    </ChButtonPrimary>
                </ChModalFooter>
            </ChModal>
        </ChBackdrop>
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
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!category.trim()) newErrors.category = "Kategori wajib diisi";
        if (!amount || Number(amount) <= 0) newErrors.amount = "Jumlah harus diisi dan lebih dari 0";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave({ date, category, description, amount: Number(amount) });
    };

    return (
        <ChBackdrop>
            <ChModal className="max-w-md">
                <ChModalHeader onClose={onClose}>
                    {initial ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
                </ChModalHeader>
                <ChModalBody>
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label={<><span className="text-ch-accent-rose">*</span> Tanggal</>}><input type="date" className="ch-input" value={date} onChange={e => setDate(e.target.value)} /></InputField>
                        <InputField label={<><span className="text-ch-accent-rose">*</span> Kategori</>}>
                            <input className={`ch-input ${errors.category ? 'border-ch-accent-rose' : ''}`} value={category} onChange={e => { setCategory(e.target.value); setErrors(prev => ({ ...prev, category: '' })); }} placeholder="Benang, Listrik, ..." />
                            {errors.category && <p className="text-xs text-ch-accent-rose mt-1">{errors.category}</p>}
                        </InputField>
                    </div>
                    <InputField label="Deskripsi"><input className="ch-input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Keterangan" /></InputField>
                    <InputField label={<><span className="text-ch-accent-rose">*</span> Jumlah (Rp)</>}>
                        <input type="number" className={`ch-input ${errors.amount ? 'border-ch-accent-rose' : ''}`} value={amount} onChange={e => { setAmount(e.target.value); setErrors(prev => ({ ...prev, amount: '' })); }} />
                        {errors.amount && <p className="text-xs text-ch-accent-rose mt-1">{errors.amount}</p>}
                    </InputField>
                </ChModalBody>
                <ChModalFooter>
                    <ChButtonOutline onClick={onClose} className="flex-1">Batal</ChButtonOutline>
                    <ChButtonPrimary onClick={handleSave} className="flex-1">
                        <Save size={14} />Simpan
                    </ChButtonPrimary>
                </ChModalFooter>
            </ChModal>
        </ChBackdrop>
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
        <ChBackdrop>
            <ChModal className="max-w-md">
                <ChModalHeader onClose={onClose}>Catat Pembayaran</ChModalHeader>
                <ChModalBody>
                    <div className="bg-ch-surface-soft rounded-lg p-3 text-sm flex justify-between">
                        <span className="text-ch-muted">Sisa tagihan</span>
                        <span className="font-semibold text-ch-accent-rose">{fmt(remaining)}</span>
                    </div>
                    <InputField label="Jenis Pembayaran">
                        <select className="ch-select" value={type} onChange={e => setType(e.target.value as any)}>
                            <option value="down_payment">Uang Muka (DP)</option>
                            <option value="remaining_payment">Sisa Pembayaran</option>
                            <option value="full_payment">Lunas Penuh</option>
                        </select>
                    </InputField>
                    <InputField label="Jumlah (Rp)"><input type="number" className="ch-input" value={amount} onChange={e => setAmount(e.target.value)} /></InputField>
                    <InputField label="Metode">
                        <select className="ch-select" value={method} onChange={e => setMethod(e.target.value as any)}>
                            <option value="cash">Tunai</option>
                            <option value="transfer">Transfer</option>
                            <option value="ewallet">E-Wallet</option>
                        </select>
                    </InputField>
                    <InputField label="Catatan"><input className="ch-input" value={notes} onChange={e => setNotes(e.target.value)} /></InputField>
                </ChModalBody>
                <ChModalFooter>
                    <ChButtonOutline onClick={onClose} className="flex-1">Batal</ChButtonOutline>
                    <ChButtonPrimary onClick={() => onSave({ type, amount: Number(amount) || 0, payment_method: method, notes })} className="flex-1">
                        <Banknote size={14} />Bayar
                    </ChButtonPrimary>
                </ChModalFooter>
            </ChModal>
        </ChBackdrop>
    );
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({ title, message, onConfirm, onClose }: {
    title: string; message: string; onConfirm: () => void; onClose: () => void;
}) {
    return (
        <ChBackdrop>
            <ChModal className="max-w-sm">
                <ChModalBody>
                    <h3 className="text-base font-semibold text-ch-on-dark mb-1">{title}</h3>
                    <p className="text-sm text-ch-muted">{message}</p>
                </ChModalBody>
                <ChModalFooter>
                    <ChButtonOutline onClick={onClose} className="flex-1">Batal</ChButtonOutline>
                    <ChButtonDanger onClick={onConfirm} className="flex-1">Hapus</ChButtonDanger>
                </ChModalFooter>
            </ChModal>
        </ChBackdrop>
    );
}

// ─── Loading Spinner Component ─────────────────────────────────────────────────

function LoadingSpinner({ message = "Memuat data..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
            <motion.div
                className="w-10 h-10 border-2 border-ch-hairline border-t-ch-primary rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <motion.p
                className="text-sm text-ch-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                {message}
            </motion.p>
        </div>
    );
}

// ─── Login Page ────────────────────────────────────────────────────────────────

function LoginLoadingOverlay() {
    return (
        <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ch-canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <motion.div
                className="flex flex-col items-center gap-5"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            >
                <div className="text-center">
                    <div className="flex items-center gap-1 justify-center">
                        <motion.span className="text-ch-on-dark font-semibold text-base">
                            Memverifikasi Akun
                        </motion.span>
                        <div className="flex gap-0.5 ml-1">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    className="w-1.5 h-1.5 bg-ch-primary/60 rounded-full"
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                                />
                            ))}
                        </div>
                    </div>
                    <motion.p className="text-ch-muted text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                        Mohon tunggu sebentar...
                    </motion.p>
                </div>
            </motion.div>
        </motion.div>
    );
}

function LoginPage({ onLogin }: { onLogin: (payload: { username: string; password: string }) => void }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const creds = authStorage.getCredentials();
        if (creds) {
            setUsername(creds.username);
            setPassword(creds.password);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            setError("Mohon isi username dan password terlebih dahulu");
            return;
        }
        setError("");
        setIsLoading(true);
        try {
            if (rememberMe) {
                authStorage.saveCredentials(username, password);
            } else {
                authStorage.clearCredentials();
            }
            await onLogin({ username, password });
        } catch (err: any) {
            setError(err?.message || "Login gagal. Periksa kembali username dan password Anda.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isLoading && <LoginLoadingOverlay />}
            </AnimatePresence>
            <motion.div
                className="min-h-screen flex bg-ch-canvas"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                {/* Left Side - Brand Panel */}
                <motion.div
                    className="hidden lg:flex flex-1 items-center justify-center p-12 relative"
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.div
                        className="text-center text-ch-on-dark relative"
                        initial={{ y: 30 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <motion.div
                            className="w-48 h-48 rounded-2xl mx-auto overflow-hidden border border-ch-hairline"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <img src="/logo.png" alt="A.Y.A Tailor" className="w-full h-full object-cover" />
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Right Side - Login Form */}
                <motion.div
                    className="flex-1 flex items-center justify-center p-6 lg:p-12"
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    <motion.div
                        className="w-full max-w-sm"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <div className="bg-ch-surface-card border border-ch-hairline rounded-xl p-10">
                            {/* Mobile logo */}
                            <motion.div className="lg:hidden flex justify-center mb-6" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.4 }}>
                                <div className="w-16 h-16 rounded-xl overflow-hidden border border-ch-hairline">
                                    <img src="/logo.png" alt="A.Y.A Tailor" className="w-full h-full object-cover" />
                                </div>
                            </motion.div>

                            {/* Header */}
                            <motion.div className="mb-6" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.4 }}>
                                <h1 className="text-[32px] font-bold text-ch-on-dark tracking-tight">Selamat Datang</h1>
                                <p className="text-sm text-ch-muted mt-1.5">Masuk untuk mengelola toko jahit Anda</p>
                            </motion.div>

                            {/* Error message */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -5, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: "auto" }}
                                        exit={{ opacity: 0, y: -5, height: 0 }}
                                        className="flex items-center gap-2 bg-ch-surface-soft text-ch-accent-rose text-sm border border-ch-accent-rose rounded-lg px-4 py-2.5 mb-4"
                                    >
                                        <X size={14} className="shrink-0" />
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.5 }}>
                                    <InputField label="Username">
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            placeholder="Masukkan username"
                                            className="ch-input"
                                        />
                                    </InputField>
                                </motion.div>

                                <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 }}>
                                    <InputField label="Password">
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Masukkan password"
                                            className="ch-input"
                                        />
                                    </InputField>
                                </motion.div>

                                <motion.div className="flex items-center gap-2" initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.7 }}>
                                    <input
                                        type="checkbox"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={e => setRememberMe(e.target.checked)}
                                        className="w-4 h-4 accent-ch-primary"
                                    />
                                    <label htmlFor="rememberMe" className="text-sm text-ch-muted cursor-pointer">
                                        Ingat saya
                                    </label>
                                </motion.div>

                                <motion.div initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, delay: 0.75 }}>
                                    <button
                                        type="submit"
                                        className="ch-btn-primary w-full"
                                    >
                                        Masuk ke Sistem
                                    </button>
                                </motion.div>
                            </form>

                            {/* Footer */}
                            <motion.div className="mt-8 pt-6 border-t border-ch-hairline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.9 }}>
                                <p className="text-center text-xs text-ch-muted-soft">
                                    © 2026 A.Y.A Tailor · Versi 1.0
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </motion.div>
        </>
    );
}

// ─── Page: Dashboard ─────────────────────────────────────────────────────────

function DashboardPage({ orders, setPage, setSelectedOrder, setShowWhatsApp, onLoadDetail }: {
    orders: Order[];
    setPage: (p: Page) => void;
    setSelectedOrder: (o: Order) => void;
    setShowWhatsApp: (v: boolean) => void;
    onLoadDetail?: (id: string) => void;
}) {
    const [aiSummary, setAiSummary] = useState<string>("");
    const [loadingSummary, setLoadingSummary] = useState(true);
    const [loyaltySummary, setLoyaltySummary] = useState<string>("");
    const [loyalCustomers, setLoyalCustomers] = useState<any[]>([]);
    const [loadingLoyalty, setLoadingLoyalty] = useState(true);
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const monthPrefix = today.slice(0, 7);
    const todayOrders = orders.filter(o => o.createdAt === today);
    const inProgress = orders.filter(o => ["Diproses", "Finishing", "Menunggu"].includes(o.status));
    const done = orders.filter(o => o.status === "Selesai");
    const notPickedUp = orders.filter(o => o.status === "Selesai");
    const todayRevenue = todayOrders.reduce((s, o) => s + o.dp, 0);
    const monthlyRevenue = orders.filter(o => o.createdAt.startsWith(monthPrefix)).reduce((s, o) => s + (o.price - o.discount), 0);

    useEffect(() => {
        const loadAISummary = async () => {
            try {
                const data = await api.getAISummary();
                if (data?.summary) setAiSummary(data.summary);
            } catch (err) { console.error(err); }
            finally { setLoadingSummary(false); }
        };
        loadAISummary();
    }, []);

    useEffect(() => {
        const loadLoyalty = async () => {
            try {
                const data = await api.getCustomerLoyalty();
                if (data?.summary) setLoyaltySummary(data.summary);
                if (data?.loyal_customers) setLoyalCustomers(data.loyal_customers);
            } catch (err) { console.error(err); }
            finally { setLoadingLoyalty(false); }
        };
        loadLoyalty();
    }, []);

    const stats = [
        { icon: ShoppingBag, label: "Total Pesanan Hari Ini", value: String(todayOrders.length), sub: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }), yellow: true },
        { icon: Clock, label: "Sedang Diproses", value: String(inProgress.length), sub: "Menunggu + Diproses + Finishing", yellow: false },
        { icon: CheckCircle2, label: "Pesanan Selesai", value: String(done.length), sub: "Siap diambil pelanggan", yellow: false },
        { icon: Package, label: "Belum Diambil", value: String(notPickedUp.length), sub: "Perlu notifikasi", yellow: false },
        { icon: Wallet, label: "Pendapatan Hari Ini", value: fmt(todayRevenue), sub: "Dari uang muka", yellow: true },
        { icon: TrendingUp, label: "Pendapatan Bulan Ini", value: fmt(monthlyRevenue), sub: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }), yellow: false },
    ];

    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weekLabels = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];

    const REVENUE_DATA = weekLabels.map((label, weekNum) => {
        const startDay = weekNum * 7 + 1;
        const endDay = weekNum === 3 ? new Date(currentYear, currentMonth + 1, 0).getDate() : (weekNum + 1) * 7;
        const pendapatan = orders
            .filter(o => {
                if (!o.createdAt) return false;
                const [year, month, day] = o.createdAt.split('-').map(Number);
                return year === currentYear && month - 1 === currentMonth && day >= startDay && day <= endDay;
            })
            .reduce((s, o) => s + (o.price - o.discount), 0);
        return { month: label, pendapatan, pengeluaran: 0 };
    });

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                {stats.map(stat => (
                    <ChStat key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} sub={stat.sub} yellow={stat.yellow} />
                ))}
            </div>

            {/* AI Summary - ClickHouse yellow band style */}
            {!loadingSummary && aiSummary && (
                <div className="ch-cta-band">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-ch-on-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles size={18} className="text-ch-on-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-ch-on-primary/60 uppercase tracking-wider mb-1">Ringkasan AI</h3>
                            <p className="text-lg font-bold text-ch-on-primary leading-relaxed">{aiSummary}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Customer Loyalty - ClickHouse dark card */}
            {!loadingLoyalty && loyaltySummary && (
                <ChCard>
                    <ChCardBody>
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-ch-surface-elevated rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                <User size={18} className="text-ch-primary" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-ch-muted uppercase tracking-wider mb-1">Analisis Pelanggan Tetap</h3>
                                <p className="text-base text-ch-body leading-relaxed">{loyaltySummary}</p>
                                {loyalCustomers.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {loyalCustomers.slice(0, 3).map((customer, index) => (
                                            <div key={index} className="flex items-center justify-between border-b border-ch-hairline pb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 bg-ch-surface-elevated rounded-lg flex items-center justify-center">
                                                        <span className="text-xs font-semibold text-ch-primary">{index + 1}</span>
                                                    </div>
                                                    <span className="text-sm font-medium text-ch-on-dark">{customer.name}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-medium text-ch-body-strong">{customer.order_count} transaksi</span>
                                                    <p className="text-[10px] text-ch-muted">{fmt(customer.total_spent)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </ChCardBody>
                </ChCard>
            )}

            {/* Charts */}
            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 ch-card">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-semibold text-ch-on-dark">Grafik Pendapatan</h3>
                                <p className="text-xs text-ch-muted mt-0.5">Pendapatan bulan ini per minggu</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-ch-muted">
                                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-ch-primary inline-block" />Pendapatan</span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={REVENUE_DATA} margin={{ left: -10, right: 5 }}>
                                <defs>
                                    <linearGradient id="gRevCH" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={CH.primary} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={CH.primary} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={CH.hairline} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: CH.muted }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: CH.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} />
                                <Tooltip formatter={(v: number) => [fmt(v), "Pendapatan"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CH.hairline}`, backgroundColor: CH.surfaceCard, color: CH.onDark }} />
                                <Area type="monotone" dataKey="pendapatan" stroke={CH.primary} strokeWidth={2} fill="url(#gRevCH)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="ch-card">
                    <div className="p-6">
                        <h3 className="text-base font-semibold text-ch-on-dark mb-0.5">Layanan Terlaris</h3>
                        <p className="text-xs text-ch-muted mb-4">Periode ini</p>
                        {(() => {
                            const counts: Record<string, number> = {};
                            orders.forEach(o => { counts[o.service] = (counts[o.service] || 0) + 1; });
                            const TOP = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, jumlah]) => ({ name, jumlah }));
                            if (TOP.length === 0) return <p className="text-sm text-ch-muted">Belum ada data.</p>;
                            return (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={TOP} layout="vertical" margin={{ left: 0, right: 10 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={CH.hairline} horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 10, fill: CH.muted }} axisLine={false} tickLine={false} />
                                        <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: CH.muted }} axisLine={false} tickLine={false} width={85} />
                                        <Tooltip formatter={(v: number) => [`${v} pesanan`]} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CH.hairline}`, backgroundColor: CH.surfaceCard, color: CH.onDark }} />
                                        <Bar dataKey="jumlah" fill={CH.primary} radius={[0, 0, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            );
                        })()}
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <ChCard>
                <ChCardHeader>
                    <h3 className="text-base font-semibold text-ch-on-dark">Pesanan Terbaru</h3>
                    <button onClick={() => setPage("orders")} className="text-sm font-medium text-ch-primary hover:opacity-80 transition-opacity flex items-center gap-1">
                        Lihat Semua <ChevronRight size={14} />
                    </button>
                </ChCardHeader>
                <div className="overflow-x-auto">
                    <ChTable>
                        <ChTableHead>
                            <tr>
                                <ChTableHeader>Invoice</ChTableHeader>
                                <ChTableHeader>Pelanggan</ChTableHeader>
                                <ChTableHeader>Jenis Pakaian</ChTableHeader>
                                <ChTableHeader>Layanan</ChTableHeader>
                                <ChTableHeader>Status</ChTableHeader>
                                <ChTableHeader>Deadline</ChTableHeader>
                                <ChTableHeader>Aksi</ChTableHeader>
                            </tr>
                        </ChTableHead>
                        <ChTableBody>
                            {orders.slice(0, 6).map(o => (
                                <ChTableRow key={o.id} onClick={() => { setSelectedOrder(o); onLoadDetail?.(o.id); setPage("order-detail"); }}>
                                    <ChTableData className="font-semibold text-ch-primary">{o.invoice}</ChTableData>
                                    <ChTableData className="text-ch-on-dark">{o.customer}</ChTableData>
                                    <ChTableData className="text-ch-muted">{o.clothingType}</ChTableData>
                                    <ChTableData className="text-ch-muted">{o.service}</ChTableData>
                                    <ChTableData><StatusBadge status={o.status} /></ChTableData>
                                    <ChTableData className="text-ch-muted">{o.deadline}</ChTableData>
                                    <ChTableData onClick={e => e.stopPropagation()}>
                                        <div className="flex items-center gap-1">
                                            <ChIconButton onClick={() => { setSelectedOrder(o); onLoadDetail?.(o.id); setPage("order-detail"); }} title="Lihat Detail"><Eye size={15} /></ChIconButton>
                                            {o.status === "Selesai" && (
                                                <ChIconButton onClick={() => { setSelectedOrder(o); setShowWhatsApp(true); }} title="Kirim WhatsApp"><MessageCircle size={15} /></ChIconButton>
                                            )}
                                        </div>
                                    </ChTableData>
                                </ChTableRow>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-ch-muted">Belum ada pesanan.</td></tr>
                            )}
                        </ChTableBody>
                    </ChTable>
                </div>
            </ChCard>
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
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <ChSearchInput
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari nama atau nomor WhatsApp..."
                    className="flex-1 max-w-sm"
                />
                <ChButtonPrimary onClick={onAdd} className="ml-auto">
                    <Plus size={15} /> Tambah Pelanggan
                </ChButtonPrimary>
            </div>

            <ChCard>
                <div className="px-5 py-3 border-b border-ch-hairline">
                    <p className="text-sm text-ch-muted">{filtered.length} pelanggan</p>
                </div>
                <ChTable>
                    <ChTableHead>
                        <tr>
                            <ChTableHeader>Nama</ChTableHeader>
                            <ChTableHeader>Nomor WhatsApp</ChTableHeader>
                            <ChTableHeader>Alamat</ChTableHeader>
                            <ChTableHeader>Total Pesanan</ChTableHeader>
                            <ChTableHeader>Terakhir Datang</ChTableHeader>
                            <ChTableHeader>Aksi</ChTableHeader>
                        </tr>
                    </ChTableHead>
                    <ChTableBody>
                        {filtered.map(c => (
                            <ChTableRow key={c.id}>
                                <ChTableData>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-ch-surface-elevated rounded-lg flex items-center justify-center shrink-0"><User size={13} className="text-ch-primary" /></div>
                                        <span className="font-medium text-ch-on-dark">{c.name}</span>
                                    </div>
                                </ChTableData>
                                <ChTableData className="text-ch-body">{c.phone}</ChTableData>
                                <ChTableData className="text-ch-muted max-w-[200px] truncate">{c.address}</ChTableData>
                                <ChTableData>
                                    <ChBadge>{c.totalOrders}</ChBadge>
                                </ChTableData>
                                <ChTableData className="text-ch-muted">{c.lastVisit}</ChTableData>
                                <ChTableData>
                                    <div className="flex items-center gap-1">
                                        <ChIconButton onClick={() => onShowDetail(c)}><Eye size={14} /></ChIconButton>
                                        <ChIconButton onClick={() => onEdit(c)}><Edit2 size={14} /></ChIconButton>
                                        <ChIconButton onClick={() => onDelete(c)}><Trash2 size={14} /></ChIconButton>
                                    </div>
                                </ChTableData>
                            </ChTableRow>
                        ))}
                        {filtered.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-ch-muted">Tidak ada pelanggan.</td></tr>
                        )}
                    </ChTableBody>
                </ChTable>
            </ChCard>
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    <div className="ch-card px-4 py-2 text-sm">
                        <span className="text-ch-muted">Aktif: </span>
                        <span className="font-semibold text-ch-accent-emerald">{active}</span>
                    </div>
                    <div className="ch-card px-4 py-2 text-sm">
                        <span className="text-ch-muted">Nonaktif: </span>
                        <span className="font-semibold text-ch-muted">{services.length - active}</span>
                    </div>
                </div>
                <ChButtonPrimary onClick={onAdd}>
                    <Plus size={15} /> Tambah Layanan
                </ChButtonPrimary>
            </div>

            <ChCard>
                <ChTable>
                    <ChTableHead>
                        <tr>
                            <ChTableHeader>No</ChTableHeader>
                            <ChTableHeader>Nama Layanan</ChTableHeader>
                            <ChTableHeader>Harga</ChTableHeader>
                            <ChTableHeader>Estimasi Waktu</ChTableHeader>
                            <ChTableHeader>Status</ChTableHeader>
                            <ChTableHeader>Aksi</ChTableHeader>
                        </tr>
                    </ChTableHead>
                    <ChTableBody>
                        {services.map((s, i) => (
                            <ChTableRow key={s.id}>
                                <ChTableData className="text-ch-muted">{i + 1}</ChTableData>
                                <ChTableData>
                                    <span className="font-medium text-ch-on-dark">{s.name}</span>
                                </ChTableData>
                                <ChTableData><span className="font-semibold text-ch-primary">{fmt(s.price)}</span></ChTableData>
                                <ChTableData>
                                    <div className="flex items-center gap-1.5 text-sm text-ch-body">
                                        <Clock size={13} className="text-ch-muted" /> {s.estimatedDays} hari kerja
                                    </div>
                                </ChTableData>
                                <ChTableData>
                                    <span className={`ch-badge ${s.status === "Aktif" ? 'text-ch-accent-emerald border-ch-accent-emerald' : 'text-ch-muted'}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1 ${s.status === "Aktif" ? 'bg-ch-accent-emerald' : 'bg-ch-muted'}`} />
                                        {s.status}
                                    </span>
                                </ChTableData>
                                <ChTableData>
                                    <div className="flex items-center gap-1">
                                        <ChIconButton onClick={() => onEdit(s)}><Edit2 size={14} /></ChIconButton>
                                        <ChIconButton onClick={() => onDelete(s)}><Trash2 size={14} /></ChIconButton>
                                    </div>
                                </ChTableData>
                            </ChTableRow>
                        ))}
                        {services.length === 0 && (
                            <tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-ch-muted">Belum ada layanan.</td></tr>
                        )}
                    </ChTableBody>
                </ChTable>
            </ChCard>
        </div>
    );
}

// ─── Page: Orders ─────────────────────────────────────────────────────────────

function OrdersPage({ orders, setPage, setSelectedOrder, onDelete, onLoadDetail }: {
    orders: Order[];
    setPage: (p: Page) => void;
    setSelectedOrder: (o: Order) => void;
    onDelete: (o: Order) => void;
    onLoadDetail?: (id: string) => void;
}) {
    const [activeTab, setActiveTab] = useState("Semua");
    const [search, setSearch] = useState("");
    const tabs = ["Semua", "Menunggu", "Diproses", "Finishing", "Selesai", "Sudah Diambil"];
    const filtered = orders.filter(o => {
        const matchTab = activeTab === "Semua" || o.status === activeTab;
        const matchSearch = o.invoice.toLowerCase().includes(search.toLowerCase()) || o.customer.toLowerCase().includes(search.toLowerCase());
        return matchTab && matchSearch;
    });

    const tabData = tabs.map(t => ({
        key: t,
        label: t,
        count: t === "Semua" ? orders.length : orders.filter(o => o.status === t).length,
    }));

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <ChSearchInput
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Cari invoice atau nama pelanggan..."
                    className="flex-1 max-w-sm"
                />
                <ChButtonPrimary onClick={() => setPage("new-transaction")} className="ml-auto">
                    <Plus size={15} /> Pesanan Baru
                </ChButtonPrimary>
            </div>

            <ChFilterPills tabs={tabData} activeTab={activeTab} onTabChange={setActiveTab} />

            <ChCard>
                <ChTable>
                    <ChTableHead>
                        <tr>
                            <ChTableHeader>Invoice</ChTableHeader>
                            <ChTableHeader>Pelanggan</ChTableHeader>
                            <ChTableHeader>Jenis Pakaian</ChTableHeader>
                            <ChTableHeader>Layanan</ChTableHeader>
                            <ChTableHeader>Status</ChTableHeader>
                            <ChTableHeader>Deadline</ChTableHeader>
                            <ChTableHeader>Total</ChTableHeader>
                            <ChTableHeader>Aksi</ChTableHeader>
                        </tr>
                    </ChTableHead>
                    <ChTableBody>
                        {filtered.map(o => (
                            <ChTableRow key={o.id} onClick={() => { setSelectedOrder(o); onLoadDetail?.(o.id); setPage("order-detail"); }}>
                                <ChTableData className="font-semibold text-ch-primary">{o.invoice}</ChTableData>
                                <ChTableData className="text-ch-on-dark">{o.customer}</ChTableData>
                                <ChTableData className="text-ch-muted">{o.clothingType}</ChTableData>
                                <ChTableData className="text-ch-muted">{o.service}</ChTableData>
                                <ChTableData><StatusBadge status={o.status} /></ChTableData>
                                <ChTableData className="text-ch-muted">{o.deadline}</ChTableData>
                                <ChTableData className="font-semibold text-ch-on-dark">{fmt(o.price - o.discount)}</ChTableData>
                                <ChTableData onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-1">
                                        <ChIconButton onClick={() => { setSelectedOrder(o); onLoadDetail?.(o.id); setPage("order-detail"); }}><Eye size={14} /></ChIconButton>
                                        <ChIconButton onClick={() => onDelete(o)}><Trash2 size={14} /></ChIconButton>
                                    </div>
                                </ChTableData>
                            </ChTableRow>
                        ))}
                    </ChTableBody>
                </ChTable>
                {filtered.length === 0 && (
                    <div className="py-16 text-center"><p className="text-ch-muted text-sm">Tidak ada pesanan ditemukan.</p></div>
                )}
            </ChCard>
        </div>
    );
}

// ─── Page: New Transaction ────────────────────────────────────────────────────

interface OrderItemForm {
    id: string;
    clothingType: string;
    serviceId: string;
    qty: number;
    price: number;
}

function NewTransactionPage({ services, customers, setPage, onCreate }: {
    services: Service[];
    customers: Customer[];
    setPage: (p: Page) => void;
    onCreate: (data: any) => Promise<void>;
}) {
    const [customerId, setCustomerId] = useState("");
    const [deadline, setDeadline] = useState(new Date().toISOString().slice(0, 10));
    const [notes, setNotes] = useState("");
    const [discount, setDiscount] = useState(0);
    const [dp, setDp] = useState(0);
    const [saving, setSaving] = useState(false);
    const [items, setItems] = useState<OrderItemForm[]>([
        { id: Date.now().toString(), clothingType: "", serviceId: "", qty: 1, price: 0 }
    ]);
    const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
    const [estimatedDays, setEstimatedDays] = useState<number | null>(null);
    const [estimating, setEstimating] = useState(false);

    const cust = customers.find(c => String(c.id) === String(customerId));
    const activeServices = services.filter(s => s.status === "Aktif");
    const subtotal = items.reduce((sum, item) => {
        const svc = services.find(s => String(s.id) === String(item.serviceId));
        return sum + (svc ? svc.price * item.qty : 0);
    }, 0);
    const total = Math.max(0, subtotal - discount);
    const remaining = Math.max(0, total - dp);

    const addItem = () => setItems([...items, { id: Date.now().toString(), clothingType: "", serviceId: "", qty: 1, price: 0 }]);
    const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(item => item.id !== id)); };
    const updateItem = (id: string, field: keyof OrderItemForm, value: string | number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };
                if (field === "serviceId") {
                    const svc = services.find(s => String(s.id) === String(value));
                    updated.price = svc ? svc.price : 0;
                }
                return updated;
            }
            return item;
        }));
    };

    useEffect(() => {
        const estimateTime = async () => {
            const validItems = items.filter(item => item.clothingType && item.serviceId);
            if (validItems.length === 0) {
                setEstimatedDays(null);
                return;
            }
            setEstimating(true);
            try {
                const firstItem = validItems[0];
                const data = await api.estimateCompletion({
                    service_id: firstItem.serviceId,
                    item_count: validItems.length,
                    difficulty: difficulty,
                });
                if (data?.estimated_days) setEstimatedDays(data.estimated_days);
            } catch (err) { console.error(err); }
            finally { setEstimating(false); }
        };
        const timer = setTimeout(estimateTime, 500);
        return () => clearTimeout(timer);
    }, [items, difficulty]);

    const handleSave = async () => {
        if (!customerId) { alert("Pilih pelanggan terlebih dahulu."); return; }
        const validItems = items.filter(item => item.clothingType && item.serviceId);
        if (validItems.length === 0) { alert("Tambahkan minimal satu item pesanan."); return; }
        const itemsWithNames = validItems.map(item => {
            const svc = services.find(s => String(s.id) === String(item.serviceId));
            return { item_name: svc?.name || "", category: item.clothingType, price: item.price, quantity: item.qty };
        });
        setSaving(true);
        try {
            await onCreate({ customer_id: Number(customerId), order_date: new Date().toISOString().slice(0, 10), deadline, notes, discount, down_payment: dp, items: itemsWithNames });
            setPage("orders");
        } catch (e: any) {
            alert("Gagal menyimpan: " + (e?.message || "terjadi kesalahan"));
        } finally { setSaving(false); }
    };

    return (
        <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
                <ChCard>
                    <ChCardBody>
                        <h3 className="text-base font-semibold text-ch-on-dark mb-4">Data Pelanggan</h3>
                        <div className="space-y-4">
                            <InputField label={<><span className="text-ch-accent-rose">*</span> Pilih Pelanggan</>}>
                                <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="ch-select">
                                    <option value="">-- Pilih pelanggan yang sudah terdaftar --</option>
                                    {customers.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.phone})</option>))}
                                </select>
                            </InputField>
                            {cust && (
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Nomor WhatsApp"><input value={cust.phone} readOnly className="ch-input-readonly" /></InputField>
                                    <InputField label="Alamat"><input value={cust.address} readOnly className="ch-input-readonly" /></InputField>
                                </div>
                            )}
                        </div>
                    </ChCardBody>
                </ChCard>

                <ChCard>
                    <ChCardBody>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base font-semibold text-ch-on-dark">Data Pesanan</h3>
                            <ChButtonPrimary onClick={addItem} style={{ height: 40, padding: '12px 20px', fontSize: 14 }}>
                                <Plus size={15} /> Tambah Item
                            </ChButtonPrimary>
                        </div>
                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={item.id} className="border border-ch-hairline rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-ch-on-dark">Item #{index + 1}</span>
                                        {items.length > 1 && (
                                            <ChIconButton onClick={() => removeItem(item.id)} title="Hapus item"><Trash2 size={14} /></ChIconButton>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <InputField label={<><span className="text-ch-accent-rose">*</span> Jenis Pakaian</>}><input type="text" value={item.clothingType} onChange={e => updateItem(item.id, "clothingType", e.target.value)} placeholder="Contoh: Celana Jeans, Kemeja..." className="ch-input" /></InputField>
                                        <InputField label={<><span className="text-ch-accent-rose">*</span> Jumlah (pcs)</>}><input type="number" value={item.qty} onChange={e => updateItem(item.id, "qty", Math.max(1, Number(e.target.value)))} min={1} className="ch-input" /></InputField>
                                        <InputField label={<><span className="text-ch-accent-rose">*</span> Jenis Layanan</>}>
                                            <select value={item.serviceId} onChange={e => updateItem(item.id, "serviceId", e.target.value)} className="ch-select">
                                                <option value="">-- Pilih layanan --</option>
                                                {activeServices.map(s => (<option key={s.id} value={s.id}>{s.name} — {fmt(s.price)}</option>))}
                                            </select>
                                        </InputField>
                                        <InputField label="Harga Satuan"><input type="text" value={item.price ? fmt(item.price) : ""} readOnly className="ch-input-readonly" /></InputField>
                                    </div>
                                    {item.serviceId && (
                                        <div className="text-sm text-ch-body bg-ch-surface-soft rounded-lg p-2">
                                            <span className="text-ch-muted">Subtotal item:</span>
                                            <span className="font-semibold ml-2">{fmt(item.price * item.qty)}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* AI Completion Estimate */}
                        {estimating && (
                            <div className="mt-4 bg-ch-surface-soft rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <motion.div className="w-5 h-5 border-2 border-ch-primary border-t-transparent rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} />
                                    <span className="text-sm text-ch-body font-medium">AI sedang menghitung estimasi waktu...</span>
                                </div>
                            </div>
                        )}

                        {!estimating && estimatedDays !== null && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 ch-cta-band"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-ch-on-primary/10 rounded-lg flex items-center justify-center shrink-0">
                                        <Sparkles size={16} className="text-ch-on-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-semibold text-ch-on-primary/60 uppercase tracking-wider mb-1">Estimasi Waktu Pengerjaan</h4>
                                        <p className="text-2xl font-bold text-ch-on-primary mb-1">{estimatedDays} hari</p>
                                        <p className="text-xs text-ch-on-primary/60">
                                            Berdasarkan {items.filter(i => i.clothingType && i.serviceId).length} item dengan tingkat kesulitan {difficulty === 'easy' ? 'mudah' : difficulty === 'medium' ? 'sedang' : 'sulit'}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="mt-4">
                            <InputField label="Deadline"><input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="ch-input" /></InputField>
                        </div>
                        <div className="mt-3">
                            <InputField label="Catatan"><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan khusus untuk pesanan ini..." rows={2} className="ch-textarea" /></InputField>
                        </div>
                    </ChCardBody>
                </ChCard>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-4">
                <ChCard>
                    <ChCardBody>
                        <h3 className="text-base font-semibold text-ch-on-dark mb-4">Ringkasan</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-ch-muted">Subtotal ({items.length} item)</span>
                                <span className="font-semibold text-ch-on-dark">{fmt(subtotal)}</span>
                            </div>
                            <InputField label="Diskon (Rp)"><input type="number" value={discount} onChange={e => setDiscount(Math.max(0, Number(e.target.value)))} className="ch-input" /></InputField>
                            <div className="flex justify-between text-sm font-semibold text-ch-on-dark pt-2 border-t border-ch-hairline">
                                <span>Total</span><span>{fmt(total)}</span>
                            </div>
                            <InputField label="Uang Muka (DP)"><input type="number" value={dp} onChange={e => setDp(Math.max(0, Number(e.target.value)))} className="ch-input" /></InputField>
                            <div className="flex justify-between text-sm">
                                <span className="text-ch-muted">Sisa Pembayaran</span>
                                <span className={`font-semibold ${remaining > 0 ? "text-ch-accent-rose" : "text-ch-accent-emerald"}`}>{remaining > 0 ? fmt(remaining) : "LUNAS"}</span>
                            </div>
                        </div>
                    </ChCardBody>
                </ChCard>
                <div className="flex gap-3">
                    <ChButtonOutline onClick={() => setPage("orders")} className="flex-1">Batal</ChButtonOutline>
                    <ChButtonPrimary onClick={handleSave} disabled={saving} className="flex-1">
                        <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
                    </ChButtonPrimary>
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
    const orderItems = order.items || [];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => setPage("orders")} className="flex items-center gap-1.5 text-sm text-ch-muted hover:text-ch-on-dark transition-colors">
                <ChevronRight size={14} className="rotate-180" /> Kembali ke Pesanan
            </button>

            <ChCard>
                <ChCardBody className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h2 className="text-xl font-bold text-ch-on-dark">{order.invoice}</h2>
                                <StatusBadge status={order.status} />
                            </div>
                            <p className="text-sm text-ch-muted">Dibuat pada {order.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ChButtonOutline onClick={() => setShowReceipt(true)}>
                                <Printer size={14} /> Nota
                            </ChButtonOutline>
                            {order.status === "Selesai" && (
                                <ChButtonPrimary onClick={() => setShowWhatsApp(true)}>
                                    <MessageCircle size={14} /> WhatsApp
                                </ChButtonPrimary>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div>
                            <h3 className="text-sm font-semibold text-ch-muted uppercase tracking-wider mb-3">Informasi Pelanggan</h3>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-ch-surface-elevated rounded-lg flex items-center justify-center"><User size={18} className="text-ch-primary" /></div>
                                <div><p className="font-semibold text-ch-on-dark">{order.customer}</p><p className="text-sm text-ch-muted">{order.phone}</p></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-ch-muted uppercase tracking-wider mb-3">Informasi Pesanan</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-ch-muted">Deadline</span><span className="font-semibold text-ch-on-dark">{order.deadline}</span></div>
                                <div className="flex justify-between"><span className="text-ch-muted">Total Item</span><span className="font-semibold text-ch-on-dark">{orderItems.length} jenis pakaian</span></div>
                            </div>
                        </div>
                    </div>

                    {order.notes && (
                        <div className="bg-ch-surface-soft rounded-lg p-4 mb-6">
                            <p className="text-xs font-medium text-ch-muted mb-1">Catatan</p>
                            <p className="text-sm text-ch-body">{order.notes}</p>
                        </div>
                    )}

                    {orderItems.length > 0 && (
                        <div className="mb-6 pt-4 border-t border-ch-hairline">
                            <h3 className="text-sm font-semibold text-ch-muted uppercase tracking-wider mb-3">Daftar Item Pesanan</h3>
                            <div className="space-y-2">
                                {orderItems.map((item, index) => (
                                    <div key={item.id || index} className="bg-ch-surface-soft rounded-lg p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <ChBadge>Item #{index + 1}</ChBadge>
                                                    <span className="text-sm font-semibold text-ch-on-dark">{item.item_name}</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mt-2">
                                                    <div className="flex justify-between"><span className="text-ch-muted">Jenis:</span><span className="text-ch-on-dark font-medium">{item.category}</span></div>
                                                    <div className="flex justify-between"><span className="text-ch-muted">Jumlah:</span><span className="text-ch-on-dark font-medium">{item.quantity} pcs</span></div>
                                                    <div className="flex justify-between"><span className="text-ch-muted">Harga Satuan:</span><span className="text-ch-on-dark font-medium">{fmt(item.price)}</span></div>
                                                    <div className="flex justify-between"><span className="text-ch-muted">Subtotal:</span><span className="text-ch-primary font-bold">{fmt(item.price * item.quantity)}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-ch-hairline">
                        <h3 className="text-sm font-semibold text-ch-muted uppercase tracking-wider mb-3">Rincian Pembayaran</h3>
                        <div className="space-y-2 text-sm max-w-xs">
                            <div className="flex justify-between"><span className="text-ch-muted">Harga</span><span className="text-ch-on-dark">{fmt(order.price)}</span></div>
                            {order.discount > 0 && <div className="flex justify-between text-ch-accent-rose"><span>Diskon</span><span>-{fmt(order.discount)}</span></div>}
                            <div className="flex justify-between font-semibold text-ch-on-dark pt-2 border-t border-ch-hairline"><span>Total</span><span>{fmt(total)}</span></div>
                            <div className="flex justify-between text-ch-accent-emerald"><span>DP Dibayar</span><span>{fmt(order.dp)}</span></div>
                            <div className={`flex justify-between font-semibold pt-2 border-t border-ch-hairline ${remaining > 0 ? "text-ch-accent-rose" : "text-ch-accent-emerald"}`}>
                                <span>Sisa</span><span>{remaining > 0 ? fmt(remaining) : "LUNAS"}</span>
                            </div>
                        </div>
                    </div>

                    {nextStatus && (
                        <div className="mt-6">
                            <ChButtonPrimary onClick={onAdvanceStatus} className="w-full">
                                <CheckCircle2 size={15} /> Tandai sebagai: {nextStatus}
                            </ChButtonPrimary>
                        </div>
                    )}
                </ChCardBody>
            </ChCard>
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
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="ch-card px-4 py-2 text-sm">
                    <span className="text-ch-muted">Total Pengeluaran: </span>
                    <span className="font-semibold text-ch-accent-rose">{fmt(total)}</span>
                </div>
                <ChButtonPrimary onClick={onAdd}>
                    <Plus size={15} /> Tambah Pengeluaran
                </ChButtonPrimary>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 ch-card">
                    <ChTable>
                        <ChTableHead>
                            <tr>
                                <ChTableHeader>Tanggal</ChTableHeader>
                                <ChTableHeader>Kategori</ChTableHeader>
                                <ChTableHeader>Deskripsi</ChTableHeader>
                                <ChTableHeader>Jumlah</ChTableHeader>
                                <ChTableHeader>Aksi</ChTableHeader>
                            </tr>
                        </ChTableHead>
                        <ChTableBody>
                            {expenses.map(e => (
                                <ChTableRow key={e.id}>
                                    <ChTableData className="text-ch-body">{e.date}</ChTableData>
                                    <ChTableData><ChBadge>{e.category}</ChBadge></ChTableData>
                                    <ChTableData className="text-ch-body">{e.description}</ChTableData>
                                    <ChTableData className="font-semibold text-ch-accent-rose">{fmt(e.amount)}</ChTableData>
                                    <ChTableData>
                                        <div className="flex items-center gap-1">
                                            <ChIconButton onClick={() => onEdit(e)}><Edit2 size={14} /></ChIconButton>
                                            <ChIconButton onClick={() => onDelete(e)}><Trash2 size={14} /></ChIconButton>
                                        </div>
                                    </ChTableData>
                                </ChTableRow>
                            ))}
                            {expenses.length === 0 && (
                                <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-ch-muted">Belum ada pengeluaran.</td></tr>
                            )}
                        </ChTableBody>
                    </ChTable>
                </div>

                <div className="ch-card p-6">
                    <h3 className="text-base font-semibold text-ch-on-dark mb-0.5">Kategori Pengeluaran</h3>
                    <p className="text-xs text-ch-muted mb-4">Semua periode</p>
                    {EXPENSE_PIE_DATA.length === 0 ? (
                        <p className="text-sm text-ch-muted">Belum ada data.</p>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={EXPENSE_PIE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3} dataKey="value">
                                        {EXPENSE_PIE_DATA.map((_, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CH.hairline}`, backgroundColor: CH.surfaceCard, color: CH.onDark }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {EXPENSE_PIE_DATA.map((d, i) => (
                                    <div key={d.name} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[i] }} />{d.name}</span>
                                        <span className="font-medium text-ch-on-dark">{fmt(d.value)}</span>
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
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const weekLabels = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];

    const REVENUE_DATA = weekLabels.map((label, weekNum) => {
        const startDay = weekNum * 7 + 1;
        const endDay = weekNum === 3 ? new Date(currentYear, currentMonth + 1, 0).getDate() : (weekNum + 1) * 7;
        const pendapatan = orders.filter(o => {
            if (!o.createdAt) return false;
            const [year, month, day] = o.createdAt.split('-').map(Number);
            return year === currentYear && month - 1 === currentMonth && day >= startDay && day <= endDay;
        }).reduce((s, o) => s + (o.price - o.discount), 0);
        const pengeluaran = expenses.filter(e => {
            if (!e.date) return false;
            const [year, month, day] = e.date.split('-').map(Number);
            return year === currentYear && month - 1 === currentMonth && day >= startDay && day <= endDay;
        }).reduce((s, e) => s + e.amount, 0);
        return { month: label, pendapatan, pengeluaran };
    });

    const totalPendapatan = REVENUE_DATA.reduce((s, d) => s + d.pendapatan, 0);
    const totalPengeluaran = REVENUE_DATA.reduce((s, d) => s + d.pengeluaran, 0);
    const labaBersih = totalPendapatan - totalPengeluaran;
    const counts: Record<string, number> = {};
    orders.forEach(o => { counts[o.service] = (counts[o.service] || 0) + 1; });
    const TOP_SERVICES_DATA = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, jumlah]) => ({ name, jumlah }));
    const byCategory: Record<string, number> = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const EXPENSE_PIE_DATA = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

    const exportToExcel = async () => {
        const XLSX = await import('xlsx');
        const orderRows = orders.map(o => ({ 'Invoice': o.invoice, 'Pelanggan': o.customer, 'No. WhatsApp': o.phone, 'Jenis Pakaian': o.clothingType, 'Layanan': o.service, 'Status': o.status, 'Tanggal': o.createdAt, 'Deadline': o.deadline, 'Harga': o.price, 'Diskon': o.discount, 'Total': o.price - o.discount, 'DP': o.dp, 'Sisa': (o.price - o.discount) - o.dp, 'Catatan': o.notes }));
        const expenseRows = expenses.map(e => ({ 'Tanggal': e.date, 'Kategori': e.category, 'Deskripsi': e.description, 'Jumlah': e.amount }));
        const revenueRows = REVENUE_DATA.map(d => ({ 'Periode': d.month, 'Pendapatan': d.pendapatan, 'Pengeluaran': d.pengeluaran, 'Laba Bersih': d.pendapatan - d.pengeluaran }));
        const serviceRows = TOP_SERVICES_DATA.map((d, i) => ({ 'No': i + 1, 'Layanan': d.name, 'Jumlah Pesanan': d.jumlah }));
        const categoryRows = EXPENSE_PIE_DATA.map(d => ({ 'Kategori': d.name, 'Total': d.value }));
        const wb = XLSX.utils.book_new();
        const summaryData = [
            ['LAPORAN KEUANGAN A.Y.A TAILOR'], [''], ['Periode', `${new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}`], [''],
            ['Ringkasan Keuangan'], ['Total Pendapatan', totalPendapatan], ['Total Pengeluaran', totalPengeluaran], ['Laba Bersih', labaBersih], ['Total Pesanan', orders.length], [''],
            ['Pendapatan per Minggu'], ['Periode', 'Pendapatan', 'Pengeluaran', 'Laba Bersih'], ...revenueRows.map(r => [r.Periode, r.Pendapatan, r.Pengeluaran, r['Laba Bersih']]),
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(orderRows), 'Pesanan');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows), 'Pengeluaran');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(serviceRows), 'Layanan Terlaris');
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(categoryRows), 'Kategori Pengeluaran');
        [ws1].forEach(ws => {
            if (ws['!ref']) {
                const range = XLSX.utils.decode_range(ws['!ref']);
                const cols: any[] = [];
                for (let c = range.s.c; c <= range.e.c; c++) {
                    let maxLen = 10;
                    for (let r = range.s.r; r <= range.e.r; r++) {
                        const cell = ws[XLSX.utils.encode_cell({ r, c })];
                        if (cell && cell.v) { const len = String(cell.v).length; if (len > maxLen) maxLen = len; }
                    }
                    cols.push({ wch: Math.min(maxLen + 3, 40) });
                }
                ws['!cols'] = cols;
            }
        });
        XLSX.writeFile(wb, `Laporan_Keuangan_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
                <ChStat icon={TrendingUp} label="Total Pendapatan" value={fmt(totalPendapatan)} sub={`Bulan ${new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`} yellow={true} />
                <ChStat icon={TrendingDown} label="Total Pengeluaran" value={fmt(totalPengeluaran)} sub={`Bulan ${new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`} yellow={false} />
                <ChStat icon={Wallet} label="Laba Bersih" value={fmt(labaBersih)} sub={labaBersih >= 0 ? "Untung" : "Rugi"} yellow={labaBersih >= 0} />
                <ChStat icon={ShoppingBag} label="Total Pesanan" value={String(orders.length)} sub="Semua periode" yellow={false} />
            </div>

            <ChCard>
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-semibold text-ch-on-dark">Grafik Pendapatan & Pengeluaran</h3>
                            <p className="text-xs text-ch-muted mt-0.5">Per minggu - {new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-ch-muted">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-ch-primary inline-block" />Pendapatan</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-ch-muted inline-block" />Pengeluaran</span>
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={REVENUE_DATA} margin={{ left: -10, right: 5 }}>
                            <defs>
                                <linearGradient id="gRevCHRpt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CH.primary} stopOpacity={0.15} /><stop offset="95%" stopColor={CH.primary} stopOpacity={0} /></linearGradient>
                                <linearGradient id="gExpCHRpt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CH.muted} stopOpacity={0.15} /><stop offset="95%" stopColor={CH.muted} stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={CH.hairline} />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: CH.muted }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: CH.muted }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000000).toFixed(1)}jt`} />
                            <Tooltip formatter={(v: number, name: string) => [fmt(v), name === "pendapatan" ? "Pendapatan" : "Pengeluaran"]} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CH.hairline}`, backgroundColor: CH.surfaceCard, color: CH.onDark }} />
                            <Area type="monotone" dataKey="pendapatan" stroke={CH.primary} strokeWidth={2} fill="url(#gRevCHRpt)" />
                            <Area type="monotone" dataKey="pengeluaran" stroke={CH.muted} strokeWidth={1.5} fill="url(#gExpCHRpt)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </ChCard>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 ch-card p-6">
                    <h3 className="text-base font-semibold text-ch-on-dark mb-4">Layanan Terlaris</h3>
                    {TOP_SERVICES_DATA.length === 0 ? <p className="text-sm text-ch-muted">Belum ada data.</p> : (
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={TOP_SERVICES_DATA} layout="vertical" margin={{ left: 0, right: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={CH.hairline} horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 10, fill: CH.muted }} axisLine={false} tickLine={false} />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 9, fill: CH.muted }} axisLine={false} tickLine={false} width={110} />
                                <Tooltip formatter={(v: number) => [`${v} pesanan`]} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CH.hairline}`, backgroundColor: CH.surfaceCard, color: CH.onDark }} />
                                <Bar dataKey="jumlah" fill={CH.primary} radius={[0, 0, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
                <div className="ch-card p-6">
                    <h3 className="text-base font-semibold text-ch-on-dark mb-4">Kategori Pengeluaran</h3>
                    {EXPENSE_PIE_DATA.length === 0 ? <p className="text-sm text-ch-muted">Belum ada data.</p> : (
                        <>
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={EXPENSE_PIE_DATA} dataKey="value" innerRadius={40} outerRadius={75} paddingAngle={3}>
                                        {EXPENSE_PIE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ fontSize: 12, borderRadius: 8, border: `1px solid ${CH.hairline}`, backgroundColor: CH.surfaceCard, color: CH.onDark }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-2">
                                {EXPENSE_PIE_DATA.map((d, i) => (
                                    <div key={d.name} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: PIE_COLORS[i] }} />{d.name}</span>
                                        <span className="font-medium text-ch-on-dark">{fmt(d.value)}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <ChButtonPrimary onClick={exportToExcel}>
                <Download size={14} /> Export ke Excel
            </ChButtonPrimary>
        </div>
    );
}

// ─── Page: Settings ───────────────────────────────────────────────────────────

function SettingsPage({ setToast, refreshNotifications }: {
    setToast: (t: { message: string; type: "success" | "error" } | null) => void;
    refreshNotifications?: () => void;
}) {
    const [storeName, setStoreName] = useState("A.Y.A Tailor");
    const [address, setAddress] = useState("Jl. Sudirman No. 45, Bandung");
    const [phone, setPhone] = useState("022-1234567");
    const [wa, setWa] = useState("081234567890");
    const [notif1, setNotif1] = useState(true);
    const [notif2, setNotif2] = useState(true);
    const [notif3, setNotif3] = useState(false);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await api.getSettings();
                if (data) {
                    setStoreName(data.storeName || "A.Y.A Tailor");
                    setAddress(data.address || "Jl. Sudirman No. 45, Bandung");
                    setPhone(data.phone || "022-1234567");
                    setWa(data.whatsapp || "081234567890");
                    if (data.notifications) {
                        setNotif1(data.notifications.order_complete ?? true);
                        setNotif2(data.notifications.deadline_reminder ?? true);
                        setNotif3(data.notifications.stock_alert ?? false);
                    }
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        loadSettings();
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await api.updateSettings({ storeName, address, phone, whatsapp: wa, notifications: { order_complete: notif1, deadline_reminder: notif2, stock_alert: notif3 } });
            setToast({ message: "Pengaturan berhasil diperbarui!", type: "success" });
            refreshNotifications?.();
        } catch (err: any) { setToast({ message: "Gagal menyimpan: " + (err?.message || "terjadi kesalahan"), type: "error" }); }
        finally { setSaving(false); }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto">
                <ChCard><ChCardBody><p className="text-sm text-ch-muted">Memuat pengaturan...</p></ChCardBody></ChCard>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <ChCard>
                <ChCardBody>
                    <h3 className="text-base font-semibold text-ch-on-dark mb-6">Profil Toko</h3>
                    <div className="space-y-4">
                        <InputField label="Nama Toko"><input className="ch-input" value={storeName} onChange={e => setStoreName(e.target.value)} /></InputField>
                        <InputField label="Alamat"><textarea className="ch-textarea" rows={2} value={address} onChange={e => setAddress(e.target.value)} /></InputField>
                        <div className="grid grid-cols-2 gap-4">
                            <InputField label="Nomor Telepon"><input className="ch-input" value={phone} onChange={e => setPhone(e.target.value)} /></InputField>
                            <InputField label="Nomor WhatsApp"><input className="ch-input" value={wa} onChange={e => setWa(e.target.value)} /></InputField>
                        </div>
                        <ChButtonPrimary onClick={save} disabled={saving}>
                            {saving ? "Menyimpan..." : "Simpan Perubahan"}
                        </ChButtonPrimary>
                    </div>
                </ChCardBody>
            </ChCard>
        </div>
    );
}

// ─── Notification Dropdown Component ─────────────────────────────────────────

interface NotificationItem {
    id: number;
    type: string;
    title: string;
    message: string;
    icon: string | null;
    color: string | null;
    link_type: string | null;
    link_id: string | null;
    is_read: boolean;
    created_at: string;
}

const NOTIF_ICONS: Record<string, any> = {
    ShoppingBag: ShoppingBag, Clock: Clock, Scissors: Scissors, CheckCircle2: CheckCircle2,
    Package: Package, Banknote: Banknote, Calendar: Calendar, Bell: Bell, User: User, Settings: SettingsIcon,
};

function NotificationDropdown({ onNavigate, refreshTrigger }: {
    onNavigate: (type: string, id: string) => void;
    refreshTrigger?: number;
}) {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await api.getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
        } catch (err) { console.error(err); }
    }, []);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);
    useEffect(() => { const interval = setInterval(fetchNotifications, 10000); return () => clearInterval(interval); }, [fetchNotifications]);
    useEffect(() => { if (refreshTrigger && refreshTrigger > 0) fetchNotifications(); }, [refreshTrigger, fetchNotifications]);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        try { await api.markAllNotificationsRead(); setNotifications(prev => prev.map(n => ({ ...n, is_read: true }))); setUnreadCount(0); }
        catch (err) { console.error(err); }
    };

    const handleNotificationClick = async (notif: NotificationItem) => {
        if (!notif.is_read) {
            try { await api.markNotificationRead(notif.id); setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n)); setUnreadCount(prev => Math.max(0, prev - 1)); }
            catch (err) { console.error(err); }
        }
        if (notif.link_type && notif.link_id) { onNavigate(notif.link_type, notif.link_id); setOpen(false); }
    };

    const handleDelete = async (e: any, id: number) => {
        e.stopPropagation();
        try { await api.deleteNotification(id); setNotifications(prev => prev.filter(n => n.id !== id)); setUnreadCount(prev => Math.max(0, prev - 1)); }
        catch (err) { console.error(err); }
    };

    const handleClearAll = async () => {
        try { await api.clearAllNotifications(); setNotifications([]); setUnreadCount(0); }
        catch (err) { console.error(err); }
    };

    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <ChIconButton onClick={() => setOpen(!open)} className="relative">
                {unreadCount > 0 ? <BellRing size={18} /> : <Bell size={18} />}
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-ch-accent-rose text-white text-[9px] font-bold rounded-full flex items-center justify-center min-w-[18px] min-h-[18px]">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </ChIconButton>
            {open && (
                <div className="absolute right-0 top-full mt-2 w-[420px] bg-ch-surface-card border border-ch-hairline rounded-xl overflow-hidden z-50">
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-ch-hairline">
                        <div>
                            <h3 className="font-semibold text-ch-on-dark text-sm">Notifikasi</h3>
                            <p className="text-xs text-ch-muted mt-0.5">{unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && <button onClick={handleMarkAllRead} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-ch-primary hover:bg-ch-surface-elevated rounded-lg transition-colors"><CheckCheck size={13} /> Baca Semua</button>}
                            {notifications.length > 0 && <button onClick={handleClearAll} className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-ch-accent-rose hover:bg-ch-surface-elevated rounded-lg transition-colors"><Trash size={13} /> Hapus</button>}
                        </div>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-12 text-center"><BellOff size={32} className="mx-auto text-ch-hairline mb-3" /><p className="text-sm text-ch-muted">Tidak ada notifikasi</p></div>
                        ) : (
                            notifications.map((notif) => (
                                <div key={notif.id} onClick={() => handleNotificationClick(notif)} className={`flex items-start gap-3.5 px-5 py-3.5 cursor-pointer transition-all hover:bg-ch-surface-soft border-b border-ch-hairline last:border-0 ${!notif.is_read ? 'bg-ch-surface-soft' : ''}`}>
                                    <div className="w-9 h-9 bg-ch-surface-elevated rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                                        {(() => {
                                            const IconComponent = NOTIF_ICONS[notif.icon || ''] || Bell;
                                            return <IconComponent size={16} className="text-ch-primary" />;
                                        })()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm leading-tight ${!notif.is_read ? 'font-semibold text-ch-on-dark' : 'text-ch-body'}`}>{notif.title}</p>
                                            {!notif.is_read && <span className="w-2 h-2 bg-ch-primary rounded-full shrink-0 mt-1.5" />}
                                        </div>
                                        <p className="text-xs text-ch-muted mt-0.5 line-clamp-2">{notif.message}</p>
                                        <div className="flex items-center justify-between mt-1.5">
                                            <span className="text-[10px] text-ch-muted-soft">{timeAgo(notif.created_at)}</span>
                                            <button onClick={(e) => handleDelete(e, notif.id)} className="p-0.5 text-ch-hairline hover:text-ch-accent-rose transition-colors"><X size={11} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Toast Component ─────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
        const t = setTimeout(() => { setVisible(false); setTimeout(onClose, 300); }, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed top-5 right-5 z-[100] transition-all duration-300 ${visible ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"}`}>
            <div className="flex items-center gap-3.5 bg-ch-surface-card border border-ch-hairline rounded-lg px-5 py-3.5 min-w-[320px]">
                <div className={`w-7 h-7 ${type === "success" ? "bg-ch-accent-emerald" : "bg-ch-accent-rose"} rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {type === "success" ? "✓" : "✕"}
                </div>
                <p className="text-sm text-ch-on-dark font-medium flex-1">{message}</p>
                <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="p-0.5 text-ch-hairline hover:text-ch-muted transition-colors shrink-0"><X size={14} /></button>
            </div>
        </div>
    );
}

// ─── Page: Priority Recommendations ──────────────────────────────────────────

function PriorityRecommendationsPage({ orders, setPage, setSelectedOrder, onLoadDetail }: {
    orders: Order[];
    setPage: (p: Page) => void;
    setSelectedOrder: (o: Order) => void;
    onLoadDetail?: (id: string) => void;
}) {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [summary, setSummary] = useState<string>("");
    const [totalActive, setTotalActive] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "Sangat Tinggi" | "Tinggi" | "Sedang" | "Rendah">("all");

    useEffect(() => {
        const loadRecommendations = async () => {
            try {
                const data = await api.getPriorityRecommendations();
                if (data?.recommendations) {
                    setRecommendations(data.recommendations);
                    setSummary(data.summary || "");
                    setTotalActive(data.total_active_orders || 0);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        loadRecommendations();
    }, []);

    const filtered = filter === "all" ? recommendations : recommendations.filter((r: any) => r.priority_level === filter);

    const getPriorityColor = (color: string) => {
        switch (color) {
            case 'red': return { bg: 'bg-ch-surface-card', text: 'text-ch-accent-rose', border: 'border-ch-accent-rose', dot: 'bg-ch-accent-rose' };
            case 'orange': return { bg: 'bg-ch-surface-card', text: 'text-ch-body-strong', border: 'border-ch-hairline', dot: 'bg-ch-body-strong' };
            case 'yellow': return { bg: 'bg-ch-surface-card', text: 'text-ch-body-strong', border: 'border-ch-hairline', dot: 'bg-ch-muted' };
            default: return { bg: 'bg-ch-surface-card', text: 'text-ch-muted', border: 'border-ch-hairline', dot: 'bg-ch-muted' };
        }
    };

    const getDaysText = (days: number) => {
        if (days < 0) return `Terlambat ${Math.abs(days)} hari`;
        if (days === 0) return 'Deadline hari ini';
        if (days === 1) return 'Deadline besok';
        return `Deadline ${days} hari lagi`;
    };

    if (loading) {
        return <LoadingSpinner message="AI sedang menganalisis prioritas pesanan..." />;
    }

    const filterTabs = [
        { key: "all", label: "Semua", count: recommendations.length },
        { key: "Sangat Tinggi", label: "Sangat Tinggi", count: recommendations.filter((r: any) => r.priority_level === 'Sangat Tinggi').length },
        { key: "Tinggi", label: "Tinggi", count: recommendations.filter((r: any) => r.priority_level === 'Tinggi').length },
        { key: "Sedang", label: "Sedang", count: recommendations.filter((r: any) => r.priority_level === 'Sedang').length },
        { key: "Rendah", label: "Rendah", count: recommendations.filter((r: any) => r.priority_level === 'Rendah').length },
    ];

    return (
        <div className="space-y-6">
            {/* AI Summary - ClickHouse yellow band */}
            {summary && (
                <div className="ch-cta-band">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-ch-on-primary/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                            <Sparkles size={18} className="text-ch-on-primary" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-ch-on-primary/60 uppercase tracking-wider mb-1">Ringkasan AI</h3>
                            <p className="text-lg font-bold text-ch-on-primary leading-relaxed">{summary}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="ch-stat">
                    <p className="text-xs text-ch-muted mb-1">Total Pesanan Aktif</p>
                    <p className="text-[32px] font-bold text-ch-on-dark">{totalActive}</p>
                </div>
                <div className="ch-stat border-ch-accent-rose">
                    <p className="text-xs text-ch-accent-rose mb-1">Prioritas Sangat Tinggi</p>
                    <p className="text-[32px] font-bold text-ch-accent-rose">{recommendations.filter((r: any) => r.priority_level === 'Sangat Tinggi').length}</p>
                </div>
                <div className="ch-stat">
                    <p className="text-xs text-ch-muted mb-1">Prioritas Tinggi</p>
                    <p className="text-[32px] font-bold text-ch-body-strong">{recommendations.filter((r: any) => r.priority_level === 'Tinggi').length}</p>
                </div>
                <div className="ch-stat">
                    <p className="text-xs text-ch-muted mb-1">Prioritas Sedang & Rendah</p>
                    <p className="text-[32px] font-bold text-ch-muted">{recommendations.filter((r: any) => r.priority_level === 'Sedang' || r.priority_level === 'Rendah').length}</p>
                </div>
            </div>

            {/* Filter chips */}
            <ChFilterPills tabs={filterTabs} activeTab={filter} onTabChange={setFilter} />

            {/* Recommendation list */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="ch-card p-12 text-center">
                        <CheckCircle2 size={48} className="mx-auto text-ch-accent-emerald mb-3" />
                        <p className="text-sm font-semibold text-ch-on-dark mb-1">Semua pesanan dalam kondisi baik!</p>
                        <p className="text-xs text-ch-muted">Tidak ada pesanan yang memerlukan perhatian prioritas saat ini.</p>
                    </div>
                ) : (
                    filtered.map((rec: any, index: number) => {
                        const colors = getPriorityColor(rec.priority_color);
                        return (
                            <motion.div
                                key={rec.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`ch-card p-5 cursor-pointer hover:bg-ch-surface-soft transition-colors`}
                                onClick={() => { setSelectedOrder(rec); onLoadDetail?.(rec.id); setPage("order-detail"); }}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.border} border`}>
                                        <span className={`text-lg font-bold ${colors.text}`}>#{index + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-base font-bold text-ch-on-dark">{rec.invoice}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                                                        {rec.priority_level}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-ch-body">{rec.customer}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-ch-on-dark">{fmt(rec.price)}</p>
                                                <p className="text-xs text-ch-muted">{rec.item_count} item</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-ch-body">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={13} className="text-ch-muted" />
                                                <span className={rec.days_until_deadline < 0 ? "text-ch-accent-rose font-semibold" : ""}>
                                                    {getDaysText(rec.days_until_deadline)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <div className="ch-progress w-16">
                                                    <div className={`ch-progress-bar ${rec.progress < 20 ? 'bg-ch-accent-rose' : rec.progress < 50 ? 'bg-ch-body-strong' : 'bg-ch-accent-emerald'}`} style={{ width: `${rec.progress}%` }} />
                                                </div>
                                                <span>{rec.progress}%</span>
                                            </div>
                                        </div>
                                        {rec.priority_reason && (
                                            <div className="mt-2 flex items-start gap-1.5">
                                                <span className="text-xs text-ch-muted">Alasan:</span>
                                                <span className="text-xs text-ch-body">{rec.priority_reason}</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="shrink-0">
                                        <Eye size={18} className="text-ch-hairline" />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

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

    const [customerModal, setCustomerModal] = useState<{ open: boolean; editing?: Customer }>({ open: false });
    const [serviceModal, setServiceModal] = useState<{ open: boolean; editing?: Service }>({ open: false });
    const [expenseModal, setExpenseModal] = useState<{ open: boolean; editing?: Expense }>({ open: false });
    const [paymentModal, setPaymentModal] = useState(false);
    const [confirm, setConfirm] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);

    const [isInitializing, setIsInitializing] = useState(true);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            const [c, o, s, e] = await Promise.all([api.getCustomers(), api.getOrders(), api.getServices(), api.getExpenses()]);
            setCustomers(c); setOrders(o); setServices(s); setExpenses(e);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, []);

    const [user, setUser] = useState<{ id: string | number; name: string; email: string } | null>(null);
    const [notifRefreshKey, setNotifRefreshKey] = useState(0);

    useEffect(() => {
        const autoLogin = async () => {
            try {
                const creds = authStorage.getCredentials();
                if (creds && creds.username && creds.password) {
                    const res = await loginApi(creds);
                    setUser(res.user);
                    setPage("dashboard");
                    await loadAll();
                }
            } catch (err) {
                console.error('Auto-login failed:', err);
                authStorage.clearCredentials();
            } finally {
                setIsInitializing(false);
            }
        };
        autoLogin();
    }, []);

    const handleLogin = async (payload: { username: string; password: string }) => {
        try {
            const res = await loginApi(payload);
            setUser(res.user);
            setPage("dashboard");
            loadAll();
        } catch (e: any) { alert(e?.message || "Login gagal"); }
    };

    const saveCustomer = async (data: any) => {
        try {
            if (customerModal.editing) { await api.updateCustomer(customerModal.editing.id, data); setToast({ message: "Pelanggan berhasil diperbarui!", type: "success" }); }
            else { await api.createCustomer(data); setToast({ message: "Pelanggan berhasil ditambahkan!", type: "success" }); }
            setCustomerModal({ open: false }); await loadAll();
        } catch (e: any) { setToast({ message: e?.message || "Gagal menyimpan pelanggan. Periksa kembali data.", type: "error" }); }
    };
    const deleteCustomer = (c: Customer) => {
        setConfirm({
            title: "Konfirmasi Hapus", message: `Apakah Anda yakin ingin menghapus pelanggan "${c.name}"? Data yang dihapus tidak dapat dikembalikan.`,
            onConfirm: async () => { await api.deleteCustomer(c.id); setConfirm(null); await loadAll(); setToast({ message: "Pelanggan berhasil dihapus!", type: "success" }); },
        });
    };

    const saveService = async (data: any) => {
        try {
            if (serviceModal.editing) { await api.updateService(serviceModal.editing.id, data); setToast({ message: "Layanan berhasil diperbarui!", type: "success" }); }
            else { await api.createService(data); setToast({ message: "Layanan berhasil ditambahkan!", type: "success" }); }
            setServiceModal({ open: false }); await loadAll();
        } catch (e: any) { setToast({ message: e?.message || "Gagal menyimpan layanan.", type: "error" }); }
    };
    const deleteService = (s: Service) => {
        setConfirm({
            title: "Konfirmasi Hapus", message: `Apakah Anda yakin ingin menghapus layanan "${s.name}"? Data yang dihapus tidak dapat dikembalikan.`,
            onConfirm: async () => { await api.deleteService(s.id); setConfirm(null); await loadAll(); setToast({ message: "Layanan berhasil dihapus!", type: "success" }); },
        });
    };

    const saveExpense = async (data: any) => {
        try {
            if (expenseModal.editing) { await api.updateExpense(expenseModal.editing.id, data); setToast({ message: "Pengeluaran berhasil diperbarui!", type: "success" }); }
            else { await api.createExpense(data); setToast({ message: "Pengeluaran berhasil ditambahkan!", type: "success" }); }
            setExpenseModal({ open: false }); await loadAll();
        } catch (e: any) { setToast({ message: e?.message || "Gagal menyimpan pengeluaran.", type: "error" }); }
    };
    const deleteExpense = (e: Expense) => {
        setConfirm({
            title: "Konfirmasi Hapus", message: `Apakah Anda yakin ingin menghapus pengeluaran "${e.description || e.category}"? Data yang dihapus tidak dapat dikembalikan.`,
            onConfirm: async () => { await api.deleteExpense(e.id); setConfirm(null); await loadAll(); setToast({ message: "Pengeluaran berhasil dihapus!", type: "success" }); },
        });
    };

    const createOrder = async (data: any) => { await api.createOrder(data); await loadAll(); setToast({ message: "Pesanan baru berhasil ditambahkan!", type: "success" }); refreshNotificationList(); };
    const deleteOrder = (o: Order) => {
        setConfirm({
            title: "Konfirmasi Hapus", message: `Apakah Anda yakin ingin menghapus pesanan "${o.invoice}"? Data yang dihapus tidak dapat dikembalikan.`,
            onConfirm: async () => { await api.deleteOrder(o.id); setConfirm(null); if (selectedOrder?.id === o.id) setSelectedOrder(null); await loadAll(); setToast({ message: "Pesanan berhasil dihapus!", type: "success" }); },
        });
    };
    const advanceStatus = async () => {
        if (!selectedOrder) return;
        const idx = STATUS_FLOW.indexOf(selectedOrder.status);
        if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
        const next = STATUS_FLOW[idx + 1];
        await api.updateOrderStatus(selectedOrder.id, STATUS_TO_BACKEND[next]);
        await loadAll();
        setSelectedOrder((prev) => prev ? { ...prev, status: next } : prev);
        setToast({ message: `Status pesanan berhasil diubah ke: ${next}`, type: "success" });
    };
    const savePayment = async (data: any) => {
        if (!selectedOrder) return;
        await api.createPayment(selectedOrder.id, data);
        setPaymentModal(false);
        await loadAll();
        if (selectedOrder) await loadOrderDetail(selectedOrder.id);
        setToast({ message: "Pembayaran berhasil dicatat!", type: "success" });
    };

    const loadOrderDetail = async (orderId: string) => {
        try { const detail = await api.getOrder(orderId); setSelectedOrder(detail); }
        catch (err) { console.error('Failed to load order detail:', err); }
    };

    const sendWhatsApp = async () => {
        if (!selectedOrder) return;
        setWaSending(true);
        try { const res = await api.sendWhatsApp(selectedOrder.id); alert(res?.message || "WhatsApp dikirim."); }
        catch (e: any) { alert("Gagal mengirim: " + (e?.message || "terjadi kesalahan")); }
        finally { setWaSending(false); setShowWhatsApp(false); }
    };

    const handleNotificationNavigate = useCallback(async (type: string, id: string) => {
        if (type === 'order-detail') { await loadOrderDetail(id); setPage('order-detail'); }
    }, [loadOrderDetail]);

    const refreshNotificationList = useCallback(() => { setNotifRefreshKey(prev => prev + 1); }, []);

    const navItems: { icon: (props: { size?: number; className?: string }) => any; label: string; page: Page }[] = [
        { icon: LayoutDashboard, label: "Dashboard", page: "dashboard" },
        { icon: ShoppingBag, label: "Pesanan", page: "orders" },
        { icon: Users, label: "Pelanggan", page: "customers" },
        { icon: Scissors, label: "Layanan", page: "services" },
        { icon: TrendingDown, label: "Pengeluaran", page: "expenses" },
        { icon: BarChart2, label: "Laporan", page: "reports" },
        { icon: Sparkles, label: "Prioritas AI", page: "priority-recommendations" },
        { icon: SettingsIcon, label: "Pengaturan", page: "settings" },
    ];

    if (isInitializing) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-ch-canvas">
                <div className="text-center">
                    <motion.div
                        className="w-16 h-16 border-2 border-ch-hairline border-t-ch-primary rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.p className="text-ch-muted text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                        Memuat aplikasi...
                    </motion.p>
                </div>
            </div>
        );
    }

    if (page === "login") {
        return <LoginPage onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-ch-canvas flex">
            {/* ClickHouse-style sidebar - Dark surface card */}
            <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-ch-surface-card border-r border-ch-hairline transition-all duration-200 flex flex-col shrink-0 fixed h-screen overflow-y-auto z-30`}>
                {/* Logo */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-ch-hairline h-16">
                    <img src="/logo.png" alt="A.Y.A Tailor" className="w-8 h-8 object-contain shrink-0" />
                    {sidebarOpen && (
                        <div className="min-w-0">
                            <p className="text-ch-on-dark font-semibold text-sm leading-tight">A.Y.A Tailor</p>
                            <p className="text-ch-muted text-[10px]">Manajemen Jahit</p>
                        </div>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-0.5">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = page === item.page;
                        return (
                            <button
                                key={item.page}
                                onClick={() => setPage(item.page)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all rounded-lg ${isActive ? 'bg-ch-primary text-ch-on-primary' : 'text-ch-muted hover:text-ch-on-dark hover:bg-ch-surface-elevated'}`}
                                title={item.label}
                            >
                                <Icon size={18} className="shrink-0" />
                                {sidebarOpen && <span>{item.label}</span>}
                            </button>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-2 border-t border-ch-hairline">
                    <button
                        onClick={() => setPage("login")}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-ch-muted hover:text-ch-on-dark hover:bg-ch-surface-elevated rounded-lg transition-all"
                        title="Keluar"
                    >
                        <LogOut size={18} className="shrink-0" />
                        {sidebarOpen && <span>Keluar</span>}
                    </button>
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-3 border-t border-ch-hairline text-ch-muted-soft hover:text-ch-muted transition-colors text-xs text-center"
                >
                    {sidebarOpen ? "◀" : "▶"}
                </button>
            </aside>

            {/* Main content area */}
            <div className={`flex-1 flex flex-col min-w-0 ${sidebarOpen ? "ml-64" : "ml-16"} transition-all duration-200`}>
                {/* ClickHouse-style header - dark bar */}
                <header className="bg-ch-canvas border-b border-ch-hairline px-6 h-16 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-base font-semibold text-ch-on-dark">
                        {page === "dashboard" && "Dashboard"}
                        {page === "orders" && "Pesanan"}
                        {page === "new-transaction" && "Pesanan Baru"}
                        {page === "order-detail" && "Detail Pesanan"}
                        {page === "customers" && "Pelanggan"}
                        {page === "services" && "Layanan"}
                        {page === "expenses" && "Pengeluaran"}
                        {page === "reports" && "Laporan"}
                        {page === "priority-recommendations" && "Prioritas AI"}
                        {page === "settings" && "Pengaturan"}
                    </h1>
                    <div className="flex items-center gap-3">
                        <NotificationDropdown onNavigate={handleNotificationNavigate} refreshTrigger={notifRefreshKey} />
                        <div className="flex items-center gap-2.5 pl-3 border-l border-ch-hairline">
                            <div className="w-8 h-8 bg-ch-primary rounded-lg flex items-center justify-center">
                                <User size={14} className="text-ch-on-primary" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium text-ch-on-dark leading-tight">Admin</p>
                                <p className="text-xs text-ch-muted">A.Y.A Tailor</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-6">
                    {loading && <LoadingSpinner message="Memuat data..." />}
                    {!loading && page === "dashboard" && <DashboardPage orders={orders} setPage={setPage} setSelectedOrder={setSelectedOrder} setShowWhatsApp={setShowWhatsApp} onLoadDetail={loadOrderDetail} />}
                    {!loading && page === "customers" && <CustomersPage customers={customers} orders={orders} onAdd={() => setCustomerModal({ open: true })} onEdit={(c) => setCustomerModal({ open: true, editing: c })} onDelete={deleteCustomer} onShowDetail={(c) => { setSelectedCustomer(c); setShowCustomerDetail(true); }} />}
                    {!loading && page === "services" && <ServicesPage services={services} onAdd={() => setServiceModal({ open: true })} onEdit={(s) => setServiceModal({ open: true, editing: s })} onDelete={deleteService} />}
                    {!loading && page === "orders" && <OrdersPage orders={orders} setPage={setPage} setSelectedOrder={setSelectedOrder} onDelete={deleteOrder} onLoadDetail={loadOrderDetail} />}
                    {!loading && page === "new-transaction" && <NewTransactionPage services={services} customers={customers} setPage={setPage} onCreate={createOrder} />}
                    {!loading && page === "order-detail" && selectedOrder && <OrderDetailPage order={selectedOrder} setPage={setPage} setShowWhatsApp={setShowWhatsApp} setShowReceipt={setShowReceipt} onAdvanceStatus={advanceStatus} onPay={() => setPaymentModal(true)} />}
                    {!loading && page === "expenses" && <ExpensesPage expenses={expenses} onAdd={() => setExpenseModal({ open: true })} onEdit={(e) => setExpenseModal({ open: true, editing: e })} onDelete={deleteExpense} />}
                    {!loading && page === "reports" && <ReportsPage orders={orders} expenses={expenses} />}
                    {!loading && page === "priority-recommendations" && <PriorityRecommendationsPage orders={orders} setPage={setPage} setSelectedOrder={setSelectedOrder} onLoadDetail={loadOrderDetail} />}
                    {!loading && page === "settings" && <SettingsPage setToast={setToast} refreshNotifications={refreshNotificationList} />}
                </main>
            </div>

            {/* Modals */}
            {showCustomerDetail && selectedCustomer && <CustomerDetailModal customer={selectedCustomer} orders={orders} onClose={() => setShowCustomerDetail(false)} />}
            {showWhatsApp && selectedOrder && <WhatsAppModal order={selectedOrder} sending={waSending} onSend={sendWhatsApp} onClose={() => setShowWhatsApp(false)} />}
            {showReceipt && selectedOrder && <ReceiptModal order={selectedOrder} onClose={() => setShowReceipt(false)} />}
            {customerModal.open && <CustomerFormModal initial={customerModal.editing} onSave={saveCustomer} onClose={() => setCustomerModal({ open: false })} />}
            {serviceModal.open && <ServiceFormModal initial={serviceModal.editing} onSave={saveService} onClose={() => setServiceModal({ open: false })} />}
            {expenseModal.open && <ExpenseFormModal initial={expenseModal.editing} onSave={saveExpense} onClose={() => setExpenseModal({ open: false })} />}
            {paymentModal && selectedOrder && <PaymentModal order={selectedOrder} onSave={savePayment} onClose={() => setPaymentModal(false)} />}
            {confirm && <ConfirmModal title={confirm.title} message={confirm.message} onConfirm={confirm.onConfirm} onClose={() => setConfirm(null)} />}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
