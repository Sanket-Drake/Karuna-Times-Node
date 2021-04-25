import { validateURL } from './profession'
const isEmpty = require('./is-empty')

function socialLink(data) {
  var validationError = ''
  var isValid = false
  if (!(validateURL(data.linkedin) || isEmpty(data.linkedin))) {
    validationError = 'Enter valid Linkedin URL'
    return { validationError, isValid }
  } else if (!(validateURL(data.github) || isEmpty(data.github))) {
    validationError = 'Enter valid Github URL'
    return { validationError, isValid }
  } else if (!(validateURL(data.dribbble) || isEmpty(data.dribbble))) {
    validationError = 'Enter valid Dribble URL'
    return { validationError, isValid }
  } else if (!(validateURL(data.twitter) || isEmpty(data.twitter))) {
    validationError = 'Enter valid Twitter URL'
    return { validationError, isValid }
  } else if (!(validateURL(data.instagram) || isEmpty(data.instagram))) {
    validationError = 'Enter valid Instagram URL'
    return { validationError, isValid }
  } else if (!(validateURL(data.medium) || isEmpty(data.medium))) {
    validationError = 'Enter valid Medium URL'
    return { validationError, isValid }
  } else {
    isValid = true
    return { validationError, isValid }
  }
}

export { socialLink }
