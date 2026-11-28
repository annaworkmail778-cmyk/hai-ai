# Hotel OS: Integration Matrix

Research date: 2026-11-28. Sources are official vendor developer documentation, unless a row is marked *third-party*. Vendor terms change, so confirm with the provider before contracting.

**Class**

| # | Meaning |
|---|---|
| 1 | Official integration available and implementable |
| 2 | Requires provider approval / additional permissions |
| 3 | Requires an integration partner / partner status |
| 4 | Not currently feasible |
| 5 | Demo-only |

**Demo status:** every channel is **simulated** in the demo, and none is connected. The in-app version of this matrix is `/admin/integrations`, built from `business-os/src/lib/channel-adapters.ts`.

## Messaging

| Channel | Official API | Auth / access | Key restrictions | Webhooks | Class | Alternative |
|---|---|---|---|---|---|---|
| WhatsApp Business | Cloud API (send messages, templates) | Meta Business account, verified number, system-user token | Free-form replies only inside the **24-hour customer-service window** (it resets on each user message). Outside it, only **approved templates**. User opt-in required | Yes | 2 | BSP (e.g. 360dialog, Twilio) |
| Instagram Direct | Instagram Messaging API | `instagram_business_manage_messages` (Instagram Login) or `instagram_manage_messages` (Facebook Login); App Review | Professional account. **Escalation path to a human is mandatory.** 24 h standard window; Human Agent tag (7 days) is an optional, separately approved feature | Yes | 2 | Meta Business Suite inbox (manual) |
| Facebook Messenger | Messenger Platform Send API | Page token, App Review | 24 h window. `HUMAN_AGENT` tag allows replies within 7 days for human support only and is not available in standard access | Yes | 2 | Meta Business Suite |
| Website chat | Own widget | Hotel OS | — | — | 1 | — |
| E-mail | IMAP/SMTP, Gmail API, Microsoft Graph | OAuth 2.0 / app passwords | Provider quotas; SPF/DKIM | Gmail push / Graph subscriptions | 1 | Forwarding address |
| Booking.com guest messages | Connectivity **Messaging API** | Connectivity machine account | Inbound pulled from a queue (max 100 per request). Guests can message from booking until 66 days after checkout | Polling | 3 | Certified channel manager; extranet |

## Reviews

| Platform | Official API | Access | Reply via API | Class | Alternative |
|---|---|---|---|---|---|
| Google Business Profile | `accounts.locations.reviews` list + `updateReply` | OAuth `business.manage`; Business Profile API access approval; verified location | Yes (verified locations). Replies can be policy-rejected | 2 | Manual in Google Business Profile |
| Booking.com | Connectivity **Reviews API** (retrieve, reply by review ID) | Connectivity partner, Hotels segment | Yes, for partners. Reviews are for internal use, not public display | 3 | Extranet |
| Tripadvisor | Content API (gated; read-oriented); a newer platform is announced | API key after approval | **No documented public reply endpoint**; replies go through the Management Center | 4 | Hotel OS drafts the reply, a person posts it |
| Expedia | Via Expedia connectivity partner programme (unverified for reviews) | Partner | Unverified | 3 | Partner Central |

## Distribution / OTA

| Channel | Official API | Requirements | Read / write | Class | Notes |
|---|---|---|---|---|---|
| Booking.com | Connectivity APIs (reservations, ARI, content) | Connectivity Partner onboarding, PII (and PCI if card data) compliance; partners must keep up with API changes. *Third-party reports say onboarding is periodically closed* | Reservations read / ack; ARI write | 3 | Use a certified channel manager |
| Expedia | Lodging connectivity (Booking Notification API, product / AR APIs) | Connectivity Partner Program + end-to-end certification. Booking Retrieval API is **not available for new adoption** | Reservations notify / confirm; ARI | 3 | Channel manager |
| Airbnb | Partner-only API | Invitation only; *partner page states it is not accepting new access requests* | — | 4 | Channel manager that is an Airbnb partner. **iCal is availability-only and not an equivalent integration** |

## PMS / channel managers (for larger hotels or as the OTA bridge)

| System | API | Auth | Webhooks | Notes | Class |
|---|---|---|---|---|---|
| Cloudbeds | REST API (reservations, rooms, availability, folios, guests) | API keys (preferred) or OAuth 2.0; OAuth flow mandatory for certified partners. Refresh token expires after 365 days of inactivity | Yes | Partner certification for marketplace apps | 2 |
| Mews | Connector API (OpenAPI) | Client token + access token | General Webhooks / WebSockets; endpoint registered via support; failed deliveries are eventually discarded | Partner onboarding | 2 |
| SiteMinder | pmsXchange (PMS / RMS / CRS); SiteConnect (booking channels) | Partnership agreement; test credentials from the Partner Integrations team | — | SiteConnect and Channels Plus cannot be combined | 3 |

## Other

| Area | Status | Class |
|---|---|---|
| Online payments / deposits | PSP not selected. Requires a merchant agreement and hosted fields (keeps the PCI scope small) | 3 |
| RISEUP Restaurant OS | Internal contract defined (`restaurant-contract.ts`) | 1 |

## Recommended path

1. **Pilot:** website chat + e-mail (class 1). WhatsApp via the Cloud API after Meta business verification (class 2). Google reviews after access approval.
2. **OTA:** integrate with the hotel's existing channel manager or PMS (Cloudbeds / Mews / SiteMinder partner path) rather than directly with Booking.com or Expedia.
3. **Until then:** the demo adapters, manual import, and clearly labelled "manual / limited sync" states.

## Sources

- developers.facebook.com/documentation/business-messaging/whatsapp/messages/send-messages
- developers.facebook.com/documentation/business-messaging/instagram-messaging/app-review/apps-for-your-own-business
- developers.facebook.com/docs/messenger-platform/reference/send-api
- developers.facebook.com/docs/features-reference/human-agent
- developers.booking.com/connectivity/docs
- developers.booking.com/connectivity/docs/messaging-api/understanding-the-messaging-api
- developers.booking.com/connectivity/docs/review-api
- developers.google.com/my-business/reference/rest/v4/accounts.locations.reviews/updateReply
- tripadvisor-content-api.readme.io; tripadvisor.com Management Responses guidelines
- developers.expediagroup.com/supply/lodging (CPP overview; booking_retrieval getting started)
- airbnb.com/terms/api; *third-party:* bnbcalc / Hospitable summaries of the partner page
- developers.cloudbeds.com (webhooks, OAuth)
- docs.mews.com/connector-api (webhooks)
- developer.siteminder.com (pmsXchange, SiteConnect, FAQ)
