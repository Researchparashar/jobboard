// models/user.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['jobSeeker', 'employer'],
    default: 'jobSeeker',
  },


  // You can add more fields based on your requirements

  // Additional user profile fields
  fullName: String,
  bio: String,
  resume: String, // Store the path or URL to the resume file
  // ... other fields as needed
});

const User = mongoose.model('Users', userSchema);

module.exports = {User};
