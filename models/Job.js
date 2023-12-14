

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: String,
  description: String,
  requirements: String,
  contact: String,
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
