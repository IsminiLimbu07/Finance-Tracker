import express from 'express';
import Expense from '../models/Expense.js';
import auth from '../middleware/auth.js';
const router = express.Router();

// Get all expenses for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const { category, startDate, endDate, limit = 50, page = 1 } = req.query;
    
    // Build filter
    const filter = { user: req.user._id };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    // Calculate skip for pagination
    const skip = (page - 1) * parseInt(limit);

    // Get expenses
    const expenses = await Expense.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalExpenses = await Expense.countDocuments(filter);
    
    // Calculate total amount
    const totalAmount = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      expenses,
      totalExpenses,
      totalAmount: totalAmount[0]?.total || 0,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalExpenses / parseInt(limit))
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ 
      message: 'Server error fetching expenses' 
    });
  }
});

// Add new expense
router.post('/', auth, async (req, res) => {
  try {
    const { title, amount, category, date, description, paymentMethod } = req.body;

    // Validation
    if (!title || !amount || !category) {
      return res.status(400).json({ 
        message: 'Please provide title, amount, and category' 
      });
    }

    if (amount <= 0) {
      return res.status(400).json({ 
        message: 'Amount must be greater than 0' 
      });
    }

    const expense = new Expense({
      user: req.user._id,
      title: title.trim(),
      amount: parseFloat(amount),
      category,
      date: date ? new Date(date) : new Date(),
      description: description?.trim() || '',
      paymentMethod: paymentMethod || 'Credit Card'
    });

    await expense.save();

    res.status(201).json({ 
      message: 'Expense added successfully',
      expense 
    });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ 
      message: 'Server error adding expense' 
    });
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, amount, category, date, description, paymentMethod } = req.body;

    const expense = await Expense.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!expense) {
      return res.status(404).json({ 
        message: 'Expense not found' 
      });
    }

    // Update fields
    if (title) expense.title = title.trim();
    if (amount !== undefined) {
      if (amount <= 0) {
        return res.status(400).json({ 
          message: 'Amount must be greater than 0' 
        });
      }
      expense.amount = parseFloat(amount);
    }
    if (category) expense.category = category;
    if (date) expense.date = new Date(date);
    if (description !== undefined) expense.description = description.trim();
    if (paymentMethod) expense.paymentMethod = paymentMethod;

    await expense.save();

    res.json({ 
      message: 'Expense updated successfully',
      expense 
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ 
      message: 'Server error updating expense' 
    });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });

    if (!expense) {
      return res.status(404).json({ 
        message: 'Expense not found' 
      });
    }

    res.json({ 
      message: 'Expense deleted successfully' 
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ 
      message: 'Server error deleting expense' 
    });
  }
});

// Get expense statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    // Monthly total
    const monthlyTotal = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: currentMonth, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Category breakdown for current month
    const categoryBreakdown = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: currentMonth, $lt: nextMonth }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { total: -1 }
      }
    ]);

    res.json({
      monthlyTotal: monthlyTotal[0]?.total || 0,
      monthlyBudget: req.user.monthlyBudget,
      categoryBreakdown,
      budgetRemaining: Math.max(0, req.user.monthlyBudget - (monthlyTotal[0]?.total || 0))
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      message: 'Server error fetching statistics' 
    });
  }
});

export default router;