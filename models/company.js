// models/Company.js
const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyName: String,
  email: String,
  password: String,
  // Add more fields if needed
});

const Company = mongoose.model('Companies', companySchema);

module.exports = {Company};
