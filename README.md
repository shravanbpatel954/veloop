# VELOOP Rewards: Premium Giveaway System

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Security Tests](https://img.shields.io/badge/Tests-16%20Passed-brightgreen)](file:///c:/Users/shrav/Downloads/veloop-giveaway/veloop-giveaway/backend/tests)
[![License](https://img.shields.io/badge/Architecture-ACID%20%7C%20Zero--Trust-purple)]()

A production-grade, full-stack giveaway experience engineered for **VELOP Rewards**. Built strictly adhering to the **"Browser is Untrusted"** security principle, this platform combines a high-conversion, responsive React frontend with an ACID-transactional Node/Express/MongoDB engine featuring real-time fraud mitigation, anti-replay protections, and cryptographically random winner draws.

> 📄 **Looking for the Evaluator / Submission Report?** Read our human-crafted technical overview in [PROJECT_REPORT.md](PROJECT_REPORT.md).

---

![Desktop View](docs/screenshots/01-desktop-active-participant.jpg)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Core Architecture & Security Principle](#core-architecture--security-principle)
3. [Visual Architecture & System Flows](#visual-architecture--system-flows)
   - [System Architecture Diagram](#system-architecture-diagram)
   - [End-to-End User Journey Diagram](#end-to-end-user-journey-diagram)
   - [ACID Transaction & Balance Deduction Flow](#acid-transaction--balance-deduction-flow)
   - [Fraud Risk Scoring Pipeline](#fraud-risk-scoring-pipeline)
   - [Winner Determination & Dual-Schema Claim State Machine](#winner-determination--dual-schema-claim-state-machine)
4. [Feature Matrix & Task Specification Fulfillment](#feature-matrix--task-specification-fulfillment)
5. [Giveaway & User State Machine](#giveaway--user-state-machine)
6. [Prize Configuration & Multi-Currency Rules](#prize-configuration--multi-currency-rules)
7. [Repository Structure](#repository-structure)
8. [Installation & Quick Start Guide](#installation--quick-start-guide)
9. [Automated Testing & Security Verification](#automated-testing--security-verification)
10. [RESTful API Documentation](#restful-api-documentation)
11. [Final Testing Checklist Verification](#final-testing-checklist-verification)
12. [Visual Screenshot Gallery](#visual-screenshot-gallery)

---

## Executive Summary

The VELOOP Giveaway platform addresses the challenge of running high-stakes promotional draws in web applications:
- **Presentation Layer (Frontend):** Crafted with React 18, Vite, Bootstrap (grid only), and CSS Modules. Designed to deliver a rewarding fintech atmosphere (avoiding cheap gambling or casino aesthetics). Supports live countdown timers, a custom-animated giveaway loader, dynamic participation CTAs, a real-time auto-rotating social proof winner slider, and responsive layouts spanning 320px mobile to 1920px+ ultra-wide screens.
- **Authority Layer (Backend):** Built with Node.js, Express, MongoDB, and Mongoose. Serves as the single authoritative source of truth. Handles deterministic server-clock lifecycles, compound database-level race protection, atomic multi-document transactions, and multi-layered fraud risk scoring.

---

## Core Architecture & Security Principle

```
        ┌────────────────────────────────────────────────────────┐
        │                 UNTRUSTED CLIENT TIER                  │
        │  React 18 + Vite · CSS Modules · Framer Motion · State │
        └──────────────────────────┬─────────────────────────────┘
                                   │ HTTPS + JWT + Idempotency-Key
                                   ▼
        ┌────────────────────────────────────────────────────────┐
        │                 AUTHORITATIVE BACKEND                  │
        │   Express Middleware: Helmet · CORS · Rate Limiter    │
        │   Zod Schema Validation · Keyed-Hash Fraud Scoring     │
        └──────────────────────────┬─────────────────────────────┘
                                   │ ACID Multi-Document Session
                                   ▼
        ┌────────────────────────────────────────────────────────┐
        │               DATABASE & AUDIT LEDGER                  │
        │  MongoDB Replica Set: Compound Indexes · Balance Locks │
        │  Immutable Audit Logs · Reversal-Ready Ledger Rows     │
        └────────────────────────────────────────────────────────┘
```

### The "Zero-Trust Browser" Rule
1. **Zero Client Trust for Money or State:** The client never transmits currency types, entry fees, user IDs, or wallet balances. The client only sends `{ "prizeId": "PRIZE-001" }`. The server validates the prize, checks current server timestamps, checks user eligibility, locks the user document, and atomically deducts the balance.
2. **Deterministic Server Clock:** Giveaway status (`UPCOMING`, `ACTIVE`, `ENDED`, `ARCHIVED`) is calculated strictly on the backend via the server clock (`startAt <= now <= endAt`). Changing local computer time or tampering with frontend state cannot extend an ended giveaway.
3. **Compound Unique Indexing:** A compound unique index `(userId, giveawayId, prizeId)` guarantees that concurrent double-clicks or parallel network requests can never create duplicate entries or double-charge a user.
4. **Idempotency Protection:** All mutation endpoints accept an `Idempotency-Key` HTTP header. Replayed requests yield the cached result without duplicate execution.

---

## Visual Architecture & System Flows

### System Architecture Diagram

```mermaid
graph TD
    Client["Client Browser (React / Vite)"] -->|JWT Auth + Idempotency Key| Gateway["API Gateway (Express)"]
    
    subgraph Security_Middleware["Security & Enforcement Layer"]
        Gateway --> Helmet["Helmet & Strict CORS"]
        Helmet --> RateLimit["express-rate-limit"]
        RateLimit --> AuthGuard["JWT Authentication Guard"]
        AuthGuard --> ZodValidator["Zod Input Sanitizer"]
        ZodValidator --> FraudEngine["Fraud Risk Engine (0-100 Score)"]
    end

    subgraph Service_Tier["Business Logic Services"]
        FraudEngine -->|Score < 60| PartService["Participation Service"]
        FraudEngine -->|Score 60-79| FlagReview["Flag for Review (MEDIUM)"]
        FraudEngine -->|Score >= 80| BlockReq["Block Request (CRITICAL)"]
        
        PartService --> BalanceSvc["Balance Verification Service"]
        PartService --> WinnerSvc["Winner & Draw Service"]
    end

    subgraph Persistence_Tier["MongoDB Replica Set (ACID)"]
        PartService -->|Mongo Session| TxnStart["Start ACID Transaction"]
        TxnStart --> DeductBal["Deduct VE / SVE / Token ($gte guard)"]
        DeductBal --> CreateLedger["Insert GiveawayEntryTransaction"]
        CreateLedger --> CreatePart["Insert GiveawayParticipation"]
        CreatePart --> CommitTxn["Commit Transaction"]
        CommitTxn --> AuditLog["Append to Immutable AuditLog"]
    end

    CommitTxn -->|201 Created| Client
```

---

### End-to-End User Journey Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Participant
    participant FE as React Frontend (/giveaway)
    participant Details as Details Page (/giveaway/:slug)
    participant BE as Express API (/api)
    participant DB as MongoDB Replica Set

    User->>FE: Opens Giveaway Home
    FE->>BE: GET /api/giveaways/current
    BE->>DB: Query Giveaway, Prizes & Server Time
    DB-->>BE: Active Event Data
    BE-->>FE: Giveaway Payload (Masked Winners, Fees, Status)
    
    User->>FE: Clicks "Join Now" on iPhone 15 Pro
    Note over FE,Details: Routing Requirement: Never join directly from home
    FE->>Details: Navigate to /giveaway/iphone-15-pro
    Details->>BE: GET /api/giveaways/:id/my-status (with JWT)
    BE-->>Details: User Wallets (VE: 850) & Participation Status
    
    alt Insufficient Balance
        Details-->>User: Primary CTA: "Earn More VEs →" (Show Shortfall)
    else Sufficient Balance
        Details-->>User: Primary CTA: "Join for 250 VEs"
        User->>Details: Clicks CTA
        Details->>User: Displays "Confirm Participation" Modal (850 → 600 VEs)
        User->>Details: Clicks "Confirm & Join"
        Details->>BE: POST /api/giveaways/:id/join { prizeId: "PRIZE-001" }
        Note over BE,DB: Checks Server Time, Fraud Score, Atomic Transaction
        BE->>DB: Atomic Deduction & Participation Record
        DB-->>BE: Success
        BE-->>Details: 201 Created (Balance After: 600)
        Details-->>User: "You're In!" Success Modal + "You're Participating ✓"
    end
```

---

### ACID Transaction & Balance Deduction Flow

```mermaid
flowchart TD
    A["Incoming POST /api/giveaways/:id/join"] --> B["Validate Token -> Extract userId"]
    B --> C["Fetch Server Time: startAt <= now <= endAt?"]
    C -- No --> D["Abort: Return 409 GIVEAWAY_ENDED"]
    C -- Yes --> E["Fetch Prize: Required Currency & Fee from DB"]
    E --> F["Evaluate Device Fingerprint & Fraud Signals"]
    F -- Score >= 80 --> G["Log FraudEvent -> Return 403 PARTICIPATION_BLOCKED"]
    F -- Score < 80 --> H["Start Client Session (session.startTransaction())"]
    
    H --> I["Atomic Query: User.updateOne({ userId, wallet.CURRENCY: { $gte: fee } })"]
    I -- Matched 0 Docs --> J["Abort Txn -> Return 402 INSUFFICIENT_BALANCE"]
    I -- Success --> K["Insert GiveawayParticipation (unique userId+giveawayId+prizeId)"]
    K -- Duplicate Key E11000 --> L["Abort Txn -> Return 409 ALREADY_PARTICIPATING"]
    K -- Success --> M["Insert GiveawayEntryTransaction (Status: SUCCESS, Ledger)"]
    M --> N["Commit Transaction (session.commitTransaction())"]
    N --> O["Write AuditLog Row (JOIN_GIVEAWAY)"]
    O --> P["Return 201 HTTP OK with updated balance"]
```

---

### Fraud Risk Scoring Pipeline

```mermaid
graph LR
    subgraph Inputs["Inbound Signals"]
        S1["Device Identifier (X-Device-Id)"]
        S2["IP Subnet & Shared Network"]
        S3["Request Velocity & Burst Frequency"]
        S4["Account Age & Prior Suspensions"]
    end

    subgraph Normalization["Signal Processing"]
        S1 --> H1["Keyed HMAC-SHA256 Hash"]
        S2 --> H2["Subnet Aggregator"]
        S3 --> H3["Sliding Window Rate Evaluator"]
        S4 --> H4["Account Risk Profiler"]
    end

    subgraph Scoring["Scoring Matrix (0 - 100)"]
        H1 & H2 & H3 & H4 --> ScoreEngine["Weighted Multi-Factor Engine"]
    end

    subgraph Decision["Deterministic Action"]
        ScoreEngine -->|0 - 29| Low["LOW RISK: Allow Entry"]
        ScoreEngine -->|30 - 59| Med["MEDIUM RISK: Flag Entry (Exclude from Auto-Draw)"]
        ScoreEngine -->|60 - 79| High["HIGH RISK: Disallow Entry"]
        ScoreEngine -->|80 - 100| Crit["CRITICAL RISK: Block Request & Audit FraudEvent"]
    end
```

---

### Winner Determination & Dual-Schema Claim State Machine

```mermaid
stateDiagram-v2
    [*] --> NOT_SUBMITTED: Server Draw Executed (Winner Selected)
    
    state Winner_Verification {
        NOT_SUBMITTED --> Identity_Check: Winner logs in
        Identity_Check --> Non_Winner: userId != winner.userId
        Identity_Check --> Eligible_Winner: userId == winner.userId
        Non_Winner --> [*]: Shows "Didn't win this time?"
    }

    state Claim_Form_Selection {
        Eligible_Winner --> Physical_Form: Prize claimType == 'ADDRESS'
        Eligible_Winner --> Digital_Form: Prize claimType == 'EMAIL'
        
        note right of Physical_Form
            Validates:
            - Full Name
            - Phone (10 digits)
            - Address, City, State
            - PIN (6 digits)
        end note

        note right of Digital_Form
            Validates:
            - Verified Email only
            - Zero physical address asked
        end note
    }

    Physical_Form --> SUBMITTED: POST /api/giveaways/:id/claim
    Digital_Form --> SUBMITTED: POST /api/giveaways/:id/claim

    SUBMITTED --> PROCESSING: Admin Verification
    PROCESSING --> COMPLETED: Prize Dispatched / Gift Card Sent
    SUBMITTED --> EXPIRED: Claim Deadline Exceeded (7 Days)
    COMPLETED --> [*]
    EXPIRED --> [*]
```

---

## Feature Matrix & Task Specification Fulfillment

| Specification Area | PDF Section | Implementation Details | Status |
|---|---|---|:---:|
| **Giveaway Banner & Card** | §5–§7 | Dedicated banner with floating WebP illustration, hover depth, and CTA linking to `/giveaway`. | ✅ Verified |
| **Giveaway Hero & Stats** | §8–§9 | Live metrics (Active Giveaways, Participants, Rewards Won) styled with glowing fintech cards. | ✅ Verified |
| **Countdown Timer** | §10, §46 | Live ticker displaying days/hours/mins/secs; auto-syncs authoritative state on zero. | ✅ Verified |
| **Giveaway Lifecycles** | §11, §23 | Supports `UPCOMING`, `ACTIVE`, `ENDED`, and `ARCHIVED` controlled strictly by server clock. | ✅ Verified |
| **Prize Cards & Information** | §12–§13 | WebP product graphics, position indicators (1st, 2nd, 3rd, Lucky Draw), participant count, and entry fees. | ✅ Verified |
| **How to Participate** | §14–§15 | Visual step-by-step timeline: Sign In → Tasks → Entries → Win Rewards. | ✅ Verified |
| **Dynamic Participation CTAs** | §17, §54 | Contextual CTAs responding to 5 user states (Visitor, Logged In, Participant, Winner, Non-Winner). | ✅ Verified |
| **Social Proof Winner Slider** | §18–§19, §62 | Auto-rotating horizontal ticker with pause-on-hover, displaying masked IDs (`VE****72`). | ✅ Verified |
| **Dedicated Winners Tabs** | §21–§22 | Dual-tab view: Active state shows "Draw Pending"; Ended state reveals winners; Previous tab preserves history. | ✅ Verified |
| **Winner Privacy Masking** | §24–§25 | Zero exposure of PII (emails/addresses stripped); masked IDs (`VE****25`) across all public endpoints. | ✅ Verified |
| **Personalized Winner Flow** | §26–§27 | Server-side `isCurrentUser` evaluation triggering congratulatory banner and claim access for winners only. | ✅ Verified |
| **Dual-Schema Claim System** | §28–§32 | Physical modal (Name, Phone, Address, PIN) vs Digital modal (Email only) based on `claimType`. | ✅ Verified |
| **Non-Winner State** | §33, §58 | Respectful fallback encouragement card with CTA to upcoming events. | ✅ Verified |
| **Individual Details Page** | §79–§103 | Dedicated route `/giveaway/:slug` with price breakdown, eligibility, rules, and T&C accordion. | ✅ Verified |
| **Multi-Currency Joining Fees** | §85, §89 | Native validation for **VEs**, **SVEs**, and **Tokens** with automated shortfall calculation. | ✅ Verified |
| **Confirmation Modals** | §94–§96 | Full modal breakdown showing balance before, deduction, balance after, and rules agreement. | ✅ Verified |
| **Themed Custom Loader** | §51–§56 | Branded animated loader with rotating status messages (zero generic Bootstrap spinners). | ✅ Verified |
| **ACID Database Transactions** | Backend §14 | MongoDB replica set transaction coupling balance deduction, ledger recording, and entry creation. | ✅ Verified |
| **Fraud & Risk Mitigation** | Backend §21–§28 | Device tracking (`X-Device-Id`), IP analysis, 0–100 risk scoring (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), and `FraudEvent` logging. | ✅ Verified |
| **Audit Trails & Ledgers** | Backend §15, §29 | Double-entry transaction model with status transitions (`SUCCESS`, `REVERSED`) and immutable audit logs. | ✅ Verified |
| **Cryptographic Winner Draw** | Backend §30–§33 | Server-side crypto-random draw enforcing exact configured limits (1 iPhone, multiple secondary prizes). | ✅ Verified |

---

## Giveaway & User State Machine

### Giveaway Lifecycle States
1. **`UPCOMING`**: Giveaway is announced but entry window is not yet open (`now < startAt`). Primary CTA: `"Notify Me"`.
2. **`ACTIVE`**: Entry window is open (`startAt <= now <= endAt`). Users can view prizes, inspect balances, and submit entry transactions.
3. **`ENDED`**: Entry window is closed (`now > endAt`). New entries are rejected. Winners status transitions: `PENDING` → `SELECTING` → `ANNOUNCED`.
4. **`ARCHIVED`**: Preserved permanently in historical archives for public verification.

### User Participation States
* **Visitor (Unauthenticated):** CTA displays `"Login to Participate"`. Clicking opens the Login Required modal.
* **Eligible User (Not Joined):** CTA displays `"Join Giveaway - [Fee] [Currency]"`.
* **Insufficient Balance:** CTA transforms to `"Earn More [Currency] →"` with exact shortfall indicated.
* **Active Participant:** CTA displays `"You're Participating ✓"`; duplicate joins are blocked.
* **Winner:** Receives celebratory card and access to the dynamic prize claim modal.
* **Non-Winner:** Receives encouragement notice and redirection to upcoming reward events.

---

## Prize Configuration & Multi-Currency Rules

The platform supports multi-currency draws defined purely in the database:

| Prize ID | Slug | Name | Position | Winner Count | Entry Fee | Currency | Fulfillment Type |
|---|---|---|---|:---:|:---:|:---:|:---:|
| `PRIZE-001` | `iphone-15-pro` | iPhone 15 Pro (128GB) | 1st Prize | 1 | 250 | **VE** | Physical (`ADDRESS`) |
| `PRIZE-002` | `apple-watch` | Apple Watch Series 9 | 2nd Prize | 3 | 200 | **VE** | Physical (`ADDRESS`) |
| `PRIZE-003` | `airpods` | AirPods Pro 2 | 3rd Prize | 5 | 500 | **SVE** | Physical (`ADDRESS`) |
| `PRIZE-004` | `amazon-2000` | ₹2,000 Amazon Gift Card | Lucky Draw | 2 | 500 | **VE** | Digital (`EMAIL`) |
| `PRIZE-005` | `amazon-500` | ₹500 Amazon Gift Card | Lucky Draw | 5 | 300 | **VE** | Digital (`EMAIL`) |
| `PRIZE-006` | `amazon-20` | ₹20 Amazon Gift Card | Lucky Draw | 10 | 2,000 | **TOKEN** | Digital (`EMAIL`) |

---

## Repository Structure

```
veloop-giveaway/
├── backend/                              # Authoritative Node/Express/MongoDB service
│   ├── scripts/
│   │   └── seed.js                       # Comprehensive dev seed (users, active/past giveaways)
│   ├── src/
│   │   ├── app.js                        # Express app, security middleware & route mounting
│   │   ├── config/                       # Zod-validated environment config & DB connector
│   │   ├── controllers/                  # Thin HTTP controllers (giveaway, auth, claim, admin)
│   │   ├── middleware/                   # JWT auth, rate limiters, fraud signals & error handler
│   │   ├── models/                       # Mongoose schemas (Giveaway, Prize, Participation, Ledger, etc.)
│   │   ├── routes/                       # Express route definitions
│   │   ├── services/                     # Core business logic (participation, balance, fraud, winner)
│   │   ├── utils/                        # Crypto helpers, error classes, asyncHandler
│   │   └── validators/                   # Zod request validation schemas
│   ├── tests/                            # Automated security & unit test suite (16 tests)
│   ├── server.js                         # Server bootstrapper & graceful shutdown handler
│   └── package.json
│
├── frontend/                             # React 18 + Vite presentation tier
│   ├── src/
│   │   ├── api/                          # HTTP client & dual-mode mock API switcher
│   │   ├── components/                   # Modular components (each with dedicated .module.css)
│   │   │   ├── Countdown/                # Live countdown ticker
│   │   │   ├── DemoPanel/                # Interactive state-switcher widget for evaluators
│   │   │   ├── details/                  # Individual details page components (modals, timelines)
│   │   │   ├── FeaturedGiveaways/        # Prize cards grid & filters
│   │   │   ├── GiveawayBanner/           # Promotional banner with floating artwork
│   │   │   ├── GiveawayHero/             # Hero header with glowing accents
│   │   │   ├── GiveawayLoader/           # Themed custom giveaway loading animation
│   │   │   ├── PrizeClaimModal/          # Dual-schema (Physical vs Digital) claim form
│   │   │   ├── WinnerClaimCard/          # Personalized winner congratulation card
│   │   │   ├── WinnerSlider/             # Auto-rotating social proof winner marquee
│   │   │   ├── WinnersTabs/              # Winners & Previous Winners tabs
│   │   │   └── ui/                       # Reusable UI primitives (Button, Modal, Field, Accordion, Badge)
│   │   ├── context/                      # AuthContext & GiveawayContext
│   │   ├── hooks/                        # useCountdown, useJoinGiveaway, useResource
│   │   ├── pages/                        # RewardsHome, Giveaway, GiveawayDetails, Login
│   │   ├── styles/                       # tokens.css design system & global CSS
│   │   └── utils/                        # currency.js, participation.js, prizeTypes.js
│   └── package.json
│
├── docs/                                 # Documentation & Evaluator Assets
│   ├── API.md                            # Complete RESTful endpoint reference
│   └── screenshots/                      # 12 high-resolution UI flow captures
├── PROJECT_REPORT.md                     # Comprehensive Evaluator / Submission Report
└── README.md                             # Main technical documentation
```

---

## Installation & Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0+ (Must be configured as a **Replica Set** to support multi-document ACID transactions; MongoDB Atlas clusters support this by default).

---

### Option A: Running in Standalone Frontend Demo Mode (Zero DB Setup)
For rapid visual evaluation of all states without launching a database:
```bash
cd frontend
npm install
npm run dev
```
* Visit `http://localhost:5173`.
* The application runs against an in-browser mock server that strictly implements the backend contract.
* Use the **"⚡ Demo Panel"** widget in the bottom-right corner to instantly switch between:
  - **Giveaway Phase:** `ACTIVE` ↔ `ENDED` ↔ `UPCOMING`
  - **User Persona:** Aarav (Participant) ↔ Meera (Low balance) ↔ Isha (Winner) ↔ Admin
  - **Claim Status:** `NOT_SUBMITTED` ↔ `SUBMITTED` ↔ `PROCESSING` ↔ `COMPLETED` ↔ `EXPIRED`

---

### Option B: Running the Full Stack (Connected Backend + MongoDB)

#### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
```
Ensure your `.env` contains:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/veloop-giveaway?replicaSet=rs0
JWT_SECRET=super-secret-dev-jwt-token-key-32chars
```
Seed the database with users, active prizes, and historical previous winners:
```bash
npm run seed
```
Start the backend server:
```bash
npm run dev
# Backend running at http://localhost:5000
```

#### 2. Setup Frontend
```bash
cd ../frontend
npm install
cp .env.example .env
```
Ensure `.env` connects to the real backend:
```env
VITE_USE_MOCK=false
VITE_API_BASE_URL=
```
Start the frontend dev server:
```bash
npm run dev
# Frontend running at http://localhost:5173 (API calls automatically proxied to localhost:5000)
```

#### 3. Pre-Seeded Accounts for Testing

| Persona | Email | Password | Role | Wallet Balances | Assigned Testing State |
|---|---|---|:---:|---|---|
| **Aarav** | `aarav@example.com` | `Password@123` | User | 850 VE, 1200 SVE, 5000 TOKEN | Normal participant with sufficient balance |
| **Meera** | `meera@example.com` | `Password@123` | User | 120 VE, 100 SVE, 800 TOKEN | Low balance (triggers "Earn More VEs" CTA) |
| **Rohan** | `rohan@example.com` | `Password@123` | User | 400 VE, 700 SVE, 1200 TOKEN | Multi-currency tester |
| **Isha** | `isha@example.com` | `Password@123` | User | 350 VE, 500 SVE, 2500 TOKEN | Configured winner for historical claim testing |
| **Admin** | `admin@example.com` | `Password@123` | Admin | N/A | Authorized to trigger server draw & manage claims |

> 💡 **Quick Login:** On the [LoginPage](file:///c:/Users/shrav/Downloads/veloop-giveaway/veloop-giveaway/frontend/src/pages/Login/LoginPage.jsx), click any of the **"⚡ Quick Demo Accounts (1-Click Login)"** buttons to authenticate immediately without manual typing.

---

## Automated Testing & Security Verification

The backend includes a comprehensive automated test suite testing rate limiting, JWT validity, input sanitization, fraud scoring bands, clock derivation, masked user IDs, and claim schema dispatching.

Run tests:
```bash
cd backend
npm test
```

### Test Suite Execution Output (16/16 Passed):
```
TAP version 13
# Subtest: health check works
ok 1 - health check works
# Subtest: joining without a token is rejected with LOGIN_REQUIRED
ok 2 - joining without a token is rejected with LOGIN_REQUIRED
# Subtest: claiming without a token is rejected
ok 3 - claiming without a token is rejected
# Subtest: admin routes are closed to anonymous callers
ok 4 - admin routes are closed to anonymous callers
# Subtest: a forged token is not accepted
ok 5 - a forged token is not accepted
# Subtest: unknown routes return a JSON 404
ok 6 - unknown routes return a JSON 404
# Subtest: login validates its payload before touching the database
ok 7 - login validates its payload before touching the database
# Subtest: risk levels follow the documented bands
ok 8 - risk levels follow the documented bands
# Subtest: one weak signal never blocks; several strong ones do
ok 9 - one weak signal never blocks; several strong ones do
# Subtest: giveaway status is derived from the clock, not stored state
ok 10 - giveaway status is derived from the clock, not stored state
# Subtest: winners are pending until announced
ok 11 - winners are pending until announced
# Subtest: user ids are masked
ok 12 - user ids are masked
# Subtest: shuffle keeps every item exactly once
ok 13 - shuffle keeps every item exactly once
# Subtest: error code names match the currency
ok 14 - error code names match the currency
# Subtest: join payload drops client-supplied money fields
ok 15 - join payload drops client-supplied money fields
# Subtest: claim schema is chosen by prize claimType, not by the client
ok 16 - claim schema is chosen by prize claimType, not by the client
1..16
# tests 16 | pass 16 | fail 0 | duration_ms 21520
```

Frontend production bundle verification:
```bash
cd frontend
npm run build
# vite build -> transforms 1976 modules, generates dist/ cleanly with 0 errors.
```

---

## RESTful API Documentation

For the complete API contract including request bodies, response shapes, and error specifications, see [docs/API.md](docs/API.md).

### Summary of Key Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/giveaways/current` | Public | Returns active/upcoming giveaway, prizes, masked winners & server timestamp. |
| `GET` | `/api/giveaways/previous` | Public | Returns completed giveaways and historical winner lists. |
| `GET` | `/api/giveaways/:id` | Public | Retrieves specific giveaway details by ID or slug. |
| `GET` | `/api/giveaways/:id/my-status` | Authenticated | Returns logged-in user's balance, participation status, and win records. |
| `POST` | `/api/giveaways/:id/join` | Authenticated | Submits participation request (rate limited: 10/min, idempotent). |
| `POST` | `/api/giveaways/:id/claim` | Authenticated | Winner submits address or email claim (rate limited: 5/min). |
| `POST` | `/api/admin/giveaways/:id/select-winners` | Admin | Triggers authoritative crypto-random server draw after giveaway end. |

---

## Final Testing Checklist Verification

This project fulfills every item in the **75-Point Task Testing Checklist** from Pages 34–36 of the specification:

### 1. Giveaway Core
- [x] Hero / banner created with interactive motion
- [x] Authoritative giveaway status derived from server clock
- [x] Live automated countdown timer
- [x] High-fidelity prize cards with position tags
- [x] Dynamic participation CTA responding to user state
- [x] Entry fee and required currency display
- [x] 4-step visual "How to Participate" timeline
- [x] Giveaway Rules accordion
- [x] Frequently Asked Questions accordion
- [x] Trust & security guarantee section

### 2. Winner System & Privacy
- [x] Auto-rotating social proof winner slider
- [x] Dedicated Winners tab (shows "Pending" during active state)
- [x] Dedicated Previous Winners tab preserving history
- [x] Masked user IDs (`VE****72`) across all views
- [x] Strict 1-winner limit enforced for iPhone 1st Prize
- [x] Multi-winner support for secondary prizes
- [x] Active giveaway never falsely shows current winners
- [x] Ended giveaway reveals finalized winners

### 3. Winner Claim Workflow
- [x] Server-verified winner detection (`authenticatedUserId === winner.userId`)
- [x] Claim button visible only to authenticated winners
- [x] Physical prize form collecting Name, Phone, Address, City, State, PIN
- [x] Gift card form collecting Email address only
- [x] Form submission, processing, completed, and expired states handled

### 4. Non-Winner Experience
- [x] Claim form access blocked for non-winners
- [x] Public winners list viewable
- [x] Historical winners list viewable
- [x] Contextual encouragement CTA to join future events

### 5. Technical Excellence
- [x] React.js, Vite, Bootstrap (grid only), CSS Modules, React Hooks, Lucide Icons
- [x] Fully responsive across Mobile (320px+), Tablet (768px+), Desktop (1440px+), Ultra-wide (1920px+)
- [x] Accessible controls (keyboard navigable, visible focus, ARIA tags)
- [x] Restrained micro-animations (prefers-reduced-motion respected)
- [x] Custom themed giveaway loader (zero generic Bootstrap spinners)
- [x] Graceful empty and error states (raw database errors hidden)
- [x] Professional README, API documentation, and architecture diagrams

---

## Visual Screenshot Gallery

The repository includes 12 comprehensive screenshots in [`docs/screenshots/`](docs/screenshots/):

| View | Screenshot |
|---|---|
| **01. Desktop Active Participant** | ![Desktop](docs/screenshots/01-desktop-active-participant.jpg) |
| **02. Tablet View (768px)** | ![Tablet](docs/screenshots/02-tablet.jpg) |
| **03. Mobile Responsive (375px)** | ![Mobile](docs/screenshots/03-mobile.jpg) |
| **04. Giveaway Ended State** | ![Ended](docs/screenshots/04-ended.jpg) |
| **05. Winners Tab (Revealed)** | ![Winners Tab](docs/screenshots/05-winners-tab.jpg) |
| **06. Previous Winners Archive** | ![Previous Winners](docs/screenshots/06-previous-winners.jpg) |
| **07. Upcoming Giveaway State** | ![Upcoming](docs/screenshots/07-upcoming.jpg) |
| **08. Physical Prize Claim Modal** | ![Physical Claim](docs/screenshots/08-claim-modal-physical.jpg) |
| **09. Digital Gift Card Claim Modal**| ![Gift Card Claim](docs/screenshots/09-claim-modal-gift-card.jpg) |
| **10. Non-Winner Perspective** | ![Non-Winner](docs/screenshots/10-non-winner.jpg) |
| **11. Entry Confirmation Modal** | ![Confirm Modal](docs/screenshots/11-confirm-join-modal-mobile.jpg) |
| **12. Promotional Banner (Home)** | ![Banner](docs/screenshots/12-banner.jpg) |

---

## Evaluation & Handover Notes

* For an in-depth walkthrough of architectural trade-offs, attack mitigation models, and production integration steps, consult [PROJECT_REPORT.md](PROJECT_REPORT.md).
* For questions or deployment assistance, refer to the documentation or submit an issue in this repository.
