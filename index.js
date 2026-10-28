const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Check that the session holds a valid JWT access token
    if (req.session && req.session.authorization) {
        const token = req.session.authorization['accessToken'];
        try {
            const user = jwt.verify(token, "access");
            req.user = user.data;
            return next();
        } catch (err) {
            return res.status(403).json({message: "User not authenticated"});
        }
    }
    return res.status(403).json({message: "User not logged in"});
});

const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
