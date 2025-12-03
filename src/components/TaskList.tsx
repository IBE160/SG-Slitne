import React from 'react';
import { useTaskStore } from '../stores';
import TaskItem from './TaskItem';

export default function TaskList() {
  const tasks = useTaskStore((state) => state.tasks);
  const activeTasks = tasks.filter((task) => task.status === 'active');

  if (activeTasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg mb-2">No tasks yet</p>
        <p className="text-sm">Add your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {activeTasks.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  );
}
