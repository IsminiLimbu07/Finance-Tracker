import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import expensesRouter from './routes/expenses.js';

import mongoose from 'mongoose';

const app = express(); //Creates an express application think of it as a resturant.

// Middleware 
// function that process requests before they reach the final route
app.use(cors()); //allows cross origin resource sharing think of it as allowing people from another city to place an order at your resturant

app.use(express.json()); //allows express to parse json data think of it as a waiter that takes orders and gives to chef in his native language.



app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);


// Routes
app.get('/', (req, res) => {
    res.send('Hello World!'); //sends a response to the client think of it as the chef sending the food to the customer.
});

mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Visit: http://localhost:${PORT}`);
});