require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    cpassword: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    tokens: [
        {
            token: {
                type: String,
                required: true,
            }
        }
    ]
});

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        try {
            this.password = await bcrypt.hash(this.password, 12);
            this.cpassword = await bcrypt.hash(this.cpassword, 12);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

//Genrate Auth Token
UserSchema.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, "WEBDEVELOPERASHISH48");
        console.log(token);
        this.tokens.push({ token: token });
        await this.save();
        return token;
    } catch (err) {
        console.log(err);
    }
}

module.exports = mongoose.model('User', UserSchema);