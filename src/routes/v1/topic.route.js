const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const topicValidation = require('../../validations/topic.validation');
const topicController = require('../../controllers/topic.controller');

const router = express.Router();



router.post('/createtopic', validate(topicValidation.createtopic), topicController.createTopic);

router.get('/gettopic',auth(), validate(topicValidation.getTopics), topicController.getTopics);


module.exports = router;
