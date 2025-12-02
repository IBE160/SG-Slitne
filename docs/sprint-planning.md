# Sprint 1 Plan — MVP foundation (2 weeks)

Sprint window: 2025-12-01 → 2025-12-14 (2 weeks)

## Sprint Goal
- Deliver a functioning local-first MVP that supports quick task capture, reliable CRUD, rule-based AI suggestions, and editable summaries.

## Sprint Backlog (prioritized)
1. STORY-1.1 — Quick-add task (1d)
   - Acceptance: Quick-add captures title, saves locally, new item shown in list. Keyboard: Enter saves.
2. STORY-4.1 — Persist tasks to IndexedDB (1d)
   - Acceptance: Tasks persist between reloads; use LocalForage.
3. STORY-1.2 — Edit task details (1d)
   - Acceptance: Detail panel edits persist and update list item.
4. STORY-2.1 — Rule-based label/priority suggestion (2d)
   - Acceptance: Inline suggestions appear on add/edit; suggestions can be accepted/rejected and recorded locally.
5. STORY-2.2 — Suggestion UI + Why explanation (0.5d)
   - Acceptance: `Why?` reveals reasoning; does not block save.
6. STORY-3.1 — Automatic summary preview (1d)
   - Acceptance: Summaries shown and editable in detail view.
7. STORY-1.3 — Delete & Undo (0.5d)
   - Acceptance: Delete with undo snackbar (8s).

## Sprint Capacity & Assignment
- Team assumption: Solo developer or 1-2 engineers. Adjust estimates if team size differs.
- Suggested assignment (if solo): implement storage + quick-add first, then UI, then AI rules, then summary and polish.

## Definition of Done (DoD)
- Code compiles and passes lint.
- Unit tests for rule-based logic and storage.
- E2E smoke tests for add/edit/delete flows.
- Accessibility checks for focus/keyboard in core flows.
- UX review pass for quick-add and suggestion UI.

## Risks & Mitigations
- Risk: AI suggestions require tuning — mitigation: keep rule-based approach for Sprint 1 and collect corrections for later model training.
- Risk: Offline edge cases — mitigation: show offline state and use local rules.

## Sprint Review Checklist
- Demo: Add task, accept a suggested label, edit summary, and show persistence after reload.
- Metrics: record suggestion acceptance events for first-week telemetry.

---
Sprint plan prepared from `docs/epics.md` and product brief; update during grooming.
