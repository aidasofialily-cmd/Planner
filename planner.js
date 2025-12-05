// Simple Planner module
// Usage (as module):
//   const Planner = require('./planner');
//   const p = new Planner();
//   p.addTask('Buy milk', { due: '2025-12-06', priority: 'high' });
//   await p.saveToFile('planner-data.json');
//
// CLI usage:
//   node planner.js add "Task title" --due=2025-12-06 --priority=high
//   node planner.js list

const fs = require('fs').promises;
const path = require('path');

class Planner {
  constructor(tasks = []) {
    this.tasks = Array.isArray(tasks) ? tasks : [];
  }

  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  addTask(title, { notes = '', due = null, priority = 'normal' } = {}) {
    if (!title || typeof title !== 'string') {
      throw new Error('title is required and must be a string');
    }
    const task = {
      id: this._generateId(),
      title,
      notes,
      createdAt: new Date().toISOString(),
      due: due ? new Date(due).toISOString() : null,
      priority,
      done: false,
    };
    this.tasks.push(task);
    return task;
  }

  removeTask(id) {
    const idx = this.tasks.findIndex(t => t.id === id);
    if (idx === -1) return false;
    this.tasks.splice(idx, 1);
    return true;
  }

  updateTask(id, updates = {}) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) return null;
    const allowed = ['title', 'notes', 'due', 'priority', 'done'];
    for (const k of Object.keys(updates)) {
      if (!allowed.includes(k)) continue;
      task[k] = k === 'due' && updates[k] ? new Date(updates[k]).toISOString() : updates[k];
    }
    task.updatedAt = new Date().toISOString();
    return task;
  }

  getTask(id) {
    return this.tasks.find(t => t.id === id) || null;
  }

  listTasks({ includeDone = true, sortBy = 'createdAt' } = {}) {
    let list = this.tasks.slice();
    if (!includeDone) list = list.filter(t => !t.done);
    if (sortBy === 'due') {
      list.sort((a, b) => {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return new Date(a.due) - new Date(b.due);
      });
    } else if (sortBy === 'priority') {
      const rank = { high: 1, normal: 2, low: 3 };
      list.sort((a, b

