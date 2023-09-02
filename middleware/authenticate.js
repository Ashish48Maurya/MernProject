require('dotenv').config();
const jwt = require('jsonwebtoken');
const user = require('../models/User');

const Authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.jwtoken;
        const verifyToken = jwt.verify(token, "Ashish");
        const rootUser = await user.findOne({ _id: verifyToken._id, "tokens.token": token })
        if (!rootUser) { throw new Error("User Not Found") }
        console.log(rootUser)

        req.token = token;
        req.rootUser = rootUser;
        req.UserId = rootUser._id;

        next();
    }
    catch (err) {
        console.log(err);
        res.status(401).send('User Not Found');
    }
}

module.exports = Authenticate;

