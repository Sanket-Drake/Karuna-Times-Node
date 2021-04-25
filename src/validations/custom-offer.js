const isEmpty = require('./is-empty')

function validateCustomOffer(data) {
  var validationError = ''
  var isValid = false
  if (isEmpty(data.title)) {
    validationError = `Offer title should not be empty`
    return { validationError, isValid }
  } else if (isEmpty(data.price)) {
    validationError = `Offer budget should not be empty`
    return { validationError, isValid }
  } else if (data.price < 10) {
    validationError = `Offer budget should be minimum 10`
    return { validationError, isValid }
  } else if (isEmpty(data.delivery_time)) {
    validationError = `Duration/Delivery time should not be empty`
    return { validationError, isValid }
  } else if (data.delivery_time < 2) {
    validationError = `Duration/Delivery time should be greater than or equal to 2`
    return { validationError, isValid }
  } else if (isEmpty(data.revision)) {
    validationError = `Revision should not be empty`
    return { validationError, isValid }
  } else if (data.revision < 2) {
    validationError = `Revision should be greater than or equal to 2`
    return { validationError, isValid }
  } else {
    isValid = true
    return { validationError, isValid }
  }
}

export { validateCustomOffer }
