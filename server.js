const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.use(express.json());
app.use(cors());

app.post('/generate-board', async (req, res) => {
    try {
        const { categories } = req.body;
        console.log(`Received categories: ${categories}`);

        const systemMessage = {
            role: "system",
            content: `
                We are playing a trivia game modeled after Jeopardy. In this game, contestants are given an answer and must formulate the corresponding question as their response. Your task is to generate an array of trivia questions in the style of a Jeopardy answer.

                Guidelines:
                - Jeopardy Format: Always phrase the response as a Jeopardy answer.
                - Content Only: Provide only the Jeopardy-style answer with no extra explanation.
                - Difficulty: Ranges from 100 to 500 per category, totaling 25 answers.
                - Variety: Ensure diverse responses and avoid duplicates.

                Categories: ${categories.join(', ')}
                    `.trim()
        };

        const messages = [systemMessage];

        console.log('Sending prompt to OpenAI...');

        const openAIResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-2024-08-06',
                messages,
                max_tokens: 1000,
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "board_schema",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                board: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            category: {
                                                type: "string",
                                                description: "The category name for this board section"
                                            },
                                            questions: {
                                                type: "array",
                                                items: {
                                                    type: "object",
                                                    properties: {
                                                        answer: {
                                                            type: "string",
                                                            description: "The answer text"
                                                        },
                                                        value: {
                                                            type: "number",
                                                            description: "The point value assigned to the answer"
                                                        }
                                                    },
                                                    required: ["answer", "value"],
                                                    additionalProperties: false
                                                }
                                            }
                                        },
                                        required: ["category", "questions"],
                                        additionalProperties: false
                                    }
                                }
                            },
                            required: ["board"],
                            additionalProperties: false
                        }
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Received response from OpenAI');
        const boardData = JSON.parse(openAIResponse.data.choices[0].message.content);
        res.json(boardData);
    } catch (error) {
        console.error('Error in /generate-board:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

app.post('/evaluate', async (req, res) => {
    try {
        const { userAnswer, userResponse } = req.body;
        console.log(`Evaluating answer: ${userResponse} for question: ${userAnswer}`);

        const systemMessage = {
            role: "system",
            content: "You are a Jeopardy game judge. Evaluate the user's answer and return your evaluation as structured JSON."
        };

        const userMessage = {
            role: "user",
            content: `
                Evaluate the following:
                Answer: "${userAnswer}"
                UserResponse: "${userResponse}"
                    `.trim()
        };

        const messages = [systemMessage, userMessage];

        console.log('Sending evaluation prompt to OpenAI...');

        const openAIResponse = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-4o-2024-08-06',
                messages,
                max_tokens: 1000,
                response_format: {
                    type: "json_schema",
                    json_schema: {
                        name: "evaluation_schema",
                        strict: true,
                        schema: {
                            type: "object",
                            properties: {
                                result: {
                                    type: "boolean",
                                    description: "Indicates if the user's answer is correct"
                                },
                                message: {
                                    type: "string",
                                    description: "Feedback message for the user's response"
                                }
                            },
                            required: ["result", "message"],
                            additionalProperties: false
                        }
                    }
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Received evaluation response from OpenAI');
        const evaluationResult = JSON.parse(openAIResponse.data.choices[0].message.content);
        res.json(evaluationResult);
    } catch (error) {
        console.error('Error in /evaluate:', error.response?.data || error.message);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
