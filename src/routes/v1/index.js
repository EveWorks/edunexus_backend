const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const topicRoute = require('./topic.route')
const conversationRoute = require('./conversation.route')
const docsRoute = require('./docs.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/topic',
    route: topicRoute,
  },
  {
    path: '/conversation',
    route: conversationRoute,
  },
  // {
  //   path: '/plans',
  //   route: ''
  // }
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;
