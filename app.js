const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// require database connection
const User = require("./db/userModel");
const dbConnect = require("./db/dbConnect");
const auth = require("./auth");

// execute database connection
dbConnect();

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    next();
});

// body parser configuration
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}))

app.get("/", (req, res, next) => {
    res.json({ message: "Hey! This is Authenticated App Server" });
    next();
});

app.post("/register", (request, response) => {
    // hash the  password
    bcrypt
    .hash(request.body.password, 10)
    .then((hashedPassword) => {
        // create a new user instance and collec the data
        const user = new User({
            email: request.body.email,
            password: hashedPassword,
        });
        // save the user
        user
            .save()
            // return success if the new user is added to the database successfully
            .then((result) => {
                response.status(201).send({
                    message: "User Created Successfully",
                    result,
                });
            });
    })
    // catch error if the password hash isnt successful
    .catch((error) => {
        response.status(500).send({
            message: "Password was not hashed successfully",
            error,
        });
    });
});

app.post("/login", (request, response) => {
    User.findOne({ email: request.body.email })
     // if email exists
    .then((user) => {
        // compare the password entered and the hashed password found
        bcrypt.compare(request.body.password, user.password)
        // if the passwords match
        .then((passwordCheck) => {
            // check if password matches
            if (!passwordCheck) {
                return response.status(400).send({
                    message: "Password does not match",
                    error,
                });
            }
            // create JWT token

            const token = jwt.sign(
                {
                    userId: user._id,
                    userEmail: user.email,
                },
                "RANDOM_TOKEN",
                { expiresIn: "24h" }
            );
            //   return success response
            response.status(200).send({
                message: "Login Successful",
                email: user.email,
                token,
            });

        })
        // catch error if password does not match
        .catch((error) => {
            response.status(400).send({
                message: "Password does not match",
                error,
            });
        });
    })
    // catch error if email does not exist
    .catch((error) => {
        response.status(500).send({
            message: "Email not found",
            error,
        });
    });
})


// free endpoint
app.get("/free", (req, res) => {
    res.json({ message: "You are free to access anytime" })
});


// authentication endpoint
app.get("/authenticated", auth, (req, res) => {
    res.json({ message: "You are authenticated now" })
});



module.exports = app;