const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const conversationSchema = mongoose.Schema(
    {
        start_date: {
            type: Date,  
            default: Date.now()
        },
        conversation_title: {
            type: String,
        },
        topicid: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Topic',
            required: true,
        },
        userid: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
conversationSchema.plugin(toJSON);

/**
 * @typedef Conversation
 */
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
