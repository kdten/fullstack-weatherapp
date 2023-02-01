const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    citylist: {
      type: [String],
      required: true,
      default: []
    },
    userId: {
      type: String,
      required: true
    },
    userId: {
      type: String,
      required: true
    }
  });

module.exports = mongoose.model('User', UserSchema)