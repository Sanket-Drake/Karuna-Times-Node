const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validateLoginInput(data) {
  let validationError = []

  const reg = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
  const formate = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~ ]+/g;

  data.email = !isEmpty(data.email) ? data.email : ''
  data.password = !isEmpty(data.password) ? data.password : ''
  data.phone = !isEmpty(data.phone) ? data.phone : ''
  data.password = !isEmpty(data.password) ? data.password : ''
  data.role = !isEmpty(data.role) ? data.role : ''
  data.username = !isEmpty(data.username) ? data.username : ''
  data.phone = !isEmpty(data.phone) ? data.phone : ''

  if (Validator.isEmpty(data.firstname)) {
    validationError.push('First name is required')
  }

  if (!Validator.isAlpha(data.firstname)) {
    validationError.push('First name can have only Alphabets')
  }

  if (Validator.isEmpty(data.lastname)) {
    validationError.push('Last name is required')
  }

  if (!Validator.isAlpha(data.lastname)) {
    validationError.push('Last name can have only Alphabets')
  }

  if (Validator.isEmpty(data.email)) {
    validationError.push('Email is required')
  }

  if (!Validator.isEmail(data.email)) {
    validationError.push('Email is invalid')
  }

  if (Validator.isEmpty(data.username)) {
    validationError.push('Username is required')
  }

  if (formate.test(data.username)) {
    validationError.push('Username cannot have special character or space!')
  }

  if (Validator.isEmpty(data.password)) {
    validationError.push('Password is required')
  }

  if (!Validator.isLength(data.password, { min: 8, max: 16 })) {
    validationError.push('Password needs to be 8 - 16 character long')
  }

  if (!reg.test(data.password)) {
    validationError.push(
      'Password must contain 1 Uppercase, 1 Lowercase, 1 number and 1 Special Character'
    )
  }


  return {
    validationError,
    isValid: isEmpty(validationError)
  }
}
