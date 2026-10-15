const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      match: [/^[A-Za-z0-9\-_]{2,20}$/, 'Student ID must be 2-20 alphanumeric characters'],
    },
    name: {
      type: String,
      required: [true, 'Student full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
      enum: {
        values: [
          'Computer Science & Engineering',
          'Information Technology',
          'Electronics & Communication',
          'Mechanical Engineering',
          'Civil Engineering',
          'Electrical Engineering',
        ],
        message: '{VALUE} is not a supported department',
      },
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8'],
      validate: {
        validator: Number.isInteger,
        message: 'Semester must be an integer',
      },
    },
    contact: {
      type: String,
      required: [true, 'Contact number is required'],
      trim: true,
      match: [/^\+?[0-9\-\s]{7,15}$/, 'Contact must be a valid phone number (7-15 digits)'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: 'students', // Explicit collection name required by spec
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Search index for text searches on studentId, name, email, department
studentSchema.index({
  studentId: 'text',
  name: 'text',
  email: 'text',
  department: 'text',
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
