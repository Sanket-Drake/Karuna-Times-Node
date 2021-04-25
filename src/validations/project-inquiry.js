const isEmpty = require('./is-empty')

function validateProjectInquiry(data) {
  var validationError = ''
  var isValid = false
  if (isEmpty(data.user_id)) {
    validationError = `Invalid Request`
    return { validationError, isValid }
  } else if (isEmpty(data.description)) {
    validationError = `Description should not be empty`
    return { validationError, isValid }
  } else if (data.description.length < 100) {
    validationError = `Description should be more than 100 characters`
    return { validationError, isValid }
  } else if (isEmpty(data.budget)) {
    validationError = `Budget should not be empty`
    return { validationError, isValid }
  } else if (data.budget < 50) {
    validationError = `Budget should not be less than 50`
    return { validationError, isValid }
  } else if (isEmpty(data.duration)) {
    validationError = `Duration should not be empty`
    return { validationError, isValid }
  } else {
    isValid = true
    return { validationError, isValid }
  }
}

export { validateProjectInquiry }
