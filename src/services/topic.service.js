const httpStatus = require('http-status');
const { Topic } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createTopic = async (userBody) => {
  return Topic.create(userBody);
};


/**
 * Query for users
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const querytopics = async (options) => {
    const { page = 1, limit = 10 } = options;

    // Calculate skip value based on page and limit
    const skip = (page - 1) * limit;
  
    // Get the total number of topics in the collection
    const total = await Topic.countDocuments();
  
    // Retrieve the paginated topics with skip and limit
    const topics = await Topic.find()
      .skip(skip)
      .limit(limit)
      .sort({ id: 1 });
  
    const totalPages = Math.ceil(total / limit);
  
    return {
      data: topics,
      pagination: {
        totalItems: total,
        totalPages,
        currentPage: page,
        limit,
      },
    };
  };


module.exports = {
    createTopic,
    querytopics

};
