# Automated & Integration Testing Report

## 1. Test Overview
The **Student Information Management System (SIMS)** REST API was verified using automated test suites built with **Jest** and **Supertest**. Testing was conducted against the live MongoDB Atlas cluster using dedicated, isolated test identifiers to guarantee zero contamination or data loss for production records.

---

## 2. Real Execution Output

```bash
$ cd backend
$ npm test

> student-information-management-system-backend@1.0.0 test
> jest --runInBand --detectOpenHandles --forceExit

  console.log
    [Database] MongoDB Atlas Connected: ac-utt4zed-shard-00-00.stgpxqj.mongodb.net

PASS tests/students.test.js
  Student Information Management System - API Test Suite
    √ 1. GET /api/health should return 200 with database status UP (37 ms)
    √ 2. POST /api/students should add a valid student record (173 ms)
    √ 3. POST /api/students should reject missing required fields with 400 (29 ms)
    √ 4. POST /api/students should reject invalid semester (> 8) with 400 (75 ms)
    √ 5. POST /api/students should reject duplicate studentId with 409 Conflict (61 ms)
    √ 6. GET /api/students should return list of students (74 ms)
    √ 7. GET /api/students/:id should retrieve student by ObjectId (54 ms)
    √ 8. GET /api/students/:id should retrieve student by studentId string (58 ms)
    √ 9. GET /api/students?search=Aditi should filter and find student (60 ms)
    √ 10. PUT /api/students/:id should update student details (105 ms)
    √ 11. GET /api/students/:id should return 404 for non-existent student (87 ms)
    √ 12. DELETE /api/students/:id should delete student record (101 ms)
    √ 13. GET /api/students/:id should return 404 for deleted student (95 ms)
    √ 14. OPTIONS /api/students should return allowed CORS headers (9 ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        3.993 s
Ran all test suites.
```

---

## 3. Detailed Test Matrix

| # | Test Objective | Endpoint & Method | Input Data | Expected Status | Actual Outcome | Status |
|---|---|---|---|---|---|---|
| **1** | Health Endpoint Check | `GET /api/health` | None | `200 OK` (status: `UP`) | `200 OK`, `db.connected: true` | **PASS** |
| **2** | Create Valid Student | `POST /api/students` | Valid JSON payload | `201 Created` | `201 Created`, record saved | **PASS** |
| **3** | Reject Missing Fields | `POST /api/students` | `{ studentId: "..." }` | `400 Bad Request` | `400 Bad Request`, validation error | **PASS** |
| **4** | Reject Invalid Semester | `POST /api/students` | `{ semester: 12 }` | `400 Bad Request` | `400 Bad Request`, range rejection | **PASS** |
| **5** | Reject Duplicate ID | `POST /api/students` | Re-insert existing `studentId` | `409 Conflict` | `409 Conflict`, unique check | **PASS** |
| **6** | Retrieve All Records | `GET /api/students` | None | `200 OK` | `200 OK`, JSON array returned | **PASS** |
| **7** | Get by MongoDB `_id` | `GET /api/students/:id` | Valid 24-char ObjectId | `200 OK` | `200 OK`, document returned | **PASS** |
| **8** | Get by `studentId` | `GET /api/students/:id` | String `TEST-STU-101` | `200 OK` | `200 OK`, document returned | **PASS** |
| **9** | Query Search Filter | `GET /api/students?search=Aditi` | Query parameter | `200 OK` | `200 OK`, filtered result matched | **PASS** |
| **10** | Update Student Info | `PUT /api/students/:id` | `{ semester: 7 }` | `200 OK` | `200 OK`, updated fields verified | **PASS** |
| **11** | Reject Missing Student | `GET /api/students/:id` | Random valid ObjectId | `404 Not Found` | `404 Not Found`, standard JSON | **PASS** |
| **12** | Delete Student Record | `DELETE /api/students/:id` | Target student `_id` | `200 OK` | `200 OK`, deletion confirmed | **PASS** |
| **13** | Confirm Deletion | `GET /api/students/:id` | Deleted student `_id` | `404 Not Found` | `404 Not Found`, record is gone | **PASS** |
| **14** | CORS Pre-flight Check | `OPTIONS /api/students` | Origin `http://127.0.0.1:5500` | Allowed Headers | `access-control-allow-origin` verified | **PASS** |

---

## 4. Manual Verification Commands

To re-run the tests locally in Windows PowerShell:

```powershell
cd C:\Users\NIKUNJ\.gemini\antigravity\scratch\student-information-management-system\backend
npm.cmd test
```

To run a live test of the Express backend server:
```powershell
npm.cmd start
```
Then open `http://localhost:5000/api/health` in your web browser. You should see:
```json
{
  "success": true,
  "message": "Student Information Management System API is healthy",
  "data": {
    "status": "UP",
    "uptimeSeconds": 4,
    "environment": "development",
    "database": {
      "connected": true,
      "status": "connected",
      "cluster": "MongoDB Atlas",
      "databaseName": "studentDB"
    }
  }
}
```
