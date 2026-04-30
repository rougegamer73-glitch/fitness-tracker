const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Reward routes ready',
    rewards: []
  });
});

module.exports = router;
