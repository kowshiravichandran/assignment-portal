const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  studentUsername: { type: String, required: true },
  studentName: { type: String, required: true },
  subject: { type: String, required: true },
  title: { type: String, required: true },
  textAnswer: { type: String, default: '' },
  pdfFile: { type: String, default: '' }, // filename of uploaded PDF
  marks: { type: Number, default: null },
  maxMarks: { type: Number, default: 100 },
  feedback: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'graded'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
