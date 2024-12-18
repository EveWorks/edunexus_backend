const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const messageSchema = mongoose.Schema(
  {
    conversationid: {
      type: mongoose.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    userid: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    summary: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: '',
    },
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
