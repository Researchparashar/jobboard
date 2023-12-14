// index.js

const express = require('express');
const mongoose = require('mongoose');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('./models/users');
const Job = require('./models/Job');
const { Company } = require('./models/company');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

mongoose.connect('mongodb+srv://researchparashar4:TqI61HeS8TKTisdt@findjob.4vididz.mongodb.net/findjobs');

const JWT_SECRET_KEY = 'shshhsjsjsjsjsjsbtwyw668822bsbss';

// Login endpoint for users
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Protected route example
app.get('/protected', (req, res) => {
  res.json({ message: 'This is a protected route' });
});

// Sample routes for jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.json(savedJob);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Register new user
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user profile
app.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update user profile
app.put('/:userId', async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.userId, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Upload resume
app.post('/:userId/resume', upload.single('resume'), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    user.resume = req.file.path;
    await user.save();
    res.json({ message: 'Resume uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sample route to add a new job by a company
app.post('/api/jobs/c', authenticateCompany, async (req, res) => {
  try {
    const newJob = new Job(req.body);
    const savedJob = await newJob.save();
    res.json(savedJob);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Register new company
app.post('/register-comp', async (req, res) => {
  try {
    const { companyName, email, password } = req.body;
    const existingCompany = await Company.findOne({ email });

    if (existingCompany) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newCompany = new Company({
      companyName,
      email,
      password: hashedPassword,
    });

    await newCompany.save();

    res.status(201).json({ message: 'Company registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint for companies
app.post('/login-company', async (req, res) => {
  const { email, password } = req.body;

  try {
    const company = await Company.findOne({ email });

    if (!company) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ companyId: company._id, email: company.email }, JWT_SECRET_KEY, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Authentication middleware for companies
function authenticateCompany(req, res, next) {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY);
    req.company = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
