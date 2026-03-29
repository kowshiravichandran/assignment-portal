const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  description: { type: String, default: '' },
  dueDate: { type: Date, required: true },
  assignedTo: { type: String, default: 'all' }, // 'all' or specific username
  createdBy: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
