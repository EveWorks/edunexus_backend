const Joi = require('joi');
const { password, objectId } = require('./custom.validation');


const sendmessage = {
  body: Joi.object().keys({
    message: Joi.string().required(),
    message_type: Joi.string().required(),
    topicid: Joi.string().required(),
    userid: Joi.string().required(),
  }).unknown(),
};


module.exports = {
  sendmessage,
};
