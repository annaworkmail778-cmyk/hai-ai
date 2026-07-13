import type { LucideIcon } from "lucide-react";
import { BadgeCheck, BarChart3, Code, Languages, Layers, Palette, PhoneCall, Wallet } from "lucide-react";

/**
 * Structural data for the commercial sections. All prices are authored in USD
 * (see src/lib/i18n formatMoney for per-language currency). Human-readable copy
 * lives in the i18n dictionaries, keyed by the ids/labels below.
 */

export type PlanId = "starter" | "growth" | "pro" | "clinic";

export type Plan = {
  id: PlanId;
  monthly: number | null; // USD base; null → "Custom"
  priceSuffix?: string; // e.g. "+" → "$249+"
  annual: number | null; // USD base; null → custom annual
  setup: number; // USD base one-time
  highlight?: boolean;
};

export const plans: Plan[] = [
  { id: "starter", monthly: 39, annual: 390, setup: 150 },
  { id: "growth", monthly: 89, annual: 890, setup: 250, highlight: true },
  { id: "pro", monthly: 149, annual: 1490, setup: 400 },
  { id: "clinic", monthly: 249, priceSuffix: "+", annual: null, setup: 600 },
];

/** A matrix cell: true=included, false=not, "limited"=partial, string=explicit value.
 *  String labels/values double as i18n keys (see compare.tr). */
export type Cell = boolean | "limited" | string;

export type FeatureRow = {
  label: string;
  values: Record<PlanId, Cell>;
  note?: string;
};

export type FeatureGroup = {
  title: string;
  rows: FeatureRow[];
};

export const matrix: FeatureGroup[] = [
  {
    title: "Channels",
    rows: [
      { label: "AI receptionist", values: { starter: true, growth: true, pro: true, clinic: true } },
      {
        label: "Instagram & Messenger",
        note: "Starter includes 1 channel of your choice",
        values: { starter: "limited", growth: true, pro: true, clinic: true },
      },
      { label: "WhatsApp", values: { starter: false, growth: true, pro: true, clinic: true } },
      { label: "Telegram", values: { starter: "limited", growth: true, pro: true, clinic: true } },
      { label: "Web chat widget", values: { starter: false, growth: false, pro: true, clinic: true } },
      { label: "Voice-note booking", values: { starter: true, growth: true, pro: true, clinic: true } },
    ],
  },
  {
    title: "Booking & calendar",
    rows: [
      { label: "Smart availability & booking", values: { starter: true, growth: true, pro: true, clinic: true } },
      { label: "Staff calendars", values: { starter: "1", growth: "5", pro: "15", clinic: "Unlimited" } },
      { label: "Service durations & buffers", values: { starter: true, growth: true, pro: true, clinic: true } },
      { label: "Automated reminders", values: { starter: true, growth: true, pro: true, clinic: true } },
    ],
  },
  {
    title: "CRM & integrations",
    rows: [
      {
        label: "Yclients sync",
        note: "Growth includes 1 CRM of your choice",
        values: { starter: false, growth: "limited", pro: true, clinic: true },
      },
      { label: "DIKIDI sync", values: { starter: false, growth: "limited", pro: true, clinic: true } },
      { label: "Client history & notes", values: { starter: false, growth: false, pro: true, clinic: true } },
      { label: "Custom CRM fields", values: { starter: false, growth: false, pro: false, clinic: true } },
      { label: "Custom integrations", values: { starter: false, growth: false, pro: "limited", clinic: true } },
      {
        label: "API access",
        note: "Available as an add-on on any plan",
        values: { starter: false, growth: false, pro: false, clinic: true },
      },
    ],
  },
  {
    title: "Retention & revenue",
    rows: [
      { label: "Rebooking & win-back", values: { starter: false, growth: true, pro: true, clinic: true } },
      { label: "No-show deposits", values: { starter: false, growth: false, pro: true, clinic: true } },
      { label: "Waitlist auto-fill", values: { starter: false, growth: false, pro: true, clinic: true } },
      { label: "Marketing campaigns", values: { starter: false, growth: false, pro: false, clinic: true } },
    ],
  },
  {
    title: "Intelligence & admin",
    rows: [
      {
        label: "AI memory",
        note: "Persistent conversation memory above Starter",
        values: { starter: "limited", growth: true, pro: true, clinic: true },
      },
      { label: "Knowledge base", values: { starter: "20 Q&A", growth: "100 Q&A", pro: "Unlimited", clinic: "Unlimited" } },
      {
        label: "Monthly conversations",
        note: "Soft cap — we alert, never hard-block a booking",
        values: { starter: "500", growth: "3,000", pro: "10,000", clinic: "Custom" },
      },
      { label: "Analytics dashboard", values: { starter: "Telegram", growth: "Basic web", pro: "Full", clinic: "Multi-location" } },
      { label: "Analytics history", values: { starter: "7 days", growth: "90 days", pro: "12 months", clinic: "12 months" } },
      { label: "Weekly reports", values: { starter: "limited", growth: true, pro: true, clinic: true } },
      { label: "Multi-location", values: { starter: false, growth: false, pro: false, clinic: true } },
      { label: "Team seats", values: { starter: "1", growth: "3", pro: "10", clinic: "Unlimited" } },
      { label: "Custom branding", values: { starter: false, growth: false, pro: true, clinic: true } },
      {
        label: "White-label",
        note: "Available as an add-on for agencies & resellers",
        values: { starter: false, growth: false, pro: false, clinic: "limited" },
      },
    ],
  },
  {
    title: "Support",
    rows: [
      { label: "Onboarding & install", values: { starter: true, growth: true, pro: true, clinic: true } },
      { label: "Support", values: { starter: "Community", growth: "Email · 24h", pro: "Priority + WhatsApp", clinic: "Dedicated" } },
    ],
  },
];

/** Add-on price formatting types (see i18n addons.price). */
export type AddOnType = "mo" | "moUsage" | "moRev" | "once" | "from";

export type AddOn = {
  id: string;
  icon: LucideIcon;
  priceUsd: number;
  priceType: AddOnType;
};

export const addOns: AddOn[] = [
  { id: "deposits", icon: Wallet, priceUsd: 19, priceType: "mo" },
  { id: "voice", icon: PhoneCall, priceUsd: 49, priceType: "moUsage" },
  { id: "whitelabel", icon: Layers, priceUsd: 99, priceType: "moRev" },
  { id: "attribution", icon: BarChart3, priceUsd: 29, priceType: "mo" },
  { id: "language", icon: Languages, priceUsd: 15, priceType: "mo" },
  { id: "persona", icon: Palette, priceUsd: 39, priceType: "once" },
  { id: "api", icon: Code, priceUsd: 79, priceType: "mo" },
  { id: "onboarding", icon: BadgeCheck, priceUsd: 149, priceType: "from" },
];
