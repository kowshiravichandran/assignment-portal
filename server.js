const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const User = require('./models/User');
const Submission = require('./models/Submission');
const Assignment = require('./models/Assignment');

const app = express();
const PORT = 5000;

// MongoDB
mongoose.connect('mongodb://localhost:27017/assignmentportal')
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Multer for PDF uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'assignmentportal_secret_2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Auth middleware
const requireAuth = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/');
};
const requireTeacher = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'teacher') return next();
  res.status(403).json({ error: 'Access denied' });
};

// ── SEED ──
app.get('/api/seed', async (req, res) => {
  try {
    await User.deleteMany({ username: { $in: ['kowshi', 'mala'] } });
    await User.create([
      { fullName: 'Kowshi Student', username: 'kowshi', password: 'kowsh21', role: 'student', email: 'kowshi@school.com' },
      { fullName: 'Mala Teacher', username: 'mala', password: 'mala21', role: 'teacher', email: 'mala@school.com' }
    ]);
    res.send('✅ Seed successful! <a href="/">Go to Login</a>');
  } catch (err) {
    res.status(500).send('Seed error: ' + err.message);
  }
});

// ── AUTH ROUTES ──
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'register.html')));
app.get('/student', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'student.html')));
app.get('/teacher', requireAuth, (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'teacher.html')));

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password)))
      return res.json({ success: false, message: 'Invalid username or password' });
    req.session.user = { id: user._id, username: user.username, fullName: user.fullName, role: user.role };
    res.json({ success: true, role: user.role });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (!fullName || !username || !password)
      return res.json({ success: false, message: 'Full name, username, and password are required' });
    const existing = await User.findOne({ username });
    if (existing) return res.json({ success: false, message: 'Username already taken' });
    await User.create({ fullName, username, email: email || '', password, role: 'student' });
    res.json({ success: true, message: 'Account created successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/me', (req, res) => {
  if (req.session.user) res.json({ success: true, user: req.session.user });
  else res.json({ success: false });
});

// ── SUBMISSION ROUTES ──
app.post('/api/submit', requireAuth, upload.single('pdfFile'), async (req, res) => {
  try {
    const { subject, title, textAnswer } = req.body;
    const user = req.session.user;
    await Submission.create({
      studentUsername: user.username,
      studentName: user.fullName,
      subject, title,
      textAnswer: textAnswer || '',
      pdfFile: req.file ? req.file.filename : ''
    });
    res.json({ success: true, message: 'Assignment submitted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/my-submissions', requireAuth, async (req, res) => {
  const submissions = await Submission.find({ studentUsername: req.session.user.username }).sort({ createdAt: -1 });
  res.json(submissions);
});

app.get('/api/all-submissions', requireTeacher, async (req, res) => {
  const submissions = await Submission.find().sort({ createdAt: -1 });
  res.json(submissions);
});

app.post('/api/grade/:id', requireTeacher, async (req, res) => {
  try {
    const { marks, maxMarks, feedback } = req.body;
    await Submission.findByIdAndUpdate(req.params.id, {
      marks: Number(marks), maxMarks: Number(maxMarks) || 100, feedback, status: 'graded'
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ASSIGNMENT ROUTES ──
app.post('/api/assignments', requireTeacher, async (req, res) => {
  try {
    const { title, subject, description, dueDate, assignedTo } = req.body;
    await Assignment.create({ title, subject, description, dueDate, assignedTo: assignedTo || 'all', createdBy: req.session.user.username });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/assignments', requireAuth, async (req, res) => {
  const user = req.session.user;
  let query = {};
  if (user.role === 'student') {
    query = { $or: [{ assignedTo: 'all' }, { assignedTo: user.username }] };
  }
  const assignments = await Assignment.find(query).sort({ dueDate: 1 });
  res.json(assignments);
});

app.delete('/api/assignments/:id', requireTeacher, async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

app.get('/api/students', requireTeacher, async (req, res) => {
  const students = await User.find({ role: 'student' }, 'username fullName email');
  res.json(students);
});

app.listen(PORT, () => console.log(`🚀 Assignment Portal running at http://localhost:${PORT}`));
