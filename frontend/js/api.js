/**
 * Centralized API Client Service
 * Handles HTTP requests, errors, JSON formatting and toast notifications
 */
const StudentAPI = {
  /**
   * Core HTTP request handler
   */
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        let errorMsg = (data && data.message) || `Request failed with status ${response.status}`;
        if (data && data.errors && Array.isArray(data.errors)) {
          errorMsg += `: ${data.errors.join(', ')}`;
        }
        const error = new Error(errorMsg);
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const netErr = new Error(
          'Unable to connect to the backend server. Please verify the Express API is running and CORS is configured.'
        );
        netErr.status = 0;
        throw netErr;
      }
      throw err;
    }
  },

  // GET /api/health
  async checkHealth() {
    return this.request('/health');
  },

  // GET /api/students
  async getStudents(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department) query.append('department', params.department);
    if (params.semester) query.append('semester', params.semester);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);

    const qs = query.toString();
    return this.request(`/students${qs ? `?${qs}` : ''}`);
  },

  // GET /api/students/:id
  async getStudentById(id) {
    return this.request(`/students/${encodeURIComponent(id)}`);
  },

  // POST /api/students
  async createStudent(studentData) {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  // PUT /api/students/:id
  async updateStudent(id, studentData) {
    return this.request(`/students/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(studentData),
    });
  },

  // DELETE /api/students/:id
  async deleteStudent(id) {
    return this.request(`/students/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Toast Notification Utility
 */
function showNotification(message, type = 'info', duration = 4000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fade-out');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/**
 * Helper to escape HTML and prevent XSS
 */
function escapeHTML(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
