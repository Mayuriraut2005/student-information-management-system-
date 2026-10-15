/**
 * Student Directory Logic & Table Management
 */

let currentStudents = [];
let pendingDeleteStudent = null;
let searchDebounceTimeout = null;

document.addEventListener('DOMContentLoaded', () => {
  initHealthCheck();
  loadStudents();
  initEventListeners();
});

/**
 * Health check monitor
 */
async function initHealthCheck() {
  const pill = document.getElementById('backend-status-pill');
  const text = document.getElementById('backend-status-text');
  try {
    const res = await StudentAPI.checkHealth();
    if (res && res.success) {
      pill.className = 'backend-status-pill online';
      text.textContent = 'Backend: Online';
    }
  } catch (err) {
    pill.className = 'backend-status-pill offline';
    text.textContent = 'Backend: Offline';
  }
}

/**
 * Initialize DOM Event Listeners
 */
function initEventListeners() {
  const searchInput = document.getElementById('search-input');
  const deptFilter = document.getElementById('department-filter');
  const semFilter = document.getElementById('semester-filter');
  const resetBtn = document.getElementById('btn-reset-filters');
  const confirmDeleteBtn = document.getElementById('btn-confirm-delete');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimeout);
      searchDebounceTimeout = setTimeout(() => {
        loadStudents();
      }, 300);
    });
  }

  if (deptFilter) {
    deptFilter.addEventListener('change', () => loadStudents());
  }

  if (semFilter) {
    semFilter.addEventListener('change', () => loadStudents());
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (deptFilter) deptFilter.value = '';
      if (semFilter) semFilter.value = '';
      loadStudents();
    });
  }

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', executeDelete);
  }
}

/**
 * Fetch and render students with current filters
 */
async function loadStudents() {
  const tbody = document.getElementById('students-table-body');
  const countCurrent = document.getElementById('count-current');
  const countTotal = document.getElementById('count-total');
  const search = document.getElementById('search-input')?.value.trim();
  const department = document.getElementById('department-filter')?.value;
  const semester = document.getElementById('semester-filter')?.value;

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 3rem;">
        <div class="spinner"></div>
        <p style="margin-top: 0.5rem; color: var(--slate-400);">Fetching records from backend...</p>
      </td>
    </tr>
  `;

  try {
    const params = {};
    if (search) params.search = search;
    if (department) params.department = department;
    if (semester) params.semester = semester;

    const response = await StudentAPI.getStudents(params);
    currentStudents = response.data || [];

    countCurrent.textContent = currentStudents.length;
    countTotal.textContent = response.total ?? currentStudents.length;

    if (currentStudents.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">
            <div class="empty-state-icon">📂</div>
            <h4>No Student Records Found</h4>
            <p style="margin-top: 0.25rem;">
              ${search || department || semester ? 'Try clearing your filters or search terms.' : 'No students exist in MongoDB Atlas yet.'}
            </p>
            ${!search && !department && !semester ? `
              <div style="margin-top: 1rem;">
                <a href="add-student.html" class="btn btn-primary btn-sm">+ Add First Student</a>
              </div>
            ` : ''}
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = currentStudents
      .map(
        (student) => `
      <tr>
        <td><strong>${escapeHTML(student.studentId)}</strong></td>
        <td>${escapeHTML(student.name)}</td>
        <td>${escapeHTML(student.email)}</td>
        <td><span class="badge-dept">${escapeHTML(student.department)}</span></td>
        <td>Semester ${escapeHTML(student.semester)}</td>
        <td>${escapeHTML(student.contact)}</td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="btn btn-secondary btn-sm" onclick="viewStudentDetails('${escapeHTML(student._id)}')">View</button>
            <a href="edit-student.html?id=${encodeURIComponent(student._id)}" class="btn btn-secondary btn-sm">Edit</a>
            <button class="btn btn-danger btn-sm" onclick="promptDeleteStudent('${escapeHTML(student._id)}')">Delete</button>
          </div>
        </td>
      </tr>
    `
      )
      .join('');
  } catch (err) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 2.5rem; color: var(--danger);">
          <strong>Failed to load students:</strong> ${escapeHTML(err.message)}
          <div style="margin-top: 1rem;">
            <button class="btn btn-secondary btn-sm" onclick="loadStudents()">Retry</button>
          </div>
        </td>
      </tr>
    `;
    showNotification(err.message, 'error');
  }
}

/**
 * Open View Student Details Modal
 */
function viewStudentDetails(studentMongoId) {
  const student = currentStudents.find((s) => s._id === studentMongoId);
  if (!student) return;

  const list = document.getElementById('student-details-list');
  const editLink = document.getElementById('modal-edit-link');

  editLink.href = `edit-student.html?id=${encodeURIComponent(student._id)}`;

  list.innerHTML = `
    <div class="detail-row"><dt>Internal Record ID (_id)</dt><dd style="font-family: monospace; font-size: 0.8rem;">${escapeHTML(student._id)}</dd></div>
    <div class="detail-row"><dt>Student ID</dt><dd><strong>${escapeHTML(student.studentId)}</strong></dd></div>
    <div class="detail-row"><dt>Full Name</dt><dd>${escapeHTML(student.name)}</dd></div>
    <div class="detail-row"><dt>Email Address</dt><dd>${escapeHTML(student.email)}</dd></div>
    <div class="detail-row"><dt>Department</dt><dd><span class="badge-dept">${escapeHTML(student.department)}</span></dd></div>
    <div class="detail-row"><dt>Semester</dt><dd>Semester ${escapeHTML(student.semester)}</dd></div>
    <div class="detail-row"><dt>Contact Number</dt><dd>${escapeHTML(student.contact)}</dd></div>
    <div class="detail-row"><dt>Registered At</dt><dd>${student.createdAt ? new Date(student.createdAt).toLocaleString() : '--'}</dd></div>
    <div class="detail-row"><dt>Last Updated</dt><dd>${student.updatedAt ? new Date(student.updatedAt).toLocaleString() : '--'}</dd></div>
  `;

  openModal('modal-view-student');
}

/**
 * Prompt Delete Confirmation Modal
 */
function promptDeleteStudent(studentMongoId) {
  const student = currentStudents.find((s) => s._id === studentMongoId);
  if (!student) return;

  pendingDeleteStudent = student;
  document.getElementById('delete-student-name').textContent = student.name;
  document.getElementById('delete-student-id').textContent = student.studentId;

  openModal('modal-delete-student');
}

/**
 * Execute student deletion
 */
async function executeDelete() {
  if (!pendingDeleteStudent) return;

  const btn = document.getElementById('btn-confirm-delete');
  btn.disabled = true;
  btn.textContent = 'Deleting...';

  try {
    await StudentAPI.deleteStudent(pendingDeleteStudent._id);
    showNotification(`Student '${pendingDeleteStudent.name}' deleted successfully`, 'success');
    closeModal('modal-delete-student');
    pendingDeleteStudent = null;
    loadStudents();
  } catch (err) {
    showNotification(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Yes, Delete Record';
  }
}

/**
 * Modal utilities
 */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
