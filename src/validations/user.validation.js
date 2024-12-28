const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object()
    .keys({
      firstname: Joi.string().required(),
      lastname: Joi.string().required(),
      age: Joi.number().min(16).required(),
      gender: Joi.string().valid('male', 'female').required(),
      university: Joi.string().required(),
      degree: Joi.string().required(),
      year: Joi.number().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      country: Joi.string().optional(),
    })
    .optional(),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    device_id: Joi.string().optional(),
    device_type: Joi.string().optional(),
    device_token: Joi.string().optional(),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    name: Joi.string(),
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().email(),
      password: Joi.string().custom(password),
      name: Joi.string(),
    })
    .unknown()
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  login,
};
