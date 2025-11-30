# UX Design Specification — Smart To-Do List with AI Labels

## Overview
This document describes the UX for the Smart To-Do List MVP: a responsive web app that helps users manage tasks with AI-suggested labels, priorities, and short summaries. The design prioritizes clarity, discoverability, privacy control, and an easy feedback loop for improving AI suggestions.

## Personas
- Primary: Busy Professional — needs quick capture and triage of tasks across projects.
- Secondary: Student / Freelancer — manages multiple small projects and deadlines.
- Tertiary: Small team member — shares lists and collaborates (post-MVP).

## Key User Goals
- Capture tasks quickly with minimal typing.
- Get useful label and priority suggestions without friction.
- Accept/reject AI suggestions easily and see why they were suggested.
- Control privacy (opt-in to cloud AI) in a clear settings screen.

## Core User Flows

1. Add Task (fast capture)
  - Entry point: top-bar quick-add or `+` floating action button (FAB).
  - User types title (mandatory) and optional details; AI shows label/priority suggestions inline.
  - User can accept a suggestion with one click or edit fields before saving.

2. Edit Task (detailed)
  - Open task detail modal or panel from list item.
  - Show labels, priority, due date, project, and AI-generated summary.
  - Provide inline history of suggestion acceptance/rejection and an undo action.

3. Review Suggestions (feedback loop)
  - For new tasks, suggestion chip group shows detected labels and priority.
  - Each suggestion has Accept / Reject controls; rejections are recorded to improve rules/classifier.
  - A small `Why?` link reveals a short explanation (keywords, heuristics) to build trust.

4. Settings & Privacy
  - Settings screen includes `AI Analysis` toggle (Default: ON with friendly explanation).
  - `Cloud Mode` toggle (Default: OFF). When ON, richer summaries and LLM capabilities are enabled and the user must explicitly opt-in.

## Screens & Components

- App Shell
  - Top navigation: App name, search, quick-add, profile/settings.
  - Left rail (collapsible) on wide screens: Projects, Smart Filters (Today, Urgent, Low effort).
  - Main area: Task list (compact) and task detail panel (right-side slide-over on wide screens / modal on narrow screens).

- Task List Item
  - Elements: Checkbox, title, chip group (labels), due date, priority icon, quick actions (edit, snooze, delete).
  - Tap/click expands detail panel.

- Task Detail
  - Header: Title, due date picker, project selector.
  - Body: Description / notes with summarization preview at top (if present).
  - AI Suggestion bar: suggested labels (chips), suggested priority (icon + numeric score), `Why?`, Accept/Reject buttons.
  - Footer: Comment / activity timeline (future).

## Interaction Patterns
- Inline suggestions are non-blocking; they should never obstruct saving a task.
- Use progressive disclosure: show `Why?` only when the user requests it.
- Provide immediate visual feedback for Accept/Reject and an undo snackbar.
- Keyboard-first: support Enter to save, Esc to close modals, and arrow navigation in lists.

## Accessibility
- All actionable controls must be reachable via keyboard and have ARIA labels.
- Color contrast must meet WCAG AA for text and interactive elements.
- Provide text alternatives and clear focus outlines.
- For `Why?` explanations, ensure they are read by screen readers and collapsible.

## Wireframes (low-fidelity)

Main layout (wide):

[Left rail] | [Top bar: Search | Quick-add]
            | [Task list — rows]
            | [Detail panel — slide-over]

Quick-add flow:
- Quick-add input at top bar. User types: "Email client about invoice"
- Inline chips appear: [Work] [Urgent]
- Buttons: [Save] [More options]

Task detail (modal/panel):
----------------------------------
| Title input                     |
| Due date [calendar]  Project v  |
| AI Summary: "Email client about invoice and attach last month's statement." [Edit]
| Suggested labels: [Work] [Finance]  Priority: 2  [Why?]
| [Accept] [Reject]                 |
----------------------------------

## Microcopy guidelines
- Use short, action-oriented labels: `Add task`, `Save`, `Accept suggestion`.
- For privacy toggles include one-line context text: "Allow AI to analyze your notes (opt-in)."

## Error states & edge cases
- Network offline: show offline badge; queue cloud requests until online.
- AI service error: show fallback (rule-based suggestions) and a small notice: "AI suggestions temporarily unavailable — using local rules."

## Metrics to capture (for UX validation)
- Time-to-save task (ms)
- Suggestion acceptance rate
- Rate of privacy opt-ins (Cloud Mode)
- Frequency of undo after Accept/Reject

## Deliverables for handoff
- `ux-color-themes.html` — color tokens, typographic scale.
- `ux-design-directions.html` — component specs and spacing tokens.
- Low-fidelity wireframes and interaction notes in this spec.

---
End of UX specification (MVP-focused).
