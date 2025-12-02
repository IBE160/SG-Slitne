# Smart To-Do List: IndexedDB Schema & Query Guide

**Document Version:** 1.0  
**Last Updated:** 2025-12-02  
**Status:** Phase 2 - Database Design Complete  
**Owner:** Database Architect

---

## 1. Overview

This document defines the IndexedDB schema for Smart To-Do List MVP. IndexedDB is a browser-native, persistent, key-value object store optimized for client-side data management.

### Database Specifications

| Property | Value |
|----------|-------|
| **Database Name** | `smart-todo-db` |
| **Version** | 1 (production), 2+ for migrations |
| **Object Stores** | tasks, labels, projects |
| **Quota** | Typically 50MB+ per domain (browser-dependent) |
| **Persistence** | Persistent (survives browser restart) |
| **Sync** | N/A (local-only MVP); Phase 2: cloud sync |

---

## 2. Database Initialization

### Database Creation Code

```javascript
// dbInit.ts
const DB_NAME = "smart-todo-db";
const DB_VERSION = 1;

export async function initializeDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains("tasks")) {
        const taskStore = db.createObjectStore("tasks", { keyPath: "id" });
        taskStore.createIndex("dueDate", "dueDate", { unique: false });
        taskStore.createIndex("priority", "priority", { unique: false });
        taskStore.createIndex("status", "status", { unique: false });
        taskStore.createIndex("labels", "labels", { unique: false, multiEntry: true });
        taskStore.createIndex("projectId", "projectId", { unique: false });
        taskStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (!db.objectStoreNames.contains("labels")) {
        const labelStore = db.createObjectStore("labels", { keyPath: "id" });
        labelStore.createIndex("name", "name", { unique: true });
      }

      if (!db.objectStoreNames.contains("projects")) {
        const projectStore = db.createObjectStore("projects", { keyPath: "id" });
        projectStore.createIndex("name", "name", { unique: true });
      }
    };
  });
}
```

---

## 3. Object Store Schemas

### 3.1 TASKS Object Store

**Purpose:** Store all task records  
**Key Path:** `id` (UUID)  
**Primary Use:** Create, read, update, delete tasks

#### Task Record Structure

```typescript
interface Task {
  // Identification
  id: string;                           // UUID (Primary Key)
  
  // Content
  title: string;                        // Task title (required)
  description: string;                  // Task description (optional)
  
  // Organization
  projectId?: string;                   // Link to project (foreign key)
  labels: string[];                     // Array of label IDs
  
  // Priority & Status
  priority: 1 | 2 | 3;                  // 1=Low, 2=Medium, 3=High
  status: "active" | "completed" | "archived"; // Task state
  
  // Due Date
  dueDate?: string;                     // ISO 8601 date (YYYY-MM-DD)
  
  // AI Metadata
  summary: string;                      // Auto-generated summary
  aiMetadata: {
    labelConfidence: Array<{
      label: string;
      confidence: number;               // 0.0 - 1.0
      accepted?: boolean;               // User feedback
    }>;
    priorityScore: number;              // 1 | 2 | 3
    summarizedAt: string;               // ISO timestamp
    userFeedback: "accepted" | "rejected" | "edited" | null;
  };
  
  // Timestamps
  createdAt: string;                    // ISO 8601 timestamp
  updatedAt: string;                    // ISO 8601 timestamp
}
```

#### Example Task Record

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Prepare quarterly report",
  "description": "Compile Q4 metrics, format slides, send to stakeholders",
  "projectId": "proj-001",
  "labels": ["label-work", "label-urgent"],
  "priority": 3,
  "status": "active",
  "dueDate": "2025-12-10",
  "summary": "Prepare quarterly report. Due: Dec 10",
  "aiMetadata": {
    "labelConfidence": [
      { "label": "label-work", "confidence": 0.92, "accepted": true },
      { "label": "label-urgent", "confidence": 0.78, "accepted": true },
      { "label": "label-personal", "confidence": 0.15, "accepted": false }
    ],
    "priorityScore": 3,
    "summarizedAt": "2025-12-02T10:30:00Z",
    "userFeedback": "accepted"
  },
  "createdAt": "2025-12-02T09:15:00Z",
  "updatedAt": "2025-12-02T10:30:00Z"
}
```

#### Indexes

| Index Name | Key Path | Unique | Multi-Entry | Use Case |
|-----------|----------|--------|------------|----------|
| `dueDate` | `dueDate` | No | No | Sort by deadline, find overdue |
| `priority` | `priority` | No | No | Sort by importance, filter high-priority |
| `status` | `status` | No | No | Filter active/completed/archived |
| `labels` | `labels` | No | **Yes** | Find tasks by label, filter by tag |
| `projectId` | `projectId` | No | No | Find tasks in project |
| `createdAt` | `createdAt` | No | No | Sort by creation date |

---

### 3.2 LABELS Object Store

**Purpose:** Store user-defined labels  
**Key Path:** `id` (UUID)  
**Primary Use:** Manage custom task categories

#### Label Record Structure

```typescript
interface Label {
  // Identification
  id: string;                           // UUID (Primary Key)
  
  // Label Data
  name: string;                         // Label name (unique, required)
  color?: string;                       // Hex color code (e.g., "#FF5733")
  description?: string;                 // Optional label description
  
  // Metadata
  isSystemLabel: boolean;               // True for built-in labels (Work, Personal, etc.)
  createdAt: string;                    // ISO 8601 timestamp
  updatedAt?: string;                   // ISO 8601 timestamp
}
```

#### Example Label Records

```json
[
  {
    "id": "label-work",
    "name": "Work",
    "color": "#3B82F6",
    "description": "Work-related tasks",
    "isSystemLabel": true,
    "createdAt": "2025-11-30T00:00:00Z"
  },
  {
    "id": "label-personal",
    "name": "Personal",
    "color": "#8B5CF6",
    "description": "Personal errands and activities",
    "isSystemLabel": true,
    "createdAt": "2025-11-30T00:00:00Z"
  },
  {
    "id": "label-shopping",
    "name": "Shopping",
    "color": "#EC4899",
    "description": "Shopping and purchases",
    "isSystemLabel": true,
    "createdAt": "2025-11-30T00:00:00Z"
  },
  {
    "id": "label-custom-001",
    "name": "House Renovation",
    "color": "#F59E0B",
    "description": "Home improvement project",
    "isSystemLabel": false,
    "createdAt": "2025-12-02T14:30:00Z"
  }
]
```

#### Default System Labels

The following labels are created on first app launch:

| Label ID | Name | Color | Description |
|----------|------|-------|-------------|
| `label-work` | Work | `#3B82F6` | Work meetings, projects, deadlines |
| `label-personal` | Personal | `#8B5CF6` | Personal tasks and hobbies |
| `label-shopping` | Shopping | `#EC4899` | Shopping and purchases |
| `label-health` | Health | `#10B981` | Exercise, appointments, health |
| `label-urgent` | Urgent | `#EF4444` | Time-sensitive, critical items |

#### Indexes

| Index Name | Key Path | Unique | Use Case |
|-----------|----------|--------|----------|
| `name` | `name` | **Yes** | Prevent duplicate labels |

---

### 3.3 PROJECTS Object Store

**Purpose:** Store project groupings (optional, for organization)  
**Key Path:** `id` (UUID)  
**Primary Use:** Organize tasks into projects

#### Project Record Structure

```typescript
interface Project {
  // Identification
  id: string;                           // UUID (Primary Key)
  
  // Project Data
  name: string;                         // Project name (unique, required)
  description?: string;                 // Optional description
  color?: string;                       // Hex color code for UI display
  
  // Status
  status: "active" | "archived" | "completed"; // Project state
  
  // Metadata
  taskCount?: number;                   // Cached count (optional)
  createdAt: string;                    // ISO 8601 timestamp
  updatedAt?: string;                   // ISO 8601 timestamp
}
```

#### Example Project Records

```json
[
  {
    "id": "proj-001",
    "name": "Q4 Marketing Campaign",
    "description": "Year-end promotional campaign planning and execution",
    "color": "#FF6B6B",
    "status": "active",
    "createdAt": "2025-11-15T00:00:00Z",
    "updatedAt": "2025-12-02T10:00:00Z"
  },
  {
    "id": "proj-002",
    "name": "Home Renovation",
    "description": "Kitchen and bathroom updates",
    "color": "#F59E0B",
    "status": "active",
    "createdAt": "2025-11-20T00:00:00Z"
  },
  {
    "id": "proj-003",
    "name": "Product Launch",
    "description": "Smart To-Do List MVP launch",
    "color": "#10B981",
    "status": "completed",
    "createdAt": "2025-11-01T00:00:00Z",
    "updatedAt": "2025-12-01T00:00:00Z"
  }
]
```

#### Indexes

| Index Name | Key Path | Unique | Use Case |
|-----------|----------|--------|----------|
| `name` | `name` | **Yes** | Prevent duplicate project names |

---

## 4. CRUD Operations & Queries

### Task Service - CRUD Operations

#### CREATE: Add New Task

```typescript
async function createTask(taskData: Partial<Task>): Promise<Task> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks", "labels"], "readwrite");
  const taskStore = transaction.objectStore("tasks");

  const task: Task = {
    id: generateUUID(),
    title: taskData.title || "Untitled",
    description: taskData.description || "",
    projectId: taskData.projectId,
    labels: taskData.labels || [],
    priority: taskData.priority || 1,
    status: "active",
    dueDate: taskData.dueDate,
    summary: taskData.summary || taskData.title,
    aiMetadata: {
      labelConfidence: [],
      priorityScore: taskData.priority || 1,
      summarizedAt: new Date().toISOString(),
      userFeedback: null,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = taskStore.add(task);
    request.onsuccess = () => resolve(task);
    request.onerror = () => reject(request.error);
  });
}
```

#### READ: Get Single Task

```typescript
async function getTask(id: string): Promise<Task | null> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");

  return new Promise((resolve, reject) => {
    const request = taskStore.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}
```

#### READ: Get All Tasks

```typescript
async function getAllTasks(): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");

  return new Promise((resolve, reject) => {
    const request = taskStore.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
```

#### READ: Query Tasks by Index

```typescript
// Get all tasks due within 7 days
async function getUpcomingTasks(daysAhead = 7): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");
  const index = taskStore.index("dueDate");

  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);

  const todayStr = today.toISOString().split("T")[0];
  const futureStr = futureDate.toISOString().split("T")[0];

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.bound(todayStr, futureStr));
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
```

#### READ: Query Tasks by Priority

```typescript
async function getHighPriorityTasks(): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");
  const index = taskStore.index("priority");

  return new Promise((resolve, reject) => {
    const request = index.getAll(3); // 3 = HIGH priority
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
```

#### READ: Query Tasks by Label (Multi-Entry Index)

```typescript
async function getTasksByLabel(labelId: string): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");
  const index = taskStore.index("labels"); // Multi-entry index

  return new Promise((resolve, reject) => {
    const request = index.getAll(labelId);
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
```

#### READ: Query Tasks by Status

```typescript
async function getActiveTasks(): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");
  const index = taskStore.index("status");

  return new Promise((resolve, reject) => {
    const request = index.getAll("active");
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
```

#### UPDATE: Modify Existing Task

```typescript
async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readwrite");
  const taskStore = transaction.objectStore("tasks");

  // First, get the current task
  const currentTask = await new Promise<Task>((resolve, reject) => {
    const request = taskStore.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  // Merge updates
  const updatedTask: Task = {
    ...currentTask,
    ...updates,
    id: currentTask.id, // Prevent ID change
    createdAt: currentTask.createdAt, // Preserve creation date
    updatedAt: new Date().toISOString(), // Update timestamp
  };

  return new Promise((resolve, reject) => {
    const request = taskStore.put(updatedTask);
    request.onsuccess = () => resolve(updatedTask);
    request.onerror = () => reject(request.error);
  });
}
```

#### DELETE: Remove Task

```typescript
async function deleteTask(id: string): Promise<void> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readwrite");
  const taskStore = transaction.objectStore("tasks");

  return new Promise((resolve, reject) => {
    const request = taskStore.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
```

#### DELETE: Soft Delete (Archive)

```typescript
async function archiveTask(id: string): Promise<Task> {
  return updateTask(id, { status: "archived" });
}
```

#### BULK: Update Multiple Tasks

```typescript
async function bulkUpdateTasks(
  ids: string[],
  updates: Partial<Task>
): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readwrite");
  const taskStore = transaction.objectStore("tasks");

  const updatedTasks: Task[] = [];

  for (const id of ids) {
    const task = await new Promise<Task>((resolve, reject) => {
      const request = taskStore.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    const updatedTask = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await new Promise<void>((resolve, reject) => {
      const request = taskStore.put(updatedTask);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    updatedTasks.push(updatedTask);
  }

  return updatedTasks;
}
```

---

### Label Service - CRUD Operations

#### CREATE: Add Label

```typescript
async function createLabel(labelData: Partial<Label>): Promise<Label> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["labels"], "readwrite");
  const labelStore = transaction.objectStore("labels");

  const label: Label = {
    id: generateUUID(),
    name: labelData.name || "Untitled Label",
    color: labelData.color,
    description: labelData.description,
    isSystemLabel: labelData.isSystemLabel || false,
    createdAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = labelStore.add(label);
    request.onsuccess = () => resolve(label);
    request.onerror = () => reject(request.error);
  });
}
```

#### READ: Get All Labels

```typescript
async function getAllLabels(): Promise<Label[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["labels"], "readonly");
  const labelStore = transaction.objectStore("labels");

  return new Promise((resolve, reject) => {
    const request = labelStore.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
```

#### UPDATE: Modify Label

```typescript
async function updateLabel(id: string, updates: Partial<Label>): Promise<Label> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["labels"], "readwrite");
  const labelStore = transaction.objectStore("labels");

  const currentLabel = await new Promise<Label>((resolve, reject) => {
    const request = labelStore.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const updatedLabel: Label = {
    ...currentLabel,
    ...updates,
    id: currentLabel.id,
    createdAt: currentLabel.createdAt,
    updatedAt: new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = labelStore.put(updatedLabel);
    request.onsuccess = () => resolve(updatedLabel);
    request.onerror = () => reject(request.error);
  });
}
```

#### DELETE: Remove Label

```typescript
async function deleteLabel(id: string): Promise<void> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["labels"], "readwrite");
  const labelStore = transaction.objectStore("labels");

  return new Promise((resolve, reject) => {
    const request = labelStore.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
```

---

## 5. Complex Queries

### Query: Get Tasks Due This Week

```typescript
async function getTasksDueThisWeek(): Promise<Task[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(today);
  endOfWeek.setDate(today.getDate() + 7);

  const todayStr = today.toISOString().split("T")[0];
  const weekStr = endOfWeek.toISOString().split("T")[0];

  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");
  const index = taskStore.index("dueDate");

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.bound(todayStr, weekStr, false, true));
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}
```

### Query: Get Overdue Tasks

```typescript
async function getOverdueTasks(): Promise<Task[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");
  const index = taskStore.index("dueDate");

  return new Promise((resolve, reject) => {
    const request = index.getAll(IDBKeyRange.upperBound(todayStr, true));
    request.onsuccess = () => {
      const overdueTasks = (request.result || []).filter(
        (task) => task.status === "active" || task.status === "completed"
      );
      resolve(overdueTasks);
    };
    request.onerror = () => reject(request.error);
  });
}
```

### Query: Get Tasks by Multiple Labels

```typescript
async function getTasksByMultipleLabels(labelIds: string[]): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");
  const index = taskStore.index("labels");

  const allTasks: Task[] = [];

  for (const labelId of labelIds) {
    const tasks = await new Promise<Task[]>((resolve, reject) => {
      const request = index.getAll(labelId);
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    allTasks.push(...tasks);
  }

  // Remove duplicates (if task has multiple labels)
  const uniqueMap = new Map<string, Task>();
  allTasks.forEach((task) => uniqueMap.set(task.id, task));

  return Array.from(uniqueMap.values());
}
```

### Query: Search Tasks (Text Search)

```typescript
async function searchTasks(query: string): Promise<Task[]> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");

  const allTasks = await new Promise<Task[]>((resolve, reject) => {
    const request = taskStore.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

  const lowerQuery = query.toLowerCase();

  return allTasks.filter((task) => {
    return (
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery) ||
      task.summary.toLowerCase().includes(lowerQuery)
    );
  });
}
```

### Query: Get Task Statistics

```typescript
async function getTaskStats(): Promise<{
  total: number;
  active: number;
  completed: number;
  archived: number;
  overdue: number;
  highPriority: number;
}> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks"], "readonly");
  const taskStore = transaction.objectStore("tasks");

  const allTasks = await new Promise<Task[]>((resolve, reject) => {
    const request = taskStore.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  return {
    total: allTasks.length,
    active: allTasks.filter((t) => t.status === "active").length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    archived: allTasks.filter((t) => t.status === "archived").length,
    overdue: allTasks.filter(
      (t) => t.dueDate && t.dueDate < todayStr && t.status === "active"
    ).length,
    highPriority: allTasks.filter((t) => t.priority === 3).length,
  };
}
```

---

## 6. Sorting & Filtering

### In-Memory Sorting (After Query)

```typescript
// Sort tasks by due date (ascending)
function sortByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1; // Tasks without date go to end
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

// Sort tasks by priority (high to low)
function sortByPriority(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => b.priority - a.priority);
}

// Sort tasks by creation date (newest first)
function sortByNewest(tasks: Task[]): Task[] {
  return [...tasks].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
```

### In-Memory Filtering

```typescript
// Filter by status
function filterByStatus(tasks: Task[], status: string): Task[] {
  return tasks.filter((t) => t.status === status);
}

// Filter by priority
function filterByPriority(tasks: Task[], priority: number): Task[] {
  return tasks.filter((t) => t.priority === priority);
}

// Filter by labels (AND condition)
function filterByLabels(tasks: Task[], labelIds: string[]): Task[] {
  return tasks.filter((task) =>
    labelIds.every((labelId) => task.labels.includes(labelId))
  );
}

// Filter by labels (OR condition)
function filterByLabelsOr(tasks: Task[], labelIds: string[]): Task[] {
  return tasks.filter((task) =>
    task.labels.some((label) => labelIds.includes(label))
  );
}
```

---

## 7. Data Validation & Constraints

### Task Validation

```typescript
function validateTask(task: Partial<Task>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Title is required
  if (!task.title || task.title.trim().length === 0) {
    errors.push("Task title is required");
  }

  // Title length limit
  if (task.title && task.title.length > 255) {
    errors.push("Task title must be <= 255 characters");
  }

  // Priority must be 1-3
  if (task.priority && ![1, 2, 3].includes(task.priority)) {
    errors.push("Priority must be 1, 2, or 3");
  }

  // Status must be valid
  if (
    task.status &&
    !["active", "completed", "archived"].includes(task.status)
  ) {
    errors.push("Status must be active, completed, or archived");
  }

  // Due date must be valid ISO date
  if (task.dueDate) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(task.dueDate)) {
      errors.push("Due date must be in YYYY-MM-DD format");
    }
  }

  // Labels must be array of strings
  if (task.labels && !Array.isArray(task.labels)) {
    errors.push("Labels must be an array");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### Label Validation

```typescript
function validateLabel(label: Partial<Label>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Name is required
  if (!label.name || label.name.trim().length === 0) {
    errors.push("Label name is required");
  }

  // Name length limit
  if (label.name && label.name.length > 50) {
    errors.push("Label name must be <= 50 characters");
  }

  // Color must be valid hex (if provided)
  if (label.color) {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (!hexRegex.test(label.color)) {
      errors.push("Color must be valid hex code (e.g., #FF5733)");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

---

## 8. Migration Strategy (Future Versions)

### Database Version 1 → 2

```typescript
request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;
  const oldVersion = event.oldVersion;

  if (oldVersion < 2) {
    // Create new object store in v2
    if (!db.objectStoreNames.contains("recurring")) {
      const recurringStore = db.createObjectStore("recurring", { keyPath: "id" });
      recurringStore.createIndex("taskId", "taskId", { unique: false });
    }

    // Drop unused stores
    if (db.objectStoreNames.contains("tempStore")) {
      db.deleteObjectStore("tempStore");
    }
  }
};
```

---

## 9. Performance Tips

### Query Optimization

1. **Always use indexes** for frequently queried fields
2. **Limit result sets** with `.limit()` or `.skip()` for pagination
3. **Use compound indexes** (Phase 2) for multi-field queries
4. **Batch writes** in a single transaction to reduce I/O

### Storage Optimization

1. **Compression:** Use `JSON.stringify()` to estimate record size
2. **Cleanup:** Archive old completed tasks (Phase 1.1)
3. **Quota Monitoring:** Warn users at 80% quota usage
4. **Export/Import:** Provide JSON backup option

### Caching Strategy

- Cache `getAllTasks()` result in memory (Zustand store)
- Invalidate cache on task creation/update/delete
- Lazy-load labels and projects on demand

---

## 10. Backup & Export

### Export Tasks as JSON

```typescript
async function exportTasksAsJSON(): Promise<string> {
  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks", "labels", "projects"], "readonly");

  const tasks = await new Promise<Task[]>((resolve, reject) => {
    const request = transaction.objectStore("tasks").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const labels = await new Promise<Label[]>((resolve, reject) => {
    const request = transaction.objectStore("labels").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const projects = await new Promise<Project[]>((resolve, reject) => {
    const request = transaction.objectStore("projects").getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  const backup = {
    version: 1,
    exportDate: new Date().toISOString(),
    tasks,
    labels,
    projects,
  };

  return JSON.stringify(backup, null, 2);
}
```

### Import Tasks from JSON

```typescript
async function importTasksFromJSON(jsonString: string): Promise<void> {
  const backup = JSON.parse(jsonString);

  if (backup.version !== 1) {
    throw new Error(`Unsupported backup version: ${backup.version}`);
  }

  const db = await initializeDatabase();
  const transaction = db.transaction(["tasks", "labels", "projects"], "readwrite");

  // Import labels
  for (const label of backup.labels || []) {
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore("labels").put(label);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Import projects
  for (const project of backup.projects || []) {
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore("projects").put(project);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Import tasks
  for (const task of backup.tasks || []) {
    await new Promise<void>((resolve, reject) => {
      const request = transaction.objectStore("tasks").put(task);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}
```

---

## 11. Troubleshooting

### Common Issues

#### IndexedDB quota exceeded

**Symptom:** Error when writing to IndexedDB  
**Solution:** 
- Check quota: `navigator.storage.estimate()`
- Archive old tasks
- Export and clear completed tasks
- Warn user in UI

#### Data corruption

**Symptom:** Invalid task records in store  
**Solution:**
- Implement validation on read (see section 7)
- Use try-catch in service functions
- Provide data recovery UI (export → fix → import)

#### Slow queries

**Symptom:** Long wait when fetching large task list  
**Solution:**
- Use indexes (don't do full table scans)
- Implement pagination
- Cache in Zustand store
- Consider virtual scrolling in UI

---

## 12. Related Documents

- `docs/architecture.md` — System design and component architecture
- `docs/tech-spike-plan.md` — IndexedDB setup spike
- `docs/sprint-1-user-stories.md` — S1-US-2 (IndexedDB implementation)

---

**Document Status:** ✅ APPROVED  
**Phase:** Phase 2 - Database Design Ready  
**Owner:** Database Architect  
**Last Updated:** 2025-12-02  
**Next Review:** Post-Sprint 1 (Week 2, 2025-12-16)
