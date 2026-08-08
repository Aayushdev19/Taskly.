const express = require('express');
const router = express.Router();
const { UserRepository, TodoRepository } = require('../repositories');
const auth = require('../middleware/auth');

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admin role required' });
  }
};

router.get('/users', [auth, adminOnly], async (req, res) => {
  try {
    const list = await UserRepository.getAllWithStats();
    res.json(list);
  } catch (err) {
    console.error('Admin fetch users error:', err.message);
    res.status(500).send('Server error');
  }
});

router.get('/stats', [auth, adminOnly], async (req, res) => {
  try {
    const totalUsers = await UserRepository.countAll();
    const totalTodos = await TodoRepository.countAll();
    const completedTodos = await TodoRepository.getCompletedCount();
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    const categoryDistribution = await TodoRepository.getCategorySplit();
    const registrationTrends = await UserRepository.getSignupTrends();

    res.json({
      totalUsers,
      totalTodos,
      completedTodos,
      completionRate,
      categoryDistribution,
      registrationTrends,
    });
  } catch (err) {
    console.error('Admin fetch stats error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
