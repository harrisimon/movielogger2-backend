////////////////////IMPORTS//////////////////
const mongoose = require('mongoose')
const User = require('./user')
const commentSchema = require('./comment')

const {Schema, model} = mongoose

const LogSchema = new mongoose.Schema({
    //change to user thoughts / review
    userThoughts : {
        type:String,
        required: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: false
    },
    imdbId : {
        type: String,
        required: true
    },
    movieTitle: {
        type: String,
        required: true
    },
    releaseYear: {
        type: String,
        required: true
    },
    poster: {
        type:String,
        required: true
    },
    director: {
        type:[String],
        required: true
    },
    plot: {
        type:String,
        required: false
    },
    genre: {
        type:[String],
        required: true
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    comments: [commentSchema]
}, {timestamps: true,
    toObject: { virtuals: true },
})


module.exports = mongoose.model('Log',LogSchema)