const axios = require('axios');

const callAIService = async (user, messages, query, interests) => {
    try {
        const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
        const data = JSON.stringify({
            query: query,
            full_name: `${user?.firstname || ''} ${user?.lastname || ''}`,
            major: "computer science",
            degree: user?.degree,
            school: user?.university,
            year: user?.year ? String(user?.year) : '',
            interests: interests,
            wants_to_learn: [],
            previous_progress: {},
            messages: messages
        })
        const config = {
            method: 'POST',
            maxBodyLength: Infinity,
            url: AI_SERVICE_URL,
            headers: {
                'accept': 'application/json', 
                'Content-Type': 'application/json'
            },
            data
        };

        const response = await axios.request(config);
        const responseData = response?.data;
        let responseObject = {}
        if (responseData?.length) {
            responseObject = responseData[responseData.length - 1]
        }
        if (!responseObject) {
            throw new Error("Invalid Response from AI")
        }
        return {
            messageObject: responseObject,
            messagesArray: responseData
        }
    } catch (error) {
        console.log('error =>', error);
        throw error;
    }
};

module.exports = callAIService;