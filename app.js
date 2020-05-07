const express = require('express')
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const taskRoutes = require('./api/routes/tasks');
const boardRoutes = require('./api/routes/boards');
const userRoutes = require('./api/routes/users');

//Establish DB connection
mongoose.connect(
    'mongodb+srv://likejean:vfr_10_bgt@kanban-xh941.mongodb.net/test?retryWrites=true&w=majority',
    {useNewUrlParser: true, useUnifiedTopology: true}
).then(connect => console.log('connected to mongodb..'))
    .catch(e => console.log('could not connect to mongodb', e));


app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//CORS settings
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'DELETE, GET, PATCH, POST, PUT',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Method', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    };
    next();
});

app.use('/tasks', taskRoutes);
app.use('/boards', boardRoutes);
app.use('/users', userRoutes);


//Handles the server errors with routes

app.use((req, res, next) => {
    const err = new Error('Data not found');
    err.status = 404;
    next(err);
});

//Handles any possible error that wasn't be caught before...
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message
        }
    });
});

module.exports = app;
