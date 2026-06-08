# 🌿 Nature Community Journal — Release Readiness Checklist

**Project:** ai_education-main (repurposed from SpecialCare Connect / MayCare)  
**New Goal:** Build **a beautiful private digital nature journal** where users can write entries + attach photos, combined with **a community platform** that feels like a mix of **iNaturalist** (structured observations, species, location) and **Instagram** (visual, delightful sharing, discovery feed).

This is a **living document**. We will update status as we work together.

---

## Phase 0: Vision & Strategic Decisions (IN PROGRESS)

**Status:** Vision clarified by user on 2026. We are currently refining the privacy model and MVP scope.

This phase was the most important. The original codebase was built for **AI developmental assessments for special-needs children**. We are now transforming it into a **hybrid private + community nature journal** (beautiful writing + photos + iNaturalist-style observations + Instagram-like discovery).

### 0.1 Confirmed Vision (Updated 2026)

**User's stated vision:**
> "A beautiful private digital nature journal where I can write and attach photos"  
> +  
> "A community platform like a mix of iNaturalist + Instagram for nature observations"

This means the product must support **both** deeply personal journaling **and** social/community sharing in a cohesive way.

**Implications:**
- **Privacy Model Locked: Option A** — Every entry has a Private / Public visibility toggle (user chose this on 2026).
- Strong emphasis on **beautiful writing experience** + **high-quality photo experience**
- Observation features (species, location, identification) matter for the community side
- Visual discovery feed is important (Instagram-like feel)
- Trust, safety, and data privacy are critical (especially location data)

### 0.2 Refined Product Questions (Answer These Next)

- [x] **Privacy Model Decision** → **Chosen: Option A (Visibility Toggle on every entry)** **LOCKED**
  - Every journal entry can be toggled between Private and Public.
  - This best supports the hybrid vision (beautiful private journaling + optional community sharing).

**Data Model Work Started** (user said "start data model" on 2026)
- User requested to go **step by step** through the design decisions.

- [ ] Target users (primary ones for launch):
  - [ ] Amateur naturalists / hikers
  - [ ] Nature photographers
  - [ ] Families (parents + kids logging together)
  - [ ] Citizen scientists
  - [ ] Educators / environmental groups
  - Other: ________________

- [ ] For the **MVP**, what is non-negotiable?
  - Beautiful writing + photo attachment (private use)
  - Ability to make some posts public + see a community feed
  - Location tagging on entries
  - Simple species / tag system
  - Comments or likes on public posts?
  - Something else?

- [ ] Should we support **rich text** in journal entries (bold, lists, etc.) or keep it simple (plain text + photos) for MVP?

- [ ] Do you still want **bilingual support** (English + Chinese) in the new version?

### 0.3 Original Questions (kept for reference)
- [ ] Do you still want any of the **original AI/assessment features** (child tests, training plans, etc.), or should we remove/replace almost everything?
- [ ] What is the **minimum lovable product** you realistically want to launch with in the next 2–4 months?

### 0.2 Technical Direction Decisions
- [ ] Decide tech stack going forward:
  - Keep current React (CRA) frontend?
  - Migrate to **Next.js** (strongly recommended for content/journal apps)?
  - Keep FastAPI backend or switch to something else (Node, Supabase, etc.)?
- [ ] Database decision (this is critical):
  - PostgreSQL + proper ORM?
  - Supabase / Firebase (faster for MVP)?
  - SQLite for now (not recommended for community features)?
- [ ] Decide on image storage strategy (local disk, S3, Cloudinary, Supabase Storage…)
- [ ] Authentication: Keep Clerk? Switch to Supabase Auth / NextAuth / Firebase?
- [ ] Decide on rich text editor (for journal entries): TipTap, Lexical, Quill, Markdown, or simple textarea?

---

## Phase 1: Major Cleanup & Technical Debt Removal

**Status: IN PROGRESS** — Good momentum

**Completed so far:**
- Deleted `my-clerk-app/` entirely
- Deleted all legacy root HTML/JS/CSS files (`assessment.html`, `result.html`, etc.)
- Cleaned App.js routing (removed old child assessment routes)
- Updated package.json description
- Removed many "MayCare"/"SpecialCare" references from key files
- Rewrote root README.md
- Started console.log cleanup

**Now entering Mix mode** (user chose option C): Finish the largest remaining cleanup (old components), then immediately transition into product decisions (especially privacy model).

**Major milestone achieved:**
- Deleted 20+ old child assessment, testing, and game component files (AssessmentPage, ResultPage, DailyTaskPage, TrainingPlanPage, ProgressPage, all the test games like SchulteTest, AgeAdaptiveGame, etc.)
- Removed the MvpOnboarding old flow from HomePage.js
- Components folder is now dramatically cleaner (only ~12 files remain)

### 1.1 Repository Hygiene
- [x] Delete or archive `my-clerk-app/` (standalone Next.js demo — not part of product) **DONE**
- [x] Delete legacy standalone site files at root **DONE**
- [x] Deleted 20+ old child assessment & game components (AssessmentPage, ResultPage, DailyTaskPage, all test games, etc.) **DONE** (Mix mode)
- [ ] Delete or move deprecated backend files:
  - `backend/ai_model.py` + related old training scripts
  - `backend/add_route_directly.py`
  - `backend/deprecated/` folder
- [ ] Clean up root directory — move all old `.md` documents into `/docs/archive/`
- [ ] Remove all `__pycache__/` folders and `.pyc` files from git tracking
- [ ] Update `.gitignore` if needed

### 1.2 Branding & Naming Consistency
- [ ] Choose **final product name** (examples: "WildJournal", "NatureLog", "Field Notes", "GreenThread", "TerraJournal"…)
- [ ] Update everywhere:
  - `package.json` descriptions
  - README.md (rewrite completely)
  - `frontend/src/components/` (remove "MayCare", "SpecialCare")
  - Backend titles and logs
  - Favicon / manifest
- [ ] Create proper logo placeholder strategy (or use text + icon for now)

### 1.3 Code Cleanup
- [x] Cleaned major console.logs from apiClient.js **IN PROGRESS**
- [x] Major rewrite of App.js routing (removed old assessment/child routes) **DONE**
- [ ] Full console.log cleanup across remaining components
- [ ] Delete ~200+ lines of legacy password/email authentication code from `backend/auth.py`
- [ ] Run backend linting (ruff + black) after further cleanup

---

## Phase 2: Legal, Trust & Compliance (Non-Negotiable for Public Launch)

Even more important now because users will upload photos + location data + personal reflections.

- [ ] Write and publish **Privacy Policy** (must cover: photos, location data, children if any, data retention)
- [ ] Write and publish **Terms of Service**
- [ ] Add **Community Guidelines** (especially important for public nature posts)
- [ ] Create proper footer with links to all three documents
- [ ] Add age-appropriate consent / parental controls if minors can use the platform
- [ ] Decide on content moderation approach (manual? AI? community flags?)
- [ ] Add clear data export + deletion capabilities for users (right to be forgotten)
- [ ] Consider adding a **"Nature Ethics"** or **"Leave No Trace"** statement

**Recommended:** Use free generators first (Termly, PrivacyPolicyGenerator), then customize.

---

## Phase 3: Data & Backend Foundation (Biggest Technical Risk)

Current JSON-file storage is **not acceptable** for a community journal product.

### 3.1 Database Migration
- [ ] Choose and implement real database (PostgreSQL recommended)
- [ ] Design core data models:
  - Users
  - Journal Entries (title, body, date, location, weather, mood?)
  - Observations / Species records
  - Photos / Media
  - Comments / Reactions (if community features)
  - Collections / Trips
- [ ] Migrate existing Clerk user data (if any real users exist)
- [ ] Implement proper file/image handling + cleanup

### 3.2 Backend Improvements
- [ ] Add proper logging + request ID tracking
- [ ] Add rate limiting (especially on post creation + uploads)
- [ ] Add input validation and sanitization for all public-facing endpoints
- [ ] Implement soft deletes for journal entries
- [ ] Add full-text search capability (for journal entries)

---

## Phase 4: Product Repurposing — Core Feature Work

This will be the largest phase. Most current features (child assessments, training plans, Schulte tests, result reports, etc.) are likely irrelevant.

### 4.1 Decide What to Keep vs. Throw Away (for Hybrid Journal + Community Product)
- [ ] Make explicit decision list:
  - **Likely Keep**: Clerk authentication, basic routing + protected routes, i18n system (if we keep bilingual), error handling patterns, dashboard layout as starting point
  - **Almost Certainly Remove / Replace**:
    - All child assessment flows (AssessmentPage, ResultPage, TestAgeAdaptive, ChildTestPage, ChildOnboardingWizard, etc.)
    - Training plans, DailyTaskPage, ProgressPage
    - Analysis engine + model training code
    - SchulteTest, AgeAdaptiveGame, OnlineGame (unless we creatively repurpose them later)
  - **Evaluate Carefully**:
    - Can any game-like elements become "nature observation challenges" or "mindful noticing" exercises?
    - How much of the current Dashboard / HomePage design can be reused?

### 4.2 MVP Scope for Hybrid Nature Journal + Community (Recommended Starting Point)

**Tier 1 (Must have for a real launch)**
- [ ] Beautiful **Journal Entry** creation (title, rich or simple text, multiple photo uploads, date, optional location + weather + tags)
- [ ] **Visibility control** on every entry (Private vs Public) — this is the core of the hybrid model
- [ ] **My Journal** view (all my entries, filterable by private/public, date, tags)
- [ ] **Community Feed** — discovery of public entries (beautiful grid or list, like Instagram / iNaturalist)
- [ ] Entry detail view (with photos in nice gallery)
- [ ] Basic **tagging** system (free tags + optional species name)
- [ ] Simple **Profile** page showing a user's public + private activity

**Tier 2 (Strongly recommended for MVP)**
- [ ] Photo upload with compression + proper storage handling
- [ ] Comments or reactions on public entries (light social)
- [ ] Search + basic filters on community feed and personal journal
- [ ] Location display (even if just text "Near Yosemite" at first)

**Tier 3 (Post-MVP / nice to have)**
- [ ] Interactive maps (Leaflet)
- [ ] Real species identification (iNaturalist API or vision model)
- [ ] Following users + personalized feed
- [ ] "Collections" or "Trips" grouping multiple entries
- [ ] Export journal as PDF / book
- [ ] Offline support

### 4.3 Technical Work Required
- [ ] Design proper database schema for `journal_entries`, `photos`, `tags`, `comments`, `visibility`
- [ ] Build new frontend pages/components:
  - `NewJournalEntryPage`
  - `MyJournalPage`
  - `CommunityFeedPage`
  - `EntryDetailPage`
  - Update `Dashboard` / home to reflect new nature journal purpose
- [ ] Update backend APIs (or create new ones) for the above flows
- [ ] Remove or hide old assessment/child routes from the app

### 4.4 What to Do With Old Features?
- [ ] Make a final explicit list of old components to delete vs. archive vs. try to repurpose (most should be deleted).

---

## Phase 5: Frontend Polish & Professionalism

- [ ] Remove or hide all references to old assessment/child features from UI
- [ ] Create new **Home / Landing page** that sells the new nature journal vision
- [ ] Design consistent visual language (colors, typography, nature-inspired aesthetic)
- [ ] Improve mobile experience (nature journaling happens outdoors)
- [ ] Add proper empty states, loading skeletons, and error handling
- [ ] Accessibility audit (WCAG AA minimum)
- [ ] Remove the hidden "triple-click logo" demo feature
- [ ] Create professional 404 and error pages
- [ ] Update all routes in `App.js` to match new features

---

## Phase 6: Deployment, DevOps & Production Readiness

### 6.1 Docker & Infrastructure
- [ ] Completely rewrite production Docker setup:
  - Fix port mismatches
  - Decide whether to use nginx or not
  - Remove hardcoded IPs
  - Make environment configuration clean and documented
- [ ] Set up proper volume / backup strategy for user uploads + database
- [ ] Document how to run production locally and on a VPS / PaaS

### 6.2 Security & Monitoring
- [ ] Remove all real API keys from repository (use `.env.example` only)
- [ ] Add security headers properly
- [ ] Set up error tracking (Sentry recommended)
- [ ] Add basic analytics (privacy-friendly: Plausible, Umami, or self-hosted)
- [ ] Implement proper CORS + allowed origins for production domain

### 6.3 CI / Quality Gates (Strongly Recommended)
- [ ] Add GitHub Actions (or similar) for:
  - Frontend lint + build
  - Backend lint (ruff + black)
  - Basic tests (once we have them)
- [ ] Enforce that PRs pass checks before merging

---

---

## Current Recommended Next Steps (as of now)

**We are starting now (user said "start").**

**Current plan:**
1. **Begin Phase 1 Cleanup** immediately (safe, high-value work that doesn't depend on undecided architecture).
2. Finish remaining Phase 0 decisions in parallel (especially privacy model).
3. Move to data layer decisions after cleanup.

**Why starting with cleanup?**
- Removes confusion and bloat quickly
- Makes future work much easier
- Low risk
- Gives visible progress fast

---

## Phase 7: Launch Preparation

- [ ] Write new, high-quality README.md focused on the nature journal
- [ ] Create user onboarding flow for first journal entry
- [ ] Prepare launch assets (screenshots, demo data, "what to expect" guide)
- [ ] Set up custom domain + SSL
- [ ] Create support / contact method (email, form, Discord?)
- [ ] Soft launch plan (invite-only first? beta testers?)
- [ ] Post-launch monitoring plan

---

## Bonus: Quick Wins (Can Do Early for Morale)

- [ ] Beautiful nature-inspired color palette + typography
- [ ] Nice hero image / illustration on landing (even if placeholder)
- [ ] Journal entry card design that feels delightful
- [ ] Dark mode support (many nature lovers prefer it at night)
- [ ] Simple "Streak" or "Days in nature" counter

---

## How to Use This Checklist

1. We will go through **Phase 0 together first** (vision clarification).
2. Then we tackle one phase (or one section) at a time.
3. After each meaningful chunk of work, we update the checkboxes in this file.
4. I will help you execute the items — just tell me which one(s) you want to work on next.

---

**Current Status (as of last audit):**  
Mostly in **Phase 0–1**. Significant cleanup and strategic decisions required before real feature development.

---

*Last updated: [We will keep this current as we work]*  
*Owner: You + Grok collaboration*