import { validateURL } from './profession'
const isEmpty = require('./is-empty')

function validatePortfolio(data) {
  var validationError = ''
  var isValid = false
  if (isEmpty(data.type)) {
    validationError = 'Invalid Request'
    return { validationError, isValid }
  } else if (isEmpty(data.title)) {
    validationError = 'Portfolio title is required'
    return { validationError, isValid }
  } else if (!(data.tags.old.length + data.tags.new.length)) {
    validationError = 'Minimum one tag is required'
    return { validationError, isValid }
  } else if (!(isEmpty(data.live_url) || validateURL(data.live_url))) {
    validationError = 'Enter valid live url'
    return { validationError, isValid }
  } else if (data.type === 'video' && !(validateURL(data.video_url))) {
    validationError = 'Invalid Request'
    return { validationError, isValid }
  } else if (data.type !== 'video' && !(validateURL(data.img_url) && validateURL(data.img_low_url))) {
    validationError = 'Invalid Request'
    return { validationError, isValid }
  } else {
    isValid = true
    return { validationError, isValid }
  }
}

export { validatePortfolio }
