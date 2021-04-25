const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateProjectInput(data, userId) {
  let errors = []

  data.user = !isEmpty(userId) ? userId.toString() : ''
  data.user = !isEmpty(data.user) ? data.user : ''
  data.project = !isEmpty(data.project) ? data.project : ''
  data.bid_amount = !isEmpty(data.bid_amount) ? data.bid_amount : ''
  data.completion_date = !isEmpty(data.completion_date)
    ? data.completion_date
    : ''
  data.proposal_text = !isEmpty(data.proposal_text) ? data.proposal_text : ''

  if (Validator.isEmpty(data.user)) {
    errors.push('User Id is required')
  }

  if (Validator.isEmpty(data.project)) {
    errors.push('Project Id is required')
  }

  if (Validator.isEmpty(data.bid_amount)) {
    errors.push('Bid Amount is required')
  }

  if (Validator.isEmpty(data.completion_date)) {
    errors.push('Completion Date is required')
  }

  if (Validator.isEmpty(data.proposal_text)) {
    errors.push('Proposal Text is required')
  }

  return {
    errors,
    isValid: isEmpty(errors)
  }
}
