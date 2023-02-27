const mongoose = require('mongoose')

const CitySchema = new mongoose.Schema({
  cityName: {
    type: String,
    required: true
  },
  lon: {
    type: Number,
    required: true
  },
  lat: {
    type: Number,
    required: true
  }
});

const UserSchema = new mongoose.Schema({
  citylist: {
    type: [CitySchema],
    required: false,
    default: []
  },
  userId: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);