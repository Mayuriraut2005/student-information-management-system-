const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const Student = require('../models/Student');
const { connectDB } = require('../config/database');

// Sample test identifiers
const TEST_ID_1 = 'TEST-STU-101';
const TEST_ID_2 = 'TEST-STU-102';
const TEST_ID_DUP = 'TEST-STU-DUP';

beforeAll(async () => {
  // Connect to database if not already connected
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  // Clean up any test records left from prior test runs
  await Student.deleteMany({
    studentId: { $in: [TEST_ID_1, TEST_ID_2, TEST_ID_DUP, 'TEST-STU-UPDATED'] },
  });
});

afterAll(async () => {
  // Clean up test documents
  await Student.deleteMany({
    studentId: { $in: [TEST_ID_1, TEST_ID_2, TEST_ID_DUP, 'TEST-STU-UPDATED'] },
  });
  // Close database connection
  await mongoose.connection.close();
});

describe('Student Information Management System - API Test Suite', () => {
  let createdStudentMongoId = null;

  // 1. Health Endpoint Test
  test('1. GET /api/health should return 200 with database status UP', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.database.connected).toBe(true);
    expect(res.body.data.database.databaseName).toBe('studentDB');
  });

  // 2. Add Valid Student
  test('2. POST /api/students should add a valid student record', async () => {
    const payload = {
      studentId: TEST_ID_1,
      name: 'Aditi Sharma',
      email: 'aditi.sharma@example.edu',
      department: 'Computer Science & Engineering',
      semester: 6,
      contact: '+91 9876543210',
    };

    const res = await request(app).post('/api/students').send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentId).toBe(TEST_ID_1);
    expect(res.body.data.name).toBe('Aditi Sharma');

    createdStudentMongoId = res.body.data._id;
  });

  // 3. Reject Invalid Input (missing required fields)
  test('3. POST /api/students should reject missing required fields with 400', async () => {
    const payload = {
      studentId: 'INCOMPLETE-01',
      // Missing name, email, department, semester, contact
    };

    const res = await request(app).post('/api/students').send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 4. Reject Invalid Input (invalid semester / format)
  test('4. POST /api/students should reject invalid semester (> 8) with 400', async () => {
    const payload = {
      studentId: 'TEST-INVALID-SEM',
      name: 'Test Student',
      email: 'test@example.com',
      department: 'Computer Science & Engineering',
      semester: 12, // Invalid: must be 1 to 8
      contact: '9876543210',
    };

    const res = await request(app).post('/api/students').send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  // 5. Reject Duplicate studentId
  test('5. POST /api/students should reject duplicate studentId with 409 Conflict', async () => {
    const payload = {
      studentId: TEST_ID_1, // Already created in test 2
      name: 'Duplicate Student',
      email: 'dup@example.edu',
      department: 'Information Technology',
      semester: 4,
      contact: '9123456789',
    };

    const res = await request(app).post('/api/students').send(payload);
    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already registered|already exists/i);
  });

  // 6. Retrieve All Students
  test('6. GET /api/students should return list of students', async () => {
    const res = await request(app).get('/api/students');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // 7. Retrieve Single Student by ObjectId
  test('7. GET /api/students/:id should retrieve student by ObjectId', async () => {
    const res = await request(app).get(`/api/students/${createdStudentMongoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.studentId).toBe(TEST_ID_1);
  });

  // 8. Retrieve Single Student by studentId
  test('8. GET /api/students/:id should retrieve student by studentId string', async () => {
    const res = await request(app).get(`/api/students/${TEST_ID_1}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Aditi Sharma');
  });

  // 9. Search Student Records
  test('9. GET /api/students?search=Aditi should filter and find student', async () => {
    const res = await request(app).get('/api/students?search=Aditi');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some((s) => s.studentId === TEST_ID_1)).toBe(true);
  });

  // 10. Update Student Information
  test('10. PUT /api/students/:id should update student details', async () => {
    const updatePayload = {
      name: 'Aditi Sharma (Updated)',
      semester: 7,
      contact: '+91 9999988888',
    };

    const res = await request(app)
      .put(`/api/students/${createdStudentMongoId}`)
      .send(updatePayload);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Aditi Sharma (Updated)');
    expect(res.body.data.semester).toBe(7);
    expect(res.body.data.contact).toBe('+91 9999988888');
  });

  // 11. Reject Missing Student (404)
  test('11. GET /api/students/:id should return 404 for non-existent student', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/students/${nonExistentId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // 12. Delete Student Record
  test('12. DELETE /api/students/:id should delete student record', async () => {
    const res = await request(app).delete(`/api/students/${createdStudentMongoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // 13. Confirm Deleted Student is no longer returned
  test('13. GET /api/students/:id should return 404 for deleted student', async () => {
    const res = await request(app).get(`/api/students/${createdStudentMongoId}`);
    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
  });

  // 14. CORS & Options headers check
  test('14. OPTIONS /api/students should return allowed CORS headers', async () => {
    const res = await request(app)
      .options('/api/students')
      .set('Origin', 'http://127.0.0.1:5500')
      .set('Access-Control-Request-Method', 'POST');

    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
