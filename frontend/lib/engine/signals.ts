/* ── Live Signal Ingestion ──
   Adapters for real-world signals: news, oil, flights, markets.
   Normalizes into LiveSignal with deterministic scoring.

   LiveSignalScore =
     0.30 × severity +
     0.20 × sourceCredibility +
     0.15 × freshness +
     0.20 × gccRelevance +
     0.15 × confirmation */

/* ── Core Signal Type ── */

export interface LiveSignal {
  id: string;
  type: "news" | "oil_energy" | "flight" | "market" | "maritime" | "military" | "cyber";
  title: string;
  severity: number;           // 0-1
  confidence: number;         // 0-1
  region: string;             // GCC country or "International"
  entities: string[];         // node IDs affected
  timestamp: string;          // ISO 8601
  impact_vector: {
    aviation: number;
    energy: number;
    maritime: number;
    finance: number;
    insurance: number;
  };
  source: string;
  sourceCredibility: number;  // 0-1
  gccRelevance: number;       // 0-1
  confirmation: number;       // 0-1 (cross-source confirmation)
}

/* ── Signal Scoring ── */

export function scoreSignal(signal: LiveSignal): number {
  const hoursAgo = (Date.now() - new Date(signal.timestamp).getTime()) / 3_600_000;
  const freshness = Math.max(0, 1 - hoursAgo / 72); // Decays over 72 hours

  return (
    0.30 * signal.severity +
    0.20 * signal.sourceCredibility +
    0.15 * freshness +
    0.20 * signal.gccRelevance +
    0.15 * signal.confirmation
  );
}

/* ── Signal Adapters ── */

export interface SignalAdapter<T> {
  type: LiveSignal["type"];
  normalize(raw: T): LiveSignal;
}

/* ── News/Event Signal Adapter ── */

export interface RawNewsSignal {
  headline: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  region: string;
  entities: string[];
  timestamp: string;
  verified: boolean;
}

const SEVERITY_MAP: Record<string, number> = {
  low: 0.25,
  medium: 0.50,
  high: 0.75,
  critical: 1.0,
};

const SOURCE_CREDIBILITY: Record<string, number> = {
  reuters: 0.95,
  bloomberg: 0.95,
  "al-jazeera": 0.80,
  "arab-news": 0.75,
  "gulf-news": 0.75,
  "official-gov": 1.0,
  twitter: 0.35,
  unknown: 0.30,
};

export const newsAdapter: SignalAdapter<RawNewsSignal> = {
  type: "news",
  normalize(raw) {
    const severity = SEVERITY_MAP[raw.severity] ?? 0.5;
    const srcCred = SOURCE_CREDIBILITY[raw.source.toLowerCase()] ?? 0.5;
    const gccRelevance = raw.region.match(/ksa|uae|qatar|kuwait|bahrain|oman|gcc/i) ? 0.9 : 0.4;

    return {
      id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "news",
      title: raw.headline,
      severity,
      confidence: raw.verified ? 0.85 : 0.5,
      region: raw.region,
      entities: raw.entities,
      timestamp: raw.timestamp,
      impact_vector: {
        aviation: severity * 0.6,
        energy: severity * 0.8,
        maritime: severity * 0.5,
        finance: severity * 0.7,
        insurance: severity * 0.4,
      },
      source: raw.source,
      sourceCredibility: srcCred,
      gccRelevance,
      confirmation: raw.verified ? 0.7 : 0.2,
    };
  },
};

/* ── Oil/Energy Signal Adapter ── */

export interface RawOilSignal {
  benchmark: "brent" | "wti" | "dubai_oman";
  price_change_pct: number;
  current_price: number;
  supply_disruption: boolean;
  region: string;
  timestamp: string;
}

export const oilAdapter: SignalAdapter<RawOilSignal> = {
  type: "oil_energy",
  normalize(raw) {
    const absPctChange = Math.abs(raw.price_change_pct);
    const severity = Math.min(absPctChange / 15, 1); // 15% = max severity
    const entities = raw.supply_disruption
      ? ["ARAMCO", "ADNOC", "HORMUZ", "RAS_TANURA"]
      : ["ARAMCO", "TADAWUL"];

    return {
      id: `oil-${Date.now()}-${raw.benchmark}`,
      type: "oil_energy",
      title: `${raw.benchmark.toUpperCase()} ${raw.price_change_pct > 0 ? "+" : ""}${raw.price_change_pct.toFixed(1)}% ($${raw.current_price})`,
      severity,
      confidence: 0.95,
      region: raw.region || "International",
      entities,
      timestamp: raw.timestamp,
      impact_vector: {
        aviation: severity * 0.7,
        energy: severity * 1.0,
        maritime: severity * 0.6,
        finance: severity * 0.8,
        insurance: severity * 0.5,
      },
      source: "market-data",
      sourceCredibility: 0.98,
      gccRelevance: 0.95,
      confirmation: raw.supply_disruption ? 0.8 : 0.5,
    };
  },
};

/* ── Flight Disruption Signal Adapter ── */

export interface RawFlightSignal {
  airport_code: string;
  disruption_type: "closure" | "diversion" | "delay" | "reroute";
  affected_flights: number;
  duration_hours: number;
  reason: string;
  timestamp: string;
}

export const flightAdapter: SignalAdapter<RawFlightSignal> = {
  type: "flight",
  normalize(raw) {
    const severity = Math.min(
      (raw.affected_flights / 200) * 0.5 +
      (raw.duration_hours / 24) * 0.3 +
      (raw.disruption_type === "closure" ? 0.3 : 0.1),
      1
    );

    return {
      id: `flight-${Date.now()}-${raw.airport_code}`,
      type: "flight",
      title: `${raw.airport_code} ${raw.disruption_type}: ${raw.affected_flights} flights, ${raw.duration_hours}h`,
      severity,
      confidence: 0.90,
      region: "GCC",
      entities: [raw.airport_code],
      timestamp: raw.timestamp,
      impact_vector: {
        aviation: severity * 1.0,
        energy: severity * 0.3,
        maritime: 0,
        finance: severity * 0.4,
        insurance: severity * 0.6,
      },
      source: "aviation-data",
      sourceCredibility: 0.92,
      gccRelevance: 0.95,
      confirmation: 0.85,
    };
  },
};

/* ── Market Signal Adapter ── */

export interface RawMarketSignal {
  exchange: string;
  index_change_pct: number;
  volume_change_pct: number;
  sector_most_affected: string;
  timestamp: string;
}

export const marketAdapter: SignalAdapter<RawMarketSignal> = {
  type: "market",
  normalize(raw) {
    const severity = Math.min(Math.abs(raw.index_change_pct) / 8, 1); // 8% = max
    return {
      id: `market-${Date.now()}-${raw.exchange}`,
      type: "market",
      title: `${raw.exchange} ${raw.index_change_pct > 0 ? "+" : ""}${raw.index_change_pct.toFixed(1)}%`,
      severity,
      confidence: 0.95,
      region: "GCC",
      entities: [raw.exchange],
      timestamp: raw.timestamp,
      impact_vector: {
        aviation: severity * 0.3,
        energy: severity * 0.5,
        maritime: severity * 0.2,
        finance: severity * 1.0,
        insurance: severity * 0.4,
      },
      source: "market-data",
      sourceCredibility: 0.98,
      gccRelevance: 0.90,
      confirmation: 0.80,
    };
  },
};

/* ── Signal Summary ── */

export interface SignalSummary {
  totalSignals: number;
  avgSeverity: number;
  topSignals: LiveSignal[];
  byType: Record<string, number>;
  byRegion: Record<string, number>;
  compositeScore: number;
}

export function summarizeSignals(signals: LiveSignal[]): SignalSummary {
  if (signals.length === 0) {
    return {
      totalSignals: 0,
      avgSeverity: 0,
      topSignals: [],
      byType: {},
      byRegion: {},
      compositeScore: 0,
    };
  }

  const scored = signals.map((s) => ({ signal: s, score: scoreSignal(s) }));
  scored.sort((a, b) => b.score - a.score);

  const byType: Record<string, number> = {};
  const byRegion: Record<string, number> = {};
  let totalSeverity = 0;

  for (const s of signals) {
    byType[s.type] = (byType[s.type] ?? 0) + 1;
    byRegion[s.region] = (byRegion[s.region] ?? 0) + 1;
    totalSeverity += s.severity;
  }

  const compositeScore = scored.slice(0, 5).reduce((sum, s) => sum + s.score, 0) / Math.min(scored.length, 5);

  return {
    totalSignals: signals.length,
    avgSeverity: totalSeverity / signals.length,
    topSignals: scored.slice(0, 10).map((s) => s.signal),
    byType,
    byRegion,
    compositeScore,
  };
}
