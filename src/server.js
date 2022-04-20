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
const cookieParser = require('cookie-parser')
// const session = require('express-session');
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken')
const jwtSecret = '4999aed3c946f7b0a38edb534aa583628d84e36d10f1c04700770d572af3dce4362ddd'
const app = express();

// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: true,
//     saveUninitialized: true
// }));
app.use(cookieParser())

app.use(helmet());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// enabling CORS for all requests
const corsConfig = {
    origin: true,
    credentials: true,
};

app.use(cors(corsConfig));
app.options('*', cors(corsConfig));

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

app.get('/', (req, res) => {
    return res.send({
        timestamp: new Date().getTime(),
    })
})

app.post('/register', async (req, res, next) => {
    const { username, password } = req.body
    //TODO: check if they are valid
    try {
        const userRef = await firestore.collection('users').doc(username).get();
        if (userRef.exists) {
            return res.status(409).json({ message: "Username already exists" })
        } else {
            await firestore.collection('users').doc(username).set({
                username: username,
                password: password,
                roles: [2001],
                createdAt: new Date().getTime(),
            });
            const maxAge = 3 * 60 * 60;
            const token = jsonwebtoken.sign(
                { username: username },
                jwtSecret,
                {
                    expiresIn: maxAge, // 3hrs in sec
                }
            );

            await firestore.collection('players').add({
                username: username,
                wood: 0,
                stone: 0,
                food: 0,
                warriors: 0,
                generals: 0,
                archers: 0,
                createdAt: new Date().getTime(),
            });

            return res.status(201)
                .cookie("X-AUTH-TOKEN", token, {
                    httpOnly: true,
                    maxAge: maxAge * 1000, // 3hrs in ms
                })
                .send({
                    message: "User successfully created",
                    username: username,
                    roles: [2001],
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
    const { username, password } = req.body;
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
    const token = jsonwebtoken.sign(
        { username: user.username },
        jwtSecret,
        {
            expiresIn: maxAge, // 3hrs in sec
        }
    );
    res.status(200)
        .cookie("X-AUTH-TOKEN", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 3hrs in ms
        }).send({
            message: "User successfully logged in",
            username: user.username,
            accessToken: token,
            roles: user.roles,
        });
});

app.get('/refresh', async (req, res) => {
    try {
        const accessToken = req.cookies['X-AUTH-TOKEN'];
        const decoded = jsonwebtoken.verify(accessToken, jwtSecret);
        const userRef = await firestore.collection('users').doc(decoded.username).get();
        return res.send({
            accessToken: accessToken,
            username: decoded.username,
            roles: userRef.data().roles,
        });
    } catch (err) {
        return res.sendStatus(401);
    }
    return res.sendStatus(401);
})

// app.use(jwt({ secret: jwtSecret, algorithms: ['HS256'] }));

// app.get('/protected', (req, res) => {
//     return res.send({
//         message: "You are authenticated",
//     })
// })

app.listen(parseInt(process.env.PORT) || 8080, async () => {
    console.log(`HTTP Server listening on port ${process.env.PORT}...`);
});

