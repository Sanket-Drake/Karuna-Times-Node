const isEmpty = require('./is-empty')

function validateOnboarding4(data) {
  var isValid = false
  var validationError = ''
  if (isEmpty(data.perhour)) {
    validationError = 'Wage should not be empty'
    return {
      validationError,
      isValid
    }
  } else if (data.perhour < 10) {
    validationError = 'Your Wage should be greater than 10'
    return {
      validationError,
      isValid
    }
  } else if (isEmpty(data.serviceid)) {
    validationError = 'Please select the service you provide'
    return {
      validationError,
      isValid
    }
  } else if (isEmpty(data.skills.old) && isEmpty(data.skills.new)) {
    validationError = 'Please select or enter your skills'
    return {
      validationError,
      isValid
    }
  } else if (data.skills.old.length + data.skills.new.length > 6) {
    validationError = 'Selected skills should not be more than 6'
    return {
      validationError,
      isValid
    }
  } else {
    isValid = true
    return {
      validationError,
      isValid
    }
  }
}

export { validateOnboarding4 }
