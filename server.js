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

// Generate Jeopardy board with one API call
app.post('/generate-board', async (req, res) => {
    try {
        const { categories } = req.body;
        const prompt = `We are playing a trivia game modeled after Jeopardy. In this game, contestants are given an answer and must formulate the corresponding question as their response. Your task is to generate an array of trivia questions, but in the style of a Jeopardy answer, as a declarative statement that would prompt contestants to reply with a question. 
        
        Guidelines:
        - Jeopardy Format: Your response should always be phrased as a Jeopardy answer—a statement that would prompt a contestant to respond in question form. Example: If the answer is "This U.S. state is known as the Sunshine State," contestants would respond with "What is Florida?"
        - Content Only: Provide only the Jeopardy-style answer—do not include any extra explanation or dialogue.
        - Difficulty ranges from 100 - 500 for each category, so the array will contain 25 answers in total.
        - 100 should be general knowledge, 500 should be very difficult and only known by people who win at Jeopardy usually. Make 500 at least twice as hard as you think it should be.
        - Instructions: Based on the provided list of categories (${categories.join(', ')}), generate an appropriate trivia statement as a Jeopardy-style answer. 
        - Do not have any answers that can be answered with the same question.
        
        Format response as JSON:
        { "board": [ { "category": "", "questions": [ { "question": "", "answer": "", "value": 100 }, ... ] } ] }`;

        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'gpt-4',
            prompt,
            max_tokens: 1000
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
        });

        res.json(JSON.parse(response.data.choices[0].text));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Evaluate user response
app.post('/evaluate', async (req, res) => {
    try {
        const { userAnswer, correctAnswer } = req.body;
        const prompt = `You are evaluating a submitted response against a control answer in a trivia game modeled after Jeopardy. Follow these rules:
        
        Form Validation: If the submitted response "${userAnswer}" is not in the form of a question, respond in the following JSON {
          "result": false,
          "message": Respond how Alex Trebek would respond
        }
        
        Answer Comparison: If the submitted response is in the form of a question and matches the control answer "${correctAnswer}", respond in the following JSON format:
        {
          "result": true,
          "message": Respond how Alex Trebek would respond
        }
        
        If the answer is in the form of a question but is not the correct response to the control answer, respond in the following JSON format:
        {
          "result": false,
          "message": Respond how Alex Trebek would respond, clarifying the answer
        }
        
        Ensure Accuracy: Match based on content rather than strict phrasing to accommodate possible variations.
        Make sure the JSON response only contains the fields "result" and "message" with no additional text or data outside the provided format.`;

        const response = await axios.post('https://api.openai.com/v1/completions', {
            model: 'gpt-4',
            prompt,
            max_tokens: 100
        }, {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` }
        });

        res.json(JSON.parse(response.data.choices[0].text));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
