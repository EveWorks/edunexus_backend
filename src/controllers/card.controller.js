const catchAsync = require('../utils/catchAsync');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { userService } = require('../services');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const addCard = catchAsync(async (req, res) => {
  const { token } = req.body;

  const userSubscription = await userService.getSubscriptionById(req.user._id);
  if (!userSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: userSubscription.stripeCustomerId,
    type: 'card',
  });

  const tokenDetails = await stripe.tokens.retrieve(token);

  const newCardFingerprint = tokenDetails.card.fingerprint;

  const cardExists = paymentMethods.data.some((method) => method.card.fingerprint === newCardFingerprint);
  if (cardExists) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Card is already been added');
  }
  const paymentMethod = await stripe.paymentMethods.attach(token, { customer: userSubscription.stripeCustomerId });

  if (paymentMethod) {
    res.status(200).send({
      message: 'Card added successfully',
      status: true,
    });
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong');
  }
});

const getCards = catchAsync(async (req, res) => {
  const userSubscription = await userService.getSubscriptionById(req.user._id);
  if (!userSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  const customer = await stripe.customers.retrieve(userSubscription.stripeCustomerId);

  const paymentMethods = await stripe.paymentMethods.list({
    customer: userSubscription.stripeCustomerId,
    type: 'card',
  });

  const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;

  const data = paymentMethods.data.map((method) => ({
    ...method,
    isDefault: method.id === defaultPaymentMethodId,
  }));
  res.status(httpStatus.OK).send({
    data,
  });
});

const setDefaultCard = catchAsync(async (req, res) => {
  const { token } = req.body;
  const userSubscription = await userService.getSubscriptionById(req.user._id);
  if (!userSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  await stripe.customers.update(userSubscription.stripeCustomerId, {
    invoice_settings: {
      default_payment_method: token,
    },
  });

  res.status(httpStatus.OK).send({
    message: 'Card updated successfully',
  });
});

const deleteCard = catchAsync(async (req, res) => {
  const { token } = req.params;
  const userSubscription = await userService.getSubscriptionById(req.user._id);
  if (!userSubscription) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Subscription not found');
  }

  const paymentMethods = await stripe.paymentMethods.list({
    customer: userSubscription.stripeCustomerId,
    type: 'card',
  });

  const card = paymentMethods.data.find((method) => method.id === token);

  if (!card) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Card not found');
  }

  await stripe.paymentMethods.detach(token);

  res.status(httpStatus.OK).send({
    message: 'Card deleted successfully',
  });
});

module.exports = {
  addCard,
  getCards,
  setDefaultCard,
  deleteCard,
};
