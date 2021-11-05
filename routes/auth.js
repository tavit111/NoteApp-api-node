const express = require('express');
const router = express.Router();
const _ = require('lodash');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const {User} = require("../models/user");

// add: hashing passwords and config
router.post('/', async (req, res)=>{
    const {error} = validateAuth(req.body);
    if(error) return res.status(400).send(error.details[0].message);
    
    const user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send("wrong email or password");

    const compare = await bcrypt.compare(req.body.password, user.password);
    if(!compare) return res.status(400).send("wrong email or password");
    
    const responce = await user.genereateJwt();
    res.send(responce);
});

function validateAuth(login){
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().min(5).required(),
    });
    return schema.validate(login);
}

module.exports = router;
