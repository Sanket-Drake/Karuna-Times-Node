const isEmpty = require('./is-empty')

function validateChangePassword(data) {
  var validationError = ''
  var isValid = false
  if (isEmpty(data.otp)) {
    validationError = 'Invalid Request'
    return { validationError, isValid }
  } else if (isEmpty(data.password)) {
    validationError = 'Password should not be empty'
    return { validationError, isValid }
  } else if (isEmpty(data.confirm_password)) {
    validationError = 'Confirm password should not be empty'
    return { validationError, isValid }
  } else if (data.password !== data.confirm_password) {
    validationError = 'Confirm password should be same as your password'
    return { validationError, isValid }
  } else {
    isValid = true
    return { validationError, isValid }
  }
}

export { validateChangePassword }
