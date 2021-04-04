const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  balance:{
      type: Number,
      default: 0
  },
  expense:[{
    reason: String,
    amount: Number,
    date: String,
    default:[]
  }],
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
