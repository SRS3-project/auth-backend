require('dotenv').config()
const path = require('path');
const express = require('express');
const winston = require('winston');
const expressWinston = require('express-winston');
const firestore = require('./../utils/firestore');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const jwt = require('jsonwebtoken')
const jwtSecret = '4999aed3c946f7b0a38edb534aa583628d84e36d10f1c04700770d572af3dce4362ddd'
const app = express();

app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
app.use(cors());

// adding morgan to log HTTP requests
app.use(morgan('combined'));


// add some logging of requests
if (process.env.NODE_ENV === 'development') {
    app.use(expressWinston.logger({
        transports: [new winston.transports.Console()],
        meta: false,
        expressFormat: true,
        colorize: false,
        msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    }));
}

app.use((request, response, next) => {
    /*
    if (!request.headers.token || request.headers.token !== process.env.TOKEN) {
        response.sendStatus(403).end();
        return;
    }*/
    next();
});

// app.get('/profile/:id', async function (request, response) {
//     let profileRef = await firestore.collection('profiles').doc(request.params.username).get();
//
//     if (!profileRef.exists) {
//         return response.send({
//             error: 'Profile not found',
//         });
//     }
//
//     return response.send(profileRef.data());
// });

app.get('/', (req, res) => {
    return res.send({
        timestamp: new Date().getTime(),
    })
})

app.post('/register', async (req, res, next) => {
    const { username, password } = req.body
    if (password.length < 6) {
        return res.status(400).json({ message: "Password less than 6 characters" })
    }
    try {
        const userRef = await firestore.collection('users').doc(username).get();
        if (userRef.exists) {
            return res.status(400).json({ message: "Username already exists" })
        } else {
            await firestore.collection('users').doc(username).set({
                username: username,
                password: password,
                createdAt: new Date().getTime(),
            });
            const maxAge = 3 * 60 * 60;
            const token = jwt.sign(
                { username: username },
                jwtSecret,
                {
                    expiresIn: maxAge, // 3hrs in sec
                }
            );
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: maxAge * 1000, // 3hrs in ms
            });
            return res.status(201).json({
                message: "User successfully created",
                username: username,
            });
        }
    } catch (err) {
        return res.status(401).send({
            message: "User not successful created",
            error: err.message,
        })
    }
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({ message: "Username or password is missing" })
    }

    const userRef = await firestore.collection('users').doc(username).get();

    if (!userRef.exists) {
        return res.sendStatus(401);
    }

    const user = userRef.data();
    if (user.password !== req.body.password) {
        return res.sendStatus(401);
    }

    const maxAge = 3 * 60 * 60;
    const token = jwt.sign(
        { username: user.username },
        jwtSecret,
        {
            expiresIn: maxAge, // 3hrs in sec
        }
    );
    res.cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000, // 3hrs in ms
    });
    res.status(200).json({
        message: "User successfully logged in",
        username: user.username,
    });
});

app.listen(parseInt(process.env.HTTP_PORT) || 8080, async () => {
    console.log(`HTTP Server listening on port ${process.env.HTTP_PORT}...`);
});

