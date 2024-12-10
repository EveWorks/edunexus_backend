const jwt = require('jsonwebtoken');
const moment = require('moment');
const httpStatus = require('http-status');
const config = require('../config/config');
const userService = require('./user.service');
const { Token } = require('../models');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {ObjectId} userId
 * @param {string} device_id
 * @param {string} device_type
 * @param {string} device_token
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (userId, device_id, device_type, device_token, expires, type, blacklisted = false) => {
  const tokenDoc = await Token.create({
    user: userId,
    device_id,
    device_type,
    device_token,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  const tokenDoc = await Token.findOne({ token, type, user: payload.sub, blacklisted: false });
  if (!tokenDoc) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Token not found or blacklisted');
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @param {string} device_id
 * @param {string} device_type
 * @param {string} device_token
 * @returns {Promise<Object>}
 */
const generateAuthTokens = async (user, device_id, device_type, device_token) => {
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');
  const accessToken = generateToken(user.id, accessTokenExpires, tokenTypes.ACCESS);

  const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days');
  const refreshToken = generateToken(user.id, refreshTokenExpires, tokenTypes.REFRESH);

  // Save the refresh token in the database with the device information
  await saveToken(user.id, device_id, device_type, device_token, refreshTokenExpires, tokenTypes.REFRESH);

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async (email) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found with this email');
  }
  const expires = moment().add(config.jwt.resetPasswordExpirationMinutes, 'minutes');
  const resetPasswordToken = generateToken(user.id, expires, tokenTypes.RESET_PASSWORD);
  
  // Save the reset password token with the user's details (no device information needed here)
  await saveToken(user.id, null, null, resetPasswordToken, expires, tokenTypes.RESET_PASSWORD);
  
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(config.jwt.verifyEmailExpirationMinutes, 'minutes');
  const verifyEmailToken = generateToken(user.id, expires, tokenTypes.VERIFY_EMAIL);
  
  // Save the verify email token with the user's details (no device information needed here)
  await saveToken(user.id, null, null, verifyEmailToken, expires, tokenTypes.VERIFY_EMAIL);
  
  return verifyEmailToken;
};



/**
 * Check if the token already exists and generate a new one if necessary
 * @param {Object} data - The device data
 * @param {string} user_id - The user ID
 * @returns {Promise<string>} - The JWT token
 */
const checkToken = async (data, user_id) => {
  const tokenData = {
    user: user_id,  
    device_id: data.device_id,
    device_token: data.device_token,
    device_type: data.device_type
  };

  let token = await Token.findOne(tokenData);

  if (token) {
    await token.remove(); 
  }


  const expires = moment().add(1, 'hour'); 
  const newToken = await Token.create({
    ...tokenData,
    expires: expires.toDate(),
  });
  const jwtToken = generateToken(user_id, expires, 'access', process.env.JWT_SECRET_KEY);

  return jwtToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  checkToken
};
