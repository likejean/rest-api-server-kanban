const jwt = require('jsonwebtoken');

exports.verify = (token, secretKey, response) => jwt.verify(token, secretKey, (err, authData) => {
    if(err) {
        response.status(403).json({
            err
        });
    }else{
        response.json({
            message: 'Posted!',
            authData
        });
    }
});

//Generate Token
exports.sign = (user, secretKey, response) => jwt.sign({user}, secretKey, {expiresIn: '1h'},(err, token) => {
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