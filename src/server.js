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
const crypto = require("crypto");
const nodemailer=require("nodemailer");
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
    const { email, username, password } = req.body
    //TODO: check if they are valid

    if(!req.body){
        return res.status(400).json({message:"Username or password not properly formatted"})
    }

    if(!email){
        return res.status(400).json({message:"Email must not be blank"})
    }

    if(!validator.validate(email)){
        return res.status(400).json({message:"Not a valid email"})
    }

    if (!username || !password) {
        return res.status(400).json({message:"Username or password not properly formatted"})
    }

    if(username.length==0){
         res.status(400)
        .json({message:"Username or password not properly formatted"})
        return
    }

    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
    const regex = new RegExp(PWD_REGEX)

    if(!regex.test(password)){
        res.status(400)
        .send({message: "Username or password not properly formatted"})
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

    try {

        const allUserRefs = await firestore.collection('users')

        const snapshot = await allUserRefs.where('email', '==', email).get();
           if(!snapshot.empty){
            return res.status(409).json({ message: "An account with that e-mail address already exists!" })
           }
        const userRef = await firestore.collection('users').doc(username).get();
        if (userRef.exists) {
            return res.status(409).json({ message: "Username already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await firestore.collection('users').doc(username).set({
            email: email,
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

app.post('/resetpassword', async (req,res)=>{

    //ATTENZIONE:invalidare il token quando è stato già usato
    var token = req.query.token;

    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }

    if(token.length<64){
        return res.status(401).json({message:"Unauthorized"})
    }

    try{
    tokenRef = await firestore.collection('resetTokens').doc(token).get();


    if(!tokenRef.exists){
        return res.status(401).json({message:"Unauthorized"})
    }
    else{
        //invalida qui il token. Come?
        usernameTrovato = tokenRef.data().username


        return res.status(200).json({message:"mi è arrivato il token per il reset di "+usernameTrovato})
    }
}

    catch(err){
        console.log(err)
        return res.status(500)
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
        var usernameTrovato = "blank"
        const allUserRefs = await firestore.collection('users')
        const snapshot = await allUserRefs.where('email', '==', email).get();
           if(!snapshot.empty){
               // la mail è stata trovata
               snapshot.forEach(doc => {
                 usernameTrovato = doc.id
              });

              //testato funziona

              let resetToken = crypto.randomBytes(32).toString("hex");
              try{
                await firestore.collection('resetTokens').doc(resetToken).set({
                    email: email,
                    username: usernameTrovato,
                    createdAt: new Date().getTime(),
                });

              }catch(err){
                  console.log(err)
              }
              

              console.log("##### ResetToken: "+resetToken);
              let url="http://localhost:8081/resetpassword?token="+resetToken

              let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: "progettosrs3@gmail.com",
                  pass: "Progettosrs3_",
                },
              });
              urlHtml='"'+url+'"'
              var html = "<h1>Password reset procedure</h1><p>Hello from SRS3! It looks like you requested to reset your password.</p><blockquote><p>Please follow this <a href="+urlHtml+">link</a> to complete the procedure.</p></blockquote><p>If the link does not work, copy and paste the following string in the URL bar of your browser.</p><h4>"+url+"</h4><p>You didn't ask to reset your password? E sti cazzi!</p>"
              console.log(html)
              let mailOptions = {
                from: 'progettosrs3@gmail.com',
                to: email,
                subject: 'Password reset',
                html: html,
              };
              
              transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err)
                  res.json(err);
                } else {
                    console.log(info)
                  res.json(info);
                }
              });
            
              return res.status(200).json({ message: resetToken})

              
              
            
           }

           //la mail non è stata trovata, in ogni caso inviamo lo stesso messaggio

           return res.status(200).json({ message: resetToken})
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
