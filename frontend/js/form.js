/**
 * Form Handling and Validation for Add & Edit Student Pages
 */

let editingStudentId = null;

document.addEventListener('DOMContentLoaded', async () => {
  initHealthCheck();

  const urlParams = new URLSearchParams(window.location.search);
  editingStudentId = urlParams.get('id');

  const form = document.getElementById('student-form');
  const loadingDiv = document.getElementById('loading-student');

  if (editingStudentId) {
    // Mode: Edit Student
    try {
      const response = await StudentAPI.getStudentById(editingStudentId);
      const student = response.data;
      if (!student) {
        throw new Error('Student record not found');
      }

      document.getElementById('studentId').value = student.studentId || '';
      document.getElementById('name').value = student.name || '';
      document.getElementById('email').value = student.email || '';
      document.getElementById('department').value = student.department || '';
      document.getElementById('semester').value = student.semester || '';
      document.getElementById('contact').value = student.contact || '';

      if (loadingDiv) loadingDiv.style.display = 'none';
      if (form) form.style.display = 'block';
    } catch (err) {
      if (loadingDiv) {
        loadingDiv.innerHTML = `
          <p style="color: var(--danger); font-weight: 600;">Failed to load student: ${escapeHTML(err.message)}</p>
          <a href="students.html" class="btn btn-secondary btn-sm" style="margin-top: 1rem;">&larr; Return to Directory</a>
        `;
      }
      showNotification(err.message, 'error');
      return;
    }
  }

  // Bind submit event
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }
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
 * Handle form submission
 */
async function handleFormSubmit(e) {
  e.preventDefault();

  clearErrors();

  const studentId = document.getElementById('studentId').value.trim();
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const department = document.getElementById('department').value;
  const semester = document.getElementById('semester').value;
  const contact = document.getElementById('contact').value.trim();

  // Validate fields
  let hasError = false;

  if (!studentId || !/^[A-Za-z0-9\-_]{2,20}$/.test(studentId)) {
    showFieldError('studentId', 'Student ID must be 2-20 alphanumeric characters (hyphens allowed).');
    hasError = true;
  }

  if (!name || name.length < 2) {
    showFieldError('name', 'Full Name must be at least 2 characters long.');
    hasError = true;
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!email || !emailRegex.test(email)) {
    showFieldError('email', 'Please provide a valid email address.');
    hasError = true;
  }

  if (!department) {
    showFieldError('department', 'Please select a department.');
    hasError = true;
  }

  const semNum = parseInt(semester, 10);
  if (isNaN(semNum) || semNum < 1 || semNum > 8) {
    showFieldError('semester', 'Please select a valid semester between 1 and 8.');
    hasError = true;
  }

  const contactRegex = /^\+?[0-9\-\s]{7,15}$/;
  if (!contact || !contactRegex.test(contact)) {
    showFieldError('contact', 'Please enter a valid phone number (7-15 digits).');
    hasError = true;
  }

  if (hasError) return;

  const payload = {
    studentId: studentId.toUpperCase(),
    name,
    email: email.toLowerCase(),
    department,
    semester: semNum,
    contact,
  };

  const btnSubmit = document.getElementById('btn-submit');
  const originalText = btnSubmit.innerHTML;
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<span class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></span> Saving...`;

  try {
    if (editingStudentId) {
      await StudentAPI.updateStudent(editingStudentId, payload);
      showNotification('Student details updated successfully in Atlas!', 'success');
    } else {
      await StudentAPI.createStudent(payload);
      showNotification('Student registered successfully in MongoDB Atlas!', 'success');
    }

    setTimeout(() => {
      window.location.href = 'students.html';
    }, 1200);
  } catch (err) {
    if (err.status === 409) {
      showFieldError('studentId', err.message);
    } else if (err.data && err.data.errors) {
      showNotification(err.data.errors.join(' | '), 'error');
    } else {
      showNotification(err.message, 'error');
    }
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = originalText;
  }
}

/**
 * Display field-level validation error
 */
function showFieldError(fieldId, message) {
  const errSpan = document.getElementById(`err-${fieldId}`);
  const input = document.getElementById(fieldId);
  if (errSpan) {
    errSpan.textContent = message;
    errSpan.style.display = 'block';
  }
  if (input) {
    input.style.borderColor = 'var(--danger)';
  }
}

/**
 * Clear all field errors
 */
function clearErrors() {
  document.querySelectorAll('.form-error').forEach((el) => {
    el.textContent = '';
    el.style.display = 'none';
  });
  document.querySelectorAll('.form-input, .form-select').forEach((el) => {
    el.style.borderColor = 'var(--slate-200)';
  });
}
