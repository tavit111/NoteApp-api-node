const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const {User, validateUser} = require("../models/user");


router.post('/', async (req, res)=>{
    const {error} = validateUser(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if(user) return res.status(400).send("email aready registered");
    
    const hashed = await bcrypt.hash(req.body.password, 10);

    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashed,
    });
    
    await user.save();
    
    const token = await user.genereateJwt();
    const userProperties = _.pick(user, ['_id', 'name', 'email']);
    res.header('x-auth-token', token).send(userProperties);
});


module.exports = router;