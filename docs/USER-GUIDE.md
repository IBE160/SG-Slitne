# 📚 Smart To-Do List - User Guide

Welcome to Smart To-Do List! This guide will help you get the most out of the application.

---

## Getting Started

### Your First Launch

When you first open the app, you'll see:

1. **Header** - Shows your app title and current status
   - Online/Offline indicator (green = online, orange = offline)
   - Quick task count summary
   - Settings button

2. **Main Area** - Where all your tasks and projects live

3. **Add Task Button** - The blue "+ Add New Task" button to create your first task

### Understanding the Interface

```
┌─────────────────────────────────────────────┐
│  📋 Smart To-Do List                Settings │
│  Online • 5 Active • 2 Overdue              │
├─────────────────────────────────────────────┤
│ Projects         Collapsible section        │
├─────────────────────────────────────────────┤
│ [Search bar for finding tasks]              │
├─────────────────────────────────────────────┤
│ Sort: [Priority▼] Filter: [All▼]            │
├─────────────────────────────────────────────┤
│ □ Task 1                                    │
│ □ Task 2                                    │
│ □ Task 3                                    │
└─────────────────────────────────────────────┘
```

---

## Creating & Managing Tasks

### Adding a Task

1. Click **"+ Add New Task"** button
2. Fill in the required field:
   - **Title** - What needs to be done (required)
3. (Optional) Add more details:
   - **Description** - Additional context or notes
   - **Priority** - Low, Medium, or High
   - **Project** - Organize into projects
   - **Due Date** - When it needs to be done

4. Review **AI-Suggested Labels** - Small suggestions appear based on your task
   - Click to add suggested labels
   - Labels help categorize and find tasks
   - Your acceptance helps improve the AI

5. Click **"Add Task"** to save

### Editing a Task

1. Click on any task to expand it
2. Modify any field:
   - Check/uncheck to mark complete
   - Edit title or description
   - Change priority or due date
   - Update project assignment
3. Changes save automatically

### Completing Tasks

- **Mark Complete:** Click the checkbox next to the task
  - Completed tasks move out of the active list
  - Visual strikethrough shows completion
- **Undo:** Click the checkbox again to mark incomplete

### Deleting Tasks

1. Hover over a task
2. Click the **trash icon** (delete button)
3. Confirm deletion in the dialog
4. Task is permanently removed

### Bulk Operations

Great for managing multiple tasks at once:

1. Click **"Select Tasks"** button
2. Check boxes to select multiple tasks
3. Use bulk action buttons:
   - **Select All** - Quickly select all displayed tasks
   - **Deselect All** - Clear all selections
   - **Move to...** - Assign to a project
   - **Mark Complete** - Complete multiple at once
   - **Delete** - Remove multiple at once

---

## Organizing with Projects

### Creating a Project

1. Click **"+ New Project"** in the Projects section
2. Enter:
   - **Project Name** (required) - What is this project for?
   - **Description** (optional) - Notes about the project
   - **Color** - Choose a color for visual identification
3. Click **"Create"**

### Assigning Tasks to Projects

**Method 1: When Creating a Task**
- Select the project from the "Project" dropdown in the add task form

**Method 2: Edit Existing Task**
- Click the task to expand
- Click the project field and select a project

**Method 3: Bulk Operations**
- Select multiple tasks
- Use "Move to..." dropdown to assign them all at once

### Project Dashboard

Each project shows:
- 📊 **Statistics**
  - Total tasks in the project
  - Active (not completed) count
  - Completed count
  - Completion percentage
- 📈 **Progress Bar** - Visual representation of completion

### Managing Projects

1. **Edit** - Click the pencil icon to modify name, description, or color
2. **Delete** - Click the trash icon to remove the project
   - Tasks are unassigned but not deleted
3. **Collapse** - Click the arrow to hide project details

### Viewing Project Statistics

The overview section shows:
- Total number of projects
- Total tasks across all projects
- Active tasks count
- Completed tasks count
- Overall progress percentage

---

## Filtering & Searching

### Search

Use the search bar to find tasks by:
- **Title** - Search in task names
- **Description** - Search in task details
- **Labels** - Search by assigned labels

Example searches:
- `grocery` - Finds "Buy groceries"
- `work` - Finds all tasks with "work" in title or tags

### Sorting

Click "Sort by:" dropdown to change task order:
- **Priority** - High to Low (default)
- **Due Date** - Earliest first
- **Created** - Newest first

### Filtering by Priority

Click priority buttons to filter:
- **All** - Show all tasks (default)
- **High** - Only high priority (red)
- **Medium** - Only medium priority (yellow)
- **Low** - Only low priority (gray)

### Filtering by Project

Use the "Project:" dropdown to show:
- **All Projects** - All tasks regardless of project
- **No Project** - Tasks not assigned to any project
- **[Project Name]** - Tasks in specific project

### Combining Filters

All filters work together! For example:
- Show High priority tasks in the "Work" project
- Show tasks due this week that are unassigned
- Search for "urgent" AND filter by Medium priority

---

## AI-Powered Features

### Label Suggestions

As you type a task, the AI suggests labels:

- 🏷️ Shows up to 3 suggestions with confidence scores
- **Why it suggests** - Explains the reasoning
- Click to **add** a suggested label
- Click to **remove** an accepted label

How it works:
- Analyzes keywords in your title and description
- Considers urgency indicators ("ASAP", "URGENT", "TODAY")
- Learns from your acceptance/rejection patterns

### Priority Scoring

The AI can suggest if your task should be high or low priority:
- Considers title keywords ("URGENT", "CRITICAL")
- Looks at due date proximity
- Examines task context

### Task Summaries

AI generates one-line summaries of your tasks when enabled in Settings.

---

## Working Offline

### Offline Mode

The app works **completely offline**:

1. **No Internet?** Don't worry - keep working!
2. **Status Indicator** - Watch the header:
   - 🟢 Green "Online" - Connected to internet
   - 🟠 Orange "Offline" - No connection
3. **Pending Sync Count** - Shows how many changes are waiting to sync
   - Example: "Offline • 3 pending"

### What Happens When Offline

✅ You can still:
- Create new tasks
- Edit existing tasks
- Delete tasks
- Mark tasks complete
- Filter and search
- Manage projects

💾 Everything is saved locally on your device

### Auto-Sync When Online

When your internet connection returns:
1. A **"Syncing..."** message appears briefly
2. Your changes are sent to the cloud (when backend is available)
3. A notification shows sync success
4. If any items failed, you'll see a warning with details

### Sync History

Check the **Settings > Sync History** to see:
- When the last sync happened
- How many items synced successfully
- Any failed items that need attention
- Retry attempts and status

### Handling Sync Failures

If sync fails:
1. The app automatically retries with smart delays
2. You'll receive a notification after multiple failures
3. Check Settings > Sync History for details
4. Most failures resolve automatically when conditions improve

---

## Settings & Preferences

Click the **Settings** button in the header to access:

### AI Analysis
- **Toggle ON/OFF** - Enable/disable label suggestions and AI features
- When ON: You'll see suggested labels while creating tasks
- When OFF: No AI suggestions, simpler interface

### Cloud Mode
- **Toggle ON/OFF** - Enable/disable cloud sync
- Currently shows as disabled (feature coming soon)
- When enabled: Automatic sync to cloud backup

### Telemetry
- **Toggle ON/OFF** - Help improve the app with usage data
- When ON: Anonymous usage patterns are collected
- We never collect task content, only interaction patterns
- Helps us understand which features are most valuable

### View Management

Create custom task views to quickly access your favorite filters:

1. **Set Your Filters** - Sort, filter, and search how you want
2. **Click "Save View"** - Name your view (e.g., "My Priority")
3. **View appears** - In the Quick Views section above tasks
4. **Use anytime** - Click saved view to instantly apply filters

### Sync History

View detailed sync operation history:
- **Timestamp** - When each operation occurred
- **Status** - Success, failed, or retrying
- **Items** - How many tasks were involved
- **Duration** - How long it took

---

## Tips & Tricks

### Productivity Tips

1. **Use Projects** - Organize by context (Work, Personal, Shopping)
2. **Set Due Dates** - Never miss a deadline, filter by "This Week"
3. **Accept AI Labels** - Let AI help categorize your tasks
4. **Bulk Operations** - Update many tasks at once
5. **Quick Views** - Save filters for common workflows

### Search Techniques

- `work` - Find all work-related tasks
- `due:this-week` - (Planned feature) Find urgent tasks
- `!completed` - (Planned feature) Exclude completed tasks

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Move between elements |
| `Enter` | Activate buttons, submit forms |
| `Space` | Check/uncheck tasks, activate buttons |
| `Esc` | Close dialogs or panels |

### Mobile Usage

- **Portrait Mode** - Optimized for phones
- **Landscape Mode** - Better for tablets
- **Touch-Friendly** - All buttons sized for easy tapping
- **Responsive** - Adapts to your screen size

---

## Troubleshooting

### Task Not Saving
- Check if you're offline (see the orange indicator)
- Refresh the page
- Try again - the app will retry automatically

### Can't Find a Task
- Use the search bar to find by keyword
- Check if it's in a specific project
- It might be marked as completed (not shown by default)

### Sync Not Working
- Check your internet connection
- Wait a few moments - retries happen automatically
- Check Settings > Sync History for error details
- Try refreshing the page

### AI Suggestions Not Appearing
- Check if AI Analysis is enabled in Settings
- Create a task with descriptive title/description
- AI only suggests when it has enough context

### Tasks Disappeared
- Check if they're in a filtered view
- Search for keywords from the task title
- Check Settings > Sync History for any deletion events
- Use browser's Undo function (Ctrl+Z or Cmd+Z)

### Performance Issues
- Reduce the number of tasks (archive old ones)
- Clear browser cache
- Try closing and reopening the app
- Try a different browser

---

## FAQ

### Q: Where is my data stored?
A: Your data is stored locally on your device using IndexedDB. It never leaves your device unless cloud sync is enabled and you're online.

### Q: Is my data private?
A: Yes! The app is designed for privacy. Your tasks are stored locally and never sent anywhere unless you explicitly enable cloud sync.

### Q: Can I use the app on multiple devices?
A: Currently, the app stores data locally per device. Cloud sync is in development to sync across devices.

### Q: What happens to my data if I clear browser cache?
A: Your data will be lost if you clear the IndexedDB storage. Consider exporting tasks before clearing cache.

### Q: Can I share tasks with others?
A: Sharing is coming in a future update. Currently, this is a single-user app.

### Q: How much data can I store?
A: Your browser typically allows 50MB+ of storage, supporting thousands of tasks.

### Q: Does the app work on mobile?
A: Yes! The app is fully responsive and works great on phones and tablets.

### Q: Can I export my tasks?
A: Export feature is coming soon. For now, you can screenshot or manually copy important tasks.

---

## Getting Help

- 📖 See more in the [main documentation](../README.md)
- 🐛 Found a bug? Report it on [GitHub Issues](https://github.com/IBE160/SG-Slitne/issues)
- 💡 Have a feature request? [Share it on GitHub Discussions](https://github.com/IBE160/SG-Slitne/discussions)

---

## Keyboard Accessibility

The app is fully accessible with keyboard:
- **Tab** - Navigate between elements
- **Shift+Tab** - Navigate backwards
- **Enter** - Activate buttons and links
- **Space** - Toggle checkboxes and buttons
- **Arrow Keys** - Navigate within lists
- **Escape** - Close dialogs

---

## Screen Reader Support

The app includes ARIA labels and semantic HTML for screen reader users:
- ✅ Form labels are properly associated
- ✅ Buttons have descriptive labels
- ✅ Status changes are announced
- ✅ Navigation landmarks are marked

---

## Accessibility Features

- **High Contrast** - Colors meet WCAG AA standards
- **Text Sizing** - Browser zoom supported
- **Focus Indicators** - Clear when navigating with keyboard
- **Color Independent** - Don't rely on color alone for information

---

**Happy task managing!** 🎉

*Last updated: December 4, 2025*
