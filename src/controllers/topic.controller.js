const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { topicService } = require('../services');


const createTopic = catchAsync(async (req, res) => {

  const topics = await topicService.createTopic(req.body)

  res.status(httpStatus.CREATED).send({
    topics,
  });
});



const getTopics = catchAsync(async (req, res) => {
    const options = pick(req.query, ['limit', 'page']);
    const result = await topicService.querytopics(options)
    res.status(httpStatus.CREATED).send({
        result,
      });
  });
  

module.exports = {
    createTopic,
    getTopics
};
