const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const verifyAuth = require('../auth/authentification');
const Board = require('../models/board');
const Task = require('../models/task');
const auth = require('../auth/authentification');
const config = require('../../config');
const jwt = require('jsonwebtoken');

//Routers
router.get('/', (req, res, next) => {
    Board
        .find()
        .select('tasks title order name _id')
        .populate('tasks', '_id title location description board priority first last')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                boards: docs.map(doc => {
                    return {
                        _id: doc._id,
                        order: doc.order,
                        tasks: doc.tasks,
                        title: doc.title,
                        name: doc.name,
                        request: {
                            type: 'GET'
                        }
                    };
                })
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', auth.verifyToken, (req, res, next) => {
    jwt.verify(req.token, config.secretKey, (err, authData) => {
        if (err) {
            res.status(403).json({
                err
            });
        } else {
            const board = new Board({
                _id: mongoose.Types.ObjectId(),
                order: req.body.order,
                name: req.body.name,
                title: req.body.title,
                tasks: []
            });
            board.save()
                .then(result => {
                    res.status(201).json({
                        message: `Board "${result.title}" Was Created...`,
                        authData,
                        createdBoard: {
                            id: result._id,
                            order: result.order,
                            tasks: result.tasks,
                            title: result.title,
                            name: result.name
                        },
                        request: {
                            type: 'GET'
                        }
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        message: "Failed to create Board",
                        error: err
                    });
                });
        }
    });

});

router.patch('/', (req, res, next) => {
    const req_data = req.body;
    req_data.forEach(board => {
        Board.updateMany({_id: board.id}, {$set: {order: board.order}}, ((res, err) => {
            if (err) return err;
            else return console.log(res);
        }));
    });
    res.status(200).json({
        message: 'The board order has been reconfigured...'
    });
});


router.patch('/:taskId', (req, res, next) => {
    const id = req.params.taskId;
    console.log(req.body, id);
    Board.findOne({order: req.body.moveOutBoard}, (err, board) => {
        if (err) return next(err);
        if (!board) return next({
            message: "Board doesn't exist yet!"
        })
        else {
            for (let i = 0; i < board.tasks.length; i++) {
                if (board.tasks[i].toString() === id) {
                    board.tasks.splice(i, 1);
                }
            }
            board.save()
                .then(response => {
                    console.log(`Task ID ${id} removed from ${response.name} board.`);
                    Board.findOne({order: req.body.moveInBoard}, (err, board) => {
                        if (err) return next(err);
                        if (!board) return next({
                            message: "Board doesn't exist yet!"
                        })
                        else {
                            board.tasks.push(id);
                            board.save()
                                .then(() => {
                                    console.log(`Task ID ${id} saved in ${board.name} board.`);
                                    Task.updateOne({_id: id}, {
                                        $set: {
                                            board: board.name
                                        }
                                    })
                                        .exec()
                                        .then(result => {
                                            console.log(`Task ID ${id} updated w/ respect of ${board.name} board.`);
                                            res.status(200).json({
                                                movedTask: id,
                                                destinationBoard: board.title,
                                                message: `This task moved in and updated w/ respect of "${board.title}" board.`,
                                                request: {
                                                    type: 'PATCH'
                                                }
                                            });
                                        })
                                        .catch(() => {
                                                res.status(500).json({
                                                    error: `Task was not updated w/ new board name.`
                                                });
                                            }
                                        )
                                })
                                .catch(() => {
                                    res.status(500).json({
                                        error: `Task was not saved to ${board.name} board.`
                                    });
                                })
                        }
                    })
                })
                .catch(() => {
                    res.status(500).json({
                        error: `Task was not removed from ${board.name} board.`
                    });
                });
        }
    });
});


router.get('/:boardId', (req, res, next) => {
    const id = req.params.boardId;
    Board.findById(id)
        .populate('task')
        .exec()
        .then(board => {
            if (!board) {
                return res.status(404).json({
                    message: "Board not found!"
                })
            }
            ;
            res.status(200).json({
                board: {
                    _id: board.id,
                    order: board.order,
                    title: board.title,
                    name: board.name,
                    tasks: board.tasks
                },
                request: {
                    type: 'GET'
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

});

router.delete('/:boardId', auth.verifyToken, (req, res, next) => {
    jwt.verify(req.token, config.secretKey, (err, authData) => {
            if (err) {
                res.status(403).json({
                    err,
                    message: 'Your login session is expired! Sign in again to perform this action...'
                });
            } else {
                const id = req.params.boardId;
                const board_order = req.body;
                Board.deleteOne({_id: id})
                    .exec()
                    .then(() => {
                        board_order.forEach(board => {
                            Board.updateMany({_id: board.id}, {$set: {order: board.order}}, ((res, err) => {
                                if (err) return console.log(err);
                                else return console.log(res);
                            }));
                        });
                        res.status(200).json({
                            message: `Board "${id}" Was Deleted...`,
                            authData,
                            deletedBoard: id,
                            request: {
                                type: 'DELETE'
                            }
                        });
                    })
                    .catch(err => {
                        res.status(500).json({
                            error: err
                        });
                    });
            }
        }
    )
});


module.exports = router;