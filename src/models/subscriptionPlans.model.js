const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const subscriptionPlans = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'users',
    },
    stripeCustomerId: {
      type: String,
    },
    subscriptionId: {
      type: String,
    },
    startDate: {
      type: Date,
    },
    renewDate: {
      type: Date,
    },
    trialEnd: {
      type: Date,
    },
    subscriptionType: {
      type: String,
      enum: ['FREE', 'PAID'],
    },
    stripeSessionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionPlans.plugin(toJSON);

const SubscriptionPlans = mongoose.model('SubscriptionPlan', subscriptionPlans);
module.exports = SubscriptionPlans;
