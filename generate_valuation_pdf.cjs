const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default;

const doc = new jsPDF({
  orientation: 'portrait',
  unit: 'mm',
  format: 'a4'
});

const BRAND = {
  accent: [217, 119, 6],      // Amber-600 #d97706
  dark: [24, 24, 27],         // Zinc-900 #18181b
  charcoal: [39, 39, 42],     // Zinc-800 #27272a
  gray: [113, 113, 122],      // Zinc-500 #71717a
  lightGray: [244, 244, 245], // Zinc-100 #f4f4f5
  borderGray: [228, 228, 231],// Zinc-200 #e4e4e7
  white: [255, 255, 255]
};

function addHeader(pageTitle, pageCategory = 'PROJECT AUDIT & VALUATION REPORT') {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Dark top bar
  doc.setFillColor(...BRAND.dark);
  doc.rect(0, 0, pageWidth, 28, 'F');
  
  // Logo & Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(...BRAND.white);
  doc.text('LIFEFLOW', 14, 12);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.accent);
  doc.text(pageCategory, 14, 18);
  
  // Subtitle / Page topic
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 185);
  doc.text(pageTitle, 14, 23);
  
  // Right metadata
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...BRAND.white);
  doc.text('Lead Architect: Muhammad Faiz Dzahin (zeynn)', pageWidth - 14, 12, { align: 'right' });
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 200, 205);
  doc.text('Production PWA | life-flow-ashy.vercel.app', pageWidth - 14, 17, { align: 'right' });
  doc.text('Evaluation Date: September 2026', pageWidth - 14, 22, { align: 'right' });
  
  // Accent divider line
  doc.setFillColor(...BRAND.accent);
  doc.rect(0, 28, pageWidth, 1.5, 'F');
}

function addFooter(pageNo, totalPages) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setDrawColor(...BRAND.borderGray);
  doc.setLineWidth(0.4);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...BRAND.gray);
  doc.text('LifeFlow Project Audit & Professional Valuation Report - Author: Muhammad Faiz Dzahin (zeynn)', 14, pageHeight - 7);
  doc.text(`Page ${pageNo} of ${totalPages}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
}

// ============================================================================
// PAGE 1: EXECUTIVE OVERVIEW, KEY METRICS & REPLACEMENT COST
// ============================================================================
addHeader('EXECUTIVE SUMMARY & CORE METRICS', 'EXECUTIVE APPRAISAL');

let y = 37;

doc.setFont('helvetica', 'bold');
doc.setFontSize(16);
doc.setTextColor(...BRAND.dark);
doc.text('Executive Summary & Project Scope', 14, y);
y += 5.5;

doc.setFont('helvetica', 'normal');
doc.setFontSize(8.5);
doc.setTextColor(...BRAND.charcoal);
const execText = 'LifeFlow is a production-grade Personal Wealth & Productivity Progressive Web App (PWA) engineered by Muhammad Faiz Dzahin (zeynn). Built with a sophisticated fullstack architecture (React 19, TypeScript, Vite, Tailwind v4, Node.js Express, and Google Cloud Firestore), the application fuses high-utility financial tools, dynamic OKR planning, habit formation analytics, edge biometric face recognition, automated WhatsApp transaction logging, and a resilient multi-tier Gemini AI engine.';
const splitExec = doc.splitTextToSize(execText, 182);
doc.text(splitExec, 14, y);
y += 15;

// KPI Summary Metric Cards (4 Cards)
const kpis = [
  { label: 'REAL DEVELOPMENT TIME', val: '320 Hours', sub: '10 Agile Sprints (Avg 32h/wk)' },
  { label: 'FUNCTIONAL MODULES', val: '14 Deep Modules', sub: 'Fullstack, AI & Biometrics' },
  { label: 'AGENCY REPLACEMENT', val: 'Rp 87.5M - 132.5M', sub: '$5,500 - $8,300 USD Equivalent' },
  { label: 'PRE-SEED MVP VALUATION', val: 'Rp 100M - 250M', sub: 'Early Traction & Working IP' }
];

const cardW = 42.5;
const cardH = 21;
kpis.forEach((kpi, idx) => {
  const cx = 14 + idx * 46.5;
  doc.setFillColor(...BRAND.lightGray);
  doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'F');
  doc.setDrawColor(...BRAND.borderGray);
  doc.roundedRect(cx, y, cardW, cardH, 2, 2, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(...BRAND.accent);
  doc.text(kpi.label, cx + 3.5, y + 5);
  
  doc.setFontSize(10.5);
  doc.setTextColor(...BRAND.dark);
  doc.text(kpi.val, cx + 3.5, y + 11.5);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...BRAND.gray);
  doc.text(kpi.sub, cx + 3.5, y + 17);
});

y += 28;

// Section: Valuation Spectrum
doc.setFont('helvetica', 'bold');
doc.setFontSize(12);
doc.setTextColor(...BRAND.dark);
doc.text('Professional Market-Rate Valuation Spectrum', 14, y);
y += 4;

const valRows = [
  [
    'Software House / Agency Build Cost',
    'Rp 87,500,000 - Rp 132,500,000\n($5,500 - $8,300 USD)',
    'Comprehensive team rate: 1 Lead Architect, 1 Senior Frontend, 1 AI/Backend Engineer, UI/UX Designer, and QA Tester over 2.5 months.'
  ],
  [
    'Senior Freelance Contractor Cost',
    'Rp 55,300,000 - Rp 87,500,000\n($3,500 - $5,500 USD)',
    'Standard market rate for an experienced Fullstack & AI Specialist (Rp 175k - Rp 275k / hour) working 320 net hours.'
  ],
  [
    'Outright IP / Source Code Acquisition',
    'Rp 38,000,000 - Rp 65,000,000\n($2,400 - $4,100 USD)',
    'Fair market buyout value for complete proprietary source code, PWA branding, database schemas, and WhatsApp webhook integration.'
  ],
  [
    'Pre-Seed Angel Investor Valuation',
    'Rp 100,000,000 - Rp 250,000,000\n($6,300 - $15,600 USD)',
    'Post-money MVP valuation for early-stage capital injection (10-15% equity) based on solo execution speed and validated user traction.'
  ]
];

autoTable(doc, {
  startY: y,
  head: [['Valuation Scenario', 'Estimated Market Value', 'Methodological Basis & Justification']],
  body: valRows,
  theme: 'grid',
  headStyles: {
    fillColor: BRAND.dark,
    textColor: BRAND.white,
    fontStyle: 'bold',
    fontSize: 7.5
  },
  bodyStyles: {
    fontSize: 7.2,
    textColor: BRAND.charcoal,
    cellPadding: 2.2
  },
  columnStyles: {
    0: { cellWidth: 48, fontStyle: 'bold', textColor: BRAND.dark },
    1: { cellWidth: 45, fontStyle: 'bold', textColor: BRAND.accent, halign: 'center' },
    2: { cellWidth: 89 }
  },
  margin: { left: 14, right: 14 }
});

y = doc.lastAutoTable.finalY + 7;

// Technical Moat Box
doc.setFillColor(...BRAND.lightGray);
doc.roundedRect(14, y, 182, 38, 2, 2, 'F');
doc.setDrawColor(...BRAND.borderGray);
doc.roundedRect(14, y, 182, 38, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...BRAND.accent);
doc.text('STRATEGIC VALUE DRIVERS & TECHNICAL MOATS', 18, y + 6);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.2);
doc.setTextColor(...BRAND.charcoal);
const moatPoints = [
  '* Multi-Tier Resilient AI Failover: Automatic zero-downtime routing from Gemini 3.6 Flash to Gemini 3.1 Flash-Lite with SSE streaming.',
  '* WhatsApp Bot Financial Logging: Real-time webhook transaction parser bridging casual messaging with enterprise Firestore persistence.',
  '* Edge Biometric Face Authentication: Client-side descriptor extraction via 68 facial landmarks, avoiding privacy risks of raw image transmission.',
  '* Bespoke "Bold Flow" Design System: High-contrast amber/slate aesthetic conforming to WCAG AA contrast standards, free of generic AI clichés.'
];
moatPoints.forEach((pt, i) => {
  doc.text(pt, 18, y + 12 + i * 5.8);
});

// ============================================================================
// PAGE 2: DETAILED FEATURE BREAKDOWN & DIFFICULTY RATINGS
// ============================================================================
doc.addPage();
addHeader('FEATURE-BY-FEATURE AUDIT & COMPLEXITY MATRIX', 'TECHNICAL DEEP DIVE');

y = 35;
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...BRAND.dark);
doc.text('Comprehensive Feature Breakdown & Difficulty Ratings', 14, y);
y += 4;

const featureRows = [
  ['01', 'Biometric Face Recognition Auth\n(@vladmandic/face-api, WebCam stream, 128D embeddings)', '9.5 / 10\n(Extremely High)', '30 h', 'Rp 5.0M - 7.5M\n($315 - $470)', 'Rp 8.0M - 12.0M\n($500 - $750)'],
  ['02', 'Multi-tier Gemini AI Resiliency Engine\n(Dual failover 3.6 Flash -> 3.1 Lite, SSE streams)', '9.0 / 10\n(Extremely High)', '40 h', 'Rp 6.5M - 10.0M\n($410 - $630)', 'Rp 10.0M - 15.0M\n($630 - $940)'],
  ['03', 'WhatsApp Bot Transaction Webhook\n(NLP receipt parser, Firestore realtime sync, simulator)', '8.5 / 10\n(Very High)', '32 h', 'Rp 5.0M - 8.0M\n($315 - $500)', 'Rp 8.0M - 12.5M\n($500 - $785)'],
  ['04', 'Personal Finance Hub & 50/30/20 Budgeting\n(Income/expense ledger, recurring rules, Recharts)', '8.0 / 10\n(High)', '38 h', 'Rp 6.0M - 9.5M\n($380 - $600)', 'Rp 9.0M - 14.0M\n($565 - $880)'],
  ['05', 'Daily Targets Dynamic OKR Engine\n(Multi-view: Table, Kanban, Gallery, mathematical progress)', '8.0 / 10\n(High)', '36 h', 'Rp 5.5M - 9.0M\n($345 - $565)', 'Rp 8.5M - 13.0M\n($535 - $815)'],
  ['06', 'Habit Tracker & Behavioral Heatmap\n(7-day matrix, GitHub-style heatmaps, streak engine)', '8.0 / 10\n(High)', '34 h', 'Rp 5.0M - 8.5M\n($315 - $535)', 'Rp 8.0M - 12.0M\n($500 - $750)'],
  ['07', 'Multimodal Receipt Vision Scanner\n(Gemini Vision OCR, structured JSON parsing)', '8.0 / 10\n(High)', '18 h', 'Rp 3.0M - 4.5M\n($190 - $285)', 'Rp 5.0M - 7.5M\n($315 - $470)'],
  ['08', 'Smart Space & Floating Pomodoro Widget\n(Draggable HUD, audio soundscape, task-linking)', '7.5 / 10\n(Med-High)', '22 h', 'Rp 3.5M - 5.5M\n($220 - $345)', 'Rp 5.5M - 8.0M\n($345 - $500)'],
  ['09', 'Branded PDF Exporter & Google Sheets Sync\n(jsPDF-autotable invoice generation, OAuth sheets)', '7.0 / 10\n(Medium)', '18 h', 'Rp 3.0M - 4.5M\n($190 - $285)', 'Rp 4.5M - 7.0M\n($285 - $440)'],
  ['10', 'Push Notification Scheduler & In-App Feed\n(Web Push API, recurring alarm daemon, activity log)', '7.0 / 10\n(Medium)', '16 h', 'Rp 2.5M - 4.0M\n($160 - $250)', 'Rp 4.0M - 6.0M\n($250 - $380)'],
  ['11', 'Gamified Achievement & Progression System\n(XP calculator, confetti trigger, unlockable badges)', '6.5 / 10\n(Medium)', '14 h', 'Rp 2.0M - 3.5M\n($125 - $220)', 'Rp 3.5M - 5.5M\n($220 - $345)'],
  ['12', 'Mindful Journal & Reflection Hub\n(Daily reflections, mood tracker, habit correlations)', '6.0 / 10\n(Moderate)', '12 h', 'Rp 1.8M - 3.0M\n($115 - $190)', 'Rp 3.0M - 4.5M\n($190 - $285)'],
  ['13', 'Interactive User Onboarding Tour\n(Multi-step driver walkthrough, local persistence)', '6.0 / 10\n(Moderate)', '10 h', 'Rp 1.5M - 2.5M\n($95 - $160)', 'Rp 2.5M - 4.0M\n($160 - $250)'],
  ['14', 'Design System & Fullstack Infrastructure\n(Express+Vite, Firestore rules, AA contrast, responsive)', '8.5 / 10\n(Very High)', '30 h', 'Rp 5.0M - 7.5M\n($315 - $470)', 'Rp 8.0M - 12.0M\n($500 - $750)']
];

autoTable(doc, {
  startY: y,
  head: [['#', 'Feature / Module Specification', 'Difficulty', 'Real Hours', 'Freelancer Senior Cost', 'Software House Rate']],
  body: featureRows,
  foot: [['', 'TOTAL AGGREGATE EVALUATION', 'Avg 7.7/10', '320 Hours', 'Rp 55.3M - 87.5M', 'Rp 87.5M - 132.5M']],
  theme: 'striped',
  headStyles: {
    fillColor: BRAND.dark,
    textColor: BRAND.white,
    fontStyle: 'bold',
    fontSize: 7
  },
  footStyles: {
    fillColor: BRAND.lightGray,
    textColor: BRAND.dark,
    fontStyle: 'bold',
    fontSize: 7.5
  },
  bodyStyles: {
    fontSize: 6.5,
    textColor: BRAND.charcoal,
    cellPadding: 1.4
  },
  columnStyles: {
    0: { cellWidth: 7, halign: 'center' },
    1: { cellWidth: 63, fontStyle: 'bold' },
    2: { cellWidth: 25, halign: 'center' },
    3: { cellWidth: 15, halign: 'center', textColor: BRAND.accent, fontStyle: 'bold' },
    4: { cellWidth: 36, halign: 'right' },
    5: { cellWidth: 36, halign: 'right', fontStyle: 'bold' }
  },
  margin: { left: 14, right: 14 }
});

// ============================================================================
// PAGE 3: DEVELOPMENT TIMELINE, VELOCITY & WORKLOG
// ============================================================================
doc.addPage();
addHeader('DEVELOPMENT TIMELINE & VELOCITY WORKLOG', 'DEVELOPMENT TIMELINE');

y = 35;
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...BRAND.dark);
doc.text('10-Week Development Timeline & Sprint Breakdown', 14, y);
y += 4;

const sprintRows = [
  ['Sprint 1 (Week 1)', '32 h', '10.0%', 'Architecture, Firebase Auth, Firestore Schemas & AppShell Setup', 'Medium (6.5)'],
  ['Sprint 2 (Week 2)', '38 h', '21.9%', 'Personal Finance Hub: Transaction Ledger, 50/30/20 Budgeting & Recharts', 'High (8.0)'],
  ['Sprint 3 (Week 3)', '36 h', '33.1%', 'Daily Targets Engine: Table, Kanban Board & Gallery Views with Progress Math', 'High (8.0)'],
  ['Sprint 4 (Week 4)', '34 h', '43.8%', 'Habit Tracker: 7-Day Matrix, Heatmap Activity & Milestone Streak System', 'High (8.0)'],
  ['Sprint 5 (Week 5)', '40 h', '56.3%', 'Gemini Multi-Tier AI: Failover, SSE Streaming & Vision Receipt Scanner', 'Very High (9.0)'],
  ['Sprint 6 (Week 6)', '32 h', '66.3%', 'WhatsApp Bot Webhook Integration, Text Parsing & Interactive Simulator', 'Very High (8.5)'],
  ['Sprint 7 (Week 7)', '30 h', '75.6%', 'Biometric Face Recognition (@vladmandic/face-api) & Facial Embeddings', 'Very High (9.5)'],
  ['Sprint 8 (Week 8)', '28 h', '84.4%', 'Smart Space, Floating Draggable Pomodoro & Gamified Achievement Engine', 'Med-High (7.5)'],
  ['Sprint 9 (Week 9)', '24 h', '91.9%', 'Branded PDF Exporter (jsPDF), Google Sheets Sync & Web Push Alerts', 'Medium (7.0)'],
  ['Sprint 10 (Week 10)', '26 h', '100.0%', 'Bold Flow Design System, De-slopping, Mobile Viewport Audit & Hardening', 'High (8.0)']
];

autoTable(doc, {
  startY: y,
  head: [['Sprint Period', 'Effort', 'Progress', 'Key Engineering Deliverables & Scope', 'Complexity']],
  body: sprintRows,
  theme: 'grid',
  headStyles: {
    fillColor: BRAND.dark,
    textColor: BRAND.white,
    fontStyle: 'bold',
    fontSize: 7.5
  },
  bodyStyles: {
    fontSize: 7,
    textColor: BRAND.charcoal,
    cellPadding: 2.0
  },
  columnStyles: {
    0: { cellWidth: 28, fontStyle: 'bold' },
    1: { cellWidth: 15, halign: 'center', textColor: BRAND.accent, fontStyle: 'bold' },
    2: { cellWidth: 16, halign: 'center' },
    3: { cellWidth: 98 },
    4: { cellWidth: 25, halign: 'center' }
  },
  margin: { left: 14, right: 14 }
});

y = doc.lastAutoTable.finalY + 7;

// Weekly Velocity Chart Box
doc.setFillColor(...BRAND.lightGray);
doc.roundedRect(14, y, 182, 85, 2, 2, 'F');
doc.setDrawColor(...BRAND.borderGray);
doc.roundedRect(14, y, 182, 85, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...BRAND.accent);
doc.text('WEEKLY TIME ALLOCATION & CUMULATIVE VELOCITY CHART', 18, y + 6);

doc.setFont('courier', 'normal');
doc.setFontSize(6.8);
doc.setTextColor(...BRAND.dark);

const asciiGraph = [
  'Sprint     Hours  Visual Workload Distribution (Each solid bar = 2 Hours Net)',
  '-----------------------------------------------------------------------------------------',
  'Week 01 :  32 h   [================] Setup, Auth, Data Modeling, AppShell',
  'Week 02 :  38 h   [===================] Finance Hub, 50/30/20 Budgeting, Recharts Area',
  'Week 03 :  36 h   [==================] Daily Targets: Multi-View (Table, Kanban, Cards)',
  'Week 04 :  34 h   [=================] Habit Matrix 7-Day, Heatmaps, Milestones',
  'Week 05 :  40 h   [====================] Gemini AI Engine, Dual Failover, Vision OCR',
  'Week 06 :  32 h   [================] WhatsApp Bot Webhook & NLP Transaction Parser',
  'Week 07 :  30 h   [===============] Biometric Face Recognition @vladmandic/face-api',
  'Week 08 :  28 h   [==============] Smart Space, Draggable Pomodoro, Gamification',
  'Week 09 :  24 h   [============] PDF Generator jsPDF, Google Sheets, Push Scheduler',
  'Week 10 :  26 h   [=============] Bold Flow Design System, De-slopping, PWA Polish',
  '-----------------------------------------------------------------------------------------',
  'TOTAL   : 320 HOURS NET (Average Velocity: 32.0 Hours / Week over 10 Weeks)'
];

asciiGraph.forEach((line, idx) => {
  doc.text(line, 18, y + 13 + idx * 4.4);
});

// Cumulative Curve
doc.setFont('courier', 'normal');
doc.setFontSize(6.3);
doc.setTextColor(...BRAND.gray);
const burnUp = [
  'Cumulative: [32h]->[70h]->[106h]->[140h]->[180h]->[212h]->[242h]->[270h]->[294h]->[320h Completed!]'
];
doc.text(burnUp[0], 18, y + 78);

// ============================================================================
// PAGE 4: SYSTEM ARCHITECTURE & RESILIENCE FLOWCHARTS
// ============================================================================
doc.addPage();
addHeader('SYSTEM ARCHITECTURE & RESILIENCE FLOWCHARTS', 'SYSTEM DESIGN');

y = 35;
doc.setFont('helvetica', 'bold');
doc.setFontSize(13);
doc.setTextColor(...BRAND.dark);
doc.text('Architectural Blueprints & Resilient Execution Flow', 14, y);
y += 5;

// Box 1: High Level System Architecture
doc.setFillColor(...BRAND.lightGray);
doc.roundedRect(14, y, 182, 58, 2, 2, 'F');
doc.setDrawColor(...BRAND.borderGray);
doc.roundedRect(14, y, 182, 58, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...BRAND.accent);
doc.text('1. HIGH-LEVEL MULTI-LAYER ARCHITECTURE', 18, y + 6);

doc.setFont('courier', 'normal');
doc.setFontSize(6.6);
doc.setTextColor(...BRAND.dark);

const archAscii = [
  '+-----------------------+      +-------------------------+      +---------------------------+',
  '|  CLIENT EXPERIENCES   |      |   SECURITY & AUTH GATE  |      |   BACKEND & AI GATEWAY    |',
  '| * Responsive Web PWA  | ---> | * Face-API Biometrics   | ---> | * Node Express API Server |',
  '| * Mobile Touch HUD    |      | * Firebase Token Verify |      | * Gemini 3.6 Flash (Pri)  |',
  '| * WhatsApp Bot Client |      | * Webhook HMAC Secret   |      | * Gemini 3.1 Lite (Fall)  |',
  '+-----------------------+      +-------------------------+      +---------------------------+',
  '            |                                                                 |',
  '            v                                                                 v',
  '+-------------------------------------------------------------------------------------------+',
  '| PERSISTENCE & DATA PIPELINE: Cloud Firestore Database + Security Rules + PDF & Sheets Sync |',
  '+-------------------------------------------------------------------------------------------+'
];
archAscii.forEach((line, idx) => {
  doc.text(line, 18, y + 13 + idx * 4.1);
});

y += 64;

// Box 2: Zero-Downtime AI Failover Flowchart
doc.setFillColor(...BRAND.lightGray);
doc.roundedRect(14, y, 182, 58, 2, 2, 'F');
doc.setDrawColor(...BRAND.borderGray);
doc.roundedRect(14, y, 182, 58, 2, 2, 'S');

doc.setFont('helvetica', 'bold');
doc.setFontSize(8.5);
doc.setTextColor(...BRAND.accent);
doc.text('2. ZERO-DOWNTIME GEMINI AI RESILIENCY PIPELINE', 18, y + 6);

doc.setFont('courier', 'normal');
doc.setFontSize(6.6);
doc.setTextColor(...BRAND.dark);

const aiFlow = [
  'Client Request ---> Express Backend (/api/gemini/*) ---> Primary Execution: Gemini 3.6 Flash',
  '                                                                   |',
  '                 +-------------------------------------------------+',
  '                 | Status 200 OK?                                  | Status 503 / Limit Overload?',
  '                 v                                                 v',
  '         Stream Chunks via SSE                             Trigger Exponential Backoff (500ms)',
  '                 |                                                 |',
  '                 |                                         Automatic Failover: Gemini 3.1 Lite',
  '                 |                                                 |',
  '                 +-------------------------------------------------+',
  '                                         |',
  '                                         v',
  '                    End User Receives Fluid Real-Time AI Stream Without Crash'
];
aiFlow.forEach((line, idx) => {
  doc.text(line, 18, y + 13 + idx * 3.8);
});

y += 64;

// Box 3: Final Certification Sign-off
doc.setFillColor(...BRAND.dark);
doc.roundedRect(14, y, 182, 40, 2, 2, 'F');

doc.setFont('helvetica', 'bold');
doc.setFontSize(9.5);
doc.setTextColor(217, 119, 6);
doc.text('TECHNICAL APPRAISAL CERTIFICATION', 18, y + 7);

doc.setFont('helvetica', 'normal');
doc.setFontSize(7.5);
doc.setTextColor(...BRAND.white);
const certNotes = [
  'This technical audit certifies that LifeFlow contains 320 net hours of high-discipline engineering.',
  'By combining edge biometrics, real-time messaging webhooks, and a resilient multi-tier LLM engine,',
  'the software significantly exceeds typical prototype standards, representing a market-ready asset.',
  'Commercial Replacement Value: Rp 87,500,000 - Rp 132,500,000 | Acquisition Value: Rp 38M - Rp 65M.'
];
certNotes.forEach((cn, idx) => {
  doc.text(cn, 18, y + 14 + idx * 4.2);
});

doc.setFont('helvetica', 'bold');
doc.setFontSize(8);
doc.setTextColor(217, 119, 6);
doc.text('Authored & Engineered by: Muhammad Faiz Dzahin (zeynn) - Lead Architect', 18, y + 33);

// Apply Footers to all 4 pages
const totalPages = doc.getNumberOfPages();
for (let i = 1; i <= totalPages; i++) {
  doc.setPage(i);
  addFooter(i, totalPages);
}

// Generate & write PDF buffers
const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

// Root file
fs.writeFileSync(path.join(process.cwd(), 'LIFEFLOW_VALUATION_BY_ZEYNN.pdf'), pdfBuffer);

// Public dir file
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'LIFEFLOW_VALUATION_BY_ZEYNN.pdf'), pdfBuffer);

console.log(`[Success] Generated ${totalPages}-page PDF successfully at LIFEFLOW_VALUATION_BY_ZEYNN.pdf and public/LIFEFLOW_VALUATION_BY_ZEYNN.pdf`);
