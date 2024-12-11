const mongoose = require('mongoose');

const personalizationSchema = mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: 'users',
  },
  conversationId: {
    type: mongoose.Types.ObjectId,
    ref: 'conversations',
  },
  interests: {
    type: Array,
    default: [],
  },
  wants_to_learn: {
    type: Array,
    default: [],
  },
  previous_progress: {
    type: Array,
    default: [],
  },
});

const PersonalizationModel = mongoose.model('Personalization', personalizationSchema);
module.exports = PersonalizationModel;
