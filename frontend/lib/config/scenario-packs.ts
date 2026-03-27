export const GCC_AIRPORTS = [
  { code: "KWI", name: "Kuwait International", country: "Kuwait", city: "Kuwait City" },
  { code: "RUH", name: "King Khalid International", country: "Saudi Arabia", city: "Riyadh" },
  { code: "DMM", name: "King Fahd International", country: "Saudi Arabia", city: "Dammam" },
  { code: "JED", name: "King Abdulaziz International", country: "Saudi Arabia", city: "Jeddah" },
  { code: "DXB", name: "Dubai International", country: "UAE", city: "Dubai" },
  { code: "AUH", name: "Zayed International", country: "UAE", city: "Abu Dhabi" },
  { code: "DOH", name: "Hamad International", country: "Qatar", city: "Doha" },
  { code: "BAH", name: "Bahrain International", country: "Bahrain", city: "Manama" },
  { code: "MCT", name: "Muscat International", country: "Oman", city: "Muscat" },
] as const;

export const CRISIS_BRANCHES = [
  { id: "baseline_tension", label: "Baseline Tension", description: "Ongoing geopolitical friction without escalation" },
  { id: "contained_strike", label: "Contained Strike", description: "Limited military strike with contained response" },
  { id: "regional_escalation", label: "Regional Escalation", description: "Multi-front escalation across GCC theater" },
  { id: "maritime_disruption", label: "Maritime Disruption", description: "Strait of Hormuz blockade / tanker attacks" },
  { id: "infrastructure_shock", label: "Infrastructure Shock", description: "Critical infrastructure targeted (refineries, ports)" },
  { id: "diplomatic_deescalation", label: "Diplomatic De-escalation", description: "Active diplomacy reducing tensions" },
] as const;

export const CRISIS_LAYERS = [
  { id: "geopolitical", label: "Geopolitical", color: "#ef4444" },
  { id: "energy", label: "Energy", color: "#f97316" },
  { id: "aviation", label: "Aviation", color: "#3b82f6" },
  { id: "trade", label: "Trade / E-Commerce", color: "#22d3ee" },
  { id: "social", label: "Social / Media", color: "#a855f7" },
  { id: "macro", label: "Financial / Macro", color: "#eab308" },
] as const;

export const US_IRAN_GCC_PACK = {
  scenario_id: "us_iran_gcc_escalation",
  title_en: "US–Iran Conflict Escalation",
  title_ar: "تصعيد النزاع الأمريكي-الإيراني",
  description_en: "US–Iran military escalation triggers regional instability across the GCC, affecting oil supply chains, airspace, logistics, and financial markets.",
  description_ar: "تصعيد عسكري بين أمريكا وإيران يؤدي إلى عدم استقرار إقليمي في الخليج، يؤثر على سلاسل إمداد النفط، المجال الجوي، اللوجستيات، والأسواق المالية.",
} as const;
