// Frontend (React + TailwindCSS)
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

const JeopardyApp = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [board, setBoard] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [evaluation, setEvaluation] = useState(null);

    const addCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.trim())) {
            setCategories([...categories, newCategory.trim()]);
            setNewCategory('');
        }
    };

    const generateBoard = async () => {
        if (categories.length === 0) return;
        try {
            const response = await axios.post('http://localhost:5000/generate-board', { categories });
            setBoard(response.data.board);
        } catch (error) {
            console.error('Error generating board:', error);
        }
    };

    const checkAnswer = async () => {
        if (!selectedQuestion) return;
        try {
            const response = await axios.post('http://localhost:5000/evaluate', {
                userAnswer: selectedQuestion.question,
                userResponse: selectedQuestion.userAnswer
            });
            setEvaluation(response.data);
        } catch (error) {
            console.error('Error evaluating answer:', error);
        }
    };

    return (
        <div className="min-h-screen bg-blue-200 flex flex-col items-center p-4">
            <h1 className="text-4xl font-bold mb-4">Jeopardy Game</h1>
            <div className="mb-4 flex flex-col items-center">
                <input
                    type="text"
                    placeholder="Enter a category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border p-2 rounded w-96 mb-2"
                />
                <button onClick={addCategory} className="bg-blue-500 text-white p-2 rounded">Add Category</button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
                {categories.map((category, index) => (
                    <span key={index} className="bg-gray-300 text-black px-3 py-1 rounded-lg">{category}</span>
                ))}
            </div>
            <button onClick={generateBoard} className="bg-green-500 text-white p-2 rounded mb-4">Generate Board</button>
            <div className="grid grid-cols-3 gap-4">
                {board.map((categoryData, index) => (
                    <div key={index} className="bg-white p-4 rounded shadow-md">
                        <h2 className="text-xl font-bold mb-2">{categoryData.category}</h2>
                        {categoryData.questions.map((q, qIndex) => (
                            <button 
                                key={qIndex} 
                                className="bg-blue-500 text-white p-2 m-1 rounded w-full"
                                onClick={() => setSelectedQuestion(q)}
                            >
                                ${q.value}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            {selectedQuestion && (
                <div className="mt-6 p-4 bg-white shadow-md rounded text-center">
                    <h2 className="text-2xl mb-4">{selectedQuestion.question}</h2>
                    <input 
                        type="text" 
                        value={userAnswer} 
                        onChange={(e) => setUserAnswer(e.target.value)} 
                        className="border p-2 w-full rounded mb-2"
                    />
                    <button onClick={checkAnswer} className="bg-red-500 text-white p-2 rounded">Submit Answer</button>
                    {evaluation && (
                        <p className={`mt-2 text-lg font-bold ${evaluation.result ? 'text-green-600' : 'text-red-600'}`}>
                            {evaluation.message}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

ReactDOM.render(<JeopardyApp />, document.getElementById('root'));

export default JeopardyApp;
