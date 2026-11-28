# RISEUP Restaurant OS: Integration Matrix

**Status:** Phase 1 research, for approval. **Researched:** 2026-11-27.
**Rule:** nothing below is connected. "Verified" means we found the provider's own documentation (or an official government document) during this research. Everything else is an assumption to confirm with the provider before any commitment to a client.

**Evidence levels**
- **V** verified from an official source
- **S** secondary source only (integrator page, community library, press)
- **U** unverified / not found


---

## Revision 2 — channels, reviews, reservations and payment adapter (2026-11-28)

| Integration | Official path | Requirements | Demo state |
|---|---|---|---|
| Website chat | Own product | — | **Works** (in product) |
| WhatsApp Business Platform | Cloud API | Meta Business verification, phone number, webhook, approved templates; 24 h free-form window, templates after | Simulated, labelled |
| Instagram Messaging | Instagram Graph / Messenger Platform | Professional account linked to a Page, App Review (`instagram_manage_messages`), webhooks; 24 h window, HUMAN_AGENT tag up to 7 days with approval | Simulated, labelled |
| Messenger | Messenger Platform | Page, App Review (`pages_messaging`), webhooks; 24 h window, Human Agent tag 7 days; several tags retired in 2026 (**verify**) | Simulated, labelled |
| Email | IMAP/SMTP, Gmail API, Microsoft Graph | Mailbox access, SPF/DKIM | Simulated, labelled |
| Google Business Profile reviews | Business Profile API (`reviews.updateReply`) | Verified location, API access approval, OAuth `business.manage`; replies may be moderated | Publish simulated, labelled |
| Tripadvisor reviews | Management Center (no public reply API) | Owner account | Manual posting |
| TheFork reviews / bookings | TheFork Manager, B2B/Partners API | Accepted partnership | Manual |
| OpenTable | Partner API | Partner approval + contract, OAuth 2.0 | Not connected |
| Card terminal | Acquirer / POS vendor SDK | Merchant contract, test terminal | `demo-terminal` simulated adapter: pending → approved/declined with unique provider reference |
| SMS reminders | Local gateway | Contract, consent | Simulated, labelled |

Rule: no unofficial scraping; nothing is shown as connected until it is connected and verified.

---

## Revision 1 — Phase 1 matrix (kept for reference)


## 1. Principles
1. **Coexist first.** Restaurant OS never requires replacing the POS, fiscal register, payment terminal or accountant's software.
2. **Integrate through official APIs only**, under the restaurant's own account and the provider's approval. No scraping, no reverse engineering of fiscal devices.
3. **Every integration has a manual fallback** that works on day one (e.g. "settled on POS" button, CSV export, Telegram staff alert).
4. **No claim without verification:** the UI shows `Not connected`, `Simulated`, or `Connected` (only after a live test with the client's credentials).
5. **Never claim fiscal compliance** or the ability to issue legally valid receipts unless SRC requirements, device vendor and certification are verified in writing.

---

## 2. POS and restaurant management systems
| Provider | Official API? | What it supports (per docs found) | Auth / approval | Realistic? | Unverified | Alternative |
|---|---|---|---|---|---|---|
| **iiko / Syrve** | **V** — iiko Cloud API docs at `api-ru.iiko.services/docs`; Syrve API at `api-eu.syrve.live/docs`; separate .NET Front plugin API (`syrve.github.io`) | Cloud API is used by integrators for menu (nomenclature), stop-lists, delivery and table orders (S: integrator plugins); plugin API runs inside the POS client | API key generated in iikoWeb by the restaurant (S); partner terms per region | **Yes, best candidate** if a client runs iiko/Syrve | Which region/cluster Armenian accounts use; whether order injection is enabled on the client's licence; cost of API access | Orders shown to cashier for manual entry (P1 coexistence) |
| **r_keeper (UCS)** | **S/U** — r_keeper 7 docs exist (`docs.rkeeper.ru`); an "HTTP access" privilege is referenced in a Yandex Pay setup guide; Yandex Logistics documents an r_keeper integration | Order/check access via r_keeper's XML/HTTP interface (S) | Dealer-installed, licence-dependent | **Possible via the local dealer** | Public REST API; Armenian dealer terms; version installed at the client | Manual entry; daily CSV |
| **Poster POS** | **V (portal exists)** — `dev.joinposter.com` says the API lets developers receive and edit account data, plus in-app widgets | Online orders sync to POS (S: GonnaOrder, Restimo integrations) | Application registration | **Likely** | Exact incoming-order endpoints; availability in Armenia | Manual entry |
| Square, Toast, Lightspeed | Official APIs exist | Full orders/menu APIs | Merchant accounts | **Unlikely in Armenia** (merchant availability in Armenia not found) | Availability | — |
| Local Armenian POS / cash-register software | **U** | — | — | Unknown | Which systems Tsaghkadzor restaurants use: **ask in every discovery interview (question 11 already exists)** | Manual entry |

**Integration patterns, in order of preference**
1. **Order injection** (RISEUP order → POS check) so the cashier settles on the POS without retyping.
2. **Menu + stop-list sync** (POS → RISEUP) so prices and availability have one source.
3. **Sales sync** (POS closed checks → RISEUP analytics) for restaurants where waiters keep using the POS.
4. **Payment status** (POS → RISEUP order "settled").
5. **Daily export** (CSV/XLSX) for accounting reconciliation — always available.

## 3. Fiscal cash registers (Armenia, e-HDM / ՀԴՄ)
| Item | Finding | Evidence |
|---|---|---|
| Integration protocol | The State Revenue Committee (SRC) publishes an **HDM Integration Protocol** (v0.7.3, April 2025) describing how a fiscal cash register connects with external software in "integration mode", activated on the device by an administrator | **V** (src.am PDF) |
| Transport | A community client library describes the transport as TCP with JSON payloads to the device on the local network | **S** (docs.rs `hdm-am`) |
| Electronic HDM | SRC publishes **electronic HDM** integration manuals (Nov 2024, Mar 2026, Apr 2026 editions) | **V** (titles/files on src.am; contents not reviewed in this research) |
| Open API direction | An SRC/MinFin procurement clarification describes physical and virtual registers (virtual via mutual TLS) and an aim of an open standard API | **S/V** (gnumner.minfin.am) |
| Third-party example | A hotel PMS (Exely) documents a cash-register connection by IP/port/password on the local network | **S** |

**Conclusions**
- Issuing fiscal receipts from Restaurant OS is **technically documented but legally and operationally heavy**: it needs the client's registered device or e-HDM, the protocol implementation, a local bridge for LAN devices, and confirmation from SRC and a tax adviser of what software registration or approval is required. **Tier E, Category C.**
- Until then: **the guest receives the fiscal receipt from the restaurant's existing register, exactly as today.** Restaurant OS marks the order "settled on POS".
- Required before any fiscal work: read the current SRC e-HDM manual in full, written legal opinion, device vendor confirmation, test device.

## 4. Payments
| Provider | Official API? | Supports | Auth / approval | Realistic? | Unverified | Alternative |
|---|---|---|---|---|---|---|
| **Ameriabank vPOS** | **V (product page)**; API reference not opened. Secondary sources name a VPOS Web API with a test environment | E-commerce card acceptance (Visa, Mastercard, Mir, ArCa), 3-D Secure | Merchant agreement; apply via MyBusiness; test credentials from the vPOS team (S) | **Yes** for prepaid takeaway/delivery/deposits | API details, refunds/pre-auth support, fees (one T&C edition lists ArCa at 1.5%; check current) | Pay at pickup on the restaurant's terminal |
| Other Armenian banks' vPOS (via ArCa gateway) | **U** | Card e-commerce | Bank agreement | Probable | Each bank's API | Same |
| **Idram** | **S** — merchant interface description (copies on SlideShare/third-party PDF), form-post to Idram's GetPayment endpoint, success/fail/result callbacks, secret key set by Idram after agreement | Wallet payments on web and mobile | Merchant agreement with Idram | **Yes** (popular wallet, check current docs) | Official current spec | Card vPOS |
| **Telcell Wallet** | **U** (official docs not found; a community Omnipay driver uses shop ID + key) | Wallet payments | Merchant agreement | Probable | Everything | Card vPOS |
| Stripe / PayPal | — | — | — | Earlier RISEUP research: not offered to Armenian merchants; **re-verify** | — | — |

**Rule:** card data never touches RISEUP servers (redirect/hosted payment page). Order is `paid` only after a **server-side verified** provider callback. Demo: payments are absent; any "payment" screen would be labelled **Simulated**.

## 5. Accounting
| Provider | Official API? | Supports | Realistic? | Unverified | Alternative |
|---|---|---|---|---|---|
| **ArmSoft** (AS-Bookkeeper, AS-Accountant) | **S** (product listings) | XML import/export of data; SRC e-invoicing integration; newer cloud product | **Yes, via file exchange** | Import format for sales journals | CSV/XLSX daily sales & purchases export |
| **1C (Armenian localisation)** | **S** — official 1C representative in Armenia (INFOEXPERT); 1C:Enterprise 8.3.5+ can auto-generate a REST (OData) interface | File or OData exchange | Per client configuration | Which configuration the client's accountant uses | CSV export |
| Other local accounting software | **U** | — | Unknown | Ask accountants during pilot | CSV export |
| SRC e-invoicing (supplier invoices) | **S** (vendor integrations exist) | — | Later | — | Manual |

**Decision:** pilot = **CSV/XLSX exports** (daily sales by category/VAT mode, discounts, voids, purchases and goods receipts). Direct accounting integration only on demand (Tier E).

## 6. Delivery platforms
| Provider | Official API? | Supports | Realistic? | Unverified | Alternative |
|---|---|---|---|---|---|
| **Yandex Eats** | **V** — "API for Yandex Service Integration" (`yandex.com/dev/eda-vendor`): menu, orders, restaurants, feedback, delivery zones, schedules; partner implements the methods, Yandex mostly pulls | Order intake, menu/stop-list publishing | **Possible** | Operating in Armenia since Sept 2022 (press, S); whether the vendor API is enabled for Armenian partners; partner approval | Tablet from the platform + staff re-entry; RISEUP direct ordering |
| **Menu.am** | **U** (no public API found; shared promotions with Yandex appear in Yandex's Armenian promo rules) | — | Unknown | Everything | Same |
| Glovo, Wolt, others | **U** for Armenia | — | Unknown | Presence and partner APIs in Armenia | — |
| Aggregators (Deliverect-type middleware) | Official APIs exist | Multi-platform order routing | Only if a platform in Armenia supports them | Coverage | — |

Strategic note: Restaurant OS's direct ordering **reduces** dependence on commission platforms; platform integration matters for restaurants with high platform volume and is Tier C.

## 7. Messaging and notifications
| Channel | Official API? | Notes | Realistic? | Demo |
|---|---|---|---|---|
| **Telegram Bot API** | **V** (public, free) | Staff alerts to a group; customers must start the bot first | **Yes — pilot default for staff alerts** (already planned in existing docs) | B |
| **WhatsApp Business Platform (Cloud API)** | **V** (Meta docs) | Templates (marketing / utility / authentication) billed **per delivered message** since 1 July 2025; Meta's docs state non-template messages are charged from 1 October 2026; rates by country — check the official rate card for Armenia | Yes, needs Meta Business verification and approved templates | B |
| **Viber Business Messages** | **V** via official partners list (`forbusiness.viber.com`); partners (e.g. Infobip API docs) | Popular in the region; partner minimums apply (one partner page lists a monthly minimum of 115 EUR from month two) | Possible for customer messages | B |
| **SMS** | Via aggregators (S) | Per a compliance guide: Armenian landlines can't receive SMS and two-way A2P SMS isn't available — design SMS as one-way | Yes for "order ready" / reminders | B |
| **E-mail** | Resend (already used by the main site's contact form) | Transactional e-mail | Yes | B |
| **Web push** | Standard (PWA) | iOS requires the site to be installed to the home screen | Optional for staff | — |

**Consent:** marketing messages only with recorded opt-in per channel; every message includes opt-out; service messages (order ready, reservation reminder) only for the transaction the guest initiated.

## 8. Printers
| Option | Official docs? | How it works | Realistic? |
|---|---|---|---|
| **Star CloudPRNT** | **V** (star-m.jp developer guide) | Printer polls an HTTPS endpoint, posts status (JSON), fetches a job with GET, confirms with DELETE; MQTT variant available | **Yes, no local agent needed** |
| **Epson Server Direct Print** | **S** (Odoo, WCPOS docs; Epson's own spec not opened) | Printer polls a URL and pulls ePOS-Print XML | **Yes** |
| Generic ESC/POS LAN printers | Standard protocol | Needs a local bridge (small agent on a PC/Raspberry Pi) | Possible, more support effort |

Tier P (kitchen tickets for kitchens that prefer paper), Category C.

## 9. Hotel OS (internal)
| Capability | Contract | Status |
|---|---|---|
| Room-service order with stay verification | `HotelBridge.verifyStay(roomId, stayRef)` → `RoomServiceOrder` | Designed (`TECHNICAL_ARCHITECTURE.md` §11); demo B in optional phase R9 |
| Charge to room (folio posting) | `FolioPosting`, idempotent by order id | Designed; demo B |
| Shared guest identity and loyalty | Organization-level `Person` and ledger | Tier E |

## 10. Other services
| Service | Use | Status |
|---|---|---|
| Google Business Profile / Maps | Directions link (no API key needed); reviews API needs approval | Link only in demo |
| Yandex Maps | Directions link | Link only |
| Instagram | Link in bio to booking/order pages | Link only |
| Claude API (LLM assistant) | Future `LLMEngine` behind the existing assistant contract, answers checked against tool results | Tier C |
| Supabase | Production DB, Auth, RLS, Realtime, Storage | Tier P (pilot), as in existing docs |
| n8n | Outbox workers (already used by RISEUP) | Tier P |

## 11. Verification checklist before promising any integration to a client
- [ ] Client's exact system name, version, licence and dealer.
- [ ] Provider's official API documentation read; sandbox access obtained.
- [ ] Provider approval or partner agreement terms (cost, timeline).
- [ ] Data-processing terms (who is controller/processor).
- [ ] Live test with the client's credentials on a test location.
- [ ] Manual fallback documented and trained.
- [ ] For fiscal or payment: written legal/tax confirmation.

## Sources
- SRC HDM integration protocol (v0.7.3, 2025): https://src.am/storage/menu_contents_144/uc_hhpek_hdm_integration_manual_2025_v073_arm_680f12e548bc8.pdf
- SRC electronic HDM integration manual (Apr 2026): https://www.src.am/storage/menu_contents_144/uc_hhpek_electronic_HDM_integration_manual_04_2026__69eef5319d758.pdf
- SRC electronic HDM integration manual (Nov 2024): https://src.am/storage/menu_contents_144/uc_hhpek_electronic_HDM_integration_manual_11_2024_6734a3be6964d.pdf
- `hdm-am` community client spec: https://docs.rs/crate/hdm-am/0.3.0/source/docs/spec.md
- MinFin procurement clarification: https://gnumner.minfin.am/website/images/original/ClarificationmadePre-Proposal Meetingissued.pdf
- Exely cash-register guide: https://exely.com/help/381181/
- Syrve Front API: https://syrve.github.io/front.api.doc/Intro.html
- r_keeper + Yandex Pay guide: https://pay.yandex.ru/docs/ru/qr-code/rkeeper.md
- Yandex Logistics r_keeper integration: https://yandex.com/dev/logistics/api/integration/integration-rkeeper.html
- Poster for developers: https://dev.joinposter.com/en
- GonnaOrder Poster integration: https://gonnaorder.com/help/store-settings/integrations/poster
- Restimo Poster integration: https://www.restimo.com/en/integrations/poster
- Ameriabank e-commerce: https://ameriabank.am/en/business/sme/cards/acquiring/ecommerce
- Ameriabank internet acquiring T&C (ed9): https://ameriabank.am/Portals/0/files/Business/pos/green/Internet_Acquiring_Terms_and_Conditions_ed9_eng.pdf
- Ucraft Ameriabank vPOS setup: https://support.ucraft.com/en/articles/5243868-how-to-setup-ameriabank-vpos
- Ameria/Idram integration write-up: https://dev.to/boolfalse/ameriabank-idram-v-pos-integration-to-your-laravel-php-app-e55
- Idram merchant interface (copy): https://www.slideshare.net/slideshow/idram-merchant-api-idram-payment-system-merchant-interface-description/228443396
- Idram interface PDF (copy): https://totalarmenia.am/image/uploads/67b998ad99ac7.pdf
- Telcell Omnipay driver (community): https://github.com/ArtMin96/omnipay-telcell-wallet
- ArmSoft AS-Bookkeeper listing: https://marketplace.platform.softwareone.com/product/as-bookkeeper/PCP-3099-7133
- ArmSoft AS-Accountant listing: https://marketplace.platform.softwareone.com/product/as-accountant/PCP-4767-7745
- INFOEXPERT (1C in Armenia): https://www.spyur.am/en/companies/3679
- 1C integration methods: https://1c-dn.com/blog/methods-of-integration-with-1c-enterprise-applications/
- Yandex Eats vendor API: https://yandex.com/dev/eda-vendor/doc/en/ref/
- Yandex Eats Armenia launch: https://www.euronews.com/2022/09/15/russia-yandex-armenia
- Yandex Eats Armenia promo rules: https://yandex.com/project/eats/am/rules/09_06_2026
- WhatsApp Business Platform pricing: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing
- WhatsApp non-template pricing: https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing/non-template-messages/
- Viber messaging partners: https://forbusiness.viber.com/en/messaging-partners/
- Infobip Viber API: https://www.infobip.com/docs/viber/business-messages/api
- SMSBAT Viber Armenia pricing: https://smsbat.com/es/pricing/viber-business-messages/armenia/
- Armenia SMS guidance: https://sent.dm/resources/am_sms_guidance
- Star CloudPRNT: https://star-m.jp/products/s_print/sdk/StarCloudPRNT/manual/en/about.html
- Star CloudPRNT protocol: https://star-m.jp/products/s_print/sdk/StarCloudPRNT/manual/en/protocol-guide.html
- Epson Server Direct Print (Odoo): https://www.odoo.com/documentation/master/applications/sales/point_of_sale/configuration/epson_server_direct_print.html
- WCPOS cloud printing: https://docs.wcpos.com/receipts/cloud-printing.md
