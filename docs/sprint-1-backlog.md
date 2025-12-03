# Sprint 1 Backlog (Foundation)

**Sprint 1** – 10 user stories, 47 story points

## Stories

1. S1-US-1: Project setup (React + Vite + Tailwind)
   - As a developer, I want a working dev environment so I can run and build the app.
   - Acceptance: `npm run dev` starts, `npm run build` completes, lint/test scripts exist.
   - Est: 5 SP

2. S1-US-2: IndexedDB schema & TaskService
   - As the app, I need a persistent TaskService so tasks survive reloads.
   - Acceptance: CRUD operations persist to IndexedDB, tests cover basic operations.
   - Est: 5 SP

3. S1-US-3: Task list UI
   - As a user, I want to see all tasks in a list so I can scan my work.
   - Acceptance: List displays title, due date, priority, labels; pagination/virtualization considered.
   - Est: 8 SP

4. S1-US-4: Create task form & dialog
   - As a user, I want to add tasks quickly so I can capture work.
   - Acceptance: Form validates input, triggers AI suggestions (stubbed), persists.
   - Est: 5 SP

5. S1-US-5: Edit task details
   - As a user, I want to edit tasks so I can correct or update info.
   - Acceptance: Edit UI updates storage and UI reflects changes.
   - Est: 5 SP

6. S1-US-6: Delete & archive tasks
   - As a user, I want to remove or archive tasks so I can keep lists clean.
   - Acceptance: Soft delete implemented; archived tasks viewable.
   - Est: 5 SP

7. S1-US-7: Sort by due date & priority
   - As a user, I want tasks sorted by date/priority so I can focus.
   - Acceptance: Sorting controls, default sort by due date.
   - Est: 3 SP

8. S1-US-8: Filter by status
   - As a user, I want to filter Active/Completed/All tasks.
   - Acceptance: Filter UI works and state persists.
   - Est: 3 SP

9. S1-US-9: Responsive design (desktop/tablet)
   - As a user, I want the UI to display sensibly across screen sizes.
   - Acceptance: Layout verified on desktop and tablet breakpoints.
   - Est: 5 SP

10. S1-US-10: Loading & empty states
    - As a user, I want clear feedback when the app is loading or empty.
    - Acceptance: Empty-state UX, skeleton loading components.
    - Est: 3 SP

## Acceptance & DoD
- All stories have automated tests where applicable
- PRs merged with reviews
- Demoable features at end of sprint

## Assignments
- Team members assign themselves to stories; create feature branches `feat/s1-<story-key>`

## Notes
- AI engine integration will be stubbed to call `aiEngine.suggestLabels()` returning deterministic results
- Keep UI minimal and test-first where possible
