const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const { connectDB } = require('./config/database');

dotenv.config();

const sampleStudents = [
  {
    studentId: 'STU101',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.edu',
    department: 'Computer Science & Engineering',
    semester: 6,
    contact: '+91 9876543210',
  },
  {
    studentId: 'STU102',
    name: 'Priya Patel',
    email: 'priya.patel@example.edu',
    department: 'Information Technology',
    semester: 4,
    contact: '+91 9876543211',
  },
  {
    studentId: 'STU103',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.edu',
    department: 'Electronics & Communication',
    semester: 5,
    contact: '+91 9876543212',
  },
  {
    studentId: 'STU104',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.edu',
    department: 'Computer Science & Engineering',
    semester: 8,
    contact: '+91 9876543213',
  },
  {
    studentId: 'STU105',
    name: 'Siddharth Nair',
    email: 'siddharth.nair@example.edu',
    department: 'Mechanical Engineering',
    semester: 3,
    contact: '+91 9876543214',
  },
  {
    studentId: 'STU106',
    name: 'Sneha Kulkarni',
    email: 'sneha.kulkarni@example.edu',
    department: 'Civil Engineering',
    semester: 7,
    contact: '+91 9876543215',
  },
  {
    studentId: 'STU107',
    name: 'Vikram Singh',
    email: 'vikram.singh@example.edu',
    department: 'Electrical Engineering',
    semester: 2,
    contact: '+91 9876543216',
  },
  {
    studentId: 'STU108',
    name: 'Meera Joshi',
    email: 'meera.joshi@example.edu',
    department: 'Information Technology',
    semester: 6,
    contact: '+91 9876543217',
  },
  {
    studentId: 'STU109',
    name: 'Aditya Deshmukh',
    email: 'aditya.deshmukh@example.edu',
    department: 'Computer Science & Engineering',
    semester: 4,
    contact: '+91 9876543218',
  },
  {
    studentId: 'STU110',
    name: 'Tanvi Reddy',
    email: 'tanvi.reddy@example.edu',
    department: 'Electronics & Communication',
    semester: 1,
    contact: '+91 9876543219',
  },
];

async function seedData() {
  try {
    await connectDB();
    console.log('[Seed] Connected to MongoDB Atlas successfully.');

    let insertedCount = 0;
    for (const student of sampleStudents) {
      // Upsert: update if exists or insert if new
      await Student.findOneAndUpdate(
        { studentId: student.studentId },
        student,
        { upsert: true, new: true, runValidators: true }
      );
      insertedCount++;
      console.log(`[Seed] Added/Updated student: ${student.studentId} - ${student.name}`);
    }

    console.log(`[Seed] Successfully seeded ${insertedCount} student records into studentDB.students!`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed data:', error.message);
    process.exit(1);
  }
}

seedData();
