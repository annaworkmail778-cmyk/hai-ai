# 19 — Implementation Roadmap

Starts after the founder approves Phase 1. **M** = manual, **A** = automated.

## First 24 hours
1. Founder approves or edits the decisions in doc 21: domain, prices, legal form, CRM choice, segments.
2. (M) Create the CRM spreadsheet from doc 10. Create tabs and headers only; no data imports from unknown sources.
3. (M) Write `sales/facts/company-facts.md`: the only facts that may be used in sales material. Get the founder's sign-off.
4. (M) Research & Ops: first 20 developers from public sources, with source URLs.
5. (M) Founder: list 10 warm contacts who know developers, solar installers or business owners.
6. (M) Book a lawyer consultation and an accountant consultation.

## First 72 hours
1. (M) 60 companies researched (40 developers, 20 solar/O&M), scored and tiered.
2. Phase 2 build items 1–5 (doc 20): Claude rules, the 4 agents, research and qualification skills, hooks.
3. (M) Developer Sales OS one-pager (hy/ru) and discovery script. **Demo screenshots from the existing Lead-to-Booking demo, labelled as demo.**
4. (M) First 15 personalized touches (founder-approved) and 10 calls to public sales numbers.
5. (M) Message warm contacts asking for introductions.
6. SMB: follow up with contest participants (contest runs until Nov 25). This is a cash bridge.

## Days 4–7
- Developer Sales OS demo video A (90 s, hy + en), built in Remotion with demo data.
- Proposal template (doc 15 structure) + pricing approved.
- 4+ discovery meetings held. Notes go through `deal-desk`.
- Daily plan and EOD report run manually via the skill.

## Days 8–40
| Week | Focus | Manual | Automate (only if proven) |
|---|---|---|---|
| 2 (d8–14) | Meetings → proposals | Calls, meetings, proposals | — |
| 3 (d15–21) | Close the first pilot; Solar demo video B | Negotiation, contract (lawyer-reviewed), invoicing | Daily plan → Telegram (n8n schedule) |
| 4 (d22–28) | Deliver pilot 1; keep the pipeline full | Delivery, outreach | EOD report → Telegram; website form → CRM row |
| 5 (d29–35) | Go-live milestones = cash | Collections | Dedupe check on insert |
| 6 (d36–40) | Review; first case study draft (with permission) | Retro | — |
Website B2B pages (`/developers`, `/solar`) ship in week 2–3, after the copy is approved.

## Days 41–90
- Decide whether to move the CRM to HubSpot Free or the Supabase dashboard (criterion: more than 300 active records, or the need to show clients a dashboard).
- Productize the Developer Sales OS: templates per channel, a standard n8n package, client onboarding checklist.
- Build the management dashboard (Next.js + Supabase) as a reusable component for clients.
- 1–2 case studies published with client approval.
- Partner/referral programme if vendors are vetted.
- EU/US preparation: LIA, outreach policy, English assets. No outreach before the lawyer has checked the policy.
- Move hosting to a commercial plan.

## Manual → automated rule
Automate a step only when it has been done **10+ times manually**, has a written checklist, and has a clear owner who reviews the output.
