# RISEUP Restaurant OS: Operations Research

What a mid-size restaurant (60–150 covers, à la carte, Armenia / CIS context, multilingual guests) actually does during service, where time and money are lost, and which product decisions follow. External facts are from providers' public documentation consulted during this phase; anything that must be re-verified before a client promise is marked **verify**.

## 1. Service in practice

### 1.1 The dining-room loop
Greet → seat → water/menu → drinks order → food order (often by course) → kitchen → "ready" → run food → check-back → more drinks / dessert → bill → payment → reset table.

Observed pain points (common across restaurant operations literature and the owner interviews in CUSTOMER_DISCOVERY):

| Pain | Cost | Product decision |
|---|---|---|
| Paper tickets mis-read, lost, or not split by station | Remakes, waste, slow tickets | Digital order → automatic station routing (A) |
| Courses fired too early or forgotten | Cold mains, angry guests | Course on every line; later courses **held**; one-tap "fire course" (A) |
| Waiter does not know food is ready | Food dies on the pass | "Ready" appears in the waiter's attention queue; KDS expo view (A) |
| Allergy told to waiter never reaches kitchen | Safety risk | Table allergy field printed on every ticket for that table (A) |
| Splitting the bill by hand | 3–6 min per table, errors | Seat numbers at order time → split by seat / equal (A) |
| "Did that card payment go through?" | Disputes, losses | Payment state only from the terminal / provider response (A with simulated adapter) |
| Guests can't get the waiter's attention | Lower check average, bad reviews | QR call waiter / bill; attention queue sorted by age (A) |
| Double-booked tables, no-shows | Lost covers | Availability engine with turn time and buffer; no-show after +15 min; reminders (A / B) |
| Messages across WhatsApp, Instagram, phone, email | Slow answers, lost bookings | Unified inbox with AI drafts and human approval (A UI / B channels) |
| Unanswered bad reviews | Rating drift | Review center; low rating creates a task (A) |
| Food cost unknown until month end | Margin erosion | Recipe costing, price-change impact, automatic deduction (A) |
| Stock-outs discovered during service | 86'd dishes, angry guests | Live stock, low-stock alert, sold-out sync to every channel (A) |

### 1.2 Kitchen
Station-based (hot, grill, cold, pastry, bar). Needs: big readable tickets, timers against station-specific thresholds, modifiers and allergens prominent, all-day counts for batching, a way to undo a mistaken bump with accountability. See KITCHEN_WORKFLOWS.

### 1.3 Host stand
Peaks between 19:00 and 21:00. Needs: today's book at a glance, a suggestion for which table fits, combinations for large parties, a waitlist with honest quotes, and walk-ins that do not break later bookings. See USER_JOURNEYS §Host.

## 2. Turn times and capacity rules used

| Party size | Default turn | Source |
|---|---|---|
| 1–2 | 75 min | Typical casual / premium casual dinner turn |
| 3–4 | 95 min | |
| 5+ | 120 min | |

Buffer between bookings: 15 min. All values are configuration in `ops.ts` and must be tuned per client in the pilot (**verify with the client's POS history**).

## 3. Reservation platforms

| Platform | Integration reality | Decision |
|---|---|---|
| TheFork | B2B / "Partners" API for accepted partners only; keys issued after a partnership agreement | R; host workspace accepts manual / imported bookings meanwhile |
| OpenTable | Partner approval + contract, OAuth 2.0 | R |
| Google (Reserve with Google) | Through approved booking partners | R |
| Own website + chat + phone | Fully under our control | **A** — this is the demo path |

## 4. Messaging channels (verify before each client promise)

| Channel | Requirements | Constraints |
|---|---|---|
| WhatsApp Business Platform (Cloud API) | Meta Business account, business verification, a dedicated phone number, webhook, approved templates | Free-form replies only within 24 h of the guest's last message; after that only approved templates, priced per message |
| Instagram Messaging | Instagram **Professional** account linked to a Facebook Page, Meta App Review (`instagram_manage_messages`), webhooks | 24 h standard window; `HUMAN_AGENT` tag allows up to 7 days for human replies and needs approval |
| Messenger | Facebook Page, Meta App, App Review (`pages_messaging`), webhooks | 24 h window; Human Agent tag 7 days (approval). Meta retired several message tags in 2026 — **verify the current tag list** |
| Email | IMAP/SMTP or Gmail / Microsoft Graph | SPF / DKIM for deliverability |
| SMS (reminders) | Local SMS gateway contract | Cost per message; consent |

Decision: the product works with *any* of these switched off. Every message carries a state (`received`, `delivered`, `simulated`, `auto_simulated`, `auto_delivered`) so the UI can never imply a message was sent when it was not.

## 5. Review platforms

| Platform | Reply possibility | Decision |
|---|---|---|
| Google Business Profile | Official API: `accounts.locations.reviews.updateReply`, OAuth scope `business.manage`, verified location, API access approval; replies can go through moderation | Adapter designed; demo simulates publish and labels it |
| Tripadvisor | No public management-response API for restaurants; replies via Management Center | Approved reply is copied and posted manually; status "manual" |
| TheFork | Partner-gated (TheFork Manager / B2B API) | Manual until partnership |

No scraping. Review import for Tripadvisor / TheFork is manual or partner-based.

## 6. Payments and fiscal (Armenia)

* Card terminals belong to the acquiring bank or the POS vendor. Restaurant OS must treat payment as **requested → pending → approved / declined** and accept only the provider's answer (with a unique reference) as proof. Implemented with a `demo-terminal` simulated adapter.
* Online payments (bank vPOS, Idram, Telcell) need a merchant contract (R).
* Fiscal receipts: issued by the restaurant's existing e-HDM / ՀԴՄ. Restaurant OS does **not** claim fiscal compliance; fiscal integration needs the SRC protocol and a certified vendor (R).

## 7. Staffing reality

Small teams, high turnover, multilingual staff (Armenian, Russian, some English). Hence: staff UI in hy / ru / en per device; SOP assistant for onboarding; role-based screens that show only what each role needs; one-handed waiter UI with 48 px targets.

## 8. What we deliberately do not automate

* Sending anything to a guest without a human (except manager-enabled low-risk auto-replies).
* Sending purchase orders to suppliers (drafts only).
* Marking payments as paid without a provider result.
* Answering allergy, complaint, discount or "speak to the manager" messages automatically.
* Promising fiscal, delivery-platform or reservation-platform integration before partner access is confirmed.
