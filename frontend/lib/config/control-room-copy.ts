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
