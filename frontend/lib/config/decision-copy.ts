/* ══════════════════════════════════════════════════════════════
   Decision Intelligence — Bilingual Copy System
   Every string in the Decision Intelligence layer passes through
   this file. NO hardcoded text in any panel.
   ══════════════════════════════════════════════════════════════ */

export type CopyPair = {
  en: string;
  ar: string;
};

export const decisionCopy = {
  /* ── Executive Brief ─────────────────────────────────── */
  executive: {
    title: { en: "Executive Brief", ar: "الموجز التنفيذي" } as CopyPair,
    situation: { en: "Situation", ar: "الوضع الراهن" } as CopyPair,
    impact: { en: "Impact Assessment", ar: "تقييم الأثر" } as CopyPair,
    risk: { en: "Key Risks", ar: "المخاطر الرئيسية" } as CopyPair,
    recommendation: { en: "Recommended Course of Action", ar: "مسار العمل الموصى به" } as CopyPair,
    urgency: { en: "Decision Deadline", ar: "الموعد النهائي للقرار" } as CopyPair,
    confidence: { en: "Confidence Assessment", ar: "تقييم الثقة" } as CopyPair,
    awaiting: { en: "Awaiting intelligence assessment…", ar: "في انتظار التقييم الاستخباري…" } as CopyPair,
    implications: { en: "Strategic Implications", ar: "التداعيات الاستراتيجية" } as CopyPair,
  },

  /* ── Decision Options ────────────────────────────────── */
  decisions: {
    title: { en: "Decision Options", ar: "خيارات القرار" } as CopyPair,
    primary: { en: "Primary Recommendation", ar: "التوصية الرئيسية" } as CopyPair,
    alternatives: { en: "Alternative Courses of Action", ar: "مسارات العمل البديلة" } as CopyPair,
    riskReduction: { en: "Risk Reduction", ar: "خفض المخاطر" } as CopyPair,
    executionTime: { en: "Execution Time", ar: "وقت التنفيذ" } as CopyPair,
    feasibility: { en: "Feasibility", ar: "الجدوى" } as CopyPair,
    confidence: { en: "Confidence", ar: "الثقة" } as CopyPair,
    cost: { en: "Estimated Cost", ar: "التكلفة المقدرة" } as CopyPair,
    rationale: { en: "Rationale", ar: "المبررات" } as CopyPair,
    tradeoffs: { en: "Trade-offs", ar: "المقايضات" } as CopyPair,
    dependencies: { en: "Dependencies", ar: "التبعيات" } as CopyPair,
    noOptions: { en: "No decision options available", ar: "لا تتوفر خيارات قرار" } as CopyPair,
    options: { en: "options", ar: "خيارات" } as CopyPair,
    stronglyRecommended: { en: "Strongly Recommended", ar: "موصى به بشدة" } as CopyPair,
    recommended: { en: "Recommended", ar: "موصى به" } as CopyPair,
    conditional: { en: "Conditional", ar: "مشروط" } as CopyPair,
    notRecommended: { en: "Not Recommended", ar: "غير موصى به" } as CopyPair,
  },

  /* ── Critical Nodes ──────────────────────────────────── */
  nodes: {
    title: { en: "Critical Infrastructure", ar: "البنية التحتية الحرجة" } as CopyPair,
    subtitle: { en: "Highest cascade risk systems", ar: "أنظمة ذات أعلى مخاطر تتابعية" } as CopyPair,
    criticality: { en: "Criticality", ar: "الأهمية" } as CopyPair,
    cascadeRisk: { en: "Cascade Risk", ar: "مخاطر التتابع" } as CopyPair,
    downstream: { en: "Downstream Systems", ar: "الأنظمة المتأثرة" } as CopyPair,
    interventions: { en: "Intervention Options", ar: "خيارات التدخل" } as CopyPair,
    noNodes: { en: "No critical nodes identified", ar: "لم يتم تحديد عقد حرجة" } as CopyPair,
    impactSentence: { en: "Failure at this node cascades to {count} downstream systems", ar: "فشل هذه العقدة يؤثر على {count} أنظمة متصلة" } as CopyPair,
  },

  /* ── Decision Windows ────────────────────────────────── */
  timing: {
    title: { en: "Decision Windows", ar: "نوافذ القرار" } as CopyPair,
    immediate: { en: "Immediate (0–6h)", ar: "فوري (٠–٦ ساعات)" } as CopyPair,
    short: { en: "Short-term (6–24h)", ar: "قصير المدى (٦–٢٤ ساعة)" } as CopyPair,
    medium: { en: "Medium-term (24–72h)", ar: "متوسط المدى (٢٤–٧٢ ساعة)" } as CopyPair,
    costOfDelay: { en: "Cost of Delay", ar: "تكلفة التأخير" } as CopyPair,
    actionsAvailable: { en: "Actions Available", ar: "الإجراءات المتاحة" } as CopyPair,
    noWindows: { en: "No active decision windows", ar: "لا توجد نوافذ قرار نشطة" } as CopyPair,
    critical: { en: "Critical", ar: "حرج" } as CopyPair,
    high: { en: "High", ar: "مرتفع" } as CopyPair,
    medium_label: { en: "Medium", ar: "متوسط" } as CopyPair,
    low: { en: "Low", ar: "منخفض" } as CopyPair,
  },

  /* ── Confidence ──────────────────────────────────────── */
  confidence: {
    title: { en: "Model Confidence", ar: "ثقة النموذج" } as CopyPair,
    overall: { en: "Overall Confidence", ar: "الثقة الإجمالية" } as CopyPair,
    band: { en: "confidence", ar: "ثقة" } as CopyPair,
    explanation: {
      en: "Confidence bands reflect model certainty across impact dimensions. Wider bands indicate higher uncertainty requiring additional intelligence validation.",
      ar: "نطاقات الثقة تعكس يقين النموذج عبر أبعاد التأثير. النطاقات الأوسع تشير إلى عدم يقين أعلى يتطلب تحقق استخباري إضافي.",
    } as CopyPair,
    noData: { en: "No confidence data available", ar: "لا تتوفر بيانات ثقة" } as CopyPair,
  },

  /* ── Impact Panels ───────────────────────────────────── */
  impact: {
    energy: {
      title: { en: "Energy & Fuel Transmission", ar: "الطاقة ونقل الوقود" } as CopyPair,
      headline: { en: "Regional energy supply under severe pressure", ar: "إمدادات الطاقة الإقليمية تحت ضغط شديد" } as CopyPair,
      oilShock: { en: "Oil Supply Disruption", ar: "انقطاع إمدادات النفط" } as CopyPair,
      refiningStress: { en: "Refinery Capacity Strain", ar: "إجهاد قدرة التكرير" } as CopyPair,
      logisticsDelay: { en: "Fuel Distribution Delay", ar: "تأخر توزيع الوقود" } as CopyPair,
      fuelScore: { en: "Fuel Transmission Impact", ar: "أثر نقل الوقود" } as CopyPair,
      implication: { en: "Energy costs will escalate across aviation, industrial, and consumer sectors within 48 hours", ar: "تكاليف الطاقة سترتفع عبر قطاعات الطيران والصناعة والمستهلكين خلال ٤٨ ساعة" } as CopyPair,
      noData: { en: "No energy impact data available", ar: "لا تتوفر بيانات أثر الطاقة" } as CopyPair,
    },
    aviation: {
      title: { en: "Aviation Operations", ar: "العمليات الجوية" } as CopyPair,
      headline: { en: "GCC airport network under operational stress", ar: "شبكة مطارات الخليج تحت ضغط تشغيلي" } as CopyPair,
      rerouting: { en: "Rerouting Load", ar: "حمل إعادة التوجيه" } as CopyPair,
      fuel: { en: "Fuel Availability", ar: "توفر الوقود" } as CopyPair,
      congestion: { en: "Ground Congestion", ar: "الازدحام الأرضي" } as CopyPair,
      insurance: { en: "Insurance & Operating Cost", ar: "التأمين وتكاليف التشغيل" } as CopyPair,
      score: { en: "Disruption Score", ar: "درجة التعطل" } as CopyPair,
      implication: { en: "Passenger delays and cargo bottlenecks require immediate airline coordination", ar: "تأخيرات الركاب واختناقات الشحن تتطلب تنسيقاً فورياً مع شركات الطيران" } as CopyPair,
      noData: { en: "No aviation data available", ar: "لا تتوفر بيانات الطيران" } as CopyPair,
    },
    maritime: {
      title: { en: "Maritime & Trade Routes", ar: "الممرات البحرية والتجارية" } as CopyPair,
      headline: { en: "Critical shipping lanes face chokepoint pressure", ar: "الممرات البحرية الحيوية تواجه ضغط نقاط الاختناق" } as CopyPair,
      chokepoint: { en: "Chokepoint Pressure", ar: "ضغط نقاط الاختناق" } as CopyPair,
      portDelay: { en: "Port Processing Delay", ar: "تأخر معالجة الموانئ" } as CopyPair,
      insuranceSurge: { en: "Insurance Cost Escalation", ar: "تصاعد تكاليف التأمين" } as CopyPair,
      reroutingStress: { en: "Shipping Reroute Burden", ar: "عبء إعادة توجيه الشحن" } as CopyPair,
      score: { en: "Maritime Trade Stress", ar: "إجهاد التجارة البحرية" } as CopyPair,
      implication: { en: "Strait disruption will increase cargo insurance by 40-60% and delay shipments by 5-8 days", ar: "اضطراب المضيق سيرفع تأمين الشحن بنسبة ٤٠-٦٠٪ ويؤخر الشحنات ٥-٨ أيام" } as CopyPair,
      noData: { en: "No maritime data available", ar: "لا تتوفر بيانات بحرية" } as CopyPair,
    },
    financial: {
      title: { en: "Financial Markets", ar: "الأسواق المالية" } as CopyPair,
      headline: { en: "Market volatility and liquidity tightening detected", ar: "تم رصد تقلبات السوق وتشديد السيولة" } as CopyPair,
      oilVolatility: { en: "Oil Price Volatility", ar: "تقلب أسعار النفط" } as CopyPair,
      liquidityStress: { en: "Liquidity Contraction", ar: "انكماش السيولة" } as CopyPair,
      sentimentShock: { en: "Investor Sentiment Shock", ar: "صدمة معنويات المستثمرين" } as CopyPair,
      insuranceRepricing: { en: "Insurance Repricing", ar: "إعادة تسعير التأمين" } as CopyPair,
      score: { en: "Market Stress Index", ar: "مؤشر إجهاد السوق" } as CopyPair,
      implication: { en: "GCC equity markets likely to face 3-5% correction with sovereign fund exposure risk", ar: "أسواق أسهم الخليج معرضة لتصحيح ٣-٥٪ مع مخاطر تعرض الصناديق السيادية" } as CopyPair,
      noData: { en: "No financial data available", ar: "لا تتوفر بيانات مالية" } as CopyPair,
    },
    social: {
      title: { en: "Public Sentiment & Media", ar: "المعنويات العامة والإعلام" } as CopyPair,
      headline: { en: "Public anxiety rising with social media amplification", ar: "تصاعد القلق العام مع تضخيم وسائل التواصل الاجتماعي" } as CopyPair,
      panicBuying: { en: "Consumer Panic Behavior", ar: "سلوك الذعر الاستهلاكي" } as CopyPair,
      mediaAmplification: { en: "Media Amplification Effect", ar: "تأثير التضخيم الإعلامي" } as CopyPair,
      trustLoss: { en: "Public Trust Erosion", ar: "تآكل الثقة العامة" } as CopyPair,
      officialStabilization: { en: "Official Stabilization Effort", ar: "جهود الاستقرار الرسمية" } as CopyPair,
      score: { en: "Public Reaction Index", ar: "مؤشر ردة الفعل العامة" } as CopyPair,
      implication: { en: "Government communication strategy needed within 6 hours to prevent panic buying escalation", ar: "استراتيجية اتصال حكومية مطلوبة خلال ٦ ساعات لمنع تصاعد الشراء بدافع الذعر" } as CopyPair,
      noData: { en: "No social response data available", ar: "لا تتوفر بيانات الاستجابة الاجتماعية" } as CopyPair,
    },
    supply: {
      title: { en: "Supply Chain & Essential Goods", ar: "سلسلة الإمداد والسلع الأساسية" } as CopyPair,
      headline: { en: "Essential goods flow at risk across GCC distribution networks", ar: "تدفق السلع الأساسية معرض للخطر عبر شبكات توزيع الخليج" } as CopyPair,
      foodImports: { en: "Food Import Disruption", ar: "اضطراب استيراد الغذاء" } as CopyPair,
      medicineSupply: { en: "Pharmaceutical Supply Risk", ar: "مخاطر إمداد الأدوية" } as CopyPair,
      airportCargo: { en: "Air Cargo Bottleneck", ar: "اختناق الشحن الجوي" } as CopyPair,
      lastMile: { en: "Last-Mile Distribution", ar: "توزيع الميل الأخير" } as CopyPair,
      score: { en: "Supply Chain Stress Index", ar: "مؤشر إجهاد سلسلة الإمداد" } as CopyPair,
      implication: { en: "Strategic reserves should be activated within 24 hours for food and pharmaceutical continuity", ar: "يجب تفعيل الاحتياطيات الاستراتيجية خلال ٢٤ ساعة لاستمرارية الغذاء والأدوية" } as CopyPair,
      noData: { en: "No supply chain data available", ar: "لا تتوفر بيانات سلسلة الإمداد" } as CopyPair,
    },
    ecommerce: {
      title: { en: "E-Commerce & Digital Trade", ar: "التجارة الإلكترونية والتجارة الرقمية" } as CopyPair,
      headline: { en: "Digital commerce fulfillment under mounting pressure", ar: "تلبية طلبات التجارة الرقمية تحت ضغط متزايد" } as CopyPair,
      delay: { en: "Delivery Delay Severity", ar: "شدة تأخر التسليم" } as CopyPair,
      inventoryStress: { en: "Inventory Availability", ar: "توفر المخزون" } as CopyPair,
      demandVolatility: { en: "Demand Volatility", ar: "تقلب الطلب" } as CopyPair,
      paymentFriction: { en: "Payment Processing Friction", ar: "احتكاك معالجة المدفوعات" } as CopyPair,
      score: { en: "E-Commerce Disruption Index", ar: "مؤشر اضطراب التجارة الإلكترونية" } as CopyPair,
      implication: { en: "Cross-border e-commerce delays will impact consumer confidence and logistics contracts", ar: "تأخيرات التجارة الإلكترونية عبر الحدود ستؤثر على ثقة المستهلك وعقود الخدمات اللوجستية" } as CopyPair,
      noData: { en: "No e-commerce data available", ar: "لا تتوفر بيانات التجارة الإلكترونية" } as CopyPair,
    },
  },

  /* ── Shared Actions / Labels ─────────────────────────── */
  actions: {
    loadScenario: { en: "Run Scenario Assessment", ar: "تشغيل تقييم السيناريو" } as CopyPair,
    loading: { en: "Processing intelligence…", ar: "معالجة الاستخبارات…" } as CopyPair,
    error: { en: "Intelligence assessment failed", ar: "فشل التقييم الاستخباري" } as CopyPair,
    whatIsHappening: { en: "What is happening", ar: "ما الذي يحدث" } as CopyPair,
    whyItMatters: { en: "Why it matters", ar: "لماذا يهم" } as CopyPair,
    whatToDo: { en: "What should we do", ar: "ما الذي يجب فعله" } as CopyPair,
    whenToAct: { en: "When to act", ar: "متى نتحرك" } as CopyPair,
    howConfident: { en: "How confident are we", ar: "ما مستوى ثقتنا" } as CopyPair,
  },
} as const;
