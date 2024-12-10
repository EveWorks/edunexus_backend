const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const conversationValidation = require('../../validations/conversation.validation');
const conversationController = require('../../controllers/conversation.controller');

const router = express.Router();

router.post('/sendmessage', auth(), validate(conversationValidation.sendmessage), conversationController.sendmessage);

router.get('/list_conversation', auth(), conversationController.list_conversation);

router.get('/get_conversation', auth(), conversationController.get_conversation);

router.get('/get_allmessage', auth(), conversationController.get_allmessage);

router.post('/new_conversation', auth(), conversationController.createConversation);

router.delete('/remove_conversation/:id', auth(), conversationController.removeConversation);

module.exports = router;
