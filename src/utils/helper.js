export function randomString(length, chars) {
  var mask = ''
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz'
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (chars.indexOf('#') > -1) mask += '0123456789'
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\'
  var result = ''
  for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)]
  return result
}

export const BASE_URL = 'https://www.karunatimes.org/'

export const notificationType = {
  readOnly: 0,
  followRequest: 1,
  jobResponse: 2,
  post: 3
}

export const fileTypeValidation = function(file, types) {
  if (types.includes(file.mimetype)) {
    return { status: true }
  } else {
    const error = `Invalid file type. Only ${types} files are allowed.`
    return { status: false, error }
  }
}
 
export const chatType = {
  text: "TEXT",
  image: "image",
  video: "video",
  zip: "zip",
  customOffer: "CUSTOM_OFFER",
  projectEnquiry: "PROJECT_ENQUIRY"
}
