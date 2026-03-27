/* ── GCC Command Graph: Edges ──
   Typed dependency edges between all 100+ nodes.
   Every edge has: source, target, type, sector, weight, dependency,
   sensitivity, latency_hours, cross_border. */

export type EdgeType =
  | "depends_on"
  | "routes_through"
  | "exports_to"
  | "finances"
  | "insures"
  | "influences"
  | "amplifies"
  | "stresses"
  | "supplies"
  | "operates_at";

export interface GraphEdge {
  edge_id: string;
  source_id: string;
  target_id: string;
  edge_type: EdgeType;
  sector: string;
  weight: number;       // 0-1 (strength of connection)
  dependency: number;   // 0-1 (how dependent target is on source)
  sensitivity: number;  // 0-1 (how much disruption propagates)
  latency_hours: number;
  cross_border: boolean;
}

let _eid = 0;
function e(
  source_id: string,
  target_id: string,
  edge_type: EdgeType,
  sector: string,
  weight: number,
  dependency: number,
  sensitivity: number,
  latency_hours: number,
  cross_border = false
): GraphEdge {
  return {
    edge_id: `E${++_eid}`,
    source_id,
    target_id,
    edge_type,
    sector,
    weight,
    dependency,
    sensitivity,
    latency_hours,
    cross_border,
  };
}

export const ALL_GCC_EDGES: GraphEdge[] = [
  /* ── HORMUZ CHOKEPOINT: everything routes through ── */
  e("HORMUZ", "JEBEL_ALI", "routes_through", "maritime", 0.95, 0.85, 0.90, 2),
  e("HORMUZ", "FUJAIRAH", "routes_through", "maritime", 0.90, 0.80, 0.85, 1),
  e("HORMUZ", "DAMMAM_PORT", "routes_through", "maritime", 0.85, 0.80, 0.85, 4),
  e("HORMUZ", "HAMAD_PORT", "routes_through", "maritime", 0.80, 0.75, 0.80, 3),
  e("HORMUZ", "SHUWAIKH", "routes_through", "maritime", 0.75, 0.70, 0.80, 5),
  e("HORMUZ", "MINA_SALMAN", "routes_through", "maritime", 0.70, 0.65, 0.75, 4),
  e("HORMUZ", "SOHAR", "routes_through", "maritime", 0.65, 0.50, 0.60, 1),
  e("HORMUZ", "RAS_TANURA", "routes_through", "energy", 0.95, 0.90, 0.95, 2),
  e("HORMUZ", "KHARG", "routes_through", "energy", 0.90, 0.85, 0.90, 1),

  /* ── ARAMCO SUPPLY CHAIN ── */
  e("ARAMCO", "RAS_TANURA", "operates_at", "energy", 0.95, 0.90, 0.90, 0),
  e("ARAMCO", "ABQAIQ", "operates_at", "energy", 0.98, 0.95, 0.95, 0),
  e("ARAMCO", "YANBU", "operates_at", "energy", 0.80, 0.75, 0.80, 0),
  e("ARAMCO", "JUBAIL", "operates_at", "energy", 0.85, 0.80, 0.85, 0),
  e("ABQAIQ", "RAS_TANURA", "supplies", "energy", 0.95, 0.90, 0.95, 1),
  e("RAS_TANURA", "HORMUZ", "routes_through", "energy", 0.95, 0.90, 0.95, 2),
  e("ARAMCO", "TADAWUL", "influences", "finance", 0.85, 0.70, 0.75, 1),
  e("ARAMCO", "GOV_KSA", "influences", "government", 0.90, 0.60, 0.70, 0),

  /* ── UAE ENERGY ── */
  e("ADNOC", "RUWAIS", "operates_at", "energy", 0.90, 0.85, 0.85, 0),
  e("ADNOC", "FUJAIRAH", "routes_through", "energy", 0.80, 0.70, 0.75, 2),
  e("ADNOC", "JEBEL_ALI", "supplies", "energy", 0.75, 0.60, 0.65, 3),
  e("ADNOC", "ADX", "influences", "finance", 0.75, 0.60, 0.65, 1),
  e("ADNOC", "GOV_UAE", "influences", "government", 0.85, 0.55, 0.65, 0),

  /* ── QATAR ENERGY ── */
  e("QATARGAS", "RAS_LAFFAN", "operates_at", "energy", 0.95, 0.90, 0.90, 0),
  e("RAS_LAFFAN", "HAMAD_PORT", "routes_through", "energy", 0.85, 0.80, 0.80, 1),
  e("RAS_LAFFAN", "HORMUZ", "routes_through", "energy", 0.90, 0.85, 0.90, 2),
  e("QATARGAS", "QSE", "influences", "finance", 0.75, 0.60, 0.65, 1),
  e("QATARGAS", "GOV_QAT", "influences", "government", 0.85, 0.55, 0.65, 0),

  /* ── AIRLINE → AIRPORT ── */
  e("EK", "DXB", "operates_at", "aviation", 0.98, 0.95, 0.95, 0),
  e("EY", "AUH", "operates_at", "aviation", 0.95, 0.90, 0.90, 0),
  e("QR", "DOH", "operates_at", "aviation", 0.98, 0.95, 0.95, 0),
  e("SV", "JED", "operates_at", "aviation", 0.90, 0.85, 0.85, 0),
  e("SV", "RUH", "operates_at", "aviation", 0.90, 0.85, 0.85, 0),
  e("GF", "BAH", "operates_at", "aviation", 0.90, 0.85, 0.85, 0),
  e("WY", "MCT", "operates_at", "aviation", 0.90, 0.85, 0.85, 0),
  e("KU", "KWI", "operates_at", "aviation", 0.90, 0.85, 0.85, 0),
  e("FZ", "DXB", "operates_at", "aviation", 0.80, 0.70, 0.70, 0),
  e("XY", "RUH", "operates_at", "aviation", 0.75, 0.65, 0.65, 0),
  e("G9", "SHJ", "operates_at", "aviation", 0.85, 0.80, 0.80, 0),

  /* ── AVIATION → ENERGY dependency (fuel) ── */
  e("ADNOC", "DXB", "supplies", "energy", 0.70, 0.60, 0.65, 4),
  e("ADNOC", "AUH", "supplies", "energy", 0.75, 0.65, 0.70, 2),
  e("ARAMCO", "RUH", "supplies", "energy", 0.70, 0.60, 0.65, 4),
  e("ARAMCO", "JED", "supplies", "energy", 0.70, 0.60, 0.65, 6),
  e("ARAMCO", "DMM", "supplies", "energy", 0.65, 0.55, 0.60, 3),
  e("KPC", "KWI", "supplies", "energy", 0.65, 0.55, 0.60, 3),
  e("BAPCO", "BAH", "supplies", "energy", 0.60, 0.50, 0.55, 2),
  e("PDO", "MCT", "supplies", "energy", 0.60, 0.50, 0.55, 3),

  /* ── PORTS → LOGISTICS ── */
  e("JEBEL_ALI", "DWL", "supplies", "logistics", 0.90, 0.85, 0.80, 1),
  e("JEBEL_ALI", "DAFZ", "supplies", "logistics", 0.75, 0.65, 0.60, 2),
  e("JEDDAH_PORT", "SAL_CARGO", "supplies", "logistics", 0.65, 0.55, 0.55, 4),
  e("JEDDAH_PORT", "KAEC", "supplies", "logistics", 0.55, 0.45, 0.45, 6),
  e("HAMAD_PORT", "QFZ", "supplies", "logistics", 0.70, 0.60, 0.60, 2),

  /* ── FINANCIAL DEPENDENCIES ── */
  e("TADAWUL", "GOV_KSA", "influences", "finance", 0.80, 0.50, 0.60, 0),
  e("DFM", "GOV_UAE", "influences", "finance", 0.75, 0.45, 0.55, 0),
  e("QSE", "GOV_QAT", "influences", "finance", 0.70, 0.40, 0.50, 0),
  e("DIFC", "DFM", "influences", "finance", 0.80, 0.60, 0.65, 0),
  e("DIFC", "FAB", "influences", "finance", 0.70, 0.50, 0.55, 0),
  e("SNB", "TADAWUL", "finances", "finance", 0.75, 0.55, 0.60, 0),
  e("RAJHI", "TADAWUL", "finances", "finance", 0.70, 0.50, 0.55, 0),
  e("FAB", "ADX", "finances", "finance", 0.75, 0.55, 0.60, 0),
  e("ENBD", "DFM", "finances", "finance", 0.70, 0.50, 0.55, 0),
  e("QNB", "QSE", "finances", "finance", 0.75, 0.55, 0.60, 0),
  e("NBK", "BOURSA_KWT", "finances", "finance", 0.70, 0.50, 0.55, 0),

  /* ── INSURANCE → ENERGY/AVIATION ── */
  e("TAWUNIYA", "ARAMCO", "insures", "insurance", 0.65, 0.30, 0.40, 0),
  e("BUPA_KSA", "GOV_KSA", "insures", "insurance", 0.50, 0.20, 0.25, 0),
  e("OIC", "EK", "insures", "insurance", 0.55, 0.25, 0.30, 0),
  e("OIC", "JEBEL_ALI", "insures", "insurance", 0.60, 0.30, 0.35, 0),
  e("AMAN_UAE", "ADNOC", "insures", "insurance", 0.55, 0.25, 0.30, 0),
  e("QIC", "QATARGAS", "insures", "insurance", 0.60, 0.30, 0.35, 0),
  e("GIG_GULF", "KPC", "insures", "insurance", 0.50, 0.25, 0.30, 0),

  /* ── CROSS-BORDER ENERGY EXPORTS ── */
  e("ARAMCO", "DXB", "exports_to", "energy", 0.60, 0.40, 0.50, 8, true),
  e("ARAMCO", "BAH", "exports_to", "energy", 0.55, 0.50, 0.55, 4, true),
  e("ADNOC", "DOH", "exports_to", "energy", 0.45, 0.30, 0.35, 6, true),
  e("QATARGAS", "KWI", "exports_to", "energy", 0.50, 0.40, 0.45, 8, true),
  e("RAS_LAFFAN", "JEBEL_ALI", "exports_to", "energy", 0.55, 0.35, 0.40, 4, true),

  /* ── CROSS-BORDER AVIATION ── */
  e("DXB", "DOH", "routes_through", "aviation", 0.70, 0.30, 0.35, 1, true),
  e("DXB", "RUH", "routes_through", "aviation", 0.75, 0.35, 0.40, 2, true),
  e("DXB", "KWI", "routes_through", "aviation", 0.65, 0.25, 0.30, 2, true),
  e("DXB", "BAH", "routes_through", "aviation", 0.60, 0.25, 0.30, 1, true),
  e("DXB", "MCT", "routes_through", "aviation", 0.60, 0.25, 0.30, 1, true),
  e("DOH", "RUH", "routes_through", "aviation", 0.55, 0.20, 0.25, 2, true),
  e("DOH", "KWI", "routes_through", "aviation", 0.50, 0.20, 0.25, 2, true),

  /* ── BAB EL-MANDEB (Red Sea chokepoint) ── */
  e("BAB_MANDEB", "JEDDAH_PORT", "routes_through", "maritime", 0.85, 0.75, 0.80, 3),
  e("BAB_MANDEB", "SALALAH_PORT", "routes_through", "maritime", 0.70, 0.55, 0.60, 2),
  e("BAB_MANDEB", "YANBU", "routes_through", "energy", 0.65, 0.50, 0.55, 4),

  /* ── SOVEREIGN → SECTOR INFLUENCE ── */
  e("GOV_KSA", "ARAMCO", "influences", "government", 0.90, 0.60, 0.50, 0),
  e("GOV_KSA", "SNB", "influences", "government", 0.70, 0.40, 0.35, 0),
  e("GOV_UAE", "ADNOC", "influences", "government", 0.85, 0.55, 0.50, 0),
  e("GOV_UAE", "EK", "influences", "government", 0.80, 0.50, 0.45, 0),
  e("GOV_UAE", "JEBEL_ALI", "influences", "government", 0.80, 0.50, 0.45, 0),
  e("GOV_QAT", "QR", "influences", "government", 0.85, 0.55, 0.50, 0),
  e("GOV_QAT", "QATARGAS", "influences", "government", 0.85, 0.55, 0.50, 0),

  /* ── STRESS PROPAGATION (energy crisis → finance) ── */
  e("RAS_TANURA", "TADAWUL", "stresses", "energy", 0.70, 0.55, 0.65, 2),
  e("ABQAIQ", "TADAWUL", "stresses", "energy", 0.75, 0.60, 0.70, 1),
  e("HORMUZ", "DFM", "stresses", "maritime", 0.80, 0.65, 0.75, 4),
  e("HORMUZ", "TADAWUL", "stresses", "maritime", 0.80, 0.65, 0.75, 6),
  e("HORMUZ", "QSE", "stresses", "maritime", 0.70, 0.55, 0.65, 4),
  e("HORMUZ", "BOURSA_KWT", "stresses", "maritime", 0.65, 0.50, 0.60, 6),

  /* ── AMPLIFICATION (media, sentiment) ── */
  e("DFM", "ADX", "amplifies", "finance", 0.60, 0.40, 0.50, 1),
  e("TADAWUL", "DFM", "amplifies", "finance", 0.65, 0.40, 0.50, 2, true),
  e("TADAWUL", "QSE", "amplifies", "finance", 0.55, 0.30, 0.40, 2, true),
  e("TADAWUL", "BOURSA_KWT", "amplifies", "finance", 0.50, 0.30, 0.35, 3, true),
];

/* ── Edge Lookup ── */
export const EDGE_MAP = new Map(ALL_GCC_EDGES.map((e) => [e.edge_id, e]));

/* ── Get edges for a given node ── */
export function getEdgesForNode(nodeId: string): GraphEdge[] {
  return ALL_GCC_EDGES.filter(
    (e) => e.source_id === nodeId || e.target_id === nodeId
  );
}

/* ── Get downstream nodes from a source ── */
export function getDownstream(sourceId: string): string[] {
  return ALL_GCC_EDGES
    .filter((e) => e.source_id === sourceId)
    .map((e) => e.target_id);
}

/* ── Get upstream nodes to a target ── */
export function getUpstream(targetId: string): string[] {
  return ALL_GCC_EDGES
    .filter((e) => e.target_id === targetId)
    .map((e) => e.source_id);
}

/* ── Stats ── */
export const EDGE_COUNT = ALL_GCC_EDGES.length;
export const CROSS_BORDER_COUNT = ALL_GCC_EDGES.filter((e) => e.cross_border).length;
