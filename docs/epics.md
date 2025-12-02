# Epics & User Stories — Smart To-Do List with AI Labels

This file captures high-level epics derived from `proposal.md` and `docs/product-brief.md`, with suggested user stories and acceptance criteria. Use these to plan sprints and create sprint artifacts.

## Epic 1 — Core Task Management
Goal: Provide reliable, fast CRUD operations and list management for tasks.

- Story 1.1: Create task (Quick-add)
  - As a user I can quickly add a task from the top bar so I can capture ideas fast.
  - Acceptance: Quick-add accepts title, saves locally, shows the new task in the list within 1s.
  - Estimate: 1 day

- Story 1.2: Edit task details
  - As a user I can open a task detail panel and edit fields (title, description, due date, project).
  - Acceptance: Changes save and persist between reloads; UI updates reflect edits.
  - Estimate: 1 day

- Story 1.3: Delete & Undo
  - As a user I can delete a task and undo the delete via a snackbar for 8 seconds.
  - Acceptance: Delete removes the task; undo restores it and logs the event.
  - Estimate: 0.5 day

## Epic 2 — AI Suggestions (Labels & Priority)
Goal: Provide AI-suggested labels and priority scores in a trustworthy, explainable way.

- Story 2.1: Rule-based label/priority suggestion
  - As a user I see suggested labels and a priority score when adding a task.
  - Acceptance: Suggestions appear inline; user can accept/reject; suggestion acceptance recorded locally.
  - Estimate: 2 days

- Story 2.2: Suggestion UI + Why explanation
  - As a user I can tap `Why?` to see a short explanation of how the suggestion was derived.
  - Acceptance: `Why?` shows keywords or heuristics; does not block saving.
  - Estimate: 0.5 day

## Epic 3 — Summaries & Edit
Goal: Provide short automatic summaries of longer task notes and let users edit them.

- Story 3.1: Automatic summary preview
  - As a user the task detail shows a 1–2 sentence summary derived from notes.
  - Acceptance: Summary displays and is editable; editing updates stored summary.
  - Estimate: 1 day

## Epic 4 — Local Storage & Offline
Goal: Ensure the app works offline and persists tasks locally.

- Story 4.1: Persist tasks to IndexedDB
  - As a user my tasks persist between sessions and reloads.
  - Acceptance: Tasks survive page reload and browser close; use LocalForage/IndexedDB.
  - Estimate: 1 day

- Story 4.2: Offline behavior for AI/Sync
  - As a user AI cloud calls are queued or replaced by local rules when offline.
  - Acceptance: App shows offline badge and uses local rule-based suggestions; queued tasks are sent when online.
  - Estimate: 1 day

## Epic 5 — Settings, Privacy & Opt-in
Goal: Give users control over AI analysis and cloud features.

- Story 5.1: AI Analysis & Cloud Mode toggles
  - As a user I can toggle AI Analysis and Cloud Mode in settings.
  - Acceptance: Cloud Mode requires explicit opt-in; when off no content is sent to external APIs.
  - Estimate: 0.5 day

## Epic 6 — UX & Accessibility
Goal: Deliver accessible, keyboard-first UI and visible suggestion feedback.

- Story 6.1: Keyboard and focus support
  - As a keyboard user I can navigate tasks, quick-add, and accept/reject suggestions via keyboard.
  - Acceptance: Tab order logical, visible focus outlines, Enter saves, Esc closes modals.
  - Estimate: 0.5 day

## Epic 7 — Telemetry & Feedback Collection
Goal: Collect minimal telemetry to evaluate suggestion quality and product KPIs.

- Story 7.1: Capture Accept/Reject events locally
  - As a product owner I can collect user corrections (locally) to bootstrap training data.
  - Acceptance: Accept/Reject events recorded with task id and timestamp; optional upload when user opts in.
  - Estimate: 0.5 day

---
Notes:
- Estimates are rough and intended for early planning; adjust after initial spike.
- Many epics include optional future work (sharing, sync to cloud, collaboration) which are out-of-scope for Sprint 1.
