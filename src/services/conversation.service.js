const httpStatus = require('http-status');
const { Conversation,Message } = require('../models');
const ApiError = require('../utils/ApiError');




/**
 * Create a new conversation
 * @param {Object} conversationBody
 * @returns {Promise<Conversation>}
 */
const createConversation = async (conversationBody) => {
    return Conversation.create(conversationBody);
  };
  
  
/**
 * Get all conversations for a specific user
 * @param {string} userid - The ID of the user
 *  * @param {string} topicid - The ID of the user
 * @returns {Promise<Array>} - List of conversations
 */

  const getConversationByTopicAndUser = async (topicid, userid) => {
    return await Conversation.findOne({ topicid, userid });
};


  /**
   * Create a new message for a conversation
   * @param {Object} messageBody
   * @returns {Promise<Message>}
   */

  const createMessage = async (messageBody) => {
    return Message.create(messageBody);
  };

/**
 * Get all conversations for a specific user
 * @param {string} userid - The ID of the user
 * @returns {Promise<Array>} - List of conversations
 */
const listConversationsByUser = async (userid) => {
  return Conversation.find({ userid })
    .populate('topicid', 'topic_name') // Populate topic_name from the Topic model
    .sort({ createdAt: 1 }); // Sort by most recent conversation
};


/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getconversationById = async (id) => {
    return Conversation.findById(id).populate('topicid');
  };
    
  /**
   * Get all messages by conversation ID with pagination
   * @param {string} conversation_id - The ID of the conversation
   * @param {Object} options - Pagination options
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<Object>} - Paginated messages with metadata
   */
  const getAllMessages = async (conversation_id, options) => {
    const { page = 1, limit = 10 } = options;

    const skip = (page - 1) * limit;

    const filter = { conversationid: conversation_id };

    const total = await Message.countDocuments(filter);

    const messages = await Message.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('conversationid', 'topicid') 
      .populate('userid', 'firstname lastname') 
      .sort({ createdAt: 1 }); 

    const totalPages = Math.ceil(total / limit);

    return {
      data: messages,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  };

// eslint-disable-next-line camelcase
const deleteConversation = async (conversation_id) => {
  const conversation = await Conversation.deleteOne({ _id: conversation_id });
  const messages = await Message.deleteMany({ conversationid: conversation_id });
  return conversation;
};

module.exports = {
    createConversation,
    listConversationsByUser,
    createMessage,
    getconversationById,
    getConversationByTopicAndUser,
    getAllMessages,
    deleteConversation,
};
