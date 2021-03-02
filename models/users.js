const { Schema, model } = require('mongoose');

const UserSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    complitedGame: {
        memory: { type: Number },
        simon: { type: Number },
        tetris: { type: Number },
        tic_tac_toe: { type: Number },
        hangman: { type: Number },
        gem_puzzle: { type: Number },
        snake: { type: Number },
        guess_a_number: { type: Number },
    },
});

module.exports = model('User', UserSchema);
