const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) =>{
    const token = req.get('x-auth-token');
    if(!token) return res.status(401).send("acess denailed: no token was provided");

    try{
        req.user = await jwt.verify(token, "secretpassword");
        next();
    }catch(ex){
        res.status(400).send("invalid token");
    }
}