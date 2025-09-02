import express from 'express';
import cors from 'cors';

const app = express(); //Creates an express application think of it as a resturant.

// Middleware 
// function that process requests before they reach the final route
app.use(cors()); //allows cross origin resource sharing think of it as allowing people from another city to place an order at your resturant

app.use(express.json()); //allows express to parse json data think of it as a waiter that takes orders and gives to chef in his native language.


// Routes
app.get('/', (req, res) => {
    res.send('Hello World!'); //sends a response to the client think of it as the chef sending the food to the customer.
});

app.listen(3000, () => {
    console.log('Server is running on port 3000'); //starts the server think of it as opening the resturant for business.
});


