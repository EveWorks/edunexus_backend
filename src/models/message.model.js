const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const messageSchema = mongoose.Schema(
    {
        message: {
            type: String,  
        },
        message_type: {
            type: String,  
        },
        conversationid: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'Conversation',
            required: true,
        },
        userid: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: 'User',
            required: true,
        },
        role: {
            type: String,
            default: "user"
        }
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
messageSchema.plugin(toJSON);

/**
 * @typedef Message
 */
const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
