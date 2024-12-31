const Joi = require('joi');

const addCard = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const defaultCard = {
  body: Joi.object().keys({
    token: Joi.string().required(),
  }),
};

const deleteCard = {
  params: Joi.object().keys({
    token: Joi.string().required(),
  }),
};
module.exports = {
  addCard,
  defaultCard,
  deleteCard,
};
