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
var validator = require("email-validator");
module.exports = app

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

app.post('/register', async (req, res) => {
    const { username, password } = req.body
    //TODO: check if they are valid

    if(!req.body){
        return res.status(400).json({message:"Username or password not properly formatted"})
    }

    if (!username || !password) {
        return res.status(400).json({message:"Username or password not properly formatted"})
    }

    if(username.length==0){
         res.status(400)
        .json({message:"Username or password not properly formatted"})
        return
    }

    if(password.length<8){
         res.status(400)
        .send({message: "Username or password not properly formatted"})
        return
    }
    if(password.length > 24){
        res.status(400)
       .send({message: "Username or password not properly formatted"})
       return
   }


   // E' la get() che non funziona
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
        console.log("--------ERRORE DI REGISTRAZIONE----------")
        console.log(err)
        return res.status(401).send({
            message: "User not successfully created",
            error: err.message,
        })
    }
})

app.post('/forgotpassword', async (req, res) => {

    if(!req.body){
        res.status(400).json({message:"E-mail field must not be blank"})
        return
    }

    const { email } = req.body;
    console.log("EMAIL: " + email)
    if(email==undefined){
        res.status(400).json({message:"E-mail field must not be blank"})
        return

    }
    if(email==""){
        res.status(400).json({ message:"E-mail field must not be blank" })
        return
   }


    if(!validator.validate(email)){
        res.status(400).json({message:"Not a valid e-mail address"})
        return

    }

    try{
        const userRef = await firestore.collection('users').doc(username).get();
    if (!userRef.exists) {
        //per evitare l'enumerazione di tutti gli account, inviamo un messaggio generico
         res.status(200)({ message: "If that email address is in our database, we will send you an email to reset your password"});
         return
    }

    }
    catch(err){
        console.log("------ERRORE FORGOT PASSWORD-----")
        console.log(email)
        console.log(err)
        res.status(500).json({message:"Errore del server"})
        return

    }
    


    
})

app.post('/login', async (req, res) => {

    if(!req.body){

        return res.status(400)
        .json({ 
            message: "Login failed: invalid username or password"
         })
    }
/*
    if (!username || !password) {
        return res.status(400)
        .json({ 
            message: "Login failed: invalid username or password"
         })
    }

    if(username==undefined || password == undefined){
        return res.status(400)
        .json({ 
            message: "Login failed: invalid username or password"
         })

    }*/

    const { username, password } = req.body;

    if(username == "" || password == ""){
        return res.status(400)
        .json({  
            message: "Login failed: invalid username or password"
         })
    }
    if (!username || !password) {
        return res.status(400)
        .json({ 
            message: "Login failed: invalid username or password"
         })
    }

    try{
        const userRef = await firestore.collection('users').doc(username).get();
    if (!userRef.exists) {
        return res.status(401)
        .json({
            message: "Login failed: invalid username or password"
        });
    }

    const user = userRef.data();
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
         return res.status(401)
         .json({
             message: "Login failed: invalid username or password"
            })
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

    }

    catch (err) {
        console.log("-----------ERRORE DI LOGIN-------")
        console.log(username)
        console.log(password)
        console.log(err)
        return res.status(500).send({
            message: "User not successfully logged in",
            error: err.message,
        })
    }

    
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
app.listen(parseInt(process.env.PORT) || 8080, async () => {
    console.log(`HTTP Server listening on port ${process.env.PORT}...`);
});
