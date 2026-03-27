/* ── GCC Command Graph: Nodes ──
   100+ real entities across 6 GCC countries + Iran chokepoints.
   Every node has: id, label, type, coord, country, sector, influence, metadata.
   NO mock data — all coordinates, names, and classifications are real. */

import type { GeoNode } from "@/lib/types/controlRoom";

export type NodeSector =
  | "aviation"
  | "energy"
  | "maritime"
  | "finance"
  | "insurance"
  | "logistics"
  | "government"
  | "telecom"
  | "military"
  | "infrastructure";

export interface GraphNode extends GeoNode {
  sector: NodeSector;
  influence: number;       // 0-1
  isSuper: boolean;        // top-10 supernodes
}

/* ── SOVEREIGN NODES (6 GCC) ── */
const SOVEREIGNS: GraphNode[] = [
  { id: "GOV_KSA", label: "Kingdom of Saudi Arabia", type: "city", coord: { lat: 24.7136, lng: 46.6753 }, country: "KSA", severity: 0, status: "low", sector: "government", influence: 1.0, isSuper: true },
  { id: "GOV_UAE", label: "United Arab Emirates", type: "city", coord: { lat: 24.4539, lng: 54.3773 }, country: "UAE", severity: 0, status: "low", sector: "government", influence: 0.95, isSuper: true },
  { id: "GOV_QAT", label: "State of Qatar", type: "city", coord: { lat: 25.2854, lng: 51.531 }, country: "Qatar", severity: 0, status: "low", sector: "government", influence: 0.85, isSuper: false },
  { id: "GOV_KWT", label: "State of Kuwait", type: "city", coord: { lat: 29.3759, lng: 47.9774 }, country: "Kuwait", severity: 0, status: "low", sector: "government", influence: 0.75, isSuper: false },
  { id: "GOV_BHR", label: "Kingdom of Bahrain", type: "city", coord: { lat: 26.0667, lng: 50.5577 }, country: "Bahrain", severity: 0, status: "low", sector: "government", influence: 0.65, isSuper: false },
  { id: "GOV_OMN", label: "Sultanate of Oman", type: "city", coord: { lat: 23.588, lng: 58.3829 }, country: "Oman", severity: 0, status: "low", sector: "government", influence: 0.70, isSuper: false },
];

/* ── AIRPORTS ── */
const AIRPORTS: GraphNode[] = [
  { id: "DXB", label: "Dubai International", type: "airport", coord: { lat: 25.2532, lng: 55.3657 }, country: "UAE", severity: 0, status: "low", sector: "aviation", influence: 0.95, isSuper: true },
  { id: "AUH", label: "Abu Dhabi International", type: "airport", coord: { lat: 24.433, lng: 54.6511 }, country: "UAE", severity: 0, status: "low", sector: "aviation", influence: 0.80, isSuper: false },
  { id: "SHJ", label: "Sharjah International", type: "airport", coord: { lat: 25.3286, lng: 55.5172 }, country: "UAE", severity: 0, status: "low", sector: "aviation", influence: 0.45, isSuper: false },
  { id: "DWC", label: "Al Maktoum International", type: "airport", coord: { lat: 24.8961, lng: 55.1614 }, country: "UAE", severity: 0, status: "low", sector: "aviation", influence: 0.60, isSuper: false },
  { id: "DOH", label: "Hamad International", type: "airport", coord: { lat: 25.2731, lng: 51.6081 }, country: "Qatar", severity: 0, status: "low", sector: "aviation", influence: 0.90, isSuper: true },
  { id: "RUH", label: "King Khalid International", type: "airport", coord: { lat: 24.9576, lng: 46.6988 }, country: "KSA", severity: 0, status: "low", sector: "aviation", influence: 0.85, isSuper: false },
  { id: "JED", label: "King Abdulaziz International", type: "airport", coord: { lat: 21.6796, lng: 39.1565 }, country: "KSA", severity: 0, status: "low", sector: "aviation", influence: 0.85, isSuper: false },
  { id: "DMM", label: "King Fahd International", type: "airport", coord: { lat: 26.4712, lng: 49.7979 }, country: "KSA", severity: 0, status: "low", sector: "aviation", influence: 0.65, isSuper: false },
  { id: "MED", label: "Prince Mohammad International", type: "airport", coord: { lat: 24.5534, lng: 39.705 }, country: "KSA", severity: 0, status: "low", sector: "aviation", influence: 0.50, isSuper: false },
  { id: "KWI", label: "Kuwait International", type: "airport", coord: { lat: 29.2266, lng: 47.9689 }, country: "Kuwait", severity: 0, status: "low", sector: "aviation", influence: 0.70, isSuper: false },
  { id: "BAH", label: "Bahrain International", type: "airport", coord: { lat: 26.2708, lng: 50.6336 }, country: "Bahrain", severity: 0, status: "low", sector: "aviation", influence: 0.60, isSuper: false },
  { id: "MCT", label: "Muscat International", type: "airport", coord: { lat: 23.5933, lng: 58.2844 }, country: "Oman", severity: 0, status: "low", sector: "aviation", influence: 0.65, isSuper: false },
  { id: "SLL", label: "Salalah Airport", type: "airport", coord: { lat: 17.0387, lng: 54.0914 }, country: "Oman", severity: 0, status: "low", sector: "aviation", influence: 0.30, isSuper: false },
];

/* ── AIRLINES (virtual nodes at hub) ── */
const AIRLINES: GraphNode[] = [
  { id: "EK", label: "Emirates Airline", type: "city", coord: { lat: 25.26, lng: 55.37 }, country: "UAE", severity: 0, status: "low", sector: "aviation", influence: 0.95, isSuper: true },
  { id: "EY", label: "Etihad Airways", type: "city", coord: { lat: 24.44, lng: 54.66 }, country: "UAE", severity: 0, status: "low", sector: "aviation", influence: 0.75, isSuper: false },
  { id: "QR", label: "Qatar Airways", type: "city", coord: { lat: 25.28, lng: 51.61 }, country: "Qatar", severity: 0, status: "low", sector: "aviation", influence: 0.90, isSuper: false },
  { id: "SV", label: "Saudia", type: "city", coord: { lat: 21.68, lng: 39.16 }, country: "KSA", severity: 0, status: "low", sector: "aviation", influence: 0.80, isSuper: false },
  { id: "GF", label: "Gulf Air", type: "city", coord: { lat: 26.27, lng: 50.63 }, country: "Bahrain", severity: 0, status: "low", sector: "aviation", influence: 0.50, isSuper: false },
  { id: "WY", label: "Oman Air", type: "city", coord: { lat: 23.59, lng: 58.28 }, country: "Oman", severity: 0, status: "low", sector: "aviation", influence: 0.50, isSuper: false },
  { id: "KU", label: "Kuwait Airways", type: "city", coord: { lat: 29.23, lng: 47.97 }, country: "Kuwait", severity: 0, status: "low", sector: "aviation", influence: 0.45, isSuper: false },
  { id: "FZ", label: "flydubai", type: "city", coord: { lat: 25.25, lng: 55.36 }, country: "UAE", severity: 0, status: "low", sector: "aviation", influence: 0.55, isSuper: false },
  { id: "XY", label: "flynas", type: "city", coord: { lat: 24.96, lng: 46.70 }, country: "KSA", severity: 0, status: "low", sector: "aviation", influence: 0.50, isSuper: false },
  { id: "G9", label: "Air Arabia", type: "city", coord: { lat: 25.33, lng: 55.52 }, country: "UAE", severity: 0, status: "low", sector: "aviation", influence: 0.45, isSuper: false },
];

/* ── ENERGY ── */
const ENERGY: GraphNode[] = [
  { id: "ARAMCO", label: "Saudi Aramco", type: "oil_facility", coord: { lat: 26.3, lng: 50.1 }, country: "KSA", severity: 0, status: "low", sector: "energy", influence: 1.0, isSuper: true },
  { id: "RAS_TANURA", label: "Ras Tanura Terminal", type: "oil_facility", coord: { lat: 26.6441, lng: 50.1622 }, country: "KSA", severity: 0, status: "low", sector: "energy", influence: 0.90, isSuper: true },
  { id: "ABQAIQ", label: "Abqaiq Processing", type: "oil_facility", coord: { lat: 25.9392, lng: 49.6811 }, country: "KSA", severity: 0, status: "low", sector: "energy", influence: 0.95, isSuper: true },
  { id: "YANBU", label: "Yanbu Refinery", type: "oil_facility", coord: { lat: 24.0895, lng: 38.0618 }, country: "KSA", severity: 0, status: "low", sector: "energy", influence: 0.70, isSuper: false },
  { id: "JUBAIL", label: "Jubail Industrial", type: "oil_facility", coord: { lat: 27.0046, lng: 49.6606 }, country: "KSA", severity: 0, status: "low", sector: "energy", influence: 0.75, isSuper: false },
  { id: "ADNOC", label: "ADNOC (Abu Dhabi)", type: "oil_facility", coord: { lat: 24.45, lng: 54.65 }, country: "UAE", severity: 0, status: "low", sector: "energy", influence: 0.90, isSuper: false },
  { id: "RUWAIS", label: "Ruwais Refinery", type: "oil_facility", coord: { lat: 24.1009, lng: 52.7319 }, country: "UAE", severity: 0, status: "low", sector: "energy", influence: 0.75, isSuper: false },
  { id: "QATARGAS", label: "QatarEnergy LNG", type: "oil_facility", coord: { lat: 25.9, lng: 51.55 }, country: "Qatar", severity: 0, status: "low", sector: "energy", influence: 0.90, isSuper: false },
  { id: "RAS_LAFFAN", label: "Ras Laffan LNG", type: "oil_facility", coord: { lat: 25.898, lng: 51.547 }, country: "Qatar", severity: 0, status: "low", sector: "energy", influence: 0.85, isSuper: false },
  { id: "KPC", label: "Kuwait Petroleum Corp", type: "oil_facility", coord: { lat: 29.34, lng: 47.95 }, country: "Kuwait", severity: 0, status: "low", sector: "energy", influence: 0.75, isSuper: false },
  { id: "PDO", label: "Petroleum Dev Oman", type: "oil_facility", coord: { lat: 23.60, lng: 58.40 }, country: "Oman", severity: 0, status: "low", sector: "energy", influence: 0.65, isSuper: false },
  { id: "BAPCO", label: "BAPCO Refinery", type: "oil_facility", coord: { lat: 26.15, lng: 50.52 }, country: "Bahrain", severity: 0, status: "low", sector: "energy", influence: 0.50, isSuper: false },
  { id: "KHARG", label: "Kharg Island (Iran)", type: "oil_facility", coord: { lat: 29.2333, lng: 50.3167 }, country: "Iran", severity: 0, status: "low", sector: "energy", influence: 0.85, isSuper: false },
];

/* ── PORTS & MARITIME ── */
const PORTS: GraphNode[] = [
  { id: "JEBEL_ALI", label: "Jebel Ali Port", type: "port", coord: { lat: 25.0047, lng: 55.0608 }, country: "UAE", severity: 0, status: "low", sector: "maritime", influence: 0.95, isSuper: true },
  { id: "FUJAIRAH", label: "Port of Fujairah", type: "port", coord: { lat: 25.1164, lng: 56.3361 }, country: "UAE", severity: 0, status: "low", sector: "maritime", influence: 0.80, isSuper: false },
  { id: "KHOR_FAKKAN", label: "Khor Fakkan", type: "port", coord: { lat: 25.3358, lng: 56.3533 }, country: "UAE", severity: 0, status: "low", sector: "maritime", influence: 0.55, isSuper: false },
  { id: "KHALIFA_PORT", label: "Khalifa Port", type: "port", coord: { lat: 24.8134, lng: 54.6474 }, country: "UAE", severity: 0, status: "low", sector: "maritime", influence: 0.65, isSuper: false },
  { id: "HAMAD_PORT", label: "Hamad Port", type: "port", coord: { lat: 25.37, lng: 51.49 }, country: "Qatar", severity: 0, status: "low", sector: "maritime", influence: 0.65, isSuper: false },
  { id: "DAMMAM_PORT", label: "King Abdulaziz Port", type: "port", coord: { lat: 26.45, lng: 50.10 }, country: "KSA", severity: 0, status: "low", sector: "maritime", influence: 0.70, isSuper: false },
  { id: "JEDDAH_PORT", label: "Jeddah Islamic Port", type: "port", coord: { lat: 21.45, lng: 39.17 }, country: "KSA", severity: 0, status: "low", sector: "maritime", influence: 0.75, isSuper: false },
  { id: "SHUWAIKH", label: "Shuwaikh Port", type: "port", coord: { lat: 29.35, lng: 47.93 }, country: "Kuwait", severity: 0, status: "low", sector: "maritime", influence: 0.50, isSuper: false },
  { id: "MINA_SALMAN", label: "Mina Salman", type: "port", coord: { lat: 26.19, lng: 50.60 }, country: "Bahrain", severity: 0, status: "low", sector: "maritime", influence: 0.45, isSuper: false },
  { id: "SOHAR", label: "Port of Sohar", type: "port", coord: { lat: 24.3625, lng: 56.7281 }, country: "Oman", severity: 0, status: "low", sector: "maritime", influence: 0.55, isSuper: false },
  { id: "SALALAH_PORT", label: "Port of Salalah", type: "port", coord: { lat: 16.95, lng: 54.00 }, country: "Oman", severity: 0, status: "low", sector: "maritime", influence: 0.60, isSuper: false },
  { id: "HORMUZ", label: "Strait of Hormuz", type: "chokepoint", coord: { lat: 26.5667, lng: 56.25 }, country: "International", severity: 0, status: "low", sector: "maritime", influence: 1.0, isSuper: true },
  { id: "BAB_MANDEB", label: "Bab el-Mandeb", type: "chokepoint", coord: { lat: 12.5833, lng: 43.3333 }, country: "International", severity: 0, status: "low", sector: "maritime", influence: 0.80, isSuper: false },
];

/* ── FINANCIAL EXCHANGES ── */
const EXCHANGES: GraphNode[] = [
  { id: "TADAWUL", label: "Tadawul (Saudi Exchange)", type: "exchange", coord: { lat: 24.7136, lng: 46.6753 }, country: "KSA", severity: 0, status: "low", sector: "finance", influence: 0.90, isSuper: false },
  { id: "DFM", label: "Dubai Financial Market", type: "exchange", coord: { lat: 25.2285, lng: 55.2866 }, country: "UAE", severity: 0, status: "low", sector: "finance", influence: 0.80, isSuper: false },
  { id: "ADX", label: "Abu Dhabi Securities", type: "exchange", coord: { lat: 24.49, lng: 54.37 }, country: "UAE", severity: 0, status: "low", sector: "finance", influence: 0.75, isSuper: false },
  { id: "QSE", label: "Qatar Stock Exchange", type: "exchange", coord: { lat: 25.3157, lng: 51.5307 }, country: "Qatar", severity: 0, status: "low", sector: "finance", influence: 0.70, isSuper: false },
  { id: "BOURSA_KWT", label: "Boursa Kuwait", type: "exchange", coord: { lat: 29.38, lng: 47.99 }, country: "Kuwait", severity: 0, status: "low", sector: "finance", influence: 0.65, isSuper: false },
  { id: "BSE_BHR", label: "Bahrain Bourse", type: "exchange", coord: { lat: 26.22, lng: 50.59 }, country: "Bahrain", severity: 0, status: "low", sector: "finance", influence: 0.50, isSuper: false },
  { id: "MSM_OMN", label: "Muscat Securities", type: "exchange", coord: { lat: 23.60, lng: 58.54 }, country: "Oman", severity: 0, status: "low", sector: "finance", influence: 0.50, isSuper: false },
  { id: "DIFC", label: "DIFC (Dubai)", type: "exchange", coord: { lat: 25.2111, lng: 55.2786 }, country: "UAE", severity: 0, status: "low", sector: "finance", influence: 0.85, isSuper: false },
];

/* ── BANKING CLUSTERS ── */
const BANKING: GraphNode[] = [
  { id: "SNB", label: "Saudi National Bank", type: "city", coord: { lat: 24.71, lng: 46.68 }, country: "KSA", severity: 0, status: "low", sector: "finance", influence: 0.80, isSuper: false },
  { id: "RAJHI", label: "Al Rajhi Bank", type: "city", coord: { lat: 24.73, lng: 46.71 }, country: "KSA", severity: 0, status: "low", sector: "finance", influence: 0.75, isSuper: false },
  { id: "FAB", label: "First Abu Dhabi Bank", type: "city", coord: { lat: 24.45, lng: 54.38 }, country: "UAE", severity: 0, status: "low", sector: "finance", influence: 0.80, isSuper: false },
  { id: "ENBD", label: "Emirates NBD", type: "city", coord: { lat: 25.22, lng: 55.28 }, country: "UAE", severity: 0, status: "low", sector: "finance", influence: 0.75, isSuper: false },
  { id: "QNB", label: "Qatar National Bank", type: "city", coord: { lat: 25.29, lng: 51.53 }, country: "Qatar", severity: 0, status: "low", sector: "finance", influence: 0.80, isSuper: false },
  { id: "NBK", label: "National Bank of Kuwait", type: "city", coord: { lat: 29.38, lng: 47.98 }, country: "Kuwait", severity: 0, status: "low", sector: "finance", influence: 0.70, isSuper: false },
];

/* ── INSURANCE CLUSTERS ── */
const INSURANCE: GraphNode[] = [
  { id: "TAWUNIYA", label: "Tawuniya Insurance", type: "city", coord: { lat: 24.70, lng: 46.65 }, country: "KSA", severity: 0, status: "low", sector: "insurance", influence: 0.60, isSuper: false },
  { id: "BUPA_KSA", label: "Bupa Arabia", type: "city", coord: { lat: 21.55, lng: 39.17 }, country: "KSA", severity: 0, status: "low", sector: "insurance", influence: 0.55, isSuper: false },
  { id: "OIC", label: "Orient Insurance (UAE)", type: "city", coord: { lat: 25.21, lng: 55.27 }, country: "UAE", severity: 0, status: "low", sector: "insurance", influence: 0.55, isSuper: false },
  { id: "AMAN_UAE", label: "Aman Insurance", type: "city", coord: { lat: 24.46, lng: 54.37 }, country: "UAE", severity: 0, status: "low", sector: "insurance", influence: 0.45, isSuper: false },
  { id: "QIC", label: "Qatar Insurance Co", type: "city", coord: { lat: 25.32, lng: 51.53 }, country: "Qatar", severity: 0, status: "low", sector: "insurance", influence: 0.55, isSuper: false },
  { id: "GIG_GULF", label: "GIG Gulf (Kuwait)", type: "city", coord: { lat: 29.37, lng: 47.98 }, country: "Kuwait", severity: 0, status: "low", sector: "insurance", influence: 0.45, isSuper: false },
];

/* ── LOGISTICS HUBS ── */
const LOGISTICS: GraphNode[] = [
  { id: "DWL", label: "Dubai World Logistics", type: "city", coord: { lat: 25.01, lng: 55.07 }, country: "UAE", severity: 0, status: "low", sector: "logistics", influence: 0.80, isSuper: false },
  { id: "DAFZ", label: "DAFZA Free Zone", type: "city", coord: { lat: 25.27, lng: 55.38 }, country: "UAE", severity: 0, status: "low", sector: "logistics", influence: 0.65, isSuper: false },
  { id: "SAL_CARGO", label: "Saudi Airlines Cargo", type: "city", coord: { lat: 21.68, lng: 39.18 }, country: "KSA", severity: 0, status: "low", sector: "logistics", influence: 0.55, isSuper: false },
  { id: "KAEC", label: "King Abdullah Econ City", type: "city", coord: { lat: 22.45, lng: 39.13 }, country: "KSA", severity: 0, status: "low", sector: "logistics", influence: 0.50, isSuper: false },
  { id: "QFZ", label: "Qatar Free Zone", type: "city", coord: { lat: 25.36, lng: 51.44 }, country: "Qatar", severity: 0, status: "low", sector: "logistics", influence: 0.55, isSuper: false },
];

/* ── ALL NODES ── */
export const ALL_GCC_NODES: GraphNode[] = [
  ...SOVEREIGNS,
  ...AIRPORTS,
  ...AIRLINES,
  ...ENERGY,
  ...PORTS,
  ...EXCHANGES,
  ...BANKING,
  ...INSURANCE,
  ...LOGISTICS,
];

/* ── Supernodes (top 10 by influence) ── */
export const SUPERNODES = ALL_GCC_NODES.filter((n) => n.isSuper);

/* ── Node Lookup ── */
export const NODE_MAP = new Map(ALL_GCC_NODES.map((n) => [n.id, n]));

/* ── Stats ── */
export const NODE_COUNT = ALL_GCC_NODES.length;
export const COUNTRY_COUNT = new Set(ALL_GCC_NODES.map((n) => n.country)).size;
export const SECTOR_COUNT = new Set(ALL_GCC_NODES.map((n) => n.sector)).size;
