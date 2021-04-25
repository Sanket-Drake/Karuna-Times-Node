const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateOfferInput(data) {
  let validationError = []

  if (!Validator.isInt(data.creator_id, { gt: 0 })) {
    validationError.push('User id is required')
  }

  if (!Validator.isInt(data.price, { gt: 0 })) {
    validationError.push('Price is required')
  }

  if (Validator.isEmpty(data.media)) {
    validationError.push('media is required')
  }

  if (Validator.isEmpty(data.title)) {
    validationError.push('Title is required')
  }

  if (!Validator.isLength(data.title, { min: 1, max: 255 })) {
    validationError.push('Title needs to be 1 - 255 character long')
  }

  return {
    validationError,
    isValid: isEmpty(validationError)
  }
}
