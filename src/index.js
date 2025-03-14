import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const JeopardyApp = () => {
  const [mode, setMode] = useState('simple'); // "simple" or "complex"
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [board, setBoard] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluation, setEvaluation] = useState(null);
  const [scores, setScores] = useState([]); // new state for scores

  // Fetch scores on initial mount and after updates
  useEffect(() => {
    fetchScores();
  }, []);

  const fetchScores = async () => {
    try {
      const response = await axios.get('http://localhost:5000/scores');
      setScores(response.data);
    } catch (error) {
      console.error('Error fetching scores:', error);
    }
  };

  const addCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCategory('');
    }
  };

  // Generate board for simple mode (using categories)
  const generateBoardSimple = async () => {
    if (categories.length === 0) return;
    try {
      const response = await axios.post('http://localhost:5000/generate-board', { categories });
      setBoard(response.data.board);
    } catch (error) {
      console.error('Error generating board:', error);
    }
  };

  // Generate board for complex mode (using URL)
  const generateBoardComplex = async () => {
    if (!sourceUrl.trim()) return;
    try {
      const response = await axios.post('http://localhost:5000/generate-board-from-url', { url: sourceUrl });
      setBoard(response.data.board);
    } catch (error) {
      console.error('Error generating board from URL:', error);
    }
  };

  const generateBoard = () => {
    if (mode === 'simple') {
      generateBoardSimple();
    } else {
      generateBoardComplex();
    }
  };

  // Modified checkAnswer: send expectedQuestion if available from complex mode
  const checkAnswer = async () => {
    if (!selectedQuestion) return;
    try {
      const expectedQuestion = selectedQuestion.question 
        ? selectedQuestion.question 
        : selectedQuestion.answer; // fallback for simple mode
      const response = await axios.post('http://localhost:5000/evaluate', {
        expectedQuestion,
        userResponse: userAnswer
      });
      setEvaluation(response.data);

      // If the evaluation passes, submit the score to be recorded in the backend.
      if (response.data.result) {
        // Create a simple score object, you might want to include additional data.
        const scoreData = {
          userId: "guest", // Replace with dynamic user info if available
          score: calculatePoints(selectedQuestion.value) // You can adjust scoring logic as needed.
        };
        await axios.post('http://localhost:5000/scores', scoreData);
        fetchScores(); // Refresh the scores list after adding.
      }
    } catch (error) {
      console.error('Error evaluating answer:', error);
    }
  };

  // Dummy function for calculating points
  const calculatePoints = (value) => {
    // For example, simply return the value.
    return value;
  };

  // Clear input and evaluation when selecting a new question
  const handleQuestionSelect = (q) => {
    setSelectedQuestion(q);
    setUserAnswer('');
    setEvaluation(null);
  };

  return (
    <div className="min-h-screen bg-blue-200 flex flex-col items-center p-4">
      <h1 className="text-4xl font-bold mb-4">Jeopardy Game</h1>
      
      {/* Mode selection */}
      <div className="mb-4">
        <label className="mr-4">
          <input 
            type="radio" 
            name="mode" 
            value="simple" 
            checked={mode === 'simple'} 
            onChange={() => setMode('simple')} 
            className="mr-1"
          />
          Simple Mode
        </label>
        <label>
          <input 
            type="radio" 
            name="mode" 
            value="complex" 
            checked={mode === 'complex'} 
            onChange={() => setMode('complex')} 
            className="mr-1"
          />
          Complex Mode
        </label>
      </div>

      {/* Render input based on selected mode */}
      {mode === 'simple' ? (
        <div className="mb-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Enter a category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="border p-2 rounded w-96 mb-2"
          />
          <button onClick={addCategory} className="bg-blue-500 text-white p-2 rounded">
            Add Category
          </button>
          <div className="mt-2 flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <span key={index} className="bg-gray-300 text-black px-3 py-1 rounded-lg">
                {category}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 flex flex-col items-center">
          <input
            type="text"
            placeholder="Enter a document or website URL"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="border p-2 rounded w-96 mb-2"
          />
        </div>
      )}

      <button onClick={generateBoard} className="bg-green-500 text-white p-2 rounded mb-4">
        Generate Board
      </button>

      <div className="grid grid-cols-3 gap-4">
        {board.map((categoryData, index) => (
          <div key={index} className="bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-bold mb-2">{categoryData.category}</h2>
            {categoryData.questions.map((q, qIndex) => (
              <button
                key={qIndex}
                className="bg-blue-500 text-white p-2 m-1 rounded w-full"
                onClick={() => handleQuestionSelect(q)}
              >
                ${q.value}
              </button>
            ))}
          </div>
        ))}
      </div>

      {selectedQuestion && (
        <div className="mt-6 p-4 bg-white shadow-md rounded text-center">
          {/* Always display the answer (Jeopardy style) */}
          <h2 className="text-2xl mb-4">{selectedQuestion.answer}</h2>
          <input
            type="text"
            placeholder="Your answer in question form"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="border p-2 w-full rounded mb-2"
          />
          <button onClick={checkAnswer} className="bg-red-500 text-white p-2 rounded">
            Submit Answer
          </button>
          {evaluation && (
            <p className={`mt-2 text-lg font-bold ${evaluation.result ? 'text-green-600' : 'text-red-600'}`}>
              {evaluation.message}
            </p>
          )}
        </div>
      )}

      {/* Scoreboard */}
      <div className="mt-8 w-full max-w-2xl bg-white p-4 shadow-md rounded">
        <h3 className="text-2xl font-bold mb-4 text-center">Scoreboard</h3>
        {scores.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="border p-2">User</th>
                <th className="border p-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, idx) => (
                <tr key={idx}>
                  <td className="border p-2">{score.userId}</td>
                  <td className="border p-2">{score.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center">No scores available.</p>
        )}
      </div>
    </div>
  );
};

ReactDOM.render(<JeopardyApp />, document.getElementById('root'));
export default JeopardyApp;
