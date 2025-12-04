// EPIC-9: Projects & Task Organization
// Purpose: Manage projects with CRUD operations and progress tracking

import { useState, useEffect } from 'react';
import { getAllProjects, createProject, updateProject, deleteProject, getProjectStats, Project } from '../services/db';

interface ProjectWithStats extends Project {
  stats?: {
    total: number;
    active: number;
    completed: number;
    completionRate: number;
  };
}

export default function ProjectList() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3B82F6' });

  const loadProjects = async () => {
    const allProjects = await getAllProjects();
    
    // Load stats for each project
    const projectsWithStats = await Promise.all(
      allProjects.map(async (project) => {
        const stats = await getProjectStats(project.id);
        return { ...project, stats };
      })
    );
    
    setProjects(projectsWithStats);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    
    await createProject({
      name: formData.name,
      description: formData.description,
      color: formData.color,
    });
    
    setFormData({ name: '', description: '', color: '#3B82F6' });
    setIsCreating(false);
    loadProjects();
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) return;
    
    await updateProject(id, {
      name: formData.name,
      description: formData.description,
      color: formData.color,
    });
    
    setFormData({ name: '', description: '', color: '#3B82F6' });
    setEditingId(null);
    loadProjects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project? Tasks will be unassigned.')) return;
    
    await deleteProject(id);
    loadProjects();
  };

  const handleEdit = (project: Project) => {
    setEditingId(project.id);
    setFormData({
      name: project.name,
      description: project.description || '',
      color: project.color || '#3B82F6',
    });
    setIsCreating(false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', description: '', color: '#3B82F6' });
  };

  // Calculate overall statistics
  const overallStats = projects.reduce(
    (acc, project) => ({
      totalProjects: acc.totalProjects + 1,
      totalTasks: acc.totalTasks + (project.stats?.total || 0),
      activeTasks: acc.activeTasks + (project.stats?.active || 0),
      completedTasks: acc.completedTasks + (project.stats?.completed || 0),
    }),
    { totalProjects: 0, totalTasks: 0, activeTasks: 0, completedTasks: 0 }
  );

  const overallCompletionRate = overallStats.totalTasks > 0
    ? (overallStats.completedTasks / overallStats.totalTasks) * 100
    : 0;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
          <button
            type="button"
            className="p-1 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={isCollapsed ? 'Expand projects' : 'Collapse projects'}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        <button
          type="button"
          className="px-3 py-1.5 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          onClick={() => {
            setIsCreating(true);
            setEditingId(null);
            setFormData({ name: '', description: '', color: '#3B82F6' });
            setIsCollapsed(false); // Expand when creating
          }}
          aria-label="Create new project"
        >
          + New Project
        </button>
      </div>

      {/* Dashboard Summary */}
      {!isCollapsed && projects.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded p-2 shadow-sm">
              <div className="text-xs text-gray-600">Projects</div>
              <div className="text-lg font-semibold text-gray-900">{overallStats.totalProjects}</div>
            </div>
            <div className="bg-white rounded p-2 shadow-sm">
              <div className="text-xs text-gray-600">Total Tasks</div>
              <div className="text-lg font-semibold text-gray-900">{overallStats.totalTasks}</div>
            </div>
            <div className="bg-white rounded p-2 shadow-sm">
              <div className="text-xs text-gray-600">Active</div>
              <div className="text-lg font-semibold text-blue-600">{overallStats.activeTasks}</div>
            </div>
            <div className="bg-white rounded p-2 shadow-sm">
              <div className="text-xs text-gray-600">Completed</div>
              <div className="text-lg font-semibold text-green-600">{overallStats.completedTasks}</div>
            </div>
          </div>
          {overallStats.totalTasks > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                <span>Overall Progress</span>
                <span className="font-medium text-blue-600">{overallCompletionRate.toFixed(0)}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all"
                  style={{ width: `${overallCompletionRate}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {!isCollapsed && (
        <>
      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="w-12 h-10 rounded border cursor-pointer"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
                <span className="text-sm text-gray-600">{formData.color}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={() => editingId ? handleUpdate(editingId) : handleCreate()}
              >
                {editingId ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm rounded-md border bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project List */}
      <div className="space-y-2">
        {projects.length === 0 && !isCreating && (
          <p className="text-sm text-gray-500 text-center py-8">
            No projects yet. Create one to organize your tasks!
          </p>
        )}

        {projects.map((project) => (
          <div
            key={project.id}
            className="border rounded-lg p-3 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                    title={`Project color: ${project.color}`}
                  />
                  <h3 className="font-medium text-gray-900 truncate">
                    {project.name}
                  </h3>
                </div>
                
                {project.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {project.description}
                  </p>
                )}

                {project.stats && (
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>{project.stats.total} tasks</span>
                    <span>{project.stats.active} active</span>
                    <span>{project.stats.completed} completed</span>
                    {project.stats.total > 0 && (
                      <span className="font-medium text-blue-600">
                        {project.stats.completionRate.toFixed(0)}% done
                      </span>
                    )}
                  </div>
                )}

                {project.stats && project.stats.total > 0 && (
                  <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-green-500 h-full transition-all"
                      style={{ width: `${project.stats.completionRate}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => handleEdit(project)}
                  aria-label="Edit project"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                  onClick={() => handleDelete(project.id)}
                  aria-label="Delete project"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </>
      )}
    </div>
  );
}
