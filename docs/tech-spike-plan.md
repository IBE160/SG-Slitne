# Smart To-Do List: Tech Spike Plan

**Document Version:** 1.0  
**Last Updated:** 2025-12-02  
**Status:** Phase 2 - Ready for Execution  
**Owner:** Tech Lead  
**Duration:** 1 week (5 business days)  
**Start Date:** 2025-12-03 (Week of Dec 3)  
**End Date:** 2025-12-07 (Friday)

---

## 1. Overview

The Tech Spike Plan validates critical technology choices and reduces risk before Sprint 1 implementation. Five parallel spikes over 1 week (1-2 days each) will confirm that Vite, React, Zustand, IndexedDB, and offline capabilities work as expected for the MVP.

### Goals

✅ **Proof of Concept:** Validate each tech stack component works in isolation  
✅ **Risk Reduction:** Identify blockers early before Sprint 1 starts  
✅ **Team Learning:** Familiarize developers with tech stack  
✅ **Reusable Code:** Spike code becomes foundation for Sprint 1 implementation  

### Success Criteria

- All 5 spikes completed on time
- Zero blockers identified (or documented with mitigation)
- Code demonstrates core MVP functionality
- Team confidence level: 8+/10 for Sprint 1 readiness

---

## 2. Spike Breakdown

### Spike #1: IndexedDB Schema & CRUD Operations (2 days)

**Owner:** Database Developer  
**Timeline:** Dec 3-4 (Tuesday-Wednesday)  
**Effort:** 2 days  

**Objective:** Verify IndexedDB implementation works end-to-end with proper schema, indexes, and CRUD operations.

**Deliverables:**
1. Database initialization script (`dbInit.ts`)
   - Create `smart-todo-db` with version 1
   - Define `tasks`, `labels`, `projects` object stores
   - Create all required indexes

2. CRUD service functions (`taskService.ts`, `labelService.ts`)
   - ✅ Create task (with validation)
   - ✅ Read task (single + all)
   - ✅ Update task (merge logic)
   - ✅ Delete task (hard + soft delete)

3. Query functions
   - ✅ Filter by status, priority, labels
   - ✅ Sort by due date, priority
   - ✅ Search text

4. Test suite
   - ✅ Unit tests for all CRUD operations (>85% coverage)
   - ✅ Test with 100+ mock tasks (performance check)
   - ✅ Test edge cases (null values, duplicates, invalid data)

5. Performance validation
   - ✅ Single record query: <50ms
   - ✅ Get all tasks (100): <200ms
   - ✅ Complex query (filter + sort): <300ms

**Success Criteria:**
- [ ] All CRUD operations tested and working
- [ ] Indexes optimized (no full table scans)
- [ ] No data corruption on repeated operations
- [ ] Performance targets met
- [ ] Code coverage >85%

**Risks & Mitigations:**
| Risk | Mitigation |
|------|-----------|
| IndexedDB not supported on some browsers | Add feature detection + fallback (localStorage MVP) |
| Quota exceeded with large datasets | Implement quota check; warn at 80% |
| Transaction conflicts | Use error handling; retry logic |

**Code Repository:** `src/services/db/`

---

### Spike #2: Vite Build & Dev Setup (1.5 days)

**Owner:** Frontend Developer  
**Timeline:** Dec 3-4 (Tuesday-Wednesday)  
**Effort:** 1.5 days  

**Objective:** Set up Vite project with React, Tailwind CSS, ESLint, Prettier, and build optimization.

**Deliverables:**
1. Vite project scaffold
   - ✅ `npm create vite@latest` with React template
   - ✅ Install dependencies (React 18, React DOM, Vite plugins)
   - ✅ Configure `vite.config.ts`

2. Build optimization
   - ✅ Code splitting for AI service (lazy-loaded)
   - ✅ Tree-shaking unused code
   - ✅ CSS minification with PostCSS
   - ✅ Production build <100KB gzipped (excluding React)

3. Development setup
   - ✅ HMR (Hot Module Replacement) working
   - ✅ Dev server starts in <3 seconds
   - ✅ Source maps for debugging
   - ✅ Environment variables (.env) support

4. Code quality
   - ✅ ESLint configured (React, import, a11y plugins)
   - ✅ Prettier for code formatting
   - ✅ Pre-commit hooks (optional, Phase 1.1)

5. Testing infrastructure
   - ✅ Vitest configured
   - ✅ Testing Library setup
   - ✅ Coverage reporter configured
   - ✅ Test script: `npm run test`

6. Styling
   - ✅ Tailwind CSS configured (PostCSS, Tailwind config)
   - ✅ Tailwind utilities working in React components
   - ✅ Dark mode setup (deferred usage, Phase 2)

**Success Criteria:**
- [ ] Dev server runs without errors
- [ ] Production build succeeds
- [ ] Build size <100KB gzipped (React + deps)
- [ ] Linting passes on sample components
- [ ] Test command runs and produces coverage report
- [ ] Tailwind classes properly applied in UI

**Risks & Mitigations:**
| Risk | Mitigation |
|------|-----------|
| Build time >30 seconds | Implement code splitting; analyze bundle |
| HMR not working | Reinstall dependencies; clear cache |
| Tailwind not applying styles | Check PostCSS config; verify import order |

**Code Repository:** `vite.config.ts`, `tailwind.config.ts`, `vitest.config.ts`

---

### Spike #3: Zustand State Management (1.5 days)

**Owner:** Frontend Developer  
**Timeline:** Dec 4-5 (Wednesday-Thursday)  
**Effort:** 1.5 days  

**Objective:** Validate Zustand store works for managing sort, filter, and task list state.

**Deliverables:**
1. Zustand store setup
   - ✅ Create `useAppStore` with TypeScript types
   - ✅ Define store structure (tasks, sort, filter, UI state)
   - ✅ Implement store actions (setTasks, setSortMode, etc.)

2. Store state structure
   ```typescript
   {
     // Data
     tasks: Task[],
     labels: Label[],
     // UI
     sortMode: string,
     filterStatus: string,
     selectedLabels: string[],
     // Actions
     setTasks(), setSortMode(), etc.
   }
   ```

3. Persistence (localStorage)
   - ✅ Auto-save preferences (sortMode, filterStatus) to localStorage
   - ✅ Load preferences on app init
   - ✅ Clear data on user request

4. React integration
   - ✅ Hook usage in components (`const tasks = useAppStore(s => s.tasks)`)
   - ✅ Components re-render on state change
   - ✅ No unnecessary renders (selector memoization)

5. Testing
   - ✅ Unit tests for store actions
   - ✅ Test localStorage persistence
   - ✅ Test with React components (hooks)

**Success Criteria:**
- [ ] Store actions work without errors
- [ ] localStorage persistence verified
- [ ] React components can access store
- [ ] No memory leaks (test subscription cleanup)
- [ ] Code coverage >80%

**Risks & Mitigations:**
| Risk | Mitigation |
|------|-----------|
| Unnecessary re-renders | Use selectors + shallow comparison |
| localStorage quota exceeded | Implement quota check |
| Store state becomes too large | Consider splitting into multiple stores (Phase 2) |

**Code Repository:** `src/store/` and `src/hooks/useAppStore.ts`

---

### Spike #4: AI Engine (Heuristic Rules) (2 days)

**Owner:** AI Engineer  
**Timeline:** Dec 5-6 (Thursday-Friday)  
**Effort:** 2 days  

**Objective:** Implement and validate heuristic-based AI engine for label suggestions, priority scoring, and summarization.

**Deliverables:**
1. Label Suggester
   - ✅ Build keyword dictionary (Work, Personal, Shopping, Health, Urgent)
   - ✅ Implement tokenization and keyword matching
   - ✅ Score labels by frequency + weight
   - ✅ Return top 3 labels with confidence scores

2. Priority Scorer
   - ✅ Detect urgency keywords (urgent, asap, critical, deadline)
   - ✅ Calculate days to due date
   - ✅ Composite scoring: urgency + daysScore
   - ✅ Map to priority (High=3, Medium=2, Low=1)

3. Summarizer
   - ✅ Extract first 1-2 sentences from description
   - ✅ Clean up redundancy
   - ✅ Append due date context ("Due: Tomorrow")
   - ✅ Output: 1-2 sentence summary (max 120 chars)

4. AI Metadata tracking
   - ✅ Store label confidence scores
   - ✅ Track user feedback (accepted/rejected)
   - ✅ Timestamp AI generation

5. Testing
   - ✅ Unit tests for each AI service (>85% coverage)
   - ✅ Test with 50 realistic task examples
   - ✅ Manual accuracy audit (80%+ target)
   - ✅ Test edge cases (empty input, special chars, etc.)

6. Integration with Task Service
   - ✅ Call AI engine when creating task
   - ✅ Attach suggestions to aiMetadata
   - ✅ Store confidence scores in task record

**Success Criteria:**
- [ ] All AI services implemented
- [ ] Accuracy: 80%+ for label suggestions (manual test)
- [ ] Performance: AI processing <200ms per task
- [ ] Handles edge cases (null, empty, special characters)
- [ ] Code coverage >85%
- [ ] Keyword dictionary covers 80% of common task types

**Example Test Cases:**
```
Input: "Urgent: Prepare Q4 report due tomorrow"
Labels: ["Work", "Urgent"]
Priority: 3 (High)
Summary: "Prepare Q4 report. Due: Tomorrow"

Input: "Buy milk and bread at Whole Foods"
Labels: ["Shopping"]
Priority: 1 (Low)
Summary: "Buy milk and bread at Whole Foods"

Input: "Schedule dentist appointment"
Labels: ["Health"]
Priority: 2 (Medium)
Summary: "Schedule dentist appointment"
```

**Risks & Mitigations:**
| Risk | Mitigation |
|------|-----------|
| AI accuracy <75% | Expand keyword dictionary; adjust weights |
| Performance >200ms | Optimize tokenization; cache dictionary |
| User distrust in suggestions | Show confidence scores; allow rejection |

**Code Repository:** `src/services/ai/`

---

### Spike #5: Offline-First & Data Persistence (1.5 days)

**Owner:** Frontend Developer  
**Timeline:** Dec 6-7 (Friday-Friday EOD)  
**Effort:** 1.5 days  

**Objective:** Validate that the app works fully offline and data persists across browser restarts.

**Deliverables:**
1. Offline functionality
   - ✅ All CRUD operations work without network
   - ✅ AI suggestions work offline
   - ✅ No external API calls (MVP Phase 1)
   - ✅ Offline indicator badge in UI

2. Data persistence validation
   - ✅ Create task → refresh browser → task still exists
   - ✅ Update task → refresh → changes persisted
   - ✅ Delete task → refresh → task gone
   - ✅ Test with 500+ tasks (IndexedDB capacity check)

3. Service Worker (optional, Phase 1.1)
   - ⏳ Basic service worker scaffold (not required for MVP)
   - ⏳ Cache static assets
   - ⏳ Offline page fallback

4. Export/Import
   - ✅ Export tasks as JSON
   - ✅ Import JSON file
   - ✅ Data recovery scenario

5. Testing
   - ✅ End-to-end offline scenarios
   - ✅ Browser tab close/open persistence
   - ✅ IndexedDB quota edge cases
   - ✅ Data integrity validation

**Success Criteria:**
- [ ] App fully functional offline (no network needed)
- [ ] Data persists across page reloads
- [ ] JSON export/import working
- [ ] 500+ tasks handled without performance degradation
- [ ] IndexedDB quota check implemented

**Test Scenarios:**
1. Create task → Disable network → Refresh → Task exists
2. Edit task details → Close tab → Reopen → Changes saved
3. Delete 100 tasks → Refresh → All deleted
4. Export to JSON → Clear browser storage → Import → All tasks restored

**Risks & Mitigations:**
| Risk | Mitigation |
|------|-----------|
| IndexedDB cleared by browser | Provide export warning before clearing |
| Large dataset (1000+ tasks) affects performance | Implement pagination; virtual scrolling |
| Data sync conflicts (Phase 2) | Document conflict resolution strategy |

**Code Repository:** `src/services/persistence/`

---

## 3. Spike Execution Schedule

### Week of Dec 3, 2025

| Date | Mon | Tue | Wed | Thu | Fri |
|------|-----|-----|-----|-----|-----|
| **Dec 2** | X | - | - | - | - |
| **Dec 3** | - | **S1 start** | S1, S2 | S2, S3 | - |
| **Dec 4** | - | S1 cont | S1 done, S2 cont | S3 cont, S4 start | S4 cont |
| **Dec 5** | - | - | S2 done, S3 | S3 done, S4 | S4 cont, S5 start |
| **Dec 6** | - | - | - | S4 done, S5 | S5 cont |
| **Dec 7** | - | - | - | - | **S5 done** |

### Daily Standup (15 min)
- **Time:** 10:00 AM Daily
- **Participants:** All spike leads + Tech Lead
- **Agenda:** Blockers, progress, risk flags

### Deliverable Reviews
- **Tuesday (Dec 3, end of day):** S1 initial design review
- **Wednesday (Dec 4, end of day):** S1 CRUD validation + S2 build check
- **Thursday (Dec 5, end of day):** S3 store demo + S4 AI accuracy review
- **Friday (Dec 7, 5 PM):** Final spike review + Sprint 1 readiness assessment

---

## 4. Spike Outputs & Sprint 1 Handoff

### Reusable Code for Sprint 1

Each spike produces code that becomes the foundation for Sprint 1:

**Spike #1 → Sprint 1 S1-US-2 (IndexedDB Schema)**
- `src/services/db/dbInit.ts`
- `src/services/db/taskService.ts`
- `src/services/db/labelService.ts`
- `src/services/db/__tests__/` (unit tests)

**Spike #2 → Sprint 1 S1-US-1 (Project Setup)**
- `vite.config.ts`
- `tailwind.config.ts`
- `vitest.config.ts`
- `tsconfig.json`
- `package.json` (with all deps)

**Spike #3 → Sprint 1 (State Management)**
- `src/store/useAppStore.ts`
- `src/hooks/` (custom hooks)

**Spike #4 → Sprint 2 Epic 2 (AI Engine)**
- `src/services/ai/labelSuggester.ts`
- `src/services/ai/priorityScorer.ts`
- `src/services/ai/summarizer.ts`
- `src/services/ai/__tests__/` (unit tests)

**Spike #5 → Sprint 1 (Persistence)**
- `src/services/persistence/export.ts`
- `src/services/persistence/import.ts`
- `src/hooks/usePersistence.ts`

---

## 5. Success Metrics & Acceptance Criteria

### Spike Completion Checklist

**Spike #1: IndexedDB**
- [ ] Database schema documented and tested
- [ ] CRUD operations implemented and tested
- [ ] Indexes created for dueDate, priority, labels, status
- [ ] Performance targets met (<300ms for complex queries)
- [ ] Code coverage >85%
- [ ] No critical bugs identified

**Spike #2: Vite**
- [ ] Dev server runs without errors
- [ ] Production build <100KB gzipped
- [ ] ESLint and Prettier passing
- [ ] Test infrastructure working
- [ ] HMR functional

**Spike #3: Zustand**
- [ ] Store structure defined and types checked
- [ ] Actions working correctly
- [ ] localStorage persistence verified
- [ ] React component integration tested
- [ ] No memory leaks

**Spike #4: AI Engine**
- [ ] Label suggester accuracy 80%+
- [ ] Priority scoring working
- [ ] Summarizer producing concise output
- [ ] Performance <200ms per task
- [ ] 50 test cases passing
- [ ] Keyword dictionary documented

**Spike #5: Offline**
- [ ] App fully functional offline
- [ ] Data persists across browser restarts
- [ ] Export/Import working
- [ ] 500+ tasks handled
- [ ] IndexedDB quota check implemented

---

## 6. Risk Registry

### Critical Risks

| Risk | Impact | Likelihood | Mitigation | Owner |
|------|--------|-----------|-----------|-------|
| IndexedDB not available | Spike #1 blocks all work | Low | Fallback to localStorage (limited) | DB Dev |
| Vite build too large (>100KB) | Performance concern | Medium | Code splitting; tree-shake; optimize | Frontend Dev |
| AI accuracy <75% | User distrust | Medium | Expand keywords; adjust weights; user feedback | AI Eng |
| Offline storage quota hit | Data loss risk | Low | Quota check; warn user; archive old tasks | Frontend Dev |
| Team unfamiliar with stack | Ramp-up delays | Medium | Pair programming; documentation; training | Tech Lead |

### Risk Responses

1. **IndexedDB failure** → Use localStorage as fallback (50MB limit vs 100MB+ IndexedDB)
2. **Large bundle** → Implement code splitting for AI service; lazy-load on demand
3. **Low AI accuracy** → Collect feedback loop; expand keywords; consider Phase 2 ML migration
4. **Storage quota** → Implement quota check at app startup; provide export/cleanup UI
5. **Team learning curve** → Daily standups + pair programming + spike documentation

---

## 7. Spike Documentation Requirements

### Each Spike Must Deliver

1. **README.md** - Setup and usage instructions
2. **API Documentation** - Function signatures and examples
3. **Test Results** - Coverage report + test output
4. **Performance Benchmark** - Load times, query speeds
5. **Known Issues** - Limitations and workarounds
6. **Code Comments** - Inline documentation for complex logic

### Spike Report Template

```markdown
# Spike #[N]: [Title]

## Summary
[1-2 sentence overview]

## What Worked
- [Success 1]
- [Success 2]

## What Didn't Work
- [Challenge 1]
- [Challenge 2]

## Recommendations for Sprint 1
- [Recommendation 1]
- [Recommendation 2]

## Performance Metrics
- [Metric 1]: [Value] (Target: [X])
- [Metric 2]: [Value] (Target: [X])

## Code Location
- `[File path]`

## Test Coverage
- [Coverage %]

## Open Questions
- [Question 1]
- [Question 2]
```

---

## 8. Go/No-Go Decision Criteria

### Friday Dec 7, 5 PM Sprint 1 Readiness Review

**Go Criteria (All must be YES):**
- ✅ All 5 spikes completed and signed off
- ✅ Zero critical bugs identified
- ✅ Performance targets met (or documented workarounds)
- ✅ Team confidence 8+/10 for Sprint 1
- ✅ Reusable code ready for Sprint 1 integration
- ✅ Spike documentation complete

**No-Go Criteria (If ANY is true):**
- ❌ >2 spikes incomplete or failing
- ❌ Critical blocker with no mitigation
- ❌ Performance degradation (>2x expected)
- ❌ Team consensus <7/10 confidence
- ❌ Major architectural issue discovered

**Decision Authority:** Tech Lead + Product Manager

---

## 9. Spike Dependencies & Parallel Execution

### Dependency Graph

```
Spike #2 (Vite) ──────────────────┐
                                   ├──→ Sprint 1 Ready
Spike #1 (IndexedDB) ──────────────┤
                                   ├──→ Sprint 1 Ready
Spike #3 (Zustand) ────────────────┤
                                   ├──→ Sprint 1 Ready
Spike #4 (AI Engine) ──────────────┘

Spike #5 (Offline) ─→ Sprint 1 Ready
```

**Parallel Execution:** S1, S2, S3, S4 can run in parallel (separate teams)  
**Sequential:** S5 depends on S1 (IndexedDB persistence)

---

## 10. Team Assignments

| Spike | Owner | Role | Availability |
|-------|-------|------|-------------|
| #1: IndexedDB | Jane (Backend) | DB architect | Full-time |
| #2: Vite | Alice (Frontend) | Build engineer | Full-time |
| #3: Zustand | Bob (Frontend) | State specialist | Full-time |
| #4: AI Engine | Carlos (ML) | AI engineer | Full-time |
| #5: Offline | Alice (Frontend) | Persistence | 50% (after S2) |
| Tech Lead | David | Oversight | 20% (standups) |

---

## 11. Knowledge Transfer Plan

### Post-Spike Documentation

1. **Architecture Diagram** - Updated component hierarchy
2. **API Reference** - Service function signatures
3. **Code Examples** - 3-5 real usage examples per service
4. **Testing Guide** - How to write tests for each spike
5. **Troubleshooting Guide** - Common issues + solutions

### Team Learning Sessions (Optional)

- **Tuesday Dec 3, 3 PM:** Vite + Build optimization Q&A
- **Wednesday Dec 4, 3 PM:** IndexedDB deep dive
- **Thursday Dec 5, 3 PM:** State management + AI engine overview
- **Friday Dec 7, 2 PM:** Offline-first strategy + Sprint 1 kickoff prep

---

## 12. Budget & Resources

### Time Allocation
- **Spike Execution:** 7.5 developer-days
- **Documentation:** 1.5 developer-days
- **Testing & Reviews:** 1 developer-day
- **Total:** 10 developer-days (for 4-5 person team)

### Tools & Infrastructure
- **IDE:** VS Code (free)
- **Version Control:** GitHub (already set up)
- **Testing:** Vitest (free)
- **Monitoring:** Browser DevTools (free)

### No Additional Budget Required

All tools are free/open-source. Use existing GitHub Actions for CI/CD.

---

## 13. Communication Plan

### Stakeholder Updates
- **Daily:** Tech Lead → Product Manager (blocker summary)
- **Wednesday EOD:** Mid-week progress report (% complete)
- **Friday EOD:** Final spike report + Sprint 1 readiness assessment

### Team Communication
- **Daily Standup:** 10 AM (15 min)
- **Spike Slack Channel:** `#tech-spike-week`
- **Issues & PRs:** Use GitHub for code review

---

## 14. Escalation Path

**If blocker discovered:**
1. Spike lead documents issue in GitHub issue + Slack
2. Tech lead reviews + proposes mitigation
3. If critical: Emergency call with product manager
4. Escalation decision: Proceed / Pivot / Defer

---

## 15. Post-Spike Deliverables

By Friday Dec 7, 5 PM:

1. ✅ All spike code in `/src/` (organized by spike)
2. ✅ Unit test suite (>85% coverage)
3. ✅ Performance benchmarks documented
4. ✅ Spike reports (one per spike + summary)
5. ✅ Go/No-Go decision + sign-off
6. ✅ Sprint 1 code ready for handoff
7. ✅ Team trained + confident

---

## 16. Sprint 1 Kickoff (Monday Dec 9)

After spikes complete, Sprint 1 begins with:

- **Code freeze on spike branches** (merge to main Sunday)
- **Sprint planning meeting** (Monday 10 AM)
- **User story refinement** (Monday 2 PM)
- **Development begins** (Monday end of day)

---

## 17. Appendix: Spike Retrospective Template

### Post-Spike Retrospective (Friday 4:30 PM)

**Questions for Each Spike Lead:**

1. What went better than expected?
2. What took longer than anticipated?
3. What surprised you?
4. What should we do differently in Sprint 1?
5. What's your confidence level (1-10) for Sprint 1 implementation?
6. Any technical debt to address?

**Output:** Lessons learned document → Incorporated into Sprint 1 DoD

---

## 18. Related Documents

- `docs/architecture.md` — System design for all spikes
- `docs/database-schema.md` — IndexedDB schema (Spike #1 ref)
- `docs/sprint-1-user-stories.md` — Sprint 1 implementation plan
- `docs/deployment.md` — CI/CD setup (after spikes)

---

**Document Status:** ✅ APPROVED  
**Phase:** Phase 2 - Tech Spike Validation  
**Owner:** Tech Lead  
**Last Updated:** 2025-12-02  
**Execution Start:** 2025-12-03  
**Execution End:** 2025-12-07  
**Sprint 1 Kickoff:** 2025-12-09
