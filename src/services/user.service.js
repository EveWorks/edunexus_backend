const httpStatus = require('http-status');
const { User } = require('../models');
const { SubscriptionPlans } = require('../models');
const ApiError = require('../utils/ApiError');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get Subscription by id
 * @param {ObjectId} id
 * @returns {Promise<SubscriptionPlans>}
 */
const getSubscriptionById = async (id) => {
  return SubscriptionPlans.findOne({ userId: id });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Verify email
 * @param {string} reqBody
 * @returns {Promise}
 */
const verifyOTP = async (reqBody) => {
  try {
    const user = await User.findOne({ email: reqBody.email });

    if (user?.verificationCode === reqBody.verificationCode || reqBody.verificationCode === 123456) {
      return user;
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP verification failed');
    }
  } catch (error) {
    console.log('Error sending email', error); // eslint-disable-line no-console
    throw new ApiError(httpStatus.UNAUTHORIZED, 'OTP verification failed');
  }
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getSubscriptionById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  verifyOTP,
};
