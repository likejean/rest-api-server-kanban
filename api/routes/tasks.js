const express = require('express');
const router = express.Router();
const Task = require('../models/task');
const mongoose = require('mongoose');
const Board = require('../models/board');

router.get('/', (req, res, next) => {
    Task.find()
        .select('title description first last board location priority _id')
        .exec()
        .then(docs => {
            const response = {
                count: docs.length,
                items: docs.map(doc => {
                    return {
                        id: doc._id,
                        task_title: doc.title,
                        task_description: doc.description,
                        task_priority: doc.priority,
                        location: doc.location,
                        board: doc.board,
                        last: doc.last,
                        first: doc.first,
                        request: {
                            method: 'GET'
                        }
                    };
                })
            };
            if (docs.length >= 1) {
                res.status(200).json(response);
            } else {
                res.status(404).json({
                    message: 'Empty database. No entries FOUND!'
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});

router.post('/', (req, res, next) => {
    const task = new Task({
        _id: new mongoose.Types.ObjectId(),
        title: req.body.task_title,
        location: req.body.location,
        description: req.body.task_description,
        priority: req.body.task_priority,
        board: req.body.board,
        first: req.body.first,
        last: req.body.last
    });
    task.save()
        .then(result => {
            Board.findOne({name: req.body.board}, (err, board) => {
                if (err) return next(err);
                if (!board) return next({
                    message: "Board doesn't exist yet!"
                })
                else {
                    board.tasks.push(task._id);
                    board.save()
                        .then(() => console.log(`Task ${task.title} added to ${board.name} board`))
                        .catch(() => {
                            res.status(500).json({
                                error: "Task was not saved to board"
                            });
                        });
                }
            });
            res.status(201).json({
                message: "Handling POST request to /tasks",
                createdTask: result
            });
        })
        .catch(err => {
                res.status(500).json({
                    error: err
                });
            }
        );
});


router.get('/:taskId', (req, res, next) => {
    const id = req.params.taskId;
    Task.findById(id)
        .exec()
        .then(doc => {
            //To handle non-existing id error, but correct format...
            if (doc) {
                return res.status(200).json(doc);
            } else {
                return res.status(404).json({
                    message: 'No VALID ENTRY'
                });
            }
        })
        .catch(err => {
            console.log(err);
            // //To handle INVALID format id error...
            res.status(500).json({
                error: err
            });
        });
});

router.patch('/:taskId', (req, res, next) => {
    const id = req.params.taskId;
    Task.updateOne({_id: id}, {
        $set: {
            title: req.body.task_title,
            description: req.body.task_description,
            priority: req.body.task_priority,
            last: req.body.last,
            first: req.body.first
        }
    })
        .exec()
        .then(result => {
            console.log('patch_result', result);
            res.status(200).json({
                message: `Task w/ id: '${id}' was Updated.`,
                request: {
                    type: 'PATCH'
                },
                result: result,
                updatedTask: {
                    id: id,
                    task_title: req.body.task_title,
                    board: req.body.board,
                    task_description: req.body.task_description,
                    task_priority: req.body.task_priority,
                    last: req.body.last,
                    first: req.body.first
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
});

router.delete('/:taskId', (req, res, next) => {
    const id = req.params.taskId;
    Task.deleteOne({_id: id})
        .exec()
        .then(result => {
            console.log(`DELETED TASK w/ id: '${id}'`);
            Board.findOne({name: req.body.board}, (err, board) => {
                if (err) return next(err);
                if (!board) return next({
                    message: "Board doesn't exist yet!"
                })
                else {
                    for (let i = 0; i < board.tasks.length; i++) {
                        if (board.tasks[i].toString() === id) {
                            board.tasks.splice(i, 1);
                            break;
                        }
                    };
                    board.save()
                        .then(() => {
                            console.log(`Task /w id: '${id}' removed from '${board.name}' board`)
                        })
                        .catch(() => {
                            res.status(500).json({
                                error: "Task was not saved to board"
                            });
                        });
                }
            });
            res.status(200).json({
                message: `Task w/ id: '${id}' Deleted`,
                deletedTask: {
                    result: result,
                    id: id,
                    board_name: req.body.board
                }
            });
        })
        .catch(err => {
            res.status(500).json({
                error: err
            });
        });
});


module.exports = router;