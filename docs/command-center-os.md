# Institutional Command Center Operating System

## Purpose

CuratesOS is the internal command center for a private credit real estate trust deed investing platform. It should let the team originate, underwrite, close, monitor, service, report, and govern loans from one operating surface with institutional controls, auditability, and investor-grade transparency.

The system is designed for internal operators first: investment, credit, capital markets, legal, servicing, asset management, investor relations, finance, and compliance teams.

## North star

Build a single operating system where every trust deed investment has:

- a live source of truth for borrower, collateral, loan terms, liens, documents, approvals, covenants, draws, payments, exceptions, and investor exposure
- a governed workflow from lead intake through payoff or resolution
- real-time portfolio visibility across risk, liquidity, performance, compliance, and concentration limits
- an auditable decision record that can stand up to institutional diligence

## Operating principles

1. **Every number traces back to source evidence.** KPIs, valuations, LTVs, DSCRs, maturities, balances, and exceptions must link to documents, system events, or approved manual entries.
2. **Risk is workflow, not a report.** Exceptions, covenant breaches, draw risks, valuation changes, insurance expirations, and delinquency signals must create actionable queues.
3. **Approvals are explicit.** Investment committee, legal, servicing, and capital allocation approvals should be captured as structured decisions with signers, timestamps, conditions, and versioned materials.
4. **Documents and data move together.** A loan file is not complete unless its structured fields and source documents reconcile.
5. **Capital allocation is first class.** The system should model investor eligibility, fund constraints, concentration limits, cash availability, target yield, duration, and exposure before a loan is committed.
6. **Human judgment remains visible.** AI assistance can summarize, extract, and flag issues, but credit decisions and overrides remain owned by named users.

## Primary users

| User | Core jobs |
| --- | --- |
| Executive / CIO | See firm-wide pipeline, capital deployment, liquidity, returns, defaults, exceptions, and concentration risk. |
| Originations | Intake deals, manage broker/borrower relationships, track stage movement, and coordinate missing items. |
| Credit / Underwriting | Analyze borrower, collateral, lien position, title, valuation, exit strategy, leverage, payoff sources, and risk ratings. |
| Investment Committee | Review standardized memos, compare alternatives, approve/decline/condition deals, and retain decision history. |
| Capital Markets | Allocate loans to funds/investors, manage warehouse lines, track cash availability, and monitor eligibility constraints. |
| Closing / Legal | Manage closing checklists, docs, title, insurance, escrow, funding conditions, and recorded instruments. |
| Servicing | Track payments, maturity dates, extensions, reserves, draws, escrow, notices, delinquencies, and payoff requests. |
| Asset Management | Monitor watchlist assets, borrower communication, workout plans, REO status, valuations, and disposition strategy. |
| Investor Relations | Produce investor views, notices, reporting packages, attribution, and exposure explanations. |
| Compliance / Audit | Review policies, approvals, exceptions, conflicts, KYC/AML, document completeness, and immutable activity logs. |

## Command center layout

### 1. Executive cockpit

The executive cockpit is the daily landing page for leadership.

Core tiles:

- deployable cash by fund, mandate, and liquidity bucket
- total commitments, funded balance, unfunded exposure, and pending closings
- weighted average coupon, yield, duration, LTV, lien position, and risk rating
- pipeline by stage, geography, asset type, sponsor, broker, and expected close date
- maturities and payoffs by month
- delinquency, default, foreclosure, REO, and watchlist exposure
- concentration limit usage by state, sponsor, borrower, broker, property type, lien position, investor, and fund
- open approvals and aging exceptions

Key interactions:

- drill from KPI to loan-level population
- filter by fund, strategy, region, originator, risk rating, and vintage
- compare current values to policy limits and target ranges
- export board-ready snapshots with source links

### 2. Deal intake and pipeline

The intake surface converts inbound opportunities into structured loan records.

Capabilities:

- broker, borrower, sponsor, property, and requested loan intake
- document upload and automated classification
- initial eligibility scoring against mandate rules
- duplicate borrower, sponsor, property, and broker detection
- pipeline Kanban by stage: lead, screening, diligence, term sheet, underwriting, IC, closing, funded, declined, lost
- task assignments, due dates, aging, and SLA flags
- broker relationship history and conversion analytics

Minimum structured fields:

- borrower entity and principals
- sponsor track record
- requested amount, rate, term, fees, extension options, prepayment terms
- property address, type, valuation, lien position, debt stack, occupancy, income, exit strategy
- sources and uses
- requested close date
- broker and referral source

### 3. Credit workbench

The credit workbench is the underwriting environment for each deal.

Core sections:

- **Borrower and sponsor:** ownership, guarantors, financials, liquidity, credit events, litigation, prior performance
- **Collateral:** property type, location, valuation, appraisal/BPO, environmental, zoning, insurance, permits, condition, market data
- **Capital stack:** senior liens, junior liens, tax liens, mechanics liens, payoff letters, intercreditor terms
- **Loan economics:** coupon, fees, origination costs, servicing costs, expected return, downside cases
- **Risk assessment:** LTV, LTC, ARV LTV, DSCR when applicable, exit credibility, market liquidity, borrower strength, legal complexity
- **Conditions precedent:** title, insurance, entity docs, guaranty, escrow, assignment, recording, payoff confirmation
- **Decision memo:** investment thesis, risks, mitigants, sources, comps, committee questions, approval conditions

Analytical requirements:

- base, downside, and stress scenarios
- automatic recalculation when loan amount, valuation, lien balance, or reserves change
- policy exception detection
- versioned underwriting snapshots used for committee approval
- side-by-side comparison of original underwriting vs current monitoring state

### 4. Investment committee

Investment committee should be a structured approval system, not an email thread.

Capabilities:

- agenda builder with deals, renewals, extensions, modifications, and exceptions
- standardized IC memo package generated from current underwriting data
- approval voting: approve, decline, approve with conditions, defer
- required quorum and role-based voting rules
- condition tracking before close or modification
- automatic creation of decision record and audit entry
- redline comparison between memo versions

Decision record fields:

- approvers and roles
- decision type
- approved loan terms
- approved borrower, collateral, lien position, and maximum exposure
- conditions and expiration date
- policy exceptions
- dissenting notes when applicable

### 5. Closing and funding control tower

The closing control tower manages the path from approval to recorded security interest.

Capabilities:

- closing checklist by loan type, state, lien position, and investor mandate
- title commitment and exception tracking
- insurance certificate review and expiration capture
- escrow instructions, wire approvals, and funding authorization
- note, deed of trust, assignment, guaranty, and entity document tracking
- conditions precedent and conditions subsequent
- recorded instrument verification
- post-close loan boarding to servicing

Controls:

- dual approval for wires
- no funding without required IC approval and unresolved high-severity conditions
- document completeness gate before boarding
- immutable wire instruction change log
- sanctions, KYC, AML, and conflict checks before funding

### 6. Portfolio monitoring

The monitoring surface is the operating hub after funding.

Core views:

- payment status and delinquency aging
- maturity wall and extension pipeline
- covenant and condition tracking
- insurance, tax, license, and UCC expiration calendars
- draw requests and reserve balances
- valuation refresh schedule and updated LTV
- borrower/sponsor exposure and performance history
- watchlist and default queues
- payoff pipeline and realized return analysis

Risk alerts:

- late payment
- upcoming maturity without extension plan
- insurance lapse
- tax delinquency
- valuation decline above threshold
- concentration limit breach
- unapproved modification
- missing recorded document
- unresolved post-closing condition

### 7. Servicing operations

Servicing should connect cash activity to loan terms and investor reporting.

Capabilities:

- loan boarding and amortization/payment schedules
- interest accrual, default interest, late fees, payoff statements
- borrower invoices and notices
- payment posting and reconciliation
- extensions, modifications, forbearance, and payoff workflow
- escrow and reserve tracking
- servicer data import/export
- exception queue for payment mismatches

Outputs:

- borrower statements
- payoff quotes
- remittance files
- delinquency notices
- loan status changes
- cash reconciliation reports

### 8. Asset management and resolutions

The asset management workspace handles non-performing and high-risk loans.

Capabilities:

- watchlist classification and action plans
- default notice workflow
- foreclosure timeline by state
- legal counsel assignment
- workout, deed-in-lieu, note sale, foreclosure, REO, and disposition tracking
- updated valuations and liquidation scenarios
- cost advances and recovery estimates
- borrower communication log
- reserve recommendations

Critical metrics:

- days delinquent
- days to maturity
- expected recovery
- collateral value trend
- legal spend
- protective advances
- plan status and next action owner

### 9. Investor and fund reporting

Investor reporting should be generated from governed portfolio data.

Capabilities:

- investor exposure by loan, fund, vintage, geography, borrower, lien position, and risk rating
- performance attribution: coupon, fees, realized gains/losses, defaults, prepayments
- capital account and distribution support
- monthly/quarterly reporting package builder
- loan tape export with configurable columns
- audit-ready source mapping for reported values

Controls:

- reporting period lock
- preparer/reviewer approval
- variance checks against accounting and servicing systems
- restatement log

### 10. Compliance, audit, and policy engine

Compliance should operate continuously across the platform.

Policy engine examples:

- maximum LTV by property type, state, lien position, and strategy
- borrower/sponsor concentration limits
- geographic exposure limits
- minimum coupon or spread thresholds
- maturity and duration limits
- lien priority requirements
- required document package by loan type
- KYC/AML checks before approval and funding
- conflict-of-interest attestations

Audit requirements:

- every material field change stores previous value, new value, user, timestamp, source, and reason
- approval decisions are immutable after period close
- document versions are retained
- exported reports retain generation parameters and source dataset hash
- manual overrides require role, reason, and reviewer

## Core data model

| Entity | Description |
| --- | --- |
| `Deal` | Pre-funding opportunity and workflow state. |
| `Loan` | Funded investment with terms, balances, servicing state, and lifecycle events. |
| `Borrower` | Legal borrowing entity. |
| `Principal` | Individual owner, guarantor, or control person. |
| `Sponsor` | Repeat operator relationship across borrowers and deals. |
| `Property` | Collateral record with location, type, valuation, and legal description. |
| `Valuation` | Appraisal, BPO, AVM, internal valuation, or updated estimate. |
| `Lien` | Existing or originated lien position and related payoff/recording data. |
| `Document` | Source file with classification, metadata, version, and linked entities. |
| `Condition` | Approval, closing, or post-closing requirement. |
| `Approval` | Structured decision with approvers, terms, exceptions, and timestamp. |
| `PolicyRule` | Mandate, credit, legal, compliance, or operational rule. |
| `Exception` | Detected or approved deviation from policy or expected workflow. |
| `Task` | Work item with owner, due date, entity link, priority, and status. |
| `Investor` | External capital provider or internal fund investor. |
| `Fund` | Capital vehicle with mandate, cash, exposures, and reporting rules. |
| `Allocation` | Link between loan exposure and fund/investor capital. |
| `Payment` | Cash event, scheduled payment, posted payment, or payoff. |
| `Draw` | Construction, rehab, reserve, or escrow release request. |
| `Covenant` | Borrower, collateral, reporting, or performance obligation. |
| `WatchlistItem` | Elevated-risk loan classification and action plan. |
| `ActivityLog` | Immutable event stream across users, integrations, and system actions. |

## Lifecycle state machine

```text
Lead
  -> Screening
  -> Diligence
  -> Term Sheet
  -> Underwriting
  -> Investment Committee
  -> Closing
  -> Funded
  -> Servicing
  -> Performing
  -> Extended | Modified | Watchlist | Default
  -> Payoff | Resolution | REO | Charge-off
  -> Archived
```

State changes should require:

- allowed transition
- user role authorization
- required documents and fields for that transition
- automatic policy check
- event log entry

## Institutional dashboard taxonomy

### Firm KPIs

- assets under management
- funded principal balance
- unfunded commitments
- deployable cash
- weighted average coupon
- weighted average LTV
- weighted average remaining term
- net annualized return
- default rate
- delinquency rate
- realized loss rate
- extension rate
- payoff velocity

### Credit risk KPIs

- exposure by risk rating
- exposure by LTV band
- exposure by lien position
- top borrower/sponsor exposures
- top geographic exposures
- watchlist balance
- non-performing balance
- maturity risk by month
- exceptions by severity and age

### Operational KPIs

- pipeline conversion rate
- average days by stage
- closing checklist completion
- stale tasks
- document completeness
- wire approvals pending
- unresolved servicing exceptions
- reporting package status

## Permission model

Use role-based access control with scoped permissions.

Example roles:

- `Executive`
- `Originator`
- `Underwriter`
- `InvestmentCommitteeMember`
- `Closer`
- `ServicingOperator`
- `AssetManager`
- `InvestorRelations`
- `Finance`
- `ComplianceOfficer`
- `Auditor`
- `SystemAdmin`

Permission principles:

- segregate maker/checker functions for wires, approvals, policy overrides, and reporting locks
- restrict personally identifiable information and KYC/AML details by need-to-know
- prevent originators from unilaterally changing approved credit terms after IC approval
- allow auditors read-only access to closed-period records and activity logs

## AI-assisted internal tools

AI should accelerate review while keeping human accountability.

High-value assistants:

- document classifier for appraisals, title, insurance, entity docs, financials, payoff letters, notes, deeds of trust, and guarantees
- field extractor with confidence scores and source highlights
- IC memo drafter from structured underwriting data
- policy exception explainer
- borrower/sponsor relationship summarizer
- delinquency and maturity risk summarizer
- loan tape anomaly detector
- investor reporting variance explainer

Required controls:

- no silent writes to approved terms
- confidence thresholds and human review queues
- source citations for every extracted value
- model output retained when used in decision support
- clear distinction between extracted fact, calculated metric, and generated summary

## Integration map

Likely integration categories:

- document storage and e-signature
- loan servicing platform
- accounting / general ledger
- bank and cash management
- KYC/AML and sanctions screening
- property data, valuation, and market comps
- title, escrow, and insurance
- CRM and email/calendar
- investor portal or fund administration system
- data warehouse / BI

Integration posture:

- system of record ownership must be explicit per field
- integrations should produce idempotent events
- failed syncs must create operational exceptions
- critical reports should reconcile across servicing, accounting, and command center data

## Implementation phases

### Phase 1: Command center foundation

- executive cockpit
- deal and loan records
- pipeline workflow
- document vault
- tasking and activity log
- basic policy checks
- core dashboards

### Phase 2: Credit and approval system

- credit workbench
- scenario modeling
- IC memo builder
- structured approvals
- condition tracking
- policy exception workflow

### Phase 3: Closing, servicing, and monitoring

- closing control tower
- loan boarding
- payment and maturity monitoring
- covenant and expiration tracking
- watchlist queues
- servicing imports

### Phase 4: Capital allocation and investor reporting

- fund/investor allocation engine
- concentration and eligibility constraints
- reporting period lock
- loan tape builder
- investor package generation
- accounting and servicing reconciliations

### Phase 5: AI and advanced controls

- document extraction
- memo drafting
- anomaly detection
- relationship intelligence
- predictive maturity/default risk
- automated evidence mapping

## First implementation slice

The first build should prove the operating model with a narrow but complete workflow:

1. create a deal
2. attach and classify documents
3. enter borrower, collateral, requested terms, valuation, and lien data
4. calculate LTV and policy exceptions
5. move the deal through underwriting
6. generate an IC memo view
7. approve with conditions
8. convert to a loan
9. show the funded loan on portfolio monitoring dashboards

This slice validates the key product promise: one governed record from origination to monitoring.

## Definition of institutional quality

The platform should be considered institutional-quality when it can answer these questions instantly and defensibly:

- What loans are we funding, and why?
- Which loans violate or approach policy limits?
- What capital is available, and which loans are eligible for it?
- What has changed since approval?
- What is coming due, late, under-documented, under-insured, over-concentrated, or otherwise at risk?
- Who approved each decision, based on which terms and evidence?
- Which reported investor numbers trace back to source data?
- What work is stuck, who owns it, and what happens next?
