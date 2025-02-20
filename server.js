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

// Generate Jeopardy board with one API call and improved logging
app.post('/generate-board', async (req, res) => {
    try {
        const { categories } = req.body;
        console.log(`Received categories: ${categories}`);

        const messages = [
            { role: "system", content: "You are a trivia generator following Jeopardy rules." },
            { role: "user", content: `We are playing a trivia game modeled after Jeopardy. In this game, contestants are given an answer and must formulate the corresponding question as their response. Your task is to generate an array of trivia questions, but in the style of a Jeopardy answer, as a declarative statement that would prompt contestants to reply with a question. 
            
            Guidelines:
            - Jeopardy Format: Your response should always be phrased as a Jeopardy answer—a statement that would prompt a contestant to respond in question form.
            - Content Only: Provide only the Jeopardy-style answer—do not include any extra explanation or dialogue.
            - Difficulty ranges from 100 - 500 for each category, so the array will contain 25 answers in total.
            - Ensure variety in the responses and avoid duplicate answers.
            
            Categories: ${categories.join(', ')}
            
            Format response as JSON:
            { "board": [ { "category": "", "questions": [ { "question": "", "answer": "", "value": 100 }, ... ] } ] }` }
        ];

        console.log(`Sending prompt to OpenAI...`);
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages,
            max_tokens: 1000
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
        });

        console.log('Received response from OpenAI');
        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (error) {
        console.error('Error in /generate-board:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

// Evaluate user response with enhanced debugging
app.post('/evaluate', async (req, res) => {
    try {
        const { userAnswer, correctAnswer } = req.body;
        console.log(`Evaluating answer: ${userAnswer} against ${correctAnswer}`);

        const messages = [
            { role: "system", content: "You are a Jeopardy game judge that checks answers like Alex Trebek." },
            { role: "user", content: `Evaluate the following response:
            
            Submitted Answer: "${userAnswer}"
            Control Answer: "${correctAnswer}"
            
            Rules:
            - If the submitted response is not in the form of a question, respond in JSON:
            { "result": false, "message": "Respond how Alex Trebek would respond" }
            - If the submitted response matches the control answer, respond in JSON:
            { "result": true, "message": "Respond how Alex Trebek would respond" }
            - If the answer is incorrect but in the form of a question, respond in JSON:
            { "result": false, "message": "Respond how Alex Trebek would clarify the correct answer" }
            
            Ensure that the response is only valid JSON with no additional text.` }
        ];

        console.log(`Sending evaluation prompt to OpenAI...`);
        
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-4',
            messages,
            max_tokens: 100
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' }
        });

        console.log('Received evaluation response from OpenAI');
        res.json(JSON.parse(response.data.choices[0].message.content));
    } catch (error) {
        console.error('Error in /evaluate:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
