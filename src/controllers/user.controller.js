const bcrypt = require('bcrypt');
const httpStatus = require('http-status');
const moment = require('moment');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, emailService } = require('../services');
const tokenService = require('../services/token.service');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const SubscriptionPlans = require('../models/subscriptionPlans.model');
const config = require('../config/config');
const { tokenTypes } = require('../config/tokens');

// write a function to generate a random otp of 6 digits
const getOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

const createUser = catchAsync(async (req, res) => {
  // const { device_id, device_type, device_token, ...userData } = req.body;
  req.body.verificationCode = getOTP();
  req.body.isEmailVerified = false;
  const user = await userService.createUser(req.body);
  // const tokens = await tokenService.generateAuthTokens(user, device_id, device_type, device_token);

  // const customer = await stripe.customers.create({
  //   email: user.email,
  //   metadata: {
  //     userId: user._id.toString(),
  //   },
  // });
  // const price = await stripe.prices.list({
  //   limit: 1,
  // });
  // const subscription = await stripe.subscriptions.create({
  //   customer: customer.id,
  //   items: [{ price: price?.data[0]?.id }],
  //   trial_period_days: 7,
  //   payment_behavior: 'default_incomplete',
  // });
  // const userSubscription = await SubscriptionPlans.create({
  //   userId: user?._id,
  //   stripeCustomerId: customer?.id,
  //   subscriptionId: subscription?.id,
  //   subscriptionStatus: subscription?.status,
  //   trialEndsAt: new Date(subscription.trial_end * 1000),
  // });
  try {
    await emailService.sendVerificationEmail(user.email, user.verificationCode);
  } catch (error) {
    console.log('Error sending email', error);
  }
  if (user.verificationCode) {
    delete user.verificationCode;
  }
  res.status(httpStatus.CREATED).send({
    user,
    // subscription: userSubscription,
    // tokens,
  });
});

const loginUser = catchAsync(async (req, res) => {
  const { email, password, device_id, device_type, device_token } = req.body;

  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }

  const jwtToken = await tokenService.checkToken({ device_id, device_type, device_token }, user._id);
  // const tokens = await tokenService.generateAuthTokens(user, device_id, device_type, device_token);

  res.status(httpStatus.OK).send({
    user,
    tokens: jwtToken,
  });
});

const getuserprofile = catchAsync(async (req, res) => {
  const { id } = req.user;

  const user = await userService.getUserById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.status(httpStatus.OK).send({
    id,
    user,
  });
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyOTP = catchAsync(async (req, res) => {
  const verifiedUser = await userService.verifyOTP(req.body);
  const accessTokenExpires = moment().add(config.jwt.accessExpirationMinutes, 'minutes');

  const token = await tokenService.generateToken(verifiedUser.id, accessTokenExpires, tokenTypes.ACCESS);
  await userService.updateUserById(verifiedUser.id, { verificationCode: null, isEmailVerified: true });
  const subscription = await userService.getSubscriptionById(verifiedUser.id);

  res.status(httpStatus.OK).send({ user: verifiedUser, token, subscription });
});

const addSubscriptionPlan = catchAsync(async (req, res) => {
  const { userId, stripeCustomerId, subscriptionId, stripeSessionId, subscriptionType } = req.body;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const userSubscription = await SubscriptionPlans.create({
    userId,
    stripeCustomerId,
    subscriptionId,
    startDate: moment.unix(subscription.created).toISOString(),
    renewDate: moment.unix(subscription.current_period_end).toISOString(),
    trialEnd: moment.unix(subscription.trial_end).toISOString(),
    subscriptionType,
    stripeSessionId,
  });
  res.status(httpStatus.CREATED).send({ data: userSubscription });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  loginUser,
  getuserprofile,
  verifyOTP,
  addSubscriptionPlan,
};
