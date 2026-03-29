/* ── Demo Scenarios ──
   Pre-built propagation scenarios for demonstration.
   Each scenario defines:
   - Signal inputs (source nodes, severity, timing)
   - Expected propagation cascade
   - Narrative events for the timeline

   "Gulf Airspace Disruption" is the benchmark scenario. */

import { propagate, propagateMultiSignal } from "@/lib/engine/propagation";
import { calculateInsuranceExposure } from "@/lib/engine/insurance";
import { generateDecision } from "@/lib/engine/decisionEngine";
import { summarizeSignals, type LiveSignal } from "@/lib/engine/signals";
import { buildPlaybackFrames, type PlaybackFrame, DEFAULT_PLAYBACK_CONFIG } from "./propagationPlayback";
import { ALL_GCC_NODES } from "@/lib/map/data/gccNodes";
import { computeDecisionClarity, type DecisionClarityResult } from "@/lib/decision/decisionClarity";
import { computeInsuranceVisualization, type InsuranceVisualizationResult } from "@/lib/insurance/insuranceVisualization";

/* ── Scenario Definition ── */

export interface DemoScenario {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  signals: DemoSignal[];
  narrativeEvents: NarrativeEvent[];
  expectedDuration: number; // hours
}

export interface DemoSignal {
  nodeId: string;
  score: number;
  hoursElapsed: number;
  label: string;
}

export interface NarrativeEvent {
  hour: number;
  normalizedTime: number;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  severity: "info" | "warning" | "critical";
  relatedNodes: string[];
}

/* ── Computed Demo Result ── */

export interface DemoResult {
  scenario: DemoScenario;
  frames: PlaybackFrame[];
  narrativeEvents: NarrativeEvent[];
  signalSummary: ReturnType<typeof summarizeSignals>;
  propagation: ReturnType<typeof propagateMultiSignal>;
  propagationResult: ReturnType<typeof propagateMultiSignal>;
  insuranceResult: ReturnType<typeof calculateInsuranceExposure>;
  decisionResult: ReturnType<typeof generateDecision>;
  decisionClarity: DecisionClarityResult;
  insuranceViz: InsuranceVisualizationResult;
  nodeCoords: Map<string, { lat: number; lng: number }>;
  /* ── Mathematical Output Fields ── */
  runId: string;                    // unique run identifier for traceability
  totalLoss: number;                // estimated total system impact energy
  affectedSectors: string[];        // list of impacted sectors
  topDrivers: Array<{ nodeId: string; label: string; impact: number }>;
  propagationChain: string[];       // causal chain labels
  confidence: number;               // 0-1 model confidence
  explanation: string;              // human-readable causal summary
}

/* ── Gulf Airspace Disruption ──
   Benchmark scenario: Iranian military activity triggers
   Gulf airspace restrictions → cascading aviation + energy + trade disruption.

   Signal → HORMUZ → Gulf airports activate → airlines disrupted →
   cargo/logistics affected → energy supply chain stressed →
   insurance pressure builds → decision escalation */

export const GULF_AIRSPACE_DISRUPTION: DemoScenario = {
  id: "gulf-airspace-disruption",
  title: {
    en: "Gulf Airspace Disruption",
    ar: "اضطراب المجال الجوي الخليجي",
  },
  description: {
    en: "Iranian military escalation triggers Gulf airspace restrictions, cascading through aviation, energy, and maritime sectors across all GCC states.",
    ar: "تصعيد عسكري إيراني يؤدي إلى فرض قيود على المجال الجوي الخليجي، مما يتسبب في تأثيرات متتالية عبر قطاعات الطيران والطاقة والبحرية في جميع دول مجلس التعاون.",
  },
  signals: [
    // Primary signal: Strait of Hormuz threat
    { nodeId: "HORMUZ", score: 0.85, hoursElapsed: 0, label: "Hormuz Strait military activity detected" },
    // Secondary: Gulf airspace restriction notice
    { nodeId: "DXB", score: 0.70, hoursElapsed: 2, label: "UAE NOTAM: Gulf airspace restricted" },
    // Tertiary: Energy infrastructure alert
    { nodeId: "ARAMCO", score: 0.55, hoursElapsed: 4, label: "Saudi Aramco heightened security posture" },
    // Market signal
    { nodeId: "TADAWUL", score: 0.40, hoursElapsed: 6, label: "Tadawul trading volume spike" },
  ],
  narrativeEvents: [
    {
      hour: 0,
      normalizedTime: 0,
      title: { en: "Signal Detected", ar: "اكتشاف إشارة" },
      description: {
        en: "Iranian naval activity detected near Strait of Hormuz. Elevated military posture confirmed by multiple sources.",
        ar: "رصد نشاط بحري إيراني بالقرب من مضيق هرمز. تأكيد الوضع العسكري المتصاعد من مصادر متعددة.",
      },
      severity: "warning",
      relatedNodes: ["HORMUZ"],
    },
    {
      hour: 2,
      normalizedTime: 2 / 72,
      title: { en: "Airspace Restrictions", ar: "قيود المجال الجوي" },
      description: {
        en: "UAE issues NOTAM restricting Gulf airspace. Dubai International and Abu Dhabi airports activate contingency routing.",
        ar: "الإمارات تصدر إشعار للملاحين بتقييد المجال الجوي الخليجي. مطارا دبي وأبوظبي يفعلان مسارات الطوارئ.",
      },
      severity: "critical",
      relatedNodes: ["DXB", "AUH", "DWC"],
    },
    {
      hour: 4,
      normalizedTime: 4 / 72,
      title: { en: "Energy Alert", ar: "تنبيه الطاقة" },
      description: {
        en: "Saudi Aramco activates heightened security across Eastern Province facilities. Oil export monitoring elevated.",
        ar: "أرامكو السعودية تفعل حالة الأمن المرتفع في منشآت المنطقة الشرقية. رفع مستوى مراقبة صادرات النفط.",
      },
      severity: "warning",
      relatedNodes: ["ARAMCO", "RAS_TANURA", "JUBAIL"],
    },
    {
      hour: 6,
      normalizedTime: 6 / 72,
      title: { en: "Market Impact", ar: "تأثير السوق" },
      description: {
        en: "Regional exchanges see volume spikes. Tadawul, DFM, and ADX showing elevated volatility in energy and aviation sectors.",
        ar: "البورصات الإقليمية تشهد ارتفاعاً في حجم التداول. تداول وسوق دبي وأبوظبي تظهر تقلبات مرتفعة.",
      },
      severity: "warning",
      relatedNodes: ["TADAWUL", "DFM", "ADX"],
    },
    {
      hour: 12,
      normalizedTime: 12 / 72,
      title: { en: "Cascade Expansion", ar: "توسع التأثير المتتالي" },
      description: {
        en: "Propagation reaches Kuwait, Bahrain, and Oman airports. Maritime insurance rates spike for Gulf transits.",
        ar: "التأثير يصل إلى مطارات الكويت والبحرين وعمان. أسعار التأمين البحري ترتفع لعبور الخليج.",
      },
      severity: "critical",
      relatedNodes: ["KWI", "BAH", "MCT"],
    },
    {
      hour: 24,
      normalizedTime: 24 / 72,
      title: { en: "Full Regional Impact", ar: "التأثير الإقليمي الكامل" },
      description: {
        en: "All GCC airports operating under contingency. Cargo logistics delayed 48-72h. Insurance underwriters activating exclusion clauses.",
        ar: "جميع مطارات الخليج تعمل بخطط الطوارئ. تأخر الشحن 48-72 ساعة. شركات التأمين تفعل شروط الاستثناء.",
      },
      severity: "critical",
      relatedNodes: ["DXB", "DOH", "RUH", "KWI", "BAH", "MCT"],
    },
    {
      hour: 48,
      normalizedTime: 48 / 72,
      title: { en: "Decision Point", ar: "نقطة القرار" },
      description: {
        en: "Risk assessment indicates activate_response threshold breached. Emergency protocol evaluation underway.",
        ar: "تقييم المخاطر يشير إلى تجاوز عتبة تفعيل الاستجابة. جاري تقييم بروتوكول الطوارئ.",
      },
      severity: "critical",
      relatedNodes: [],
    },
  ],
  expectedDuration: 72,
};

/* ── Hormuz Closure ──
   Full maritime chokepoint shutdown → energy export halt → port disruption →
   insurance spike → financial stress → food import crisis → economic cascade */

export const HORMUZ_CLOSURE: DemoScenario = {
  id: "hormuz-closure",
  title: { en: "Strait of Hormuz Closure", ar: "إغلاق مضيق هرمز" },
  description: {
    en: "Full closure of Strait of Hormuz disrupts 21% of global oil transit, cascading through energy, maritime, food imports, utilities, and financial markets across all GCC states.",
    ar: "إغلاق كامل لمضيق هرمز يعطل 21% من نقل النفط العالمي، مما يتسبب في تأثيرات متتالية عبر الطاقة والبحرية والغذاء والمرافق والأسواق المالية.",
  },
  signals: [
    { nodeId: "HORMUZ", score: 0.95, hoursElapsed: 0, label: "Strait of Hormuz closure confirmed" },
    { nodeId: "RAS_TANURA", score: 0.85, hoursElapsed: 2, label: "Ras Tanura exports halted" },
    { nodeId: "JEBEL_ALI", score: 0.80, hoursElapsed: 4, label: "Jebel Ali Port inbound traffic suspended" },
    { nodeId: "ARAMCO", score: 0.70, hoursElapsed: 6, label: "Aramco activates contingency routing via Yanbu" },
    { nodeId: "FOOD_IMPORT_GCC", score: 0.65, hoursElapsed: 8, label: "GCC food import channel disrupted" },
  ],
  narrativeEvents: [
    { hour: 0, normalizedTime: 0, title: { en: "Closure Confirmed", ar: "تأكيد الإغلاق" }, description: { en: "Strait of Hormuz declared closed to commercial traffic. 21% of global oil transit halted.", ar: "إعلان إغلاق مضيق هرمز أمام حركة الملاحة التجارية. توقف 21% من نقل النفط العالمي." }, severity: "critical", relatedNodes: ["HORMUZ"] },
    { hour: 4, normalizedTime: 4/72, title: { en: "Port Disruption", ar: "تعطل الموانئ" }, description: { en: "Gulf ports from Jebel Ali to Dammam report suspension of inbound cargo. Container backlogs forming.", ar: "موانئ الخليج من جبل علي إلى الدمام تعلن تعليق استقبال الشحن. تراكم الحاويات." }, severity: "critical", relatedNodes: ["JEBEL_ALI", "DAMMAM_PORT", "HAMAD_PORT"] },
    { hour: 8, normalizedTime: 8/72, title: { en: "Food Supply Alert", ar: "تنبيه الإمداد الغذائي" }, description: { en: "GCC food import channels disrupted. Cold chain logistics under pressure. 48h buffer estimated.", ar: "قنوات استيراد الغذاء معطلة. ضغط على سلاسل التبريد. احتياطي 48 ساعة." }, severity: "critical", relatedNodes: ["FOOD_IMPORT_GCC", "COLD_CHAIN_UAE"] },
    { hour: 24, normalizedTime: 24/72, title: { en: "Financial Cascade", ar: "التأثير المالي المتتالي" }, description: { en: "Regional exchanges in free fall. SAMA and CBUAE activate emergency liquidity measures.", ar: "البورصات الإقليمية تتراجع بشدة. ساما والمركزي الإماراتي يفعلان إجراءات السيولة." }, severity: "critical", relatedNodes: ["TADAWUL", "DFM", "SAMA", "CBUAE"] },
    { hour: 48, normalizedTime: 48/72, title: { en: "Utility Stress", ar: "ضغط المرافق" }, description: { en: "Gas supply to power plants disrupted. Desalination output declining. Rolling brownouts in some areas.", ar: "إمدادات الغاز لمحطات الطاقة معطلة. انخفاض إنتاج التحلية. انقطاعات متقطعة." }, severity: "critical", relatedNodes: ["SEC", "DEWA", "KAHRAMAA", "DESAL_GCC"] },
  ],
  expectedDuration: 72,
};

/* ── Port Disruption ──
   Major port shutdown → logistics halt → food import crisis → economic pressure */

export const PORT_DISRUPTION: DemoScenario = {
  id: "port-disruption",
  title: { en: "Major Port Disruption", ar: "تعطل الموانئ الرئيسية" },
  description: {
    en: "Simultaneous disruption at Jebel Ali and Dammam ports cascading through logistics, food supply, and regional trade networks.",
    ar: "تعطل متزامن في ميناء جبل علي والدمام يؤثر على سلاسل اللوجستيات والإمداد الغذائي والتجارة الإقليمية.",
  },
  signals: [
    { nodeId: "JEBEL_ALI", score: 0.85, hoursElapsed: 0, label: "Jebel Ali Port operations suspended" },
    { nodeId: "DAMMAM_PORT", score: 0.75, hoursElapsed: 2, label: "King Abdulaziz Port Dammam disrupted" },
    { nodeId: "FOOD_IMPORT_GCC", score: 0.70, hoursElapsed: 6, label: "Food import channels under stress" },
  ],
  narrativeEvents: [
    { hour: 0, normalizedTime: 0, title: { en: "Port Shutdown", ar: "إغلاق الميناء" }, description: { en: "Jebel Ali Port operations suspended due to critical infrastructure failure.", ar: "تعليق عمليات ميناء جبل علي بسبب عطل بنية تحتية حرج." }, severity: "critical", relatedNodes: ["JEBEL_ALI"] },
    { hour: 6, normalizedTime: 6/72, title: { en: "Supply Chain Pressure", ar: "ضغط سلاسل الإمداد" }, description: { en: "GCC food imports disrupted. Logistics hubs reporting backlogs.", ar: "واردات الغذاء معطلة. مراكز اللوجستيات تعلن تراكم الشحنات." }, severity: "critical", relatedNodes: ["FOOD_IMPORT_GCC", "DWL"] },
    { hour: 24, normalizedTime: 24/72, title: { en: "Economic Impact", ar: "التأثير الاقتصادي" }, description: { en: "Trade finance under stress. Regional exchanges reflecting supply chain disruption.", ar: "تمويل التجارة تحت ضغط. البورصات تعكس تعطل سلاسل الإمداد." }, severity: "warning", relatedNodes: ["DFM", "TADAWUL"] },
  ],
  expectedDuration: 72,
};

/* ── Oil Price Shock ──
   Sudden oil price collapse → energy sector stress → fiscal pressure → financial cascade */

export const OIL_SHOCK: DemoScenario = {
  id: "oil-shock",
  title: { en: "Oil Price Shock", ar: "صدمة أسعار النفط" },
  description: {
    en: "Sudden 40% oil price collapse triggering energy sector stress, fiscal pressure on GCC sovereigns, and financial market cascade.",
    ar: "انهيار مفاجئ بنسبة 40% في أسعار النفط يؤدي إلى ضغط على قطاع الطاقة والمالية العامة والأسواق المالية الخليجية.",
  },
  signals: [
    { nodeId: "ARAMCO", score: 0.80, hoursElapsed: 0, label: "Saudi Aramco valuation shock" },
    { nodeId: "ADNOC", score: 0.70, hoursElapsed: 1, label: "ADNOC revenue projections slashed" },
    { nodeId: "KPC", score: 0.65, hoursElapsed: 1, label: "KPC export revenue declining" },
    { nodeId: "TADAWUL", score: 0.75, hoursElapsed: 2, label: "Tadawul energy sector selloff" },
  ],
  narrativeEvents: [
    { hour: 0, normalizedTime: 0, title: { en: "Price Collapse", ar: "انهيار الأسعار" }, description: { en: "Global oil prices drop 40%. GCC energy majors face immediate revenue impact.", ar: "أسعار النفط العالمية تنخفض 40%. شركات الطاقة الخليجية تواجه تأثيراً مباشراً على الإيرادات." }, severity: "critical", relatedNodes: ["ARAMCO", "ADNOC", "KPC"] },
    { hour: 4, normalizedTime: 4/72, title: { en: "Market Selloff", ar: "موجة بيع" }, description: { en: "GCC exchanges see broad-based selloff. Banking sector under pressure.", ar: "بورصات الخليج تشهد موجة بيع واسعة. القطاع المصرفي تحت ضغط." }, severity: "critical", relatedNodes: ["TADAWUL", "DFM", "QSE"] },
    { hour: 24, normalizedTime: 24/72, title: { en: "Fiscal Stress", ar: "ضغط مالي" }, description: { en: "Sovereign budgets face $30B+ shortfall. Utility subsidies under review.", ar: "ميزانيات الدول تواجه عجز يتجاوز 30 مليار دولار. إعادة النظر في دعم المرافق." }, severity: "warning", relatedNodes: ["GOV_KSA", "GOV_UAE", "GOV_KWT"] },
  ],
  expectedDuration: 72,
};

/* ── Banking Stress ──
   Systemic banking stress → credit freeze → trade finance halt → economic cascade */

export const BANKING_STRESS: DemoScenario = {
  id: "banking-stress",
  title: { en: "GCC Banking Stress", ar: "ضغوط مصرفية خليجية" },
  description: {
    en: "Systemic banking stress across GCC triggered by liquidity crisis, cascading through trade finance and economic activity.",
    ar: "أزمة سيولة تؤدي إلى ضغوط مصرفية منهجية عبر دول مجلس التعاون، مما يؤثر على تمويل التجارة والنشاط الاقتصادي.",
  },
  signals: [
    { nodeId: "SNB", score: 0.75, hoursElapsed: 0, label: "Saudi National Bank liquidity stress" },
    { nodeId: "FAB", score: 0.70, hoursElapsed: 2, label: "First Abu Dhabi Bank credit tightening" },
    { nodeId: "QNB", score: 0.65, hoursElapsed: 4, label: "QNB interbank lending freeze" },
    { nodeId: "SAMA", score: 0.50, hoursElapsed: 6, label: "SAMA emergency liquidity injection" },
  ],
  narrativeEvents: [
    { hour: 0, normalizedTime: 0, title: { en: "Liquidity Crisis", ar: "أزمة سيولة" }, description: { en: "Major GCC banks report liquidity stress. Interbank lending rates spike.", ar: "بنوك خليجية كبرى تعلن ضغوط سيولة. ارتفاع حاد في أسعار الإقراض بين البنوك." }, severity: "critical", relatedNodes: ["SNB", "FAB", "QNB"] },
    { hour: 12, normalizedTime: 12/72, title: { en: "Central Bank Response", ar: "استجابة البنوك المركزية" }, description: { en: "SAMA, CBUAE, and QCB activate emergency liquidity facilities.", ar: "ساما والمركزي الإماراتي والمركزي القطري يفعلون تسهيلات السيولة الطارئة." }, severity: "warning", relatedNodes: ["SAMA", "CBUAE", "QCB"] },
    { hour: 48, normalizedTime: 48/72, title: { en: "Trade Finance Freeze", ar: "تجميد تمويل التجارة" }, description: { en: "Letters of credit suspended. Import/export operations slowing across GCC.", ar: "تعليق خطابات الاعتماد. تباطؤ عمليات الاستيراد والتصدير." }, severity: "critical", relatedNodes: ["DIFC", "BOURSA_KWT"] },
  ],
  expectedDuration: 72,
};

/* ── Tourism Collapse ──
   Airport disruption + security event → tourism demand crash → hospitality/economic cascade */

export const TOURISM_COLLAPSE: DemoScenario = {
  id: "tourism-collapse",
  title: { en: "GCC Tourism Collapse", ar: "انهيار السياحة الخليجية" },
  description: {
    en: "Major security event triggers travel advisories across GCC, collapsing tourism demand and cascading through hospitality and aviation sectors.",
    ar: "حدث أمني كبير يؤدي إلى تحذيرات سفر عبر الخليج، مما ينهار الطلب السياحي ويؤثر على قطاعات الضيافة والطيران.",
  },
  signals: [
    { nodeId: "DXB", score: 0.80, hoursElapsed: 0, label: "Dubai International departure cancellations surge" },
    { nodeId: "TOURISM_UAE", score: 0.85, hoursElapsed: 2, label: "UAE tourism bookings collapse" },
    { nodeId: "TOURISM_KSA", score: 0.70, hoursElapsed: 4, label: "KSA tourism demand drops sharply" },
    { nodeId: "DOH", score: 0.65, hoursElapsed: 6, label: "Hamad International traffic declining" },
  ],
  narrativeEvents: [
    { hour: 0, normalizedTime: 0, title: { en: "Travel Advisories Issued", ar: "إصدار تحذيرات السفر" }, description: { en: "Multiple countries issue GCC travel advisories. Departure cancellations surge at DXB.", ar: "دول متعددة تصدر تحذيرات سفر للخليج. إلغاء رحلات مغادرة كبير في دبي." }, severity: "critical", relatedNodes: ["DXB", "DOH", "RUH"] },
    { hour: 6, normalizedTime: 6/72, title: { en: "Tourism Demand Crash", ar: "انهيار الطلب السياحي" }, description: { en: "Hotel occupancy rates plummet. Event cancellations across UAE and KSA.", ar: "معدلات إشغال الفنادق تنخفض بشدة. إلغاء فعاليات في الإمارات والسعودية." }, severity: "critical", relatedNodes: ["TOURISM_UAE", "TOURISM_KSA", "TOURISM_QAT"] },
    { hour: 24, normalizedTime: 24/72, title: { en: "Aviation Revenue Impact", ar: "تأثير إيرادات الطيران" }, description: { en: "Airlines report 40%+ booking cancellations. Emirates, Qatar Airways cut capacity.", ar: "شركات الطيران تعلن إلغاء 40%+ من الحجوزات. طيران الإمارات والقطرية تخفضان السعة." }, severity: "warning", relatedNodes: ["EK", "QR", "SV"] },
    { hour: 48, normalizedTime: 48/72, title: { en: "Economic Spillover", ar: "التأثير الاقتصادي" }, description: { en: "Hospitality sector losses mounting. GDP impact estimates at 0.5-1.2% for UAE, 0.3-0.8% for KSA.", ar: "خسائر قطاع الضيافة تتراكم. تأثير الناتج المحلي يقدر بـ 0.5-1.2% للإمارات." }, severity: "warning", relatedNodes: ["DFM", "TADAWUL"] },
  ],
  expectedDuration: 72,
};

/* ── Electricity Disruption ──
   Power grid failure → desalination halt → water stress → economic/social cascade */

export const ELECTRICITY_DISRUPTION: DemoScenario = {
  id: "electricity-disruption",
  title: { en: "GCC Electricity Grid Disruption", ar: "تعطل شبكة الكهرباء الخليجية" },
  description: {
    en: "Cascading power grid failure disrupts electricity supply, halts desalination, and triggers water stress across GCC.",
    ar: "عطل متتالي في شبكة الكهرباء يعطل إمدادات الطاقة ويوقف التحلية ويسبب أزمة مياه عبر الخليج.",
  },
  signals: [
    { nodeId: "SEC", score: 0.80, hoursElapsed: 0, label: "Saudi Electricity Co grid failure" },
    { nodeId: "DEWA", score: 0.75, hoursElapsed: 2, label: "DEWA emergency load shedding" },
    { nodeId: "DESAL_GCC", score: 0.85, hoursElapsed: 4, label: "Desalination output declining critically" },
    { nodeId: "KAHRAMAA", score: 0.65, hoursElapsed: 6, label: "Kahramaa activates emergency protocol" },
  ],
  narrativeEvents: [
    { hour: 0, normalizedTime: 0, title: { en: "Grid Failure", ar: "عطل الشبكة" }, description: { en: "Saudi Electricity Co reports cascading grid failure across Eastern Province.", ar: "شركة الكهرباء السعودية تعلن عطل متتالي في المنطقة الشرقية." }, severity: "critical", relatedNodes: ["SEC"] },
    { hour: 4, normalizedTime: 4/72, title: { en: "Desalination Crisis", ar: "أزمة التحلية" }, description: { en: "Desalination plants operating at 30% capacity. Water reserves at 72h threshold.", ar: "محطات التحلية تعمل بطاقة 30%. احتياطي المياه عند حد 72 ساعة." }, severity: "critical", relatedNodes: ["DESAL_GCC"] },
    { hour: 12, normalizedTime: 12/72, title: { en: "Utility Cascade", ar: "تتالي المرافق" }, description: { en: "DEWA and Kahramaa implement rolling blackouts. Business operations disrupted.", ar: "ديوا وكهرماء تطبقان انقطاعات متناوبة. تعطل العمليات التجارية." }, severity: "critical", relatedNodes: ["DEWA", "KAHRAMAA", "MEW_KWT"] },
    { hour: 48, normalizedTime: 48/72, title: { en: "Tourism & Economic Impact", ar: "تأثير السياحة والاقتصاد" }, description: { en: "Hotels and hospitality sector severely impacted. Tourism demand collapses. Markets decline.", ar: "فنادق وقطاع الضيافة متأثرون بشدة. الطلب السياحي ينهار. الأسواق تتراجع." }, severity: "warning", relatedNodes: ["TOURISM_UAE", "TOURISM_KSA", "DFM"] },
  ],
  expectedDuration: 72,
};

/* ── Water Stress ──
   Desalination failure → water crisis → public stability concern → economic cascade */

export const WATER_STRESS: DemoScenario = {
  id: "water-stress",
  title: { en: "GCC Water Stress Crisis", ar: "أزمة إجهاد المياه الخليجية" },
  description: {
    en: "Critical desalination failure triggers water stress across GCC, threatening public stability and economic continuity.",
    ar: "عطل حرج في التحلية يؤدي إلى أزمة مياه عبر الخليج، مهدداً الاستقرار العام واستمرارية الاقتصاد.",
  },
  signals: [
    { nodeId: "DESAL_GCC", score: 0.90, hoursElapsed: 0, label: "GCC desalination network critical failure" },
    { nodeId: "MEW_KWT", score: 0.75, hoursElapsed: 4, label: "Kuwait MEW declares water emergency" },
    { nodeId: "DEWA", score: 0.70, hoursElapsed: 6, label: "DEWA water rationing initiated" },
  ],
  narrativeEvents: [
    { hour: 0, normalizedTime: 0, title: { en: "Desalination Failure", ar: "عطل التحلية" }, description: { en: "Multiple desalination plants offline. GCC water production at 40% capacity.", ar: "عدة محطات تحلية خارج الخدمة. إنتاج المياه الخليجي عند 40%." }, severity: "critical", relatedNodes: ["DESAL_GCC"] },
    { hour: 12, normalizedTime: 12/72, title: { en: "Rationing Begins", ar: "بدء التقنين" }, description: { en: "Kuwait and UAE begin water rationing. Public concern rising.", ar: "الكويت والإمارات تبدآن تقنين المياه. ارتفاع القلق العام." }, severity: "critical", relatedNodes: ["MEW_KWT", "DEWA"] },
    { hour: 48, normalizedTime: 48/72, title: { en: "Economic Cascade", ar: "التأثير الاقتصادي" }, description: { en: "Business operations disrupted. Tourism demand drops. Markets under pressure.", ar: "تعطل العمليات التجارية. الطلب السياحي ينخفض. الأسواق تحت ضغط." }, severity: "warning", relatedNodes: ["TOURISM_UAE", "DFM", "GOV_KWT"] },
  ],
  expectedDuration: 72,
};

/* ── All Scenarios Registry ── */
export const ALL_SCENARIOS: DemoScenario[] = [
  GULF_AIRSPACE_DISRUPTION,
  HORMUZ_CLOSURE,
  PORT_DISRUPTION,
  OIL_SHOCK,
  BANKING_STRESS,
  TOURISM_COLLAPSE,
  ELECTRICITY_DISRUPTION,
  WATER_STRESS,
];

/* ── Run Demo Scenario ──
   Executes the propagation engine with the scenario signals,
   builds playback frames, and returns the complete result. */

export function runDemoScenario(scenario: DemoScenario = GULF_AIRSPACE_DISRUPTION): DemoResult {
  // Build node coordinate map
  const nodeCoords = new Map<string, { lat: number; lng: number }>();
  for (const node of ALL_GCC_NODES) {
    nodeCoords.set(node.id, { lat: node.coord.lat, lng: node.coord.lng });
  }

  // Run multi-signal propagation
  const signalInputs = scenario.signals.map((s) => ({
    nodeId: s.nodeId,
    score: s.score,
    hoursElapsed: s.hoursElapsed,
  }));

  const propagationResult = propagateMultiSignal(signalInputs);

  // Build sector impacts for insurance calculation
  const sectorMap = new Map<string, number>();
  for (const node of propagationResult.affectedNodes) {
    const current = sectorMap.get(node.sector) ?? 0;
    sectorMap.set(node.sector, Math.max(current, node.impactScore));
  }

  const sectorImpacts = {
    aviation: sectorMap.get("aviation") ?? 0,
    energy: sectorMap.get("energy") ?? 0,
    maritime: sectorMap.get("maritime") ?? 0,
    finance: sectorMap.get("finance") ?? 0,
  };

  // Calculate insurance exposure
  const insuranceResult = calculateInsuranceExposure(propagationResult, sectorImpacts);

  // Build synthetic signal summary for decision engine
  const mockSignals: LiveSignal[] = scenario.signals.map((s) => ({
    id: `demo-${s.nodeId}`,
    type: "news" as const,
    title: s.label,
    severity: s.score,
    confidence: 0.8,
    region: "GCC",
    entities: [s.nodeId],
    impact_vector: { aviation: 0.8, energy: 0.7, maritime: 0.6, finance: 0.5, insurance: 0.4 },
    sourceCredibility: 0.85,
    gccRelevance: 0.9,
    confirmation: scenario.signals.length > 1 ? 0.7 : 0.3,
    timestamp: new Date(Date.now() - s.hoursElapsed * 3_600_000).toISOString(),
    source: "DEMO",
  }));

  const signalSummary = summarizeSignals(mockSignals);
  const decisionResult = generateDecision(propagationResult, insuranceResult, signalSummary);

  // Compute decision clarity
  const decisionClarity = computeDecisionClarity(signalSummary, propagationResult, insuranceResult, decisionResult);

  // Compute insurance visualization
  const insuranceViz = computeInsuranceVisualization(insuranceResult, propagationResult, null, nodeCoords);

  // Build playback frames
  const config = {
    ...DEFAULT_PLAYBACK_CONFIG,
    totalHours: scenario.expectedDuration,
  };
  const frames = buildPlaybackFrames(propagationResult, nodeCoords, config);

  // Normalize narrative events to match frame timing
  const narrativeEvents = scenario.narrativeEvents.map((ev) => ({
    ...ev,
    normalizedTime: ev.hour / scenario.expectedDuration,
  }));

  // Extract mathematical output fields from propagation result
  const { sectorAggregation, explanation: propExplanation } = propagationResult;
  const runId = `VIVO-${scenario.id}-${Date.now().toString(36)}`;
  const totalLoss = propagationResult.totalEnergy;
  const affectedSectors = sectorAggregation.map((s) => s.sector);
  const topDrivers = propExplanation.topDrivers;
  const propagationChain = propExplanation.chain;
  const confidence = propExplanation.confidence;
  const explanationText = propExplanation.summary;

  return {
    scenario,
    frames,
    narrativeEvents,
    signalSummary,
    propagation: propagationResult,
    propagationResult,
    insuranceResult,
    decisionResult,
    decisionClarity,
    insuranceViz,
    nodeCoords,
    runId,
    totalLoss,
    affectedSectors,
    topDrivers,
    propagationChain,
    confidence,
    explanation: explanationText,
  };
}
