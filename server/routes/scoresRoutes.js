const express = require('express');
const router = express.Router();
const { addScore, getScores } = require('../db');

// POST to save a score
router.post('/scores', async (req, res) => {
  try {
    const scoreData = req.body; // expect { userId, score, ... }
    const savedScore = await addScore(scoreData);
    res.json(savedScore);
  } catch (error) {
    console.error("Error saving score:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET to retrieve scores
router.get('/scores', async (req, res) => {
  try {
    const scores = await getScores();
    res.json(scores);
  } catch (error) {
    console.error("Error retrieving scores:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;