// API client for Habit Tracker backend

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const habitsApi = {
  // GET all habits with recent logs and streaks
  async getHabits() {
    const res = await fetch(`${API_BASE}/habits`, {
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(res);
  },

  // GET single habit
  async getHabitById(id) {
    const res = await fetch(`${API_BASE}/habits/${id}`);
    return handleResponse(res);
  },

  // CREATE habit
  async createHabit(habitData) {
    const res = await fetch(`${API_BASE}/habits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(habitData)
    });
    return handleResponse(res);
  },

  // UPDATE habit
  async updateHabit(id, habitData) {
    const res = await fetch(`${API_BASE}/habits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(habitData)
    });
    return handleResponse(res);
  },

  // DELETE habit
  async deleteHabit(id) {
    const res = await fetch(`${API_BASE}/habits/${id}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(res);
  },

  // TOGGLE habit completion for a specific date (defaults to today)
  async toggleHabit(id, date = null, notes = '') {
    const res = await fetch(`${API_BASE}/habits/${id}/toggle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ date, notes })
    });
    return handleResponse(res);
  },

  // GET historical completion data for heatmap / calendar trends view
  async getHistory(habitId = null, days = 35) {
    const params = new URLSearchParams();
    if (habitId) params.append('habitId', habitId);
    if (days) params.append('days', days);

    const url = `${API_BASE}/habits/history?${params.toString()}`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });
    return handleResponse(res);
  },

  // Health check
  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  }
};
