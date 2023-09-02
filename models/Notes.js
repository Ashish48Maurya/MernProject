const mongoose = require('mongoose');

const NotesSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    title: {
        required: true,
        type: String,
    },
    decs: {
        required: true,
        type: String,
    },
    date: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('Note', NotesSchema);
