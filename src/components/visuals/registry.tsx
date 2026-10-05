import type { ReactElement } from "react";
import type { Tone } from "./primitives";
import { FlowScene, type FlowSpec } from "./scenes/flow";
import { LeadConversationScene, LeadPipelineScene } from "./scenes/lead";
import { FloorplanScene, RealEstatePhonesScene, UnitMatrixScene } from "./scenes/realestate";
import { BookingPhonesScene, CalendarScene } from "./scenes/booking";
import { OpsDashboardScene, OpsTimelineScene } from "./scenes/operations";
import { KnowledgeScene, SupportInboxScene } from "./scenes/support";
import { DesignSystemScene, EditorialSiteScene } from "./scenes/web";

/* System flows shown in project galleries. Interface labels stay in English,
   like screenshots of a real product would. */

const leadFlow: FlowSpec = {
  tone: "dark",
  columns: [
    { title: "Channels", nodes: [{ id: "web", label: "Website form" }, { id: "ig", label: "Instagram" }, { id: "wa", label: "WhatsApp" }, { id: "call", label: "Phone calls" }] },
    { title: "Intake", nodes: [{ id: "inbox", label: "Unified inbox" }] },
    { title: "Intelligence", nodes: [{ id: "ai", label: "AI qualification" }, { id: "enrich", label: "Enrichment" }] },
    { title: "Action", nodes: [{ id: "sales", label: "Assign to sales", accent: true }, { id: "nurture", label: "Nurture sequence" }] },
    { title: "Visibility", nodes: [{ id: "crm", label: "CRM pipeline" }, { id: "dash", label: "Live dashboard" }] },
  ],
  edges: [
    ["web", "inbox"],
    ["ig", "inbox"],
    ["wa", "inbox"],
    ["call", "inbox"],
    ["inbox", "ai"],
    ["inbox", "enrich"],
    ["ai", "sales"],
    ["ai", "nurture"],
    ["sales", "crm"],
    ["nurture", "crm"],
    ["sales", "dash"],
  ],
  caption: "Lead flow · capture → qualify → act → measure",
};

const bookingFlow: FlowSpec = {
  tone: "dark",
  columns: [
    { title: "Requests", nodes: [{ id: "page", label: "Booking page" }, { id: "msg", label: "Messengers" }, { id: "phone", label: "Front desk" }] },
    { title: "Engine", nodes: [{ id: "avail", label: "Availability engine" }, { id: "rules", label: "Service rules" }] },
    { title: "Automation", nodes: [{ id: "confirm", label: "Instant confirmation", accent: true }, { id: "remind", label: "Reminders 24 h · 2 h" }, { id: "wait", label: "Waitlist recovery" }] },
    { title: "Operations", nodes: [{ id: "cal", label: "Staff calendars" }, { id: "report", label: "Daily schedule" }] },
  ],
  edges: [
    ["page", "avail"],
    ["msg", "avail"],
    ["phone", "avail"],
    ["avail", "confirm"],
    ["rules", "confirm"],
    ["avail", "remind"],
    ["rules", "wait"],
    ["confirm", "cal"],
    ["remind", "cal"],
    ["wait", "report"],
  ],
  caption: "Booking flow · request → availability → automation → calendar",
};

const opsFlow: FlowSpec = {
  tone: "dark",
  columns: [
    { title: "Sources", nodes: [{ id: "orders", label: "Order system" }, { id: "stock", label: "Inventory" }, { id: "floor", label: "Production updates" }] },
    { title: "Model", nodes: [{ id: "layer", label: "Shared data layer" }] },
    { title: "Logic", nodes: [{ id: "stages", label: "Stage tracking" }, { id: "risk", label: "Risk detection", accent: true }] },
    { title: "Output", nodes: [{ id: "dash", label: "Live dashboard" }, { id: "alerts", label: "Team alerts" }, { id: "weekly", label: "Weekly report" }] },
  ],
  edges: [
    ["orders", "layer"],
    ["stock", "layer"],
    ["floor", "layer"],
    ["layer", "stages"],
    ["layer", "risk"],
    ["stages", "dash"],
    ["risk", "alerts"],
    ["stages", "weekly"],
  ],
  caption: "Operations model · sources → shared data → logic → people",
};

const supportFlow: FlowSpec = {
  tone: "dark",
  columns: [
    { title: "Channels", nodes: [{ id: "chat", label: "Website chat" }, { id: "tg", label: "Telegram" }, { id: "mail", label: "Email" }] },
    { title: "Understand", nodes: [{ id: "intent", label: "Intent detection" }] },
    { title: "Ground", nodes: [{ id: "kb", label: "Knowledge retrieval" }, { id: "orders", label: "Order lookup" }] },
    { title: "Respond", nodes: [{ id: "reply", label: "AI reply + sources", accent: true }, { id: "human", label: "Human handoff" }] },
    { title: "Improve", nodes: [{ id: "review", label: "Quality review" }] },
  ],
  edges: [
    ["chat", "intent"],
    ["tg", "intent"],
    ["mail", "intent"],
    ["intent", "kb"],
    ["intent", "orders"],
    ["kb", "reply"],
    ["orders", "reply"],
    ["kb", "human"],
    ["reply", "review"],
    ["human", "review"],
  ],
  caption: "Support flow · understand → ground → respond → improve",
};

const webFlow: FlowSpec = {
  tone: "light",
  columns: [
    { title: "Content", nodes: [{ id: "model", label: "Structured content" }, { id: "langs", label: "HY · RU · EN" }] },
    { title: "Platform", nodes: [{ id: "cms", label: "Headless CMS" }, { id: "ds", label: "Design system" }] },
    { title: "Experience", nodes: [{ id: "tpl", label: "Page templates" }, { id: "motion", label: "3D & motion", accent: true }] },
    { title: "Delivery", nodes: [{ id: "edge", label: "Edge delivery" }, { id: "seo", label: "SEO & analytics" }] },
  ],
  edges: [
    ["model", "cms"],
    ["langs", "cms"],
    ["cms", "tpl"],
    ["ds", "tpl"],
    ["ds", "motion"],
    ["tpl", "edge"],
    ["motion", "edge"],
    ["tpl", "seo"],
  ],
  caption: "Content architecture · one model, three languages, every page",
};

type Composition = { tone: Tone; render: (label?: string) => ReactElement };

/** Every coded composition, by id. Reference these ids from project files. */
export const compositions = {
  "lead-pipeline": { tone: "dark", render: (l) => <LeadPipelineScene label={l} /> },
  "lead-conversation": { tone: "dark", render: (l) => <LeadConversationScene label={l} /> },
  "lead-flow": { tone: "dark", render: (l) => <FlowScene spec={leadFlow} label={l} /> },
  "realestate-plan": { tone: "light", render: (l) => <FloorplanScene label={l} /> },
  "realestate-matrix": { tone: "dark", render: (l) => <UnitMatrixScene label={l} /> },
  "realestate-mobile": { tone: "light", render: (l) => <RealEstatePhonesScene label={l} /> },
  "booking-calendar": { tone: "dark", render: (l) => <CalendarScene label={l} /> },
  "booking-mobile": { tone: "light", render: (l) => <BookingPhonesScene label={l} /> },
  "booking-flow": { tone: "dark", render: (l) => <FlowScene spec={bookingFlow} label={l} /> },
  "ops-dashboard": { tone: "dark", render: (l) => <OpsDashboardScene label={l} /> },
  "ops-timeline": { tone: "light", render: (l) => <OpsTimelineScene label={l} /> },
  "ops-flow": { tone: "dark", render: (l) => <FlowScene spec={opsFlow} label={l} /> },
  "support-inbox": { tone: "dark", render: (l) => <SupportInboxScene label={l} /> },
  "support-knowledge": { tone: "light", render: (l) => <KnowledgeScene label={l} /> },
  "support-flow": { tone: "dark", render: (l) => <FlowScene spec={supportFlow} label={l} /> },
  "web-editorial": { tone: "light", render: (l) => <EditorialSiteScene label={l} /> },
  "web-system": { tone: "dark", render: (l) => <DesignSystemScene label={l} /> },
  "web-flow": { tone: "light", render: (l) => <FlowScene spec={webFlow} label={l} /> },
} satisfies Record<string, Composition>;

export type CompositionId = keyof typeof compositions;
