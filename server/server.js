const express = require('express');
const cors = require('cors');
require('dotenv').config();

const boardRoutes = require('./routes/boardRoutes');
const evaluationRoutes = require('./routes/evaluationRoutes');
const scoresRoutes = require('./routes/scoresRoutes'); // new file

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// Mount board, evaluation, and scores routes
app.use('/', boardRoutes);
app.use('/', evaluationRoutes);
app.use('/', scoresRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
