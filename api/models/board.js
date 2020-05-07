const mongoose = require('mongoose');

const boardSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    tasks: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            required: true
        }
    ],
    name: {type: String, required: true},
    title: {type: String, required: true},
    order: {type: Number, required: true}
});

module.exports = mongoose.model('Board', boardSchema);