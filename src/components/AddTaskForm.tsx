import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTaskStore } from '../stores';
import type { Task } from '../services/db';
import { suggestLabels, type LabelSuggestion } from '../services/ai-engine';
import { trackEvent } from '../services/telemetry';
import { getAllProjects, type Project } from '../services/db';

const AddTaskForm = React.memo(function AddTaskForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(2);
  const [dueDate, setDueDate] = useState('');
  const [projectId, setProjectId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [suggestedLabels, setSuggestedLabels] = useState<LabelSuggestion[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const addTask = useTaskStore((state) => state.addTask);
  const aiAnalysisEnabled = useTaskStore((state) => state.aiAnalysisEnabled);
  const telemetryEnabled = useTaskStore((state) => state.telemetryEnabled);

  const loadProjects = async () => {
    const allProjects = await getAllProjects();
    setProjects(allProjects.filter(p => p.status === 'active'));
  };

  // Load projects when component mounts and when form is shown
  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (showForm) {
      loadProjects(); // Reload projects when form opens
    }
  }, [showForm]);

  // Generate AI label suggestions when title/description changes
  useEffect(() => {
    if (!aiAnalysisEnabled) {
      setSuggestedLabels([]);
      return;
    }
    if (title.trim() || description.trim()) {
      const suggestions = suggestLabels(title, description, priority);
      setSuggestedLabels(suggestions.filter(s => !selectedLabels.includes(s.label)));
      
      // Track suggestions being shown
      if (telemetryEnabled && suggestions.length > 0) {
        suggestions.forEach(suggestion => {
          trackEvent({
            type: 'suggestion_shown',
            label: suggestion.label,
            confidence: suggestion.confidence,
            reason: suggestion.reason,
            taskContext: {
              title: title.trim(),
              priority,
              hasDescription: !!description.trim(),
            },
          });
        });
      }
    } else {
      setSuggestedLabels([]);
    }
  }, [title, description, priority, selectedLabels, aiAnalysisEnabled, telemetryEnabled]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;

    const newTask: Task = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'active',
      labels: selectedLabels,
      dueDate: dueDate || undefined,
      ...(projectId && { projectId }),
      summary: '',
      aiMetadata: {
        labelConfidence: [],
        priorityScore: priority,
        summarizedAt: new Date().toISOString(),
        userFeedback: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await addTask(newTask);
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority(2);
      setDueDate('');
      setProjectId('');
      setSelectedLabels([]);
      setSuggestedLabels([]);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task. Please try again.');
    }
  }, [title, description, priority, selectedLabels, dueDate, projectId, addTask]);

  const handleLabelClick = useCallback((label: string) => {
    if (selectedLabels.includes(label)) {
      setSelectedLabels(selectedLabels.filter(l => l !== label));
      // Track rejection
      if (telemetryEnabled) {
        trackEvent({
          type: 'suggestion_rejected',
          label,
        });
      }
    } else {
      setSelectedLabels([...selectedLabels, label]);
      // Track acceptance
      if (telemetryEnabled) {
        const suggestion = suggestedLabels.find(s => s.label === label);
        trackEvent({
          type: 'suggestion_accepted',
          label,
          confidence: suggestion?.confidence,
          reason: suggestion?.reason,
        });
      }
    }
  }, [selectedLabels, suggestedLabels, telemetryEnabled]);

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full py-2.5 sm:py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm sm:text-base text-gray-600 hover:border-blue-500 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        aria-label="Add a new task"
      >
        + Add New Task
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-4 sm:p-6 space-y-3 sm:space-y-4" aria-label="Add new task form">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Task Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
          rows={3}
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={1}>Low</option>
            <option value={2}>Medium</option>
            <option value={3}>High</option>
          </select>
        </div>

        <div>
          <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            id="project"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">No Project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* AI Label Suggestions */}
      {aiAnalysisEnabled && suggestedLabels.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            🤖 Suggested Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {suggestedLabels.map((suggestion) => (
              <div key={suggestion.label} className="inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleLabelClick(suggestion.label)}
                  className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors border border-blue-200"
                  title={`${suggestion.reason} (${Math.round(suggestion.confidence * 100)}% confidence)`}
                >
                  + {suggestion.label}
                </button>
                <span
                  className="inline-flex items-center justify-center w-5 h-5 text-[11px] rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                  title={`${suggestion.reason} (${Math.round(suggestion.confidence * 100)}% confidence)`}
                >
                  i
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Labels */}
      {selectedLabels.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selected Labels
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedLabels.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-blue-600 text-white rounded-full"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleLabelClick(label)}
                  className="hover:bg-blue-700 rounded-full p-0.5"
                  aria-label={`Remove ${label}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md text-sm sm:text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
          aria-label="Add the task"
        >
          Add Task
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false);
            setTitle('');
            setDescription('');
            setPriority(2);
            setDueDate('');
            setProjectId('');
            setSelectedLabels([]);
            setSuggestedLabels([]);
          }}
          className="flex-1 bg-white text-gray-700 py-2 px-4 rounded-md text-sm sm:text-base font-medium border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          aria-label="Cancel adding task"
        >
          Cancel
        </button>
      </div>
    </form>
  );
});

export default AddTaskForm;
