# Epic 2: AI Engine (Heuristic Rules)

**Epic ID:** E2  
**Phase:** MVP (Phase 1)  
**Status:** Ready for Development  
**Created:** 2025-11-30

---

## Epic Goal

Implement a heuristic-based AI engine that automatically generates labels, priority scores, and task summaries for new tasks. This is the core differentiator of the product, enabling users to capture tasks without manual organization overhead.

---

## Success Criteria

- ✅ Label suggester suggests 1-3 labels with >75% user satisfaction
- ✅ Priority scorer assigns High/Medium/Low based on keywords and due date
- ✅ Summarizer generates 1-2 sentence summaries for all new tasks
- ✅ AI suggestions complete in <200ms per task
- ✅ User can accept/reject/edit all AI suggestions
- ✅ Feedback loop captures user edits for future improvement (Phase 2)
- ✅ Heuristic rules are transparent and documented

---

## User Stories

### US-2.1: Auto-Generate Label Suggestions
**As a** user  
**I want to** receive 1-3 label suggestions when I create a task  
**So that** I don't have to manually categorize each task

**Acceptance Criteria:**
- On task creation, system analyzes title + description
- Keyword matching against predefined label dictionary (Work, Personal, Shopping, Health, etc.)
- Top 1-3 labels returned with confidence scores (0.0-1.0)
- If confidence <0.5, no suggestion shown (avoid low-quality noise)
- Labels display as clickable chips; user can accept, reject, or add custom label
- User's label acceptance/rejection logged for feedback loop

**Effort:** 5 story points  
**FR Mapping:** FR-6

**Technical Notes:**
- Dictionary-based keyword matching (simple regex/string search)
- Configurable keywords per label in JSON config
- Example keywords: "Work" → ["meeting", "email", "report", "deadline", "project"]

---

### US-2.2: Auto-Assign Priority Score
**As a** user  
**I want to** have tasks automatically assigned High/Medium/Low priority  
**So that** I can quickly identify urgent tasks without manual classification

**Acceptance Criteria:**
- On task creation, priority assigned based on:
  - Urgency keywords (urgent, ASAP, critical) → +1 priority level
  - Days to due date: ≤1 day → High, 2-7 days → Medium, >7 days → Low
  - No due date → Low (default)
- Priority visible as badge (red/yellow/blue) on task
- User can override priority in task edit
- Priority history not tracked (for simplicity in MVP)

**Effort:** 3 story points  
**FR Mapping:** FR-7

**Technical Notes:**
- Simple rule engine: if-else logic
- No ML or external API calls
- Rules configurable in constants file

---

### US-2.3: Auto-Generate Task Summary
**As a** user  
**I want to** see a concise AI-generated summary of each task  
**So that** I can quickly understand task scope without reading full description

**Acceptance Criteria:**
- On task creation, summary auto-generated from title + first 1-2 sentences of description
- Summary max 120 characters (2 short sentences)
- If due date exists, append "Due: [date]" to summary
- Summary displayed as secondary text under task title in list
- User can edit/clear summary manually
- Summary truncated with "..." if exceeds character limit

**Effort:** 3 story points  
**FR Mapping:** FR-8

**Technical Notes:**
- Rule-based extraction (first N characters, sentence detection)
- No NLP library required for MVP
- Consider: "Extract first 1-2 sentences + capitalize first letter"

---

### US-2.4: Custom Label Management
**As a** user  
**I want to** create, edit, and delete custom labels  
**So that** I can organize tasks according to my personal categories

**Acceptance Criteria:**
- Label management panel (settings or sidebar) to add/edit/delete labels
- New label creation: name (required), color (optional, hex code)
- Label validation: no duplicates, max 30 characters
- Predefined default labels (Work, Personal, Shopping, Health) non-deletable (first time)
- Labels stored in IndexedDB
- Deleted labels removed from all tasks referencing them
- UI shows label count and usage

**Effort:** 5 story points  
**FR Mapping:** FR-9

---

### US-2.5: AI Feedback Loop (Rejection Tracking)
**As a** user  
**I want to** reject or edit AI suggestions, and have the system learn from my feedback  
**So that** future suggestions improve over time

**Acceptance Criteria:**
- When user rejects label/priority suggestion, rejection recorded in task metadata
- User edits to label/priority tagged as "edited" in aiMetadata
- Feedback stored locally in IndexedDB for Phase 2 model retraining
- No action required in MVP (collection only; analysis in Phase 2)
- Clear UI indication: "AI suggested X, but you chose Y"
- Optional: Export feedback data for analysis (Phase 2)

**Effort:** 3 story points  
**FR Mapping:** FR-10

---

## Dependencies

- **Epic 1 (Task CRUD):** Must complete before AI suggestions can be attached to tasks
- **Frontend Setup:** React components for AI suggestion display and feedback UI
- **Data Model:** Task.aiMetadata schema must include labelConfidence, priorityScore, userFeedback fields

---

## Implementation Plan

### Phase 1: Keyword Dictionary & Heuristic Rules
1. Define label keywords dictionary (JSON)
2. Implement label suggester algorithm
3. Implement priority scorer algorithm
4. Implement summarizer algorithm
5. Integrate into task creation flow

### Phase 2: Model Improvement (Post-MVP)
1. Analyze user feedback data
2. Tune keyword weights and thresholds
3. Optionally introduce ML classifier if accuracy <75%

---

## Heuristic Rule Specification

### Label Suggestion Engine

```
Input: Task { title, description }
Process:
  1. Concatenate title + description into text
  2. Lowercase and tokenize text
  3. For each predefined label:
     a. Count keyword occurrences in text
     b. Score = (keyword_count / token_count) * 100
  4. Sort labels by score descending
  5. Return top 3 labels with score >= threshold (40%)
Output: [{ label: "Work", score: 0.85 }, ...] (sorted, max 3)
```

**Example Dictionary:**
```json
{
  "Work": ["meeting", "email", "call", "deadline", "project", "report", "task", "work"],
  "Personal": ["friend", "family", "call", "home", "hobby", "personal", "appointment"],
  "Shopping": ["buy", "purchase", "shop", "store", "amazon", "mall", "cart"],
  "Health": ["doctor", "exercise", "gym", "health", "appointment", "pill", "checkup"]
}
```

### Priority Scoring Engine

```
Input: Task { title, description, dueDate }
Process:
  1. Check for urgency keywords (urgent, ASAP, critical, important, asap)
     - If found: urgency_level = HIGH
  2. Calculate days_to_due:
     - If dueDate <= today + 1 day: priority = 3 (High)
     - Else if dueDate <= today + 7 days: priority = 2 (Medium)
     - Else: priority = 1 (Low)
  3. If urgency_level == HIGH: priority = min(3, priority + 1)
Output: priority (1, 2, or 3)
```

### Summarization Engine

```
Input: Task { title, description }
Process:
  1. Combine title + description
  2. Split into sentences
  3. Extract first 1-2 sentences
  4. Truncate to 120 characters
  5. If dueDate exists: append " Due: YYYY-MM-DD"
Output: summary (string, max 150 chars)
```

---

## Estimated Effort

**Total Story Points:** 19  
**Estimated Duration:** 4-5 developer days  
**Team Size:** 1 backend/AI engineer (can be same as frontend)

---

## Acceptance Checklist (Definition of Done)

- [ ] All acceptance criteria for 5 user stories met
- [ ] Heuristic algorithms tested with 20+ sample tasks
- [ ] Label accuracy validated: >75% user satisfaction (manual test)
- [ ] Priority scoring validated against due date logic
- [ ] Summary generation tested for edge cases (very long description, no description, etc.)
- [ ] AI response time <200ms per task (performance test)
- [ ] Unit tests: >85% code coverage for AI engine
- [ ] Integration test: End-to-end task creation with AI suggestions
- [ ] Documentation: Keyword dictionary and heuristic rules documented
- [ ] Code review approved by 1 peer
- [ ] PR merged to main branch

---

**Epic Owner:** AI/Backend Engineer  
**Stakeholder:** Product Manager  
**Last Updated:** 2025-11-30
