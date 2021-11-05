const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        require: true,
        max: 60,
        min: 3,
    },
    email: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        require: true,
        min: 5,
        max: 100,
    }
});
userSchema.methods.genereateJwt = function(){
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
        },
        "secretpassword");
}

const User = mongoose.model("User", userSchema);


const validateUser = user=>{
    const schema = Joi.object({
        name: Joi.string().min(3).max(60).required(),
        email: Joi.string().required(),
        password: Joi.string().min(5).max(100).required(),
    });
    return schema.validate(user);
}

module.exports = {
    User,
    validateUser,
}