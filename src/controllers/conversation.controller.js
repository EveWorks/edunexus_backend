const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { conversationService } = require('../services');
const { User, Message } = require('../models');
const callAIService = require('../services/ai.service');
const { Conversation } = require('../models')


const sendmessage = catchAsync(async (req, res) => {

    const { topicid, userid, message, message_type, interests, conversation_id } = req.body;

    let conversation = await conversationService.getconversationById(conversation_id);
    const userData = await User.findById(userid).lean()

    if (!conversation) {
        // If no conversation exists, create a new one
        conversation = await conversationService.createConversation({
            start_date: new Date(),
            topicid,
            userid,
        });
    }
    const conversationMessages = await Message.find({
      userid: userid,
      conversationid: conversation?._id
    }).select({role: 1, "content": "$message", _id: 0, "type": "$message_type"}).lean()

    let aiResponse = await callAIService(userData, conversationMessages, message, interests)

    const newMessage = await conversationService.createMessage({
        message,
        message_type: message_type,
        conversationid: conversation._id,
        userid,
        role: "user"
    });

    const aiMessage = aiResponse;  

    const newAiMessage = await conversationService.createMessage({
        message: aiMessage?.messageObject?.content,
        message_type: aiMessage?.messageObject.type, 
        conversationid: conversation._id,
        userid,
        role: "assistant"
    });

    const allMessages = await Message.find({
      userid: userid,
      conversationid: conversation?._id
    }).lean()

    res.status(httpStatus.CREATED).send({
        // conversation: conversation,
        // message: newMessage,
        // AiResponse:newAiMessage,
        // messages: allMessages,
        aiResponse 
    });
});


const list_conversation = catchAsync (async(req,res)=>{
    const {id} = req.user;
    const data = await conversationService.listConversationsByUser(id);
    if (!data) {
      throw new ApiError(httpStatus.NOT_FOUND, 'conversation not found');
    }
    res.status(httpStatus.OK).send({
      data
    });
})

const get_conversation = catchAsync(async (req, res) => {
    const {conversation_id} = req.query;
    const data = await conversationService.getconversationById(conversation_id);
    if (!data) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
    }
    res.status(httpStatus.CREATED).send({
        data
    });
  });

const get_allmessage = catchAsync(async (req, res) => {
    const {conversation_id} = req.query;
    const options = {
      limit: parseInt(req.query.limit, 10) || 10, // Default to 10 if 'limit' is not provided
      page: parseInt(req.query.page, 10) || 1    // Default to 1 if 'page' is not provided
    };
    const data = await conversationService.getAllMessages(conversation_id,options);
    
    if (!data) {
      throw new ApiError(httpStatus.NOT_FOUND, 'messages are not found.');
    }
    res.status(httpStatus.CREATED).send({
        data
    });
  });

const createConversation = catchAsync(async (req, res) => {
  const params = req?.body;
  const conversation_obj = {
    conversation_title: params?.conversation_title,
    topicid: params?.topicid,
    userid: params?.userid
  }

  let data = await conversationService.createConversation(conversation_obj)
  data = await Conversation.findById(data?._id).populate('topicid')
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Error in creating conversation.');
  }
  res.status(httpStatus.CREATED).send({
      data
  });
})

const removeConversation = catchAsync(async (req, res) => {
  const conversationId = req.params.id;
  const data = await conversationService.deleteConversation(conversationId)
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Something went wrong.');
  }
  res.status(200).send({
      message: "Conversation deleted successfully",
      status: true
  });
})

module.exports = {
    sendmessage,
    list_conversation,
    get_conversation,
    get_allmessage,
    removeConversation,
    createConversation
};
