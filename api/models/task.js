const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    title: { type: String, required: true },
    location: { type: String, required: true },
    board: { type: String, required: true },
    description: { type: String, required: true },
    priority: { type: Boolean, required: true },
    first: { type: String, required: true },
    last: { type: String, required: true }
});

module.exports = mongoose.model('Task', taskSchema);