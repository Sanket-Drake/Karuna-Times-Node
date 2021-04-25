const isEmpty = require('./is-empty')

// Validate URL Format
function validateURL(val) {
  var urlPattern = /^(?:(?:https?):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/
  return urlPattern.test(val)
}

function validateOnboardingProfessionData(data) {
  var validationError = ''
  var isValid = false
  if (data.usertype == '1') {
    if (isEmpty(data.professional_title)) {
      validationError = `Professional Title should not be empty`
      return { validationError, isValid }
    } else if (isEmpty(data.company)) {
      validationError = 'Company Name should not be empty'
      return { validationError, isValid }
    } else if (!(isEmpty(data.website) || validateURL(data.website))) {
      validationError =
        'Enter website with a valid format Example: www.example.com'
      return { validationError, isValid }
    } else {
      isValid = true
      return { validationError, isValid }
    }
  } else if (data.usertype == '2') {
    if (isEmpty(data.professional_title)) {
      validationError = `Professional Title should not be empty`
      return { validationError, isValid }
    } else if (!(isEmpty(data.website) || validateURL(data.website))) {
      validationError =
        'Enter website with a valid format Example: www.example.com'
      return { validationError, isValid }
    } else {
      isValid = true
      return { validationError, isValid }
    }
  } else {
    validationError = 'Usertype should be Employeer or FreeLancer'
    return { validationError, isValid }
  }
}

export { validateURL, validateOnboardingProfessionData }
