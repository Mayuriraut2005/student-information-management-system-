const mongoose = require('mongoose');
const Student = require('../models/Student');
const { isDBConnected } = require('../config/database');

/**
 * Helper to determine if an ID is a valid MongoDB ObjectId
 */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === id;

/**
 * @desc    Health check endpoint reporting API and Database status
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = async (req, res) => {
  const dbConnected = isDBConnected();

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected
      ? 'Student Information Management System API is healthy'
      : 'Database connection is not ready',
    data: {
      status: dbConnected ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      database: {
        connected: dbConnected,
        status: dbConnected ? 'connected' : 'disconnected',
        cluster: 'MongoDB Atlas',
        databaseName: 'studentDB',
      },
    },
  });
};

/**
 * @desc    Get all students with optional search, filtering and pagination
 * @route   GET /api/students
 * @access  Public
 */
const getStudents = async (req, res, next) => {
  try {
    const { search, department, semester, page = 1, limit = 50, sort = '-createdAt' } = req.query;

    const query = {};

    // Filter by department
    if (department && department !== 'All') {
      query.department = department;
    }

    // Filter by semester
    if (semester && !isNaN(semester)) {
      query.semester = Number(semester);
    }

    // Search by studentId, name, email, or department
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { studentId: searchRegex },
        { name: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [students, total] = await Promise.all([
      Student.find(query).sort(sort).skip(skip).limit(limitNum),
      Student.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Students retrieved successfully',
      count: students.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student by MongoDB _id or studentId
 * @route   GET /api/students/:id
 * @access  Public
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    }

    // Fallback search by unique studentId if not found by ObjectId
    if (!student) {
      student = await Student.findOne({ studentId: id.toUpperCase().trim() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier '${id}' was not found`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student retrieved successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Public
 */
const createStudent = async (req, res, next) => {
  try {
    const { studentId, name, email, department, semester, contact } = req.body;

    // Validate required fields explicitly before model save
    if (!studentId || !name || !email || !department || semester === undefined || !contact) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: studentId, name, email, department, semester, and contact are all required.',
      });
    }

    // Check for existing studentId
    const existing = await Student.findOne({ studentId: studentId.trim().toUpperCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Student ID '${studentId.trim().toUpperCase()}' is already registered. Student ID must be unique.`,
        field: 'studentId',
      });
    }

    const newStudent = await Student.create({
      studentId: studentId.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department: department.trim(),
      semester: Number(semester),
      contact: contact.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: newStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update student details by _id or studentId
 * @route   PUT /api/students/:id
 * @access  Public
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { studentId, name, email, department, semester, contact } = req.body;

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ studentId: id.toUpperCase().trim() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier '${id}' was not found`,
      });
    }

    // If changing studentId, ensure new studentId does not conflict with another student
    if (studentId && studentId.trim().toUpperCase() !== student.studentId) {
      const conflict = await Student.findOne({
        studentId: studentId.trim().toUpperCase(),
        _id: { $ne: student._id },
      });
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `Student ID '${studentId.trim().toUpperCase()}' is already in use by another student record.`,
          field: 'studentId',
        });
      }
      student.studentId = studentId.trim().toUpperCase();
    }

    if (name !== undefined) student.name = name.trim();
    if (email !== undefined) student.email = email.trim().toLowerCase();
    if (department !== undefined) student.department = department.trim();
    if (semester !== undefined) student.semester = Number(semester);
    if (contact !== undefined) student.contact = contact.trim();

    const updated = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete student record by _id or studentId
 * @route   DELETE /api/students/:id
 * @access  Public
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    let student;
    if (isValidObjectId(id)) {
      student = await Student.findById(id);
    }
    if (!student) {
      student = await Student.findOne({ studentId: id.toUpperCase().trim() });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with identifier '${id}' was not found`,
      });
    }

    await Student.findByIdAndDelete(student._id);

    res.status(200).json({
      success: true,
      message: `Student '${student.name}' (ID: ${student.studentId}) deleted successfully`,
      data: {
        _id: student._id,
        studentId: student.studentId,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHealth,
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};
