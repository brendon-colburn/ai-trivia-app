const express = require('express');
const axios = require('axios');
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/*
 * POST /evaluate
 * Evaluates a user's response by comparing the provided correct question with the user's submitted question.
 * For complex mode, send the correct question as "expectedQuestion". For simple mode, you may pass the original field as "userAnswer".
 */
router.post('/evaluate', async (req, res) => {
  try {
    // For complex mode, use expectedQuestion if provided; otherwise fallback to userAnswer.
    const expectedQuestion = req.body.expectedQuestion || req.body.userAnswer;
    const userResponse = req.body.userResponse;
    console.log(`Evaluating user's response: "${userResponse}" against expected question: "${expectedQuestion}"`);

    const systemMessage = {
      role: "system",
      content: `
You are a Jeopardy game judge. Compare the provided correct question with the user's response.
Rules:
- If the user's response is not phrased as a question, return JSON: { "result": false, "message": "Your response must be phrased as a question." }
- If the user's response closely matches the provided correct question, return JSON: { "result": true, "message": "Correct! Well done." }
- Otherwise, return JSON: { "result": false, "message": "Incorrect. The correct question was: [expected question]." }
Ensure your response is strictly valid JSON with no additional text.
      `.trim()
    };

    const userMessage = {
      role: "user",
      content: `
Evaluate the following:
Expected Question: "${expectedQuestion}"
User Response: "${userResponse}"
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
                  description: "Indicates if the user's response is correct"
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

module.exports = router;
