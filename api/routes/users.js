const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const auth = require('../auth/authentification');
const config = require('../../config');

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                console.log(user)
                return res.status(409).json({
                    message: `${req.body.email} email already exists...`
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        });
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save()
                            .then(result => {
                                console.log(result);
                                res.status(201).json({
                                    response: res,
                                    message: `User w/ email ${result.email} created...`
                                });
                            })
                            .catch(err => {
                                res.status(500).json({
                                    message: 'User was not saved',
                                    error: err
                                });
                            });
                    }
                });
            }
        })
});

router.post('/login', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if(user.length < 1) {
                return res.status(401).json({
                    message: 'Auth failed'
                });
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed',
                        error: err
                    });
                }
                if (result) {
                    auth.sign({
                        email: user[0].email,
                        userId: user[0]._id
                    }, config.secretKey, res);
                }
            });
       })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
});

router.delete('/:userId', (req, res, next) => {
    User.remove({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: `User w/ ${req.params.id} deleted`
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});



router.post('/', auth.verifyToken, (req, res) => {
    auth.verify(req.token, config.secretKey, res);
});

// router.post('/login', (req, res) => {
//     const user = req.body;
//     console.log('USER', user);
//
//     // const user = {
//     //     id: 1,
//     //     username: 'likejean',
//     //     email: 'popachs@yahoo.com'
//     // }
//
// });

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>


module.exports = router;