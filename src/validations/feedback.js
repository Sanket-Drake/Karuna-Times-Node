const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateFeedbackInput(data, userId) {
  let errors = []

  data.user = !isEmpty(userId) ? userId : ''
  data.user_type = !isEmpty(data.user_type) ? data.user_type : ''
  data.contract = !isEmpty(data.contract) ? data.budget : ''

  if (Validator.isEmpty(data.user)) {
    errors.push('User Id is required.')
  }

  if (Validator.isEmpty(data.user_type)) {
    errors.push('User type is required.')
  }

  if (Validator.isEmpty(data.contract)) {
    errors.push('Contract field is required.')
  }

  if (!data.rating || Number(data.rating) < 0 || Number(data.rating) > 5) {
    errors.push('Please give valid rating')
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
