const mongoose = require('mongoose')

const CitySchema = new mongoose.Schema({
  locationName: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lon: {
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