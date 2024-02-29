const jwt = require("jsonwebtoken");

module.exports = async (req, res, next) => {
    try {
        //   get the token from the authorization header
        const token = await req.headers.authorization.split(" ")[1];
        
        // console.log("Token", token)
        //check if the token matches the supposed origin
        const decodedToken = jwt.verify(token, "RANDOM_TOKEN");

        // console.log("decodedToken", decodedToken)
        // retrive the user details of the logged in user
        const user = decodedToken;

        // console.log("user", user)
        // pass the user down to the endpoints here
        request.user = user;

        console.log("request.user", request.user)
        // pass down functionality to the endpoint
        next();
    } catch (error) {
        res.status(401).json({
            message:"Error",
            error: new Error("Invalid request!"),
        });
    }
}