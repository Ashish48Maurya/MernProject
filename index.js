require('dotenv').config();
const express = require('express');
const port = process.env.PORT || 5000;
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const routes = require('./routes/auth');
const mongoConnect = require('./db/connect');


app.get('/', (req, res) => {
    res.send('Hello');
})

app.use(cors({
    // origin: 'http://localhost:3000',   //for localMachine
    origin: 'https://sswiftnotee.netlify.app',  //for Production
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(routes);

const start = async () => {
    try {
        // await mongoConnect(process.env.MONGODB_URL);
        await mongoConnect("mongodb+srv://Ashish:Ashishmaurya102938@cluster1.f21bdyh.mongodb.net/MernProject");
        app.listen(port, (req, res) => {
            console.log(`listening at http://localhost:${port}`);
        });
    } catch (err) {
        console.log(err);
    }
}

start();
