const isEmpty = require('./is-empty')

function validateJobPost(data) {
  var validationError = ''
  var isValid = false
  if (isEmpty(data.job_title)) {
    validationError = `Job title should not be empty`
    return { validationError, isValid }
  } else if (isEmpty(data.job_budget)) {
    validationError = `Job budget should not be empty`
    return { validationError, isValid }
  } else if (data.job_budget < 10) {
    validationError = `Job budget should be minimum 10`
    return { validationError, isValid }
  } else if (isEmpty(data.budget_description)) {
    validationError = `Budget description should be selected`
    return { validationError, isValid }
  } else if (isEmpty(data.duration)) {
    validationError = `Duration/Delivery time should not be empty`
    return { validationError, isValid }
  } else if (data.duration < 7) {
    validationError = `Duration/Delivery time should be greater than or equal to 7`
    return { validationError, isValid }
  } else if (typeof data.service !== 'object') {
    validationError = `Invalid service data`
    return { validationError, isValid }
  } else if (isEmpty(data.service)) {
    validationError = `Service should be selected`
    return { validationError, isValid }
  } else if (typeof data.skills !== 'object') {
    validationError = `Invalid  skill data`
    return { validationError, isValid }
  } else if (isEmpty(data.skills)) {
    validationError = `Skills should not be empty`
    return { validationError, isValid }
  } else if (data.skills.length > 6) {
    validationError = `less than 6 skills should be selected`
    return { validationError, isValid }
  } else if (isEmpty(data.job_description)) {
    validationError = `Job description should not be empty`
    return { validationError, isValid }
  } else if (!(data.portfolio_required == 'required' || data.portfolio_required == 'notrequired')) {
    validationError = `Invalid portfolio data`
    return { validationError, isValid }
  } else {
    isValid = true
    return { validationError, isValid }
  }
}

export { validateJobPost }
