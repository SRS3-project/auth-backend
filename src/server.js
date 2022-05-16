var newRelic = require('newrelic')
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
const nodemailer = require("nodemailer");
const mg = require('nodemailer-mailgun-transport');






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


app.get('/', async (req,res) =>{
    try{
        newRelic.recordMetric('Custom/GetSlash', 4)
    }
    catch(err){
        console.log(err)
    }
    
    return res.status(404).json({message: "not found"})

})
app.post('/register', async (req, res) => {
    const { email, username, password } = req.body
    //TODO: check if they are valid

    if (!req.body) {
        return res.status(400).json({ message: "Username or password not properly formatted" })
    }

    if (!email) {
        return res.status(400).json({ message: "Email must not be blank" })
    }

    if (!validator.validate(email)) {
        return res.status(400).json({ message: "Not a valid email" })
    }

    if (!username || !password) {
        return res.status(400).json({ message: "Username or password not properly formatted" })
    }

    if (username.length == 0) {
        res.status(400)
            .json({ message: "Username or password not properly formatted" })
        return
    }

    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
    const regex = new RegExp(PWD_REGEX)

    if (!regex.test(password)) {
        res.status(400)
            .send({ message: "Username or password not properly formatted" })
        return
    }

    if (password.length < 8) {
        res.status(400)
            .send({ message: "Username or password not properly formatted" })
        return
    }
    if (password.length > 24) {
        res.status(400)
            .send({ message: "Username or password not properly formatted" })
        return
    }

    try {

        const allUserRefs = await firestore.collection('users')

        const snapshot = await allUserRefs.where('email', '==', email).get();
        if (!snapshot.empty) {
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
            emailConfirmed: false,
            createdAt: new Date().getTime(),
        });

        let confirmToken = crypto.randomBytes(32).toString("hex");

        try{

            await firestore.collection('confirmTokens').doc(confirmToken).set({
                email: email,
                username: username,
                alreadyUsed: false
            })

        }
        catch(err){
            res.status(500).json({message: "Error in registering, please try again"})
        }


        const maxAge = 3 * 60 * 60;
        const token = jsonwebtoken.sign(
            { username: username },
            process.env.JWT_SECRET,
            {
                expiresIn: maxAge, // 3hrs in sec
            }
        );

        let url = "http://localhost:8081/confirmemail?token=" + confirmToken

        let transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
              user: "progettosrs3@gmail.com",
              pass: "Progettosrs3_", // generated ethereal password
            },
          });
          
            urlHtml = '"' + url + '"'
            var html = "<h1>Confirm your e-mail</h1><p>Hello, "+username+"! Thank you for joining us</p><blockquote><p>Please follow this <a href=" + urlHtml + ">link</a> to confirm your e-mail address.</p></blockquote><p>If the link does not work, copy and paste the following string in the URL bar of your browser.</p><h4>" + url + "</h4><p>You didn't register? Please ignore this e-mail.</p>"
            let mailOptions = {
                from: 'progettosrs3@gmail.com',
                to: email,
                subject: 'E-mail confirmation procedure',
                html: html,
            };

            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err)
                } else {
                    console.log(info)
                }
            });

        return res.status(201)
            .cookie("X-AUTH-TOKEN", token, {
                httpOnly: true,
                maxAge: maxAge * 1000, // 3hrs in ms
            })
            .send({
                message: "User successfully created. Please check your e-mail inbox to confirm your e-mail",
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

app.put('/forgotpassword', async (req, res) => {
    if (!req.body) {
        
        res.status(400).json({ message: "Parameters are not valid" })
        return

    }
    if (!req.body.email) {
        res.status(400).json({ message: "Parameters are not valid" })
        return
    }
    const { newPassword, token } = req.body
    const email = req.body.email

    if (!validator.validate(email)) {
        return res.status(400).json({ message: "Parameters are not valid" })
    }

    if (!token || !newPassword) {
        res.status(400).json({ message: "Parameters are not valid" })
        return
    }

    const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;
    const regex = new RegExp(PWD_REGEX)

    if (!regex.test(newPassword)) {
        res.status(400)
            .send({ message: "Password not properly formatted" })
        return
    }


    var usernameTrovato = "blank"
    const allUserRefs = await firestore.collection('users')
    const snapshot = await allUserRefs.where('email', '==', email).get();
    if (!snapshot.empty) {
        // la mail è stata trovata
        snapshot.forEach(doc => {
            usernameTrovato = doc.id
        });
    }

    console.log("Username:" + usernameTrovato)

    var userRef = undefined
    try {
        userRef = await firestore.collection('users').doc(usernameTrovato).get();
        tokenRef = await firestore.collection('resetTokens').doc(token).get();

        if (!userRef.exists) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        if (!tokenRef.exists) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        else {
            var now = new Date().getTime()

            var oreScaduto = ((now - tokenRef.data().createdAt) / 36e5)
            console.log("Il token è stato creato " + oreScaduto + " ore fa")

            expired = false
            if (oreScaduto > 1) {
                expired = true
            }

            var alreadyUsed = tokenRef.data().alreadyUsed

            if (alreadyUsed) {
                res.status(400).json({ message: "The reset token has already been used" })
                return
            }

            if (expired) {
                res.status(400).json({ message: "The reset token has expired" })
                return
            }

            if (!userRef.exists) {
                res.status(400)
                    .json({ message: "Parameters are not valid" })
                    return
            }

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(newPassword, salt);
            firestore.collection('users').doc(usernameTrovato).update({ password: passwordHash })
            firestore.collection('resetTokens').doc(token).update({ alreadyUsed: true })

            res.send(201).json({ message: "Password updated successfully" })
            return

        }


    }
    catch (err) {
        console.log(err)
        res.status(500)
        return
    }






})

app.get('/confirmemail', async (req, res) => {

    //ATTENZIONE:invalidare il token quando è stato già usato
    var token = req.body.token;


    if (!token) {
        return res.status(401).json({ message: "Unauthorized. No token in request" })
    }

    if (token.length < 64) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        tokenRef = await firestore.collection('confirmTokens').doc(token).get();


        if (!tokenRef.exists) {
            return res.status(401).json({ message: "Unauthorized. The token does not exist in our database" })
        }
        else {
            //invalida qui il token. Come?
            usernameTrovato = tokenRef.data().username
            alreadyUsed = tokenRef.data().alreadyUsed;
            if (alreadyUsed == true || alreadyUsed == undefined) {

                return res.status(401).json({ message: "Your e-mail has already been confirmed" })
            }

            try{
                firestore.collection('users').doc(usernameTrovato).update({emailConfirmed:true});
                firestore.collection('confirmTokens').doc(token).update({alreadyUsed: true})

            }
            catch(err){
                console.log(err)
                res.status(500).json({message: "Error in confirming the e-mail address, please try again later"})
                return
            }
            
            

            return res.status(200).json({ message: "Ho confermato la registrazione di " + usernameTrovato })
        }
    }

    catch (err) {
        console.log(err)
        return res.status(500)
    }



})



app.post('/resetpassword', async (req, res) => {

    //ATTENZIONE:invalidare il token quando è stato già usato
    var token = req.query.token;


    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    if (token.length < 64) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        tokenRef = await firestore.collection('resetTokens').doc(token).get();


        if (!tokenRef.exists) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        else {
            //invalida qui il token. Come?
            usernameTrovato = tokenRef.data().username
            alreadyUsed = tokenRef.data().alreadyUsed;
            if (alreadyUsed == true || alreadyUsed == undefined) {

                return res.status(401).json({ message: "Invalid token" })
            }


            return res.status(200).json({ message: "mi è arrivato il token per il reset di " + usernameTrovato })
        }
    }

    catch (err) {
        console.log(err)
        return res.status(500)
    }



})

app.post('/forgotpassword', async (req, res) => {

    if (!req.body) {
        res.status(400).json({ message: "E-mail field must not be blank" })
        return
    }

    const { email } = req.body;
    console.log("EMAIL: " + email)
    if (email == undefined) {
        res.status(400).json({ message: "E-mail field must not be blank" })
        return

    }
    if (email == "") {
        res.status(400).json({ message: "E-mail field must not be blank" })
        return
    }


    if (!validator.validate(email)) {
        res.status(400).json({ message: "Not a valid e-mail address" })
        return

    }

    try {
        var usernameTrovato = "blank"
        const allUserRefs = await firestore.collection('users')
        const snapshot = await allUserRefs.where('email', '==', email).get();
        if (!snapshot.empty) {
            // la mail è stata trovata
            snapshot.forEach(doc => {
                usernameTrovato = doc.id
            });
            console.log("Username:" + usernameTrovato)

            //testato funziona

            let resetToken = crypto.randomBytes(32).toString("hex");
            try {
                await firestore.collection('resetTokens').doc(resetToken).set({
                    email: email,
                    username: usernameTrovato,
                    createdAt: new Date().getTime(),
                    alreadyUsed: false
                });

            } catch (err) {
                console.log(err)
            }


            console.log("##### ResetToken: " + resetToken);
            let url = "http://localhost:8081/resetpassword?token=" + resetToken

            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                  user: "progettosrs3@gmail.com",
                  pass: "Progettosrs3_",
                },
              });
            urlHtml = '"' + url + '"'
            var html = "<h1>Password reset procedure</h1><p>Hello from SRS3! It looks like you requested to reset your password.</p><blockquote><p>Please follow this <a href=" + urlHtml + ">link</a> to complete the procedure.</p></blockquote><p>If the link does not work, copy and paste the following string in the URL bar of your browser.</p><h4>" + url + "</h4><p>You didn't ask to reset your password? Please ignore this e-mail, your password will remain unchanged.</p>"
            let mailOptions = {
                from: 'progettosrs3@gmail.com',
                to: email,
                subject: 'Password reset',
                html: html,
            };

            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.log(err)
                } else {           }
            });

            return res.status(200).json({ message: "If that e-mail is in our database, we will send a link to reset your password" })


        }

        //la mail non è stata trovata, in ogni caso inviamo lo stesso messaggio
    }
    catch (err) {
        console.log("------ERRORE FORGOT PASSWORD-----")
        console.log(email)
        console.log(err)
        res.status(500).json({ message: "Errore del server" })
        return

    }

})

app.post('/login', async (req, res) => {

    if (!req.body) {

        return res.status(400)
            .json({
                message: "Login failed: invalid username or password"
            })
    }
    const { username, password } = req.body;

    if (username == "" || password == "") {
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

    try {
        const userRef = await firestore.collection('users').doc(username).get();
        if (!userRef.exists) {
            return res.status(401)
                .json({
                    message: "Login failed: invalid username or password"
                });
        }

        const user = userRef.data();

        if(!user.emailConfirmed){
            return res.status(401).json({message: "You account has not been confirmed yet, please check your e-mail inbox"})
        }
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
