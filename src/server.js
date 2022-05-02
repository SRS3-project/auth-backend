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
const app = express();
const bcrypt = require('bcrypt');
module.exports = app

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


    if(!password){
        return res.status(400).json({message:"Password is undefined!"})
    }

    if(req.body.password.length<8){
        console.log("PASSWORD TOO SHORT")
        return res.status(400).json({message: "Password should be at least 8 characters long"})
    }
    //minimum length of password should be 8 characters

    try {
        const userRef = await firestore.collection('users').doc(username).get();
        if (userRef.exists) {
            return res.status(409).json({ message: "Username already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await firestore.collection('users').doc(username).set({
            username: username,
            password: passwordHash,
            roles: [2001],
            createdAt: new Date().getTime(),
        });

        const maxAge = 3 * 60 * 60;
        const token = jsonwebtoken.sign(
            { username: username },
            process.env.JWT_SECRET,
            {
                expiresIn: maxAge, // 3hrs in sec
            }
        );

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
    } catch (err) {
        console.log(err.message);
        return res.status(401).send({
            message: "User not successful created",
            error: err.message,
        })
    }
})

app.get('/forgotpassword', async (req, res) => {
    const { email } = req.body;

    const userRef = await firestore.collection('users').doc(username).get();
    if (!userRef.exists) {
        //per evitare l'enumerazione di tutti gli account, inviamo un messaggio generico
        return res.status(401).json({ message: "If that email address is in our database, we will send you an email to reset your password"});
    }


    
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        console.log("Username or password are blank!")
        res.status(400).json({ message: "Login Failed: invalid username or password" })
        return
    }

    const userRef = await firestore.collection('users').doc(username).get();
    if (!userRef.exists) {
        return res.status(401).json({ message: "Login Failed: invalid username or password"});
    }

    const user = userRef.data();
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ message: "Login Failed: invalid username or password"})
    }

    const maxAge = 3 * 60 * 60;
    const token = jsonwebtoken.sign(
        { username: user.username },
        process.env.JWT_SECRET,
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
        const decoded = jsonwebtoken.verify(accessToken, process.env.JWT_SECRET);
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
