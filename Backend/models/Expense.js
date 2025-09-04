import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  amount: { 
    type: Number, 
    required: true,
    min: 0.01
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Food & Dining',
      'Transportation', 
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Healthcare',
      'Education',
      'Travel',
      'Other'
    ]
  },
  date: { 
    type: Date, 
    default: Date.now,
    required: true
  },
  description: { 
    type: String,
    maxlength: 500,
    trim: true
  },
  paymentMethod: { 
    type: String, 
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Digital Wallet', 'Bank Transfer'],
    default: 'Credit Card'
  }
}, { 
  timestamps: true 
});

// Index for better query performance
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

export default mongoose.model('Expense', expenseSchema);