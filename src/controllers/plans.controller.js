const httpStatus = require('http-status');
const SubscriptionPlans = require('../models/subscriptionPlans.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const planList = async (req, res) => {
    try {
        const planList = await SubscriptionPlans.find().lean()
        return res.status(httpStatus[200]).json({
            "status": true,
            "message": "Operation executed successfully",
            "data": planList
        })
    } catch (error) {
        return res.status(httpStatus[500]).json({
            "status": false,
            "message": error?.message,
        })
    }
}

const createPlan = async (req, res) => {
    try {
        const params = req?.body;
        if (params?.secret !== "ALINDA") {
            return res.status(httpStatus[400]).json({
                "status": false,
                "message": "Invalid request."
            })
        }
        const product = await stripe.products.create({
            name: 'Pro Plan',
            description: "Pro plan with Monthly Access, Unlimited Usage, Hyper-personalized experience, No Limits",
        });
        const price = await stripe.prices.create({
            product: product.id,
            unit_amount: 5.99,
            currency: 'eur',
            recurring: {
                interval: 'month',
                trial_period_days: 7,
                usage_type: 'licensed',
                interval_count: 1
            }
        })
        return res.status(httpStatus[200]).json({
            "status": true,
            "message": "Plan added successfully",
            "data": {}
        })
    } catch (error) {
        return res.status(httpStatus[500]).json({
            "status": false,
            "message": error?.message,
        })
    }
}

const subscribePlan = async (req, res) => {
    try {
        const params = req?.body;
        if (!params?.planId || !params?.userId) {
            return res.status(httpStatus[400]).json({
                "status": false,
                "message": "Invalid request."
            })
        }

    } catch (error) {
        return res.status(httpStatus[500]).json({
            "status": false,
            "message": error?.message,
        })
    }
}


module.exports = {
    planList,
    createPlan,
    subscribePlan
}