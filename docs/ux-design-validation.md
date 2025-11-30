# UX Design Validation Checklist & Test Plan

This document defines the validation criteria, accessibility checks, usability test script, and developer QA checklist for the Smart To-Do List MVP. Use this to verify the UX spec (`ux-design-specification.md`) before developer handoff and during implementation.

## Validation Goals
- Ensure core flows (add, edit, accept/reject AI suggestions) are usable and accessible.
- Validate the privacy opt-in flow and messaging are clear.
- Measure baseline metrics (time-to-add, suggestion acceptance rate) to track improvements.

## Automated Accessibility & Quality Checks
- Run these tools routinely during CI and local development:
  - Axe (axe-core / jest-axe) for component/unit accessibility checks.
  - Lighthouse (accessibility, performance, best-practices)
  - cspell for microcopy spellcheck
  - color-contrast analyzer for token validation

## Accessibility Checklist (WCAG-focused)
- Semantic HTML: use <header>, <main>, <nav>, <button>, <form>, and <label> correctly.
- Keyboard Navigation:
  - All interactive elements reachable via Tab.
  - Enter/Space activate controls; Esc closes modals.
  - Focus order follows visual order.
- Focus indicators visible (not only color change).
- ARIA:
  - Provide aria-labels where icons lack visible text.
  - Use role="status" or aria-live for dynamic updates (suggestion accepted/failed).
- Color Contrast: text ratio >= 4.5:1 (normal text), >= 3:1 for large text.
- Images/Icons: include alt text or aria-hidden as appropriate.
- Forms: inputs have associated labels; errors are announced to screen readers.

## UX Heuristics & Interaction Checks
- Visibility of system status: show when AI is analyzing, or when offline/fallback rules apply.
- Match between system and real world: microcopy uses user language (e.g., "labels", "priority").
- User control and freedom: provide undo for Accept/Reject suggestions.
- Error prevention and handling: avoid destructive defaults; confirm before deleting lists.
- Minimalist design: avoid unnecessary elements in quick-add flow.

## Privacy & Opt-in Validation
- Verify settings screen language is clear and non-technical.
- Cloud Mode must require an explicit opt-in (checkbox + short rationale).
- When Cloud Mode is OFF, ensure no network calls send note content to third-party APIs.
- When Cloud Mode is ON, record consent with timestamp and provide an easy opt-out.

## Performance & Reliability Checks
- Suggestion latency: measure 95th percentile suggestion generation time.
- Offline behaviour: app must work for core CRUD when offline; queue cloud calls.
- Graceful fallback: if AI fails, fall back to rule-based suggestions without blocking save.

## Usability Test Plan (moderated, 5 users recommended)

Purpose: Validate that users can quickly add tasks, understand and accept/reject AI suggestions, and feel comfortable with privacy choices.

Metrics to capture:
- Time-to-add task (start typing to Save) — target: < 12s for quick capture.
- Suggestion acceptance rate — baseline target: >= 60%.
- Error rate: user needs to correct suggestion after accept (should be low).
- Task completion success (users completing scenario tasks).
- SUS or simple satisfaction question after session.

Test tasks (example script):
1. Add a task: "Call accountant about Q3 taxes" using quick-add. Observe suggestions, accept a label and save.
2. Add a task with more detail: "Draft proposal for client X, include timeline and costs". Inspect AI summary and edit it.
3. Edit an existing task and reject a label suggestion; check undo behaviour.
4. Open Settings and toggle Cloud Mode — ask user whether the explanation made sense.

Moderator prompts:
- "Please think aloud while you complete the task."
- After each task: "How confident are you in the suggested labels?" (1–5)

Success criteria for MVP usability
- 80% of participants can complete add/edit tasks without assistance.
- Average suggestion acceptance >= 60%.
- Cloud Mode wording is understood by 80% of participants in a quick comprehension check.

## Developer QA Checklist (pre-merge)
- [ ] Unit tests for rule-based labeling logic and priority heuristics.
- [ ] Component-level accessibility tests (axe) included.
- [ ] E2E happy-path tests: add, edit, accept/reject, undo, offline save.
- [ ] Performance test for suggestion latency (simple benchmark or mocked latency assertion).
- [ ] Privacy test: ensure opt-out prevents external API calls (mock network).

## Reporting & Iteration
- After initial test round, produce a findings doc with measured metrics and qualitative notes.
- Prioritize fixes: any accessibility failures (WCAG A/AA) are P0; usability flows blocking task completion are P0.
- Re-run tests after fixes and track metrics over time.

---
End of UX validation checklist & test plan.
