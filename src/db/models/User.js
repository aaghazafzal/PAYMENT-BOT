import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true, index: true },
  username: { type: String, default: '' },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  phone: { type: String, default: '9999999999' },
  email: { type: String, default: 'user@univora.com' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
