const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { conversationService } = require('../services');
const { User, Message, Personalization } = require('../models');
const callAIService = require('../services/ai.service');
const { Conversation } = require('../models');
const axios = require('axios');

const sendmessage = catchAsync(async (req, res) => {
  const { topicid, userid, message, message_type, interests, conversation_id } = req.body;

  let conversation = await conversationService.getconversationById(conversation_id);
  const userData = await User.findById(userid).lean();

  if (!conversation) {
    // If no conversation exists, create a new one
    conversation = await conversationService.createConversation({
      start_date: new Date(),
      topicid,
      userid,
    });
  }
  let conversationMessages = await Message.find({
    userid: userid,
    conversationid: conversation?._id,
  })
    .select({ role: 1, content: 1, _id: 0, summary: 1, title: 1, type: 1 })
    .limit(15)
    .sort({ _id: -1 })
    .lean();
  conversationMessages = conversationMessages.reverse();
  if (!userData?.dailyTokenLimit || userData?.dailyTokenLimit < 0) {
    return res
      .status(400)
      .json({
        status: false,
        message: 'Daily token limit is exceeded, try again tomorrow.',
      })
      .end();
  }

  let aiResponse = await callAIService(userData, conversationMessages, message, interests);
  if (aiResponse?.messageObject) {
    const newMessage = await conversationService.createMessage({
      content: message,
      type: message_type,
      conversationid: conversation._id,
      userid,
      role: 'user',
    });
    await conversationService.createMessage({
      content: aiResponse?.messageObject?.content,
      role: aiResponse?.messageObject?.role,
      summary: aiResponse?.messageObject?.summary,
      title: aiResponse?.messageObject?.title,
      type: aiResponse?.messageObject?.type,
      conversationid: conversation?._id,
      userid,
    });
    await Conversation.findByIdAndUpdate(
      conversation?._id,
      {
        $set: {
          conversation_title: aiResponse?.messageObject?.title,
        },
      },
      { new: true }
    );
    const totalTokens = aiResponse.messageObject.total_tokens || 0;
    await User.findByIdAndUpdate(userid, {
      $inc: {
        dailyTokenLimit: -totalTokens,
      },
    });
  }
  // if (aiResponse.messagesArray.length) {
  //   for (let index = 0; index < aiResponse.messagesArray.length; index++) {
  //     const element = aiResponse.messagesArray[index];
  //     await conversationService.createMessage({
  //       message: element?.content,
  //       message_type: element?.type,
  //       conversationid: conversation?._id,
  //       userid,
  //       role: element.role,
  //     });
  //   }
  // }

  const aiMessage = aiResponse;

  // const newAiMessage = await conversationService.createMessage({
  //     message: aiMessage?.messageObject?.content,
  //     message_type: aiMessage?.messageObject.type,
  //     conversationid: conversation._id,
  //     userid,
  //     role: "assistant"
  // });

  const allMessages = await Message.find({
    userid: userid,
    conversationid: conversation?._id,
  })
    .sort({ createdAt: 1 })
    .lean();

  res.status(httpStatus.CREATED).send({
    // conversation: conversation,
    // message: newMessage,
    // AiResponse:newAiMessage,
    // messages: allMessages,
    aiResponse,
    allMessages: allMessages,
  });
});

const list_conversation = catchAsync(async (req, res) => {
  const { id } = req.user;
  const data = await conversationService.listConversationsByUser(id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'conversation not found');
  }
  res.status(httpStatus.OK).send({
    data,
  });
});

const get_conversation = catchAsync(async (req, res) => {
  const { conversation_id } = req.query;
  const data = await conversationService.getconversationById(conversation_id);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found');
  }
  res.status(httpStatus.CREATED).send({
    data,
  });
});

const get_allmessage = catchAsync(async (req, res) => {
  const { conversation_id } = req.query;
  const options = {
    limit: parseInt(req.query.limit, 10) || 10, // Default to 10 if 'limit' is not provided
    page: parseInt(req.query.page, 10) || 1, // Default to 1 if 'page' is not provided
  };
  const data = await conversationService.getAllMessages(conversation_id, options);

  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'messages are not found.');
  }
  res.status(httpStatus.CREATED).send({
    data,
  });
});

const createConversation = catchAsync(async (req, res) => {
  const params = req?.body;
  const conversation_obj = {
    conversation_title: params?.conversation_title,
    topicid: params?.topicid,
    userid: params?.userid,
  };

  let data = await conversationService.createConversation(conversation_obj);
  data = await Conversation.findById(data?._id).populate('topicid');
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Error in creating conversation.');
  }
  res.status(httpStatus.CREATED).send({
    data,
  });
});

const removeConversation = catchAsync(async (req, res) => {
  const conversationId = req.params.id;
  const data = await conversationService.deleteConversation(conversationId);
  if (!data) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Something went wrong.');
  }
  res.status(200).send({
    message: 'Conversation deleted successfully',
    status: true,
  });
});

const updatePersonalization = catchAsync(async (req, res) => {
  const params = req?.body;
  if (!params?.conversationId && !params?.userId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid JSON');
  }
  try {
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
    const conversationMessage = await Message.find({
      conversationid: params?.conversationId,
      userid: params?.userId,
    })
      .sort({ _id: -1 })
      .limit(5);
    const userData = await User.findById(params?.userId);
    const personalization = await Personalization.findOne({
      conversationId: params?.conversationId,
      userId: params?.userId,
    });
    const options = JSON.stringify({
      query: '',
      full_name: `${userData?.firstname || ''} ${userData?.lastname || ''}`,
      major: `${userData?.major || ''}`,
      degree: userData?.degree,
      school: userData?.university,
      year: userData?.year ? String(userData?.year) : '',
      interests: personalization?.interests?.length ? personalization?.interests : ['Computer Science', 'Mathematics'],
      wants_to_learn: personalization?.wants_to_learn?.length
        ? personalization?.wants_to_learn
        : ['Computer Science', 'Mathematics'],
      previous_progress: personalization?.previous_progress?.length ? personalization?.previous_progress : {},
      messages: conversationMessage.map((e) => e.content).length > 0 ? conversationMessage.map((e) => e.content) : [],
    });
    let config = {
      method: 'POST',
      maxBodyLength: Infinity,
      url: `${AI_SERVICE_URL}personalize-using-session/`,
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      data: options,
    };
    const response = await axios.request(config);
    if (!personalization) {
      await Personalization.create({
        userId: userData?._id,
        conversationId: params?.conversationId,
        interests: response?.data?.interests,
        wants_to_learn: response?.data?.wants_to_learn,
        previous_progress: response?.data?.previous_progress,
      });
    } else {
      await Personalization.findByIdAndUpdate(
        {
          _id: personalization?._id,
        },
        {
          interests: response?.data?.interests,
          wants_to_learn: response?.data?.wants_to_learn,
          previous_progress: response?.data?.previous_progress,
        },
        { new: true }
      );
    }
    res.status(200).send({
      message: 'Operation executed successfully.',
      status: true,
    });
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.toString());
  }
});

module.exports = {
  sendmessage,
  list_conversation,
  get_conversation,
  get_allmessage,
  removeConversation,
  createConversation,
  updatePersonalization,
};
