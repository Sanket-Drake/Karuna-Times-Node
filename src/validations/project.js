const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateProjectInput(data, userId) {
  let errors = []

  data.title = !isEmpty(data.title) ? data.title : ''
  data.user = !isEmpty(userId) ? userId.toString() : ''
  data.brief = !isEmpty(data.brief) ? data.brief : ''
  data.budget = !isEmpty(data.budget) ? data.budget : ''
  data.type = !isEmpty(data.type) ? data.type : ''
  data.delivery_date = !isEmpty(data.delivery_date) ? data.delivery_date : ''

  if (Validator.isEmpty(data.title)) {
    errors.push('Title field is required.')
  }

  if (Validator.isEmpty(data.user)) {
    errors.push('User Id is required.')
  }

  if (Validator.isEmpty(data.brief)) {
    errors.push('Brief field is required.')
  }

  if (Validator.isEmpty(data.budget)) {
    errors.push('Budget field is required.')
  }

  if (Validator.isEmpty(data.type)) {
    errors.push('Type field is required.')
  }

  if (Validator.isEmpty(data.delivery_date)) {
    errors.push('Delivery Date field is required.')
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
