# UX Design Specification — Smart To-Do List with AI Labels

## Overview
This document describes the UX for the Smart To-Do List MVP: a responsive web app that helps users manage tasks with AI-suggested labels, priorities, and short summaries. The design prioritizes clarity, discoverability, privacy control, and an easy feedback loop for improving AI suggestions.

## Alignment with Proposal & Product Brief
- Source: `proposal.md` and `docs/product-brief.md` — core MVP requirements are CRUD, AI-generated labels/priority, automatic summaries, and sorting by due date/priority.
- UX implication: prioritize a fast, low-friction quick-add flow and non-blocking inline AI suggestions so the app demonstrates value immediately without forcing heavy AI interactions.

### How the UX implements brief goals
- CRUD: task list, task detail panel, and quick-add capture make core actions reachable within 1–2 interactions.
- AI suggestions: presented as chips and a small priority indicator with Accept/Reject actions and a lightweight `Why?` explanation to improve trust.
- Summaries: shown in the task detail preview and editable before save; default to a short one-line summary to avoid noise.
- Sorting: default list sorts by due date and exposes a priority sort option; smart filters (Today, Urgent) are in the left rail.

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

  ### Feedback capture and product goals
  - Each Accept/Reject event is captured locally and optionally uploaded if the user opts into Cloud Mode. This creates labeled data for improving classifiers in future iterations (see `docs/product-brief.md` next steps).

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

## Component States & Focus Styles
To make implementation consistent, below are compact state tables and CSS tokens for common components. Use these tokens in component libraries or design systems.

Tokens (CSS variables examples):
```
:root {
  --btn-height: 40px;
  --btn-padding-x: 16px;
  --chip-radius: 9999px;
  --input-height: 40px;
  --task-item-gap: 12px;
  --focus-ring-color: var(--accent-300);
}
```

Component state table (visual specs):

- Button
  - Default: `background: var(--accent-500); color: white; height: var(--btn-height); padding: 0 var(--btn-padding-x); border-radius:8px;`
  - Hover: `background: var(--accent-700)`
  - Focus: `box-shadow: 0 0 0 3px rgba(96,165,250,0.18); outline: none;` (or use focus ring below)
  - Active: `transform: translateY(1px);`
  - Disabled: `opacity:0.5; pointer-events:none;`

- Chip (label)
  - Default: `background: var(--chip-bg); color: var(--chip-text); padding:6px 10px; border-radius: var(--chip-radius);`
  - Hover: `filter:brightness(0.98)`
  - Focus: `outline: 2px solid var(--focus-ring-color); outline-offset: 2px;`

- Input
  - Default: `height: var(--input-height); padding: 8px 12px; border-radius:8px; border:1px solid #e6e6e9;`
  - Focus: `border-color: var(--accent-500); box-shadow: 0 0 0 3px rgba(37,99,235,0.08);`
  - Error: `border-color: var(--danger);` + support error text below input

- TaskListItem
  - Default: compact row with `gap: var(--task-item-gap);` background `transparent` or `var(--surface)` for selected
  - Hover: `background: #f8fafc` (subtle)
  - Focus: apply focus ring to the row container and ensure internal interactive elements receive focus order

Focus CSS snippet (recommended global rule):
```
/* Visible focus ring for keyboard users */
*:focus {
  outline: 2px solid var(--focus-ring-color);
  outline-offset: 2px;
}

/* Slightly stronger focus for interactive controls */
button:focus, input:focus, [role="button"]:focus {
  box-shadow: 0 0 0 3px rgba(96,165,250,0.12);
}
```

### Keyboard interaction matrix (examples)
```
Enter: Save / Activate primary action
Esc: Close modal or cancel edit
Space: Toggle checkbox or chip when focused
Tab / Shift+Tab: Move focus forward/back
Arrow Up/Down: Navigate task list when list has focus
```

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

These metrics map directly to the product success criteria in the brief: useful AI output, smooth performance, and correct sync (if enabled).

## Deliverables for handoff
- `ux-color-themes.html` — color tokens, typographic scale.
- `ux-design-directions.html` — component specs and spacing tokens.
- Low-fidelity wireframes and interaction notes in this spec.

---
End of UX specification (MVP-focused).
