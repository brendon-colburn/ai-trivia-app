// Backend (Node.js + Express)
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Generate Jeopardy board
app.post('/generate-board', async (req, res) => {
    try {
        const { categories } = req.body;
        const questions = await Promise.all(categories.map(async (category) => {
            const response = await axios.post('https://api.openai.com/v1/completions', {
                model: 'gpt-4',
                prompt: `Generate five Jeopardy-style questions with answers for the category: ${category}. Format as JSON array [{question, answer, value}].`,
                max_tokens: 300
            }, {
                headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
            });
            return { category, questions: JSON.parse(response.data.choices[0].text) };
        }));
        res.json({ board: questions });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Evaluate user response
app.post('/evaluate', async (req, res) => {
    try {
        const { question, userAnswer, correctAnswer } = req.body;
        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'gpt-4',
            prompt: `Does the answer "${userAnswer}" correctly match "${correctAnswer}"? Respond with "true" or "false".`,
            max_tokens: 5
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
        });
        res.json({ correct: response.data.choices[0].text.trim() === 'true' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
