const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


const createtopic = {
  body: Joi.object().keys({
    topic_name: Joi.string().required(),
  }),
};



const getTopics = {
    query: Joi.object().keys({
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
  };

module.exports = {
    createtopic,
    getTopics
};
