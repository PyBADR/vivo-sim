/* ── Control Room Bilingual Copy ──
   EN/AR copy pairs for the Palantir-class command center.
   Every string in the UI must come from here — no hardcoded text. */

import type { CopyPair } from "@/lib/types/i18n";

export const crCopy = {
  /* ── Top Command Bar ── */
  commandBar: {
    title: { en: "VIVO SIM — Regional Command Center", ar: "فيفو سيم — مركز القيادة الإقليمي" } as CopyPair,
    scenario: { en: "Active Scenario", ar: "السيناريو النشط" } as CopyPair,
    threat: { en: "Threat Level", ar: "مستوى التهديد" } as CopyPair,
    incidents: { en: "Active Incidents", ar: "الحوادث النشطة" } as CopyPair,
    phase: { en: "Phase", ar: "المرحلة" } as CopyPair,
    confidence: { en: "Confidence", ar: "الثقة" } as CopyPair,
    loadScenario: { en: "Load Scenario", ar: "تحميل السيناريو" } as CopyPair,
    loading: { en: "Loading...", ar: "جارٍ التحميل..." } as CopyPair,
  },

  /* ── Threat Levels ── */
  threats: {
    critical: { en: "CRITICAL", ar: "حرج" } as CopyPair,
    high: { en: "HIGH", ar: "مرتفع" } as CopyPair,
    elevated: { en: "ELEVATED", ar: "مرتفع" } as CopyPair,
    guarded: { en: "GUARDED", ar: "محمي" } as CopyPair,
    low: { en: "LOW", ar: "منخفض" } as CopyPair,
  },

  /* ── Phases ── */
  phases: {
    detection: { en: "Detection", ar: "الكشف" } as CopyPair,
    assessment: { en: "Assessment", ar: "التقييم" } as CopyPair,
    response: { en: "Response", ar: "الاستجابة" } as CopyPair,
    recovery: { en: "Recovery", ar: "التعافي" } as CopyPair,
    post_incident: { en: "Post-Incident", ar: "ما بعد الحادث" } as CopyPair,
  },

  /* ── Left Situation Rail ── */
  situation: {
    title: { en: "Situation Awareness", ar: "الوعي بالموقف" } as CopyPair,
    incidentBrief: { en: "Incident Brief", ar: "موجز الحادث" } as CopyPair,
    affectedCountries: { en: "Affected Countries", ar: "الدول المتأثرة" } as CopyPair,
    primarySector: { en: "Primary Sector", ar: "القطاع الرئيسي" } as CopyPair,
    keyMetrics: { en: "Key Metrics", ar: "المؤشرات الرئيسية" } as CopyPair,
    noIncident: { en: "No active incident. Load a scenario to begin.", ar: "لا يوجد حادث نشط. قم بتحميل سيناريو للبدء." } as CopyPair,
    layers: { en: "Geospatial Layers", ar: "الطبقات الجغرافية" } as CopyPair,
  },

  /* ── Center Globe ── */
  globe: {
    title: { en: "Operational Theater", ar: "مسرح العمليات" } as CopyPair,
    noData: { en: "Load a scenario to populate the operational theater.", ar: "قم بتحميل سيناريو لتعبئة مسرح العمليات." } as CopyPair,
    zoomIn: { en: "Zoom In", ar: "تكبير" } as CopyPair,
    zoomOut: { en: "Zoom Out", ar: "تصغير" } as CopyPair,
    resetView: { en: "Reset View", ar: "إعادة العرض" } as CopyPair,
  },

  /* ── Right Decision Rail ── */
  decision: {
    title: { en: "Decision Support", ar: "دعم القرار" } as CopyPair,
    coursesOfAction: { en: "Courses of Action", ar: "مسارات العمل" } as CopyPair,
    recommended: { en: "RECOMMENDED", ar: "موصى به" } as CopyPair,
    conditional: { en: "CONDITIONAL", ar: "مشروط" } as CopyPair,
    notRecommended: { en: "NOT RECOMMENDED", ar: "غير موصى به" } as CopyPair,
    stronglyRecommended: { en: "STRONGLY RECOMMENDED", ar: "موصى به بشدة" } as CopyPair,
    riskReduction: { en: "Risk Reduction", ar: "خفض المخاطر" } as CopyPair,
    cost: { en: "Est. Cost", ar: "التكلفة المقدرة" } as CopyPair,
    timeframe: { en: "Timeframe", ar: "الإطار الزمني" } as CopyPair,
    requirements: { en: "Requirements", ar: "المتطلبات" } as CopyPair,
    kpis: { en: "Key Performance Indicators", ar: "مؤشرات الأداء الرئيسية" } as CopyPair,
    noCOA: { en: "No courses of action available. Load a scenario to generate options.", ar: "لا توجد مسارات عمل متاحة. قم بتحميل سيناريو لتوليد الخيارات." } as CopyPair,
    selectCOA: { en: "Select", ar: "اختيار" } as CopyPair,
    selected: { en: "Selected", ar: "مُختار" } as CopyPair,
    /* Decision Clarity — boardroom-grade labels */
    decisionShift: { en: "Decision Shift", ar: "تحوّل القرار" } as CopyPair,
    whyChanged: { en: "Why This Decision Changed", ar: "لماذا تغيّر هذا القرار" } as CopyPair,
    whatToDoNow: { en: "What To Do Now", ar: "ماذا يجب فعله الآن" } as CopyPair,
    affectedEntities: { en: "Affected Entities", ar: "الجهات المتأثرة" } as CopyPair,
    exposedLines: { en: "Exposed Insurance Lines", ar: "خطوط التأمين المكشوفة" } as CopyPair,
    peakImpact: { en: "Peak Impact", ar: "أعلى تأثير" } as CopyPair,
    insurancePressure: { en: "Insurance Pressure", ar: "ضغط التأمين" } as CopyPair,
    affectedNodes: { en: "Affected Nodes", ar: "العقد المتأثرة" } as CopyPair,
    decisionState: { en: "Decision State", ar: "حالة القرار" } as CopyPair,
    financialImpact: { en: "Financial Impact", ar: "الأثر المالي" } as CopyPair,
    deadline: { en: "Decision Deadline", ar: "الموعد النهائي للقرار" } as CopyPair,
    portfolioPressure: { en: "Portfolio Pressure", ar: "ضغط المحفظة" } as CopyPair,
    fraudRisk: { en: "Fraud Escalation", ar: "تصعيد الاحتيال" } as CopyPair,
    uwPosture: { en: "Underwriting", ar: "الاكتتاب" } as CopyPair,
    claimsPosture: { en: "Claims", ar: "المطالبات" } as CopyPair,
  },

  /* ── Decision States ── */
  decisionStates: {
    hold: { en: "HOLD", ar: "انتظار" } as CopyPair,
    escalate: { en: "ESCALATE", ar: "تصعيد" } as CopyPair,
    activate_response: { en: "ACTIVATE RESPONSE", ar: "تفعيل الاستجابة" } as CopyPair,
    emergency_protocol: { en: "EMERGENCY PROTOCOL", ar: "بروتوكول الطوارئ" } as CopyPair,
  },

  /* ── Action Categories ── */
  actionCategories: {
    underwriting: { en: "Underwriting", ar: "الاكتتاب" } as CopyPair,
    claims: { en: "Claims", ar: "المطالبات" } as CopyPair,
    fraud: { en: "Fraud Prevention", ar: "مكافحة الاحتيال" } as CopyPair,
    operations: { en: "Operations", ar: "العمليات" } as CopyPair,
  },

  /* ── Urgency Labels ── */
  urgencyLabels: {
    immediate: { en: "IMMEDIATE", ar: "فوري" } as CopyPair,
    short_term: { en: "SHORT-TERM", ar: "قصير المدى" } as CopyPair,
    medium_term: { en: "MEDIUM-TERM", ar: "متوسط المدى" } as CopyPair,
  },

  /* ── Insurance Postures ── */
  postures: {
    normal: { en: "Normal", ar: "طبيعي" } as CopyPair,
    tighten: { en: "Tighten", ar: "تشديد" } as CopyPair,
    restrict: { en: "Restrict", ar: "تقييد" } as CopyPair,
    cease: { en: "Cease", ar: "إيقاف" } as CopyPair,
    monitor: { en: "Monitor", ar: "مراقبة" } as CopyPair,
    surge_prepare: { en: "Surge Prep", ar: "استعداد للذروة" } as CopyPair,
    emergency: { en: "Emergency", ar: "طوارئ" } as CopyPair,
  },

  /* ── Impact Summary Strip ── */
  impactSummary: {
    title: { en: "Impact Summary", ar: "ملخص التأثير" } as CopyPair,
    entities: { en: "Entities", ar: "جهات" } as CopyPair,
    sectors: { en: "Sectors", ar: "قطاعات" } as CopyPair,
    peakRisk: { en: "Peak Risk", ar: "أعلى خطر" } as CopyPair,
    topLine: { en: "Top Exposure", ar: "أعلى انكشاف" } as CopyPair,
  },

  /* ── Bottom Timeline ── */
  timeline: {
    title: { en: "Execution Timeline", ar: "الجدول الزمني للتنفيذ" } as CopyPair,
    hours: { en: "hours from T₀", ar: "ساعات من T₀" } as CopyPair,
    noTasks: { en: "No execution tasks. Load a scenario to populate the timeline.", ar: "لا توجد مهام تنفيذية. قم بتحميل سيناريو لتعبئة الجدول الزمني." } as CopyPair,
    immediate: { en: "Immediate (0-6h)", ar: "فوري (0-6 ساعات)" } as CopyPair,
    shortTerm: { en: "Short-term (6-24h)", ar: "قصير المدى (6-24 ساعة)" } as CopyPair,
    mediumTerm: { en: "Medium-term (24-72h)", ar: "متوسط المدى (24-72 ساعة)" } as CopyPair,
    pending: { en: "Pending", ar: "معلق" } as CopyPair,
    inProgress: { en: "In Progress", ar: "قيد التنفيذ" } as CopyPair,
    completed: { en: "Completed", ar: "مكتمل" } as CopyPair,
    overdue: { en: "Overdue", ar: "متأخر" } as CopyPair,
    blocked: { en: "Blocked", ar: "محظور" } as CopyPair,
  },

  /* ── Command Snapshot ── */
  snapshot: {
    situation: { en: "Situation", ar: "الموقف" } as CopyPair,
    impact: { en: "Impact", ar: "الأثر التجاري" } as CopyPair,
    exposure: { en: "Exposure", ar: "الانكشاف" } as CopyPair,
    peakRisk: { en: "Peak Risk", ar: "ذروة المخاطر" } as CopyPair,
    decision: { en: "Decision", ar: "القرار" } as CopyPair,
    action: { en: "Action", ar: "الإجراء الفوري" } as CopyPair,
    whyItMatters: { en: "Why", ar: "لماذا يهم" } as CopyPair,
    timeToImpact: { en: "Time to Impact", ar: "توقيت الأثر" } as CopyPair,
    confidence: { en: "Confidence", ar: "الموثوقية" } as CopyPair,
    response: { en: "Recommended Response", ar: "الاستجابة الموصى بها" } as CopyPair,
    sectors: { en: "Sectors", ar: "القطاعات" } as CopyPair,
  },

  /* ── Demo Mode ── */
  demo: {
    runFull: { en: "Run Full Scenario", ar: "تشغيل السيناريو الكامل" } as CopyPair,
    runSim: { en: "Run Simulation", ar: "تشغيل المحاكاة" } as CopyPair,
    stage: { en: "Stage", ar: "المرحلة" } as CopyPair,
    demoMode: { en: "Demo Mode", ar: "وضع العرض" } as CopyPair,
  },

  /* ── Financial Impact ── */
  finance: {
    estimatedLoss: { en: "Estimated Loss Impact", ar: "الأثر المالي التقديري" } as CopyPair,
    ifNoAction: { en: "If No Action Is Taken", ar: "في حال عدم اتخاذ إجراء" } as CopyPair,
    lossRange: { en: "Loss Range", ar: "نطاق الخسارة" } as CopyPair,
    primaryDriver: { en: "Primary Driver", ar: "المحرك الأساسي" } as CopyPair,
    doNothingCost: { en: "Inaction Cost", ar: "تكلفة عدم الإجراء" } as CopyPair,
    timeWindow: { en: "Time Window", ar: "النطاق الزمني" } as CopyPair,
    category: { en: "Category", ar: "الفئة" } as CopyPair,
    baselineVsActive: { en: "Baseline vs Active", ar: "الحالة الأساسية مقابل الحالية" } as CopyPair,
    baseline: { en: "Baseline", ar: "الأساسي" } as CopyPair,
    active: { en: "Active", ar: "الحالي" } as CopyPair,
    delta: { en: "Delta", ar: "الفرق" } as CopyPair,
    risk: { en: "Risk", ar: "المخاطر" } as CopyPair,
    loss: { en: "Loss", ar: "الخسارة" } as CopyPair,
    confidenceBand: { en: "Estimate Band", ar: "نطاق التقدير" } as CopyPair,
  },

  /* ── Trust Layer ── */
  trust: {
    trustScore: { en: "Trust Score", ar: "درجة الثقة" } as CopyPair,
    confidenceBasis: { en: "Confidence Basis", ar: "أساس الموثوقية" } as CopyPair,
    actionConfidence: { en: "Action Confidence", ar: "موثوقية الإجراء" } as CopyPair,
    modelInputs: { en: "Model Inputs", ar: "مدخلات النموذج" } as CopyPair,
    knownLimitations: { en: "Known Limitations", ar: "القيود المعروفة" } as CopyPair,
    signals: { en: "Signals", ar: "الإشارات" } as CopyPair,
    activeNodes: { en: "Active Nodes", ar: "العقد النشطة" } as CopyPair,
    activeEdges: { en: "Active Edges", ar: "الروابط النشطة" } as CopyPair,
    dataRecency: { en: "Data Recency", ar: "حداثة البيانات" } as CopyPair,
    modelBasis: { en: "Model Basis", ar: "أساس النموذج" } as CopyPair,
  },

  /* ── View Mode ── */
  viewMode: {
    executive: { en: "Executive View", ar: "العرض التنفيذي" } as CopyPair,
    analyst: { en: "Analyst View", ar: "عرض المحلل" } as CopyPair,
  },

  /* ── Language Toggle ── */
  lang: {
    toggle: { en: "العربية", ar: "English" } as CopyPair,
  },

  /* ── Node Types ── */
  nodeTypes: {
    airport: { en: "Airport", ar: "مطار" } as CopyPair,
    port: { en: "Port", ar: "ميناء" } as CopyPair,
    oil_facility: { en: "Oil Facility", ar: "منشأة نفطية" } as CopyPair,
    exchange: { en: "Financial Exchange", ar: "بورصة مالية" } as CopyPair,
    military_base: { en: "Military Base", ar: "قاعدة عسكرية" } as CopyPair,
    city: { en: "City", ar: "مدينة" } as CopyPair,
    chokepoint: { en: "Strategic Chokepoint", ar: "نقطة اختناق استراتيجية" } as CopyPair,
  },
} as const;
