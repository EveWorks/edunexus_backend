const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cardValidation = require('../../validations/card.validation');
const cardController = require('../../controllers/card.controller');

const router = express.Router();

router.post('/add', auth(), validate(cardValidation.addCard), cardController.addCard);
router.get('/', auth(), cardController.getCards);
router.post('/:token/default', auth(), validate(cardValidation.defaultCard), cardController.setDefaultCard);
router.delete('/:token', auth(), validate(cardValidation.deleteCard), cardController.deleteCard);

module.exports = router;
