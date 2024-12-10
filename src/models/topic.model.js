const mongoose = require('mongoose');
const { toJSON } = require('./plugins');
const paginate = require('../middlewares/paginate');
const topicSchema = mongoose.Schema(
    {
        topic_name: {
            type: String,
          },
    },
    {
        timestamps: true,
    }
);

// add plugin that converts mongoose to json
topicSchema.plugin(toJSON);

/**
 * @typedef Topic
 */
const Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;
