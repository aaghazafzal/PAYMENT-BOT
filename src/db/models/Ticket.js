import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  telegramId: { type: String, required: true },
  platformId: { type: String, required: true },
  planId: { type: String, required: true },
  orderId: { type: String, required: true },
  status: { type: String, enum: ['UNUSED', 'USED'], default: 'UNUSED' },
  claimedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now, expires: '30d' } // Tickets expire after 30 days if not claimed
});

export const Ticket = mongoose.model('Ticket', ticketSchema);
