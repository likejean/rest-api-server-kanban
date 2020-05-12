const jwt = require('jsonwebtoken');


//Generate Token
exports.sign = (user, secretKey, response) => jwt.sign({user}, secretKey, {expiresIn: '300s'},(err, token) => {
    console.log('TOKEN:', token);
    response.json({
        message: "Authentication is successful!",
        token
    })
});

// Verify Token
exports.verifyToken = (req, res, next) => {
    //Get auth header value
    const bearerHeader = req.headers['authorization'];
    //Check if bearer is undefined
    if (typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(' ');
        req.token = bearer[1];
        next();
    } else {
        //Forbidden
        res.sendStatus(403).json({
            message: 'Forbidden',
            description: 'You do not have permission to perform this operation'
        });
    }
}