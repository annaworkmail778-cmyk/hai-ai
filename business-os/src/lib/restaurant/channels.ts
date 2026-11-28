/*
 * Honest connection status of every external channel / platform. Only the restaurant's own website chat works
 * end-to-end inside the product; every third-party channel is SIMULATED until the owner completes the provider's
 * official onboarding. Requirements are from the providers' public documentation (see docs/RESTAURANT_OS_INTEGRATION_MATRIX.md).
 */
import type { Intent } from "./nlp.ts";
import type { InboxChannel, ReviewPlatform } from "./types.ts";

export type LinkState = "in_product" | "simulated" | "manual_only" | "partner_only";
export type ChannelInfo = { name: string; state: LinkState; needs: string[]; limits: string[] };

export const CHANNELS: Record<InboxChannel, ChannelInfo> = {
  webchat: { name: "Կայքի չատ", state: "in_product", needs: [], limits: ["Աշխատում է այս համակարգի ներսում (սեփական ալիք)"] },
  whatsapp: { name: "WhatsApp", state: "simulated", needs: ["Meta Business հաշիվ և ստուգված բիզնես", "WhatsApp Business Platform (Cloud API) հեռախոսահամար", "Webhook-ի URL և հաստատված ձևանմուշներ"], limits: ["Ազատ պատասխան՝ հյուրի վերջին հաղորդագրությունից 24 ժամ", "24 ժամից հետո՝ միայն հաստատված ձևանմուշ (վճարովի)"] },
  instagram: { name: "Instagram", state: "simulated", needs: ["Instagram Professional (Business/Creator) հաշիվ՝ կապված Facebook էջին", "Meta App Review՝ instagram_manage_messages", "Webhook բաժանորդագրություն"], limits: ["Պատասխան՝ 24 ժամվա ընթացքում", "HUMAN_AGENT պիտակ՝ մինչև 7 օր (հաստատումով)"] },
  messenger: { name: "Messenger", state: "simulated", needs: ["Facebook էջ և Meta App", "App Review՝ pages_messaging", "Webhook բաժանորդագրություն"], limits: ["Ստանդարտ պատուհան՝ 24 ժամ", "Human Agent պիտակ՝ 7 օր (հաստատումով)"] },
  email: { name: "Email", state: "simulated", needs: ["Ռեստորանի փոստարկղ (IMAP/SMTP կամ Gmail/Microsoft API)", "SPF / DKIM ուղարկողի համար"], limits: ["Ցուցադրությունում նամակներ չեն ուղարկվում"] },
};

export const REVIEW_PLATFORMS: Record<ReviewPlatform, ChannelInfo> = {
  google: { name: "Google Business Profile", state: "simulated", needs: ["Ստուգված Google Business Profile վայր", "Business Profile API հասանելիության հաստատում", "OAuth (business.manage) սեփականատիրոջ կողմից"], limits: ["Պատասխանը կարող է անցնել Google-ի մոդերացիա", "Ցուցադրությունում հրապարակումը սիմուլյացիա է"] },
  tripadvisor: { name: "Tripadvisor", state: "manual_only", needs: ["Tripadvisor Management Center հաշիվ"], limits: ["Պատասխանելու հանրային API չկա․ պատասխանը պատճենվում և տեղադրվում է ձեռքով"] },
  thefork: { name: "TheFork", state: "partner_only", needs: ["TheFork Manager հաշիվ", "Գործընկերային (B2B) API հասանելիություն՝ միայն հաստատված գործընկերներին"], limits: ["Մինչ գործընկերությունը՝ պատասխանը ձեռքով TheFork Manager-ում"] },
};

export const LINK_LABEL: Record<LinkState, string> = { in_product: "Աշխատում է (սեփական ալիք)", simulated: "Միացված չէ · սիմուլյացիա", manual_only: "Միայն ձեռքով", partner_only: "Միայն գործընկերներին" };

export const INTENT_HY: Record<Intent, string> = { hours: "Աշխատանքային ժամեր", menu: "Մենյու", allergy: "Ալերգիա", reservation: "Ամրագրում", reservation_change: "Ամրագրման փոփոխություն", order_status: "Պատվերի կարգավիճակ", complaint: "Բողոք", manager: "Մենեջեր", delivery: "Առաքում", price_discount: "Գին / զեղչ", thanks: "Շնորհակալություն", other: "Այլ" };
