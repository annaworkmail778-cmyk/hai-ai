/**
 * RiseUp Lead-to-Booking System — product demo.
 * Every visible word, voice-over line and subtitle lives here, per language.
 * Both languages have the same scenes in the same order. Each language has
 * its own timeline (TIMELINE), matched to its recorded voice-over; animations
 * inside a scene are designed for BASE_SCENES and stretched to fit.
 *
 * What the demo shows is limited to what the current RiseUp setup does
 * (n8n + ManyChat assistant): replies on Instagram, collects details,
 * offers times, registers the booking in Google Calendar / Google Sheets
 * and notifies the team in Telegram. Follow-ups are shown as an optional,
 * permission-based setting. WhatsApp is not shown as a live channel yet.
 */

export type LbLang = "en" | "hy";
export const FPS = 30;

export const SCENE_IDS = ["problem", "intro", "chat", "booking", "dashboard", "followup", "value", "cta"] as const;
export type SceneId = (typeof SCENE_IDS)[number];
type Timeline = Record<SceneId, readonly [number, number]>;

/** Scene lengths the animations were designed for (seconds). */
export const BASE_SCENES: Timeline = {
  problem: [0, 8],
  intro: [8, 14],
  chat: [14, 25],
  booking: [25, 37],
  dashboard: [37, 49],
  followup: [49, 59],
  value: [59, 68],
  cta: [68, 75],
};

/**
 * Per-language timeline, cut at the pauses between paragraphs of the voice-over
 * (public/voice/lb-demo-{lang}.mp3). Re-measure when a new recording comes in:
 *   ffmpeg -i voice.mp3 -af silencedetect=noise=-40dB:d=0.2 -f null -
 */
export const TIMELINE: Record<LbLang, Timeline> = {
  // ElevenLabs "Jessica", 61.2 s
  en: {
    problem: [0, 10.55],
    intro: [10.55, 14.22],
    chat: [14.22, 23.02],
    booking: [23.02, 32.5],
    dashboard: [32.5, 41.1],
    followup: [41.1, 49.42],
    value: [49.42, 55.9],
    cta: [55.9, 63.5],
  },
  // ElevenLabs "Aram", 77.2 s
  hy: {
    problem: [0, 12.6],
    intro: [12.6, 18.6],
    chat: [18.6, 29.1],
    booking: [29.1, 40.62],
    dashboard: [40.62, 50.5],
    followup: [50.5, 62.42],
    value: [62.42, 70.45],
    cta: [70.45, 79.5],
  },
};

export const totalSeconds = (lang: LbLang) => TIMELINE[lang].cta[1];
/** Where the recorded voice ends (the last scene holds a little longer). */
const VOICE_END: Record<LbLang, number> = { en: 60.95, hy: 76.95 };

export const SITE = "riseup-group.com";

type Msg = { from: "customer" | "riseup"; text: string };

const en = {
  salon: "Lumière Beauty Studio",
  instagram: "Instagram",
  assistant: "RiseUp assistant",
  now: "now",
  problem: {
    line1: "Every day, potential customers message your business.",
    line2: "But not every message gets a reply.",
    inbox: [
      "Hi! How much is a facial treatment?",
      "Do you have any appointments tomorrow?",
      "Can I book a consultation?",
      "Hello, are you available this Friday?",
      "Is the laser treatment still on offer?",
      "What are your opening hours?",
    ],
    unanswered: "unanswered",
    missed: "Missed opportunities",
  },
  intro: { meet: "Meet RiseUp.", sub: "Your automated Lead-to-Booking System." },
  chat: {
    title: "Replies in seconds",
    points: ["Understands what the customer needs", "Asks the right questions", "Collects the customer's details"],
    messages: [
      { from: "customer", text: "Hi! I'd like to book a facial treatment. What times are available?" },
      { from: "riseup", text: "Hello! We'd be happy to help. Are you looking for a facial treatment or a consultation?" },
      { from: "customer", text: "Facial treatment." },
      { from: "riseup", text: "Great! May I have your name?" },
      { from: "customer", text: "Anna." },
      { from: "riseup", text: "Thank you, Anna. Which day works best for you?" },
    ] as Msg[],
  },
  booking: {
    title: "Booking in the chat",
    customerDay: "Tuesday, please.",
    offer: "Here are the available times for Tuesday:",
    day: "Tuesday",
    slots: ["10:00 AM", "12:30 PM", "3:00 PM"],
    picked: 1,
    requestTitle: "Appointment request received",
    requestText: "Facial treatment · Tuesday, 12:30 PM",
    requestNote: "We'll confirm your appointment shortly.",
    confirmedTitle: "Appointment confirmed",
    confirmedText: "Tuesday, 12:30 PM · Lumière Beauty Studio",
    stepRequest: "1 · Request registered",
    stepConfirm: "2 · Confirmed after the time is verified",
  },
  dashboard: {
    app: "RiseUp",
    nav: ["Inquiries", "Calendar", "Customers", "Settings"],
    heading: "Inquiries",
    synced: "Synced with Google Calendar and Google Sheets",
    kpis: [
      ["New inquiries", 12, 13],
      ["Appointment requests", 5, 6],
      ["Confirmed this week", 7, 8],
    ] as Array<[string, number, number]>,
    columns: ["Customer", "Service", "Contact", "Date & time", "Status"],
    rows: [
      ["Anna", "Facial treatment", "@anna.k", "Tue · 12:30 PM", "requested"],
      ["Michael", "Consultation", "+1 555 0142", "—", "awaiting"],
      ["Sarah", "Laser treatment", "@sarah.m", "Mon · 4:00 PM", "confirmed"],
      ["Emily", "Brow lamination", "@emily.r", "Wed · 11:00 AM", "confirmed"],
    ] as Array<[string, string, string, string, Status]>,
    status: { requested: "Appointment requested", awaiting: "Awaiting response", confirmed: "Confirmed" },
    newLead: "New lead",
    confirm: "Confirm",
    recentTitle: "Recent conversations",
    recent: [
      ["Anna", "Tuesday 12:30 works for me.", "now"],
      ["Michael", "Do you work on Sundays?", "12 min"],
      ["Sarah", "Thank you, see you Monday!", "1 h"],
    ] as Array<[string, string, string]>,
    todayTitle: "Upcoming appointments",
    today: [
      ["Mon · 4:00 PM", "Sarah · Laser treatment", "confirmed"],
      ["Tue · 12:30 PM", "Anna · Facial treatment", "anna"],
      ["Wed · 11:00 AM", "Emily · Brow lamination", "confirmed"],
    ] as Array<[string, string, string]>,
  },
  followup: {
    title: "Follow-ups and notifications",
    customer: "Maria",
    earlier: "How much is a facial treatment?",
    earlierReply: "A facial treatment is $85. Would you like to book a time?",
    later: "Next day",
    message: "Hi Maria! Just checking whether you'd still like to book your facial treatment. We'd be happy to help.",
    optional: "Optional · sent only when your settings and messaging rules allow",
    notifyApp: "Telegram",
    notifyTitle: "New appointment request received",
    notifyText: "Anna · Facial treatment · Tue 12:30 PM",
  },
  value: {
    nodes: ["Instagram", "RiseUp", "Customer data", "Booking", "Your team"],
    lines: ["Respond faster.", "Organize every inquiry.", "Make booking easier.", "Keep your team informed."],
  },
  cta: { tagline: "Turn conversations into bookings.", discover: "Discover RiseUp.", button: "Request a demo" },
  voice: {
    problem: "Every day, potential customers message your business. But when you're busy, not every message gets a reply — and every unanswered message can be a lost booking.",
    intro: "Meet RiseUp — your automated Lead-to-Booking System.",
    chat: "When a customer writes on Instagram, RiseUp replies in seconds. It understands what they need, asks the right questions and collects their details.",
    booking: "Then it offers available times. The customer picks one and the request is registered — and confirmed once the time is verified by your calendar or your team.",
    dashboard: "Every inquiry lands in one organized list: who wrote, which service they want, their contact details and the status of each request.",
    followup: "If someone stops halfway, RiseUp can send a polite follow-up when your settings allow it. And your team is notified the moment a new request arrives.",
    value: "Respond faster. Organize every inquiry. Make booking easier. Keep your team informed.",
    cta: "RiseUp. Turn conversations into bookings. Request your personalized demo.",
  } as Record<SceneId, string>,
};

const hy: typeof en = {
  salon: "Lumière Beauty Studio",
  instagram: "Instagram",
  assistant: "RiseUp օգնական",
  now: "հիմա",
  problem: {
    line1: "Ամեն օր պոտենցիալ հաճախորդները գրում են Ձեր բիզնեսին։",
    line2: "Բայց ամեն հաղորդագրություն չէ, որ պատասխան է ստանում։",
    inbox: [
      "Բարև Ձեզ։ Դեմքի խնամքն ի՞նչ արժե։",
      "Վաղը ազատ ժամ ունե՞ք։",
      "Կարո՞ղ եմ գրանցվել խորհրդատվության։",
      "Բարև, ուրբաթ օրը ազա՞տ եք։",
      "Լազերային պրոցեդուրայի զեղչը դեռ կա՞։",
      "Ժամը քանիսի՞ն եք բացվում։",
    ],
    unanswered: "անպատասխան",
    missed: "Կորցրած հնարավորություններ",
  },
  intro: { meet: "Ծանոթացեք RiseUp-ին։", sub: "Ձեր հաճախորդների կառավարման և ամրագրման ավտոմատ համակարգը։" },
  chat: {
    title: "Պատասխան՝ վայրկյանների ընթացքում",
    points: ["Հասկանում է, թե ինչ է պետք հաճախորդին", "Տալիս է ճիշտ հարցերը", "Հավաքում է հաճախորդի տվյալները"],
    messages: [
      { from: "customer", text: "Բարև Ձեզ։ Ցանկանում եմ գրանցվել դեմքի խնամքի պրոցեդուրայի համար։ Ի՞նչ ազատ ժամեր ունեք։" },
      { from: "riseup", text: "Բարև Ձեզ։ Ուրախ կլինենք օգնել։ Կցանկանա՞ք գրանցվել դեմքի խնամքի պրոցեդուրայի, թե՞ խորհրդատվության համար։" },
      { from: "customer", text: "Դեմքի խնամքի համար։" },
      { from: "riseup", text: "Հրաշալի։ Խնդրում ենք նշել Ձեր անունը։" },
      { from: "customer", text: "Աննա։" },
      { from: "riseup", text: "Շնորհակալություն, Աննա։ Ո՞ր օրն է Ձեզ հարմար։" },
    ],
  },
  booking: {
    title: "Ամրագրում՝ հենց չատում",
    customerDay: "Երեքշաբթի, խնդրում եմ։",
    offer: "Երեքշաբթի օրվա ազատ ժամերը՝",
    day: "Երեքշաբթի",
    slots: ["10:00", "12:30", "15:00"],
    picked: 1,
    requestTitle: "Հարցումն ընդունված է",
    requestText: "Դեմքի խնամք · Երեքշաբթի, 12:30",
    requestNote: "Շուտով կհաստատենք Ձեր այցը։",
    confirmedTitle: "Ձեր այցը հաստատված է",
    confirmedText: "Երեքշաբթի, 12:30 · Lumière Beauty Studio",
    stepRequest: "1 · Հարցումը գրանցված է",
    stepConfirm: "2 · Հաստատվում է ժամը ստուգելուց հետո",
  },
  dashboard: {
    app: "RiseUp",
    nav: ["Հարցումներ", "Օրացույց", "Հաճախորդներ", "Կարգավորումներ"],
    heading: "Նոր հարցումներ",
    synced: "Համաժամեցված է Google Calendar-ի և Google Sheets-ի հետ",
    kpis: [
      ["Նոր հարցումներ", 12, 13],
      ["Ամրագրման հարցումներ", 5, 6],
      ["Հաստատված այս շաբաթ", 7, 8],
    ],
    columns: ["Հաճախորդ", "Ծառայություն", "Կոնտակտ", "Ամսաթիվ և ժամ", "Ամրագրման կարգավիճակ"],
    rows: [
      ["Աննա", "Դեմքի խնամք", "@anna.k", "Երք · 12:30", "requested"],
      ["Միքայել", "Խորհրդատվություն", "+374 77 000 142", "—", "awaiting"],
      ["Սարա", "Լազերային պրոցեդուրա", "@sara.m", "Երկ · 16:00", "confirmed"],
      ["Էմմա", "Հոնքերի լամինացիա", "@emma.r", "Չրք · 11:00", "confirmed"],
    ],
    status: { requested: "Սպասում է հաստատման", awaiting: "Սպասում է պատասխանի", confirmed: "Հաստատված" },
    newLead: "Նոր հաճախորդ",
    confirm: "Հաստատել",
    recentTitle: "Վերջին նամակագրություններ",
    recent: [
      ["Աննա", "Երեքշաբթի 12:30-ը հարմար է։", "հիմա"],
      ["Միքայել", "Կիրակի օրերին աշխատո՞ւմ եք։", "12 ր"],
      ["Սարա", "Շնորհակալություն, կհանդիպենք երկուշաբթի։", "1 ժ"],
    ],
    todayTitle: "Մոտակա այցեր",
    today: [
      ["Երկ · 16:00", "Սարա · Լազերային պրոցեդուրա", "confirmed"],
      ["Երք · 12:30", "Աննա · Դեմքի խնամք", "anna"],
      ["Չրք · 11:00", "Էմմա · Հոնքերի լամինացիա", "confirmed"],
    ],
  },
  followup: {
    title: "Հիշեցումներ և ծանուցումներ",
    customer: "Մարիա",
    earlier: "Դեմքի խնամքն ի՞նչ արժե։",
    earlierReply: "Դեմքի խնամքը 25 000 ֏ է։ Կցանկանա՞ք գրանցվել։",
    later: "Հաջորդ օրը",
    message: "Բարև, Մարիա։ Ցանկանո՞ւմ եք դեռ ամրագրել դեմքի խնամքի պրոցեդուրան։ Ուրախ կլինենք օգնել Ձեզ։",
    optional: "Ըստ ցանկության · ուղարկվում է միայն, եթե թույլատրված է Ձեր կարգավորումներով",
    notifyApp: "Telegram",
    notifyTitle: "Նոր ամրագրման հարցում",
    notifyText: "Աննա · Դեմքի խնամք · Երք 12:30",
  },
  value: {
    nodes: ["Instagram", "RiseUp", "Հաճախորդի տվյալներ", "Ամրագրում", "Ձեր թիմը"],
    lines: ["Ավելի արագ պատասխանեք։", "Կառավարեք բոլոր հարցումները։", "Հեշտացրեք ամրագրումները։", "Տեղեկացված պահեք Ձեր թիմին։"],
  },
  cta: { tagline: "Հաղորդագրությունները վերածեք ամրագրումների։", discover: "Բացահայտեք RiseUp-ը։", button: "Պատվիրեք անհատական ցուցադրություն" },
  voice: {
    problem: "Ամեն օր պոտենցիալ հաճախորդները գրում են Ձեր բիզնեսին։ Բայց երբ զբաղված եք, ամեն հաղորդագրություն չէ, որ պատասխան է ստանում, և ամեն անպատասխան նամակ կարող է կորցրած ամրագրում լինել։",
    intro: "Ծանոթացեք RiseUp-ին՝ Ձեր հաճախորդների կառավարման և ամրագրման ավտոմատ համակարգին։",
    chat: "Երբ հաճախորդը գրում է Instagram-ում, RiseUp-ը պատասխանում է վայրկյանների ընթացքում, հասկանում է, թե ինչ է նրան պետք, տալիս է ճիշտ հարցերը և հավաքում նրա տվյալները։",
    booking: "Հետո առաջարկում է ազատ ժամեր։ Հաճախորդն ընտրում է հարմար ժամը, և հարցումը գրանցվում է։ Այցը հաստատվում է, երբ ժամը ստուգվում է Ձեր օրացույցով կամ թիմի կողմից։",
    dashboard: "Բոլոր հարցումները հավաքվում են մեկ կազմակերպված ցուցակում՝ ով է գրել, ինչ ծառայություն է ուզում, նրա կոնտակտները և ամեն հարցման կարգավիճակը։",
    followup: "Եթե հաճախորդը կիսատ է թողնում, RiseUp-ը կարող է ուղարկել քաղաքավարի հիշեցում, եթե դա թույլատրված է Ձեր կարգավորումներում։ Իսկ Ձեր թիմը տեղեկանում է նոր հարցման մասին անմիջապես։",
    value: "Ավելի արագ պատասխանեք։ Կառավարեք բոլոր հարցումները։ Հեշտացրեք ամրագրումները։ Տեղեկացված պահեք Ձեր թիմին։",
    cta: "RiseUp. Հաղորդագրությունները վերածեք ամրագրումների։ Պատվիրեք անհատական ցուցադրություն։",
  },
};

export type Status = "requested" | "awaiting" | "confirmed";
export type LbCopy = typeof en;
export const LB_COPY: Record<LbLang, LbCopy> = { en, hy };

/** Subtitle cues for one language: each scene's voice line split into short chunks, spread over the scene. */
export function subtitleCues(lang: LbLang) {
  const cues: Array<{ start: number; end: number; text: string }> = [];
  SCENE_IDS.forEach((id) => {
    const [s, e] = TIMELINE[lang][id];
    const chunks = splitLine(LB_COPY[lang].voice[id]);
    const total = chunks.reduce((n, c) => n + c.length, 0);
    let t = s + 0.35;
    const span = Math.min(e, VOICE_END[lang] + 0.3) - s - 0.6;
    chunks.forEach((c) => {
      const d = (c.length / total) * span;
      cues.push({ start: t, end: t + d, text: c });
      t += d;
    });
  });
  return cues;
}

/** Splits at sentence ends and commas/dashes into readable chunks of ≤ ~58 characters. */
function splitLine(line: string) {
  const parts = line.split(/(?<=[.?!։:;—,՝])\s+/u).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (last && last.length + p.length < 58 && !/[.?!։]$/u.test(last)) out[out.length - 1] = `${last} ${p}`;
    else out.push(p);
  }
  return out;
}
