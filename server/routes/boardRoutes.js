const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/*
 * POST /generate-board (Simple Mode)
 * Generates a Jeopardy board based on provided categories.
 */
router.post('/generate-board', async (req, res) => {
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

    console.log('Sending prompt to OpenAI for simple board generation...');
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
                              description: "The answer text presented to the contestant"
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

    console.log('Received response from OpenAI (simple board)');
    const boardData = JSON.parse(openAIResponse.data.choices[0].message.content);
    res.json(boardData);
  } catch (error) {
    console.error('Error in /generate-board:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

/*
 * POST /generate-board-from-url (Complex Mode)
 * Generates a Jeopardy board based on content from a provided document or website URL.
 * This mode returns each trivia item with both a Jeopardy-style answer and the correct question.
 */
router.post('/generate-board-from-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required.' });
    }

    console.log(`Fetching content from URL: ${url}`);
    const response = await axios.get(url);
    let content = response.data;
    // Optionally process the HTML (e.g., extract text) before using it
    const $ = cheerio.load(content);
    const extractedText = $('p')
        .map((i, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 0)
        .join('\n\n');
    content = extractedText || content;

    const systemMessage = {
      role: "system",
      content: `
We are playing a trivia game modeled after Jeopardy. You are given a knowledge source extracted from a document or website. Your task is to generate a trivia board (categories and questions) based solely on this source. For each trivia item, provide both:
1. A Jeopardy-style answer (a declarative statement displayed to the contestant), and 
2. The corresponding correct question that the contestant should supply as their response.

Guidelines:
- Generate categories relevant to the provided content.
- For each category, include a range of difficulty values.
- Return the output as structured JSON following the provided schema.

Content:
${content}
      `.trim()
    };

    const messages = [systemMessage];

    console.log('Sending prompt to OpenAI for complex board generation...');
    const openAIResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-2024-08-06',
        messages,
        max_tokens: 1500,
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
                            question: {
                              type: "string",
                              description: "The correct question that the contestant should provide"
                            },
                            answer: {
                              type: "string",
                              description: "The Jeopardy-style answer displayed to the contestant"
                            },
                            value: {
                              type: "number",
                              description: "The point value assigned to this trivia item"
                            }
                          },
                          required: ["question", "answer", "value"],
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

    console.log('Received response from OpenAI (complex board)');
    const boardData = JSON.parse(openAIResponse.data.choices[0].message.content);
    res.json(boardData);
  } catch (error) {
    console.error('Error in /generate-board-from-url:', error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
