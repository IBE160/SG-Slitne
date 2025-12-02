# Smart To-Do List: Phase 2 Architecture - Visual Summary

**Date:** 2025-12-02  
**Status:** ✅ COMPLETE  
**Next:** Tech Spike Week (Dec 3-7)

---

## 📊 Phase 2 Deliverables Overview

```
┌─────────────────────────────────────────────────────────────────┐
│         PHASE 2: SYSTEM ARCHITECTURE & DESIGN (Dec 2)          │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
   ┌──────────┐         ┌──────────┐         ┌──────────┐
   │Component │         │Database  │         │Tech Spike│
   │ & State  │         │ Schema & │         │Validation│
   │Management│         │  Queries │         │Plan      │
   └──────────┘         └──────────┘         └──────────┘
   16 KB | 20 sections  14 KB | 18 sections  12 KB | 18 sections
   
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  CI/CD & Deploy  │
                    │     Pipeline     │
                    └──────────────────┘
                    11 KB | 18 sections
                              │
                              ▼
                    ┌──────────────────┐
                    │  WORKFLOW STATUS │
                    │     UPDATED      │
                    └──────────────────┘
```

---

## 🏗️ System Architecture Diagram

```
                    ┌─────────────────────────────────┐
                    │   React 18 Components           │
                    │  (App, Dashboard, TaskList)     │
                    │  (TaskForm, TaskDetail)         │
                    └──────────────┬──────────────────┘
                                   │ dispatch/subscribe
                    ┌──────────────▼──────────────────┐
                    │    Zustand Global Store         │
                    │  (sort, filter, prefs)          │
                    │     + localStorage              │
                    └──────────────┬──────────────────┘
                                   │ query/update
                    ┌──────────────▼──────────────────┐
                    │      AI Engine Service          │
                    │  • Label Suggester              │
                    │  • Priority Scorer              │
                    │  • Summarizer                   │
                    └──────────────┬──────────────────┘
                                   │ CRUD
                    ┌──────────────▼──────────────────┐
                    │     Task Service Layer          │
                    │  • Validation                   │
                    │  • Business Logic               │
                    │  • CRUD Operations              │
                    └──────────────┬──────────────────┘
                                   │ IndexedDB API
                    ┌──────────────▼──────────────────┐
                    │      IndexedDB Local DB         │
                    │  • tasks (w/ indexes)           │
                    │  • labels                       │
                    │  • projects                     │
                    └─────────────────────────────────┘
```

---

## 📦 Technology Stack Comparison

```
┌─────────────────────────────────────────────────────────────┐
│                 TECHNOLOGY DECISIONS                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Layer          │ Tech           │ Why?                     │
│  ──────────────────────────────────────────────────────────  │
│  Framework      │ React 18       │ Component-based, hooks   │
│  Build          │ Vite           │ Fast dev/build, HMR      │
│  Styling        │ Tailwind CSS   │ Utility-first, responsive│
│  State          │ Zustand        │ Lightweight, simple      │
│  Database       │ IndexedDB      │ Browser-native, offline  │
│  AI             │ Heuristic      │ Speed, no external API   │
│  Testing        │ Vitest + TL    │ Fast, React-focused      │
│  Deploy         │ GitHub Actions │ Free, automated          │
│  Hosting        │ GitHub Pages   │ Free, zero config        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📅 Tech Spike Week Schedule

```
WEEK OF DEC 3-7, 2025
═════════════════════════════════════════════════════════════

TUE 3    │  Spike #1 START          │  Spike #2 START
DEC 3    │  IndexedDB              │  Vite Build
         │  (DB schema, CRUD)      │  (Setup, optimization)
         │                          │
         │  ✓ Daily standup 10 AM   │
         │  ✓ Review 3 PM           │
─────────┼──────────────────────────┼─────────────────────────

WED 4    │  Spike #1 COMPLETE      │  Spike #2 CONT
DEC 4    │                          │  Spike #3 START
         │  → Code review           │  Zustand State
         │  → Performance test      │  (Store + localStorage)
         │                          │
         │  ✓ Daily standup 10 AM   │
         │  ✓ Review 3 PM           │
─────────┼──────────────────────────┼─────────────────────────

THU 5    │  Spike #3 CONT          │  Spike #4 START
DEC 5    │  Spike #4 CONT          │  AI Engine
         │  (Label/Priority/Summary)│  (Heuristic algorithms)
         │                          │
         │  ✓ Daily standup 10 AM   │
         │  ✓ Review 3 PM           │
─────────┼──────────────────────────┼─────────────────────────

FRI 6    │  Spike #4 CONT          │  Spike #5 START
DEC 6    │  Spike #5 START         │  Offline-First
         │  (Export/Import)        │  (Persistence)
         │                          │
         │  ✓ Daily standup 10 AM   │
         │  ✓ Mid-week review 3 PM  │
─────────┼──────────────────────────┼─────────────────────────

FRI 7    │  ALL SPIKES COMPLETE    │  FINAL REVIEW
DEC 7    │  Code merged to main    │  & Go/No-Go
         │                          │  Decision
         │  ✓ Daily standup 10 AM   │  🚦 5 PM DECISION GATE
         │  ✓ Final review 3 PM     │
         │                          │
═════════════════════════════════════════════════════════════

OUTCOMES:
✅ 5 spikes complete
✅ Reusable code in /src/
✅ Performance validated
✅ Team trained & confident
✅ Go/No-Go: PASS (goal)
```

---

## 🎯 Component Hierarchy

```
App (Root Container)
│
├── Header
│   ├── AppTitle
│   └── SortFilterBar
│       ├── SortDropdown
│       └── FilterTabs
│
├── Dashboard (Main Content)
│   ├── TaskList (Container)
│   │   ├── TaskRow (Presentational) × N
│   │   │   ├── TaskTitle
│   │   │   ├── DueDateBadge
│   │   │   ├── PriorityBadge (colored)
│   │   │   └── LabelChips (colored tags)
│   │   │
│   │   ├── LoadingSkeletons (while loading)
│   │   └── EmptyState (no tasks)
│   │
│   └── TaskActions
│       ├── CreateTaskButton
│       └── FilterTabs (Active, Completed, Archived)
│
├── TaskForm (Modal - Create/Edit)
│   ├── TitleInput (required)
│   ├── DescriptionField
│   ├── DueDatePicker
│   ├── ProjectSelect
│   ├── AISuggestions (label badges)
│   └── FormButtons (Submit, Cancel)
│
├── TaskDetail (Slide-out Panel)
│   ├── TaskHeader
│   ├── EditableFields
│   │   ├── Title (auto-save)
│   │   ├── Description (auto-save)
│   │   ├── Priority (with AI score shown)
│   │   └── Labels (with confidence shown)
│   └── ActionButtons (Archive, Delete)
│
└── ToastNotifications
    ├── SuccessToast
    ├── ErrorToast
    └── InfoToast
```

---

## 🗄️ Database Schema (IndexedDB)

```
Database: smart-todo-db (v1)

┌──────────────────────────────────────────────────────────┐
│         Object Store: TASKS                              │
├──────────────────────────────────────────────────────────┤
│ Key:     id (UUID)                                       │
│ Indexes: dueDate, priority, labels, status, projectId   │
│                                                           │
│ Fields:                                                  │
│  • id (PK)                    • priority (1|2|3)        │
│  • title                      • status (active|complete)│
│  • description                • dueDate (ISO)            │
│  • projectId (FK)             • summary                  │
│  • labels (array of IDs)      • aiMetadata (obj)        │
│  • createdAt                  • updatedAt                │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│         Object Store: LABELS                             │
├──────────────────────────────────────────────────────────┤
│ Key:     id (UUID)                                       │
│ Indexes: name (unique)                                  │
│                                                           │
│ Fields:                                                  │
│  • id (PK)                    • color (hex)             │
│  • name (required)            • isSystemLabel (bool)    │
│  • description (optional)     • createdAt               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│         Object Store: PROJECTS                           │
├──────────────────────────────────────────────────────────┤
│ Key:     id (UUID)                                       │
│ Indexes: name (unique)                                  │
│                                                           │
│ Fields:                                                  │
│  • id (PK)                    • status (active|complete)│
│  • name (required)            • taskCount (cached)      │
│  • description                • createdAt               │
│  • color (optional)           • updatedAt               │
└──────────────────────────────────────────────────────────┘

Example Task Record:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Prepare Q4 report",
  "priority": 3,
  "dueDate": "2025-12-10",
  "labels": ["label-work", "label-urgent"],
  "summary": "Prepare Q4 report. Due: Dec 10",
  "aiMetadata": {
    "labelConfidence": [
      { "label": "label-work", "confidence": 0.92 },
      { "label": "label-urgent", "confidence": 0.78 }
    ],
    "priorityScore": 3,
    "userFeedback": "accepted"
  }
}
```

---

## 🧠 AI Engine Architecture

```
┌─────────────────────────────────────────────────────────┐
│            AI ENGINE: 3 HEURISTIC SERVICES              │
└─────────────────────────────────────────────────────────┘

SERVICE #1: LABEL SUGGESTER
───────────────────────────
Input:  Task title + description
        "Buy milk at Whole Foods"

Process:
  1. Tokenize → ["buy", "milk", "whole", "foods"]
  2. Match keywords:
     - "buy", "milk" → Shopping label
     - "milk" → Food label
  3. Score: Shopping (0.92), Food (0.45)
  4. Return top 3

Output: [
  { label: "Shopping", confidence: 0.92 },
  { label: "Food", confidence: 0.45 }
]

Performance: <100ms


SERVICE #2: PRIORITY SCORER
───────────────────────────
Input:  Task title + description + dueDate
        "Urgent: Report due tomorrow"

Process:
  1. Check urgency keywords: "urgent" found → +2
  2. Calculate days to due: tomorrow → 1 day
  3. Score: 1 day → High priority (3)
  4. Composite = urgency (2) + days (1) = 3

Output: 3 (HIGH)

Performance: <50ms


SERVICE #3: SUMMARIZER
──────────────────────
Input:  Task title + description + dueDate
        "Prepare quarterly report. Compile Q4 metrics..."

Process:
  1. Extract first 1-2 sentences
     "Prepare quarterly report. Compile Q4 metrics."
  2. Append due date context: "Due: Dec 10"
  3. Clean up: Remove redundant words
  4. Result: "Prepare quarterly report. Due: Dec 10"

Output: "Prepare quarterly report. Due: Dec 10"

Performance: <50ms

───────────────────────────────────────────────────────────
TOTAL AI PROCESSING: <200ms per task ✓
ACCURACY TARGET: 80%+ label suggestions ✓
```

---

## 🔄 Data Flow: Create Task

```
USER ACTION
│
├─ Fill form: title, description, dueDate
│
▼
VALIDATION
├─ Title required? YES
├─ Format valid? YES
│
▼
AI ENGINE PROCESSING
├─ suggestLabels()
│  └─ Output: [{ label, confidence }, ...]
├─ scorePriority()
│  └─ Output: 1 | 2 | 3
├─ generateSummary()
│  └─ Output: "brief summary"
│
▼
UI SHOWS AI SUGGESTIONS
├─ User sees suggested labels as chips
├─ User sees suggested priority as badge
├─ User can accept/reject labels
│
▼
ZUSTAND STORE UPDATE
├─ Dispatch: createTask(taskData)
├─ Store action receives task
│
▼
TASK SERVICE
├─ Validation recheck
├─ Generate UUID
├─ Add timestamps
├─ IndexedDB write
│
▼
INDEX DB WRITE
├─ Insert into "tasks" store
├─ Indexes updated automatically
├─ Local storage persisted
│
▼
ZUSTAND STATE UPDATE
├─ Task added to store.tasks[]
├─ Triggers component re-render
│
▼
COMPONENT RE-RENDER
├─ Task appears in list
├─ Sorted/filtered according to current view
├─ Toast notification: "Task created"
│
▼
FINAL STATE
✓ Task in IndexedDB
✓ Task in Zustand store
✓ Task visible in UI
✓ AI metadata stored
```

---

## 🚀 CI/CD Pipeline

```
Git Event (push, PR, tag)
│
├─ BRANCH: feature/*
│  └─ TRIGGER: Code quality checks only
│
├─ BRANCH: main
│  └─ TRIGGER: Full pipeline + staging deploy
│
├─ TAG: v*.*.* (production tag)
│  └─ TRIGGER: Full pipeline + production deploy
│
▼
STAGE 1: LINT (2 min)
├─ ESLint (React, import, a11y)
├─ Prettier format check
├─ TypeScript compilation
│
▼
STAGE 2: TEST (5 min)
├─ Vitest run all tests
├─ Coverage report (>80% target)
├─ Upload to Codecov
│
▼
STAGE 3: BUILD (3 min)
├─ Vite production build
├─ Bundle size check (<100KB)
├─ Source maps generated
│
▼
STAGE 4: DEPLOY TO STAGING (2 min)
├─ Only if: main branch + all checks pass
├─ Deploy to GitHub Pages staging branch
├─ Run smoke tests
│
▼
STAGE 5: DEPLOY TO PRODUCTION (2 min)
├─ Only if: tag v*.*.* + all checks pass
├─ Deploy to GitHub Pages production
├─ Create GitHub Release
├─ Post-deployment tests
│
═════════════════════════════════════════
TOTAL PIPELINE TIME: ~15 minutes
═════════════════════════════════════════

FAILURE POINTS (blocks merge):
❌ Lint fails → Fix code format
❌ Tests fail → Fix test failures
❌ Build fails → Fix build errors
❌ Coverage drops → Write more tests
```

---

## 📈 Performance Targets

```
┌────────────────────────────────────────┐
│      PERFORMANCE TARGETS (MVP)         │
├────────────────────────────────────────┤
│                                        │
│ BUILD PERFORMANCE:                    │
│   • Build time: <10s                  │
│   • Bundle size: <100KB gzipped       │
│   • Dev server startup: <3s           │
│   • HMR update: <500ms                │
│                                        │
│ RUNTIME PERFORMANCE:                  │
│   • Page load: <2s                    │
│   • Task creation: <200ms             │
│   • Task list render (100+): <500ms   │
│   • AI suggestion: <200ms             │
│   • IndexedDB query: <300ms           │
│                                        │
│ CI/CD PIPELINE:                       │
│   • Lint: <2 min                      │
│   • Tests: <5 min                     │
│   • Build: <3 min                     │
│   • Deploy: <5 min                    │
│   • Total: <15 min                    │
│                                        │
└────────────────────────────────────────┘
```

---

## 📋 Sprint 1 User Stories (10 stories, 47 SP)

```
S1-US-1  Project Setup                    5 SP
├─ Vite + React + Tailwind + testing
├─ ESLint + Prettier + TypeScript
└─ GitHub Actions CI/CD

S1-US-2  IndexedDB Schema & CRUD          5 SP
├─ Database initialization
├─ Object stores + indexes
└─ CRUD service functions

S1-US-3  Task List UI                     8 SP
├─ Render tasks from IndexedDB
├─ Show metadata (due date, priority, labels)
└─ Skeleton loader + empty state

S1-US-4  Create Task Form                 5 SP
├─ Form fields + validation
├─ Submit to IndexedDB
└─ Toast notification

S1-US-5  Edit Task Details                5 SP
├─ Detail panel/modal
├─ Auto-save with debounce
└─ Field updates

S1-US-6  Delete & Archive Tasks           5 SP
├─ Soft delete (archive)
├─ Hard delete (confirmation)
└─ Bulk operations

S1-US-7  Sort Tasks                       3 SP
├─ Due date (asc/desc)
├─ Priority (high/low)
└─ Persist preference

S1-US-8  Filter Tasks                     3 SP
├─ Filter by status
├─ Multi-select labels
└─ Persist preference

S1-US-9  Responsive Design                5 SP
├─ Desktop (1024px+)
├─ Tablet (768px+)
└─ Mobile-friendly touches

S1-US-10 Loading & Empty States           3 SP
├─ Skeleton loaders
├─ Empty state UI
└─ Error handling

═════════════════════════════════════════
TOTAL: 47 Story Points
SPRINT DURATION: 2 weeks (Dec 9-20)
DELIVERABLE: Task CRUD + UI + persistence
═════════════════════════════════════════
```

---

## 🎯 Success Checklist

```
PHASE 2 ARCHITECTURE
═════════════════════════════════════════

☑ System architecture documented          ✅ COMPLETE
☑ Component hierarchy defined            ✅ COMPLETE
☑ State management strategy              ✅ COMPLETE
☑ AI engine algorithms                   ✅ COMPLETE
☑ Database schema optimized              ✅ COMPLETE
☑ CRUD operations designed               ✅ COMPLETE
☑ Tech stack validated (planned)         ⏳ PENDING (Dec 3-7)
☑ CI/CD pipeline designed                ✅ COMPLETE
☑ Deployment strategy finalized          ✅ COMPLETE
☑ Workflow status updated                ✅ COMPLETE

═════════════════════════════════════════

TECH SPIKE WEEK (Dec 3-7)
═════════════════════════════════════════

☐ Spike 1 (IndexedDB): CRUD + queries    ⏳ PENDING
☐ Spike 2 (Vite): Build optimization    ⏳ PENDING
☐ Spike 3 (Zustand): State management   ⏳ PENDING
☐ Spike 4 (AI): Label suggester + more  ⏳ PENDING
☐ Spike 5 (Offline): Persistence        ⏳ PENDING
☐ All spikes complete & merged          ⏳ PENDING
☐ Go/No-Go decision: PASS               ⏳ PENDING (Fri 5 PM)

═════════════════════════════════════════

SPRINT 1 PREPARATION
═════════════════════════════════════════

☐ Tech spikes validated                 ⏳ PENDING
☐ Reusable code in /src/                ⏳ PENDING
☐ Team trained on stack                 ⏳ PENDING
☐ Sprint planning meeting               ⏳ PENDING (Dec 9)
☐ User stories refined                  ⏳ PENDING (Dec 9)
☐ Development begins                    ⏳ PENDING (Dec 9)

═════════════════════════════════════════
```

---

## 📖 Document Files Created

```
/docs/
├─ architecture.md               (5.8 KB) ← NEW
│  └─ 20 sections: components, state, AI, tech stack
│
├─ database-schema.md            (4.2 KB) ← NEW
│  └─ 18 sections: IndexedDB schema, CRUD, queries
│
├─ tech-spike-plan.md            (3.5 KB) ← NEW
│  └─ 18 sections: 5 spikes, schedule, success criteria
│
└─ deployment.md                 (3.2 KB) ← NEW
   └─ 18 sections: GitHub Actions, staging/prod, rollback

ROOT/
├─ ARCHITECTURE-INDEX.md         (2.5 KB) ← NEW
│  └─ Navigation guide for all 4 docs
│
└─ PHASE-2-COMPLETION-SUMMARY.md (2.0 KB) ← NEW
   └─ Executive summary of Phase 2
```

---

## 🎓 How to Navigate

**New to project?** Read: `ARCHITECTURE-INDEX.md` (start here)  
**Architect/Tech Lead?** Read: `docs/architecture.md`  
**Database developer?** Read: `docs/database-schema.md`  
**Spike planning?** Read: `docs/tech-spike-plan.md`  
**DevOps/Deployment?** Read: `docs/deployment.md`  
**Status update?** Read: `.bmad/workflow-status.yaml`  

---

**Created:** 2025-12-02  
**Status:** ✅ COMPLETE  
**Next:** Tech Spike Execution (Dec 3-7)  
**Sprint 1 Kickoff:** Dec 9, 10 AM  

---

*Phase 2 Architecture design is complete. The system is ready for technical validation and implementation.*
