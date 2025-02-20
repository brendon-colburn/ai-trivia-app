// Frontend (React + TailwindCSS)
import React, { useState } from 'react';
import axios from 'axios';

const JeopardyApp = () => {
    const [categories, setCategories] = useState(['History', 'Science', 'Sports']);
    const [board, setBoard] = useState([]);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isCorrect, setIsCorrect] = useState(null);

    const generateBoard = async () => {
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
                question: selectedQuestion.question,
                userAnswer,
                correctAnswer: selectedQuestion.answer,
            });
            setIsCorrect(response.data.correct);
        } catch (error) {
            console.error('Error evaluating answer:', error);
        }
    };

    return (
        <div className="min-h-screen bg-blue-200 flex flex-col items-center p-4">
            <h1 className="text-4xl font-bold mb-4">Jeopardy Game</h1>
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
                    {isCorrect !== null && (
                        <p className={`mt-2 text-lg font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {isCorrect ? 'Correct!' : 'Incorrect!'}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default JeopardyApp;
