const dotenv = require('dotenv')
const aws = require('aws-sdk')

dotenv.config()

// aws.config.update({
//   // Your SECRET ACCESS KEY from AWS should go here,
//   // Never share it!
//   // Setup Env Variable, e.g: process.env.SECRET_ACCESS_KEY
//   secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//   // Not working key, Your ACCESS KEY ID from AWS should go here,
//   // Never share it!
//   // Setup Env Variable, e.g: process.env.ACCESS_KEY_ID
//   accessKeyId: process.env.S3_ACCESS_KEY_ID,
//   region: 'us-east-2' // region of your bucket
// })

const env = process.env.NODE_ENV || 'development'
const s3 = new aws.S3({
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  region: 'us-east-2'
})
module.exports = {
  env,
  isDev: env === 'development',
  port: process.env.APP_PORT || 5000,
  secrets: {
    jwt: process.env.JWT_SECRET,
    saltRounds: process.env.SALT_ROUND,
    jwtExp: process.env.JWT_EXPIRY || '2d'
  },
  hostURL: process.env.HOST_URL || 'http://karunatimes.org:5001/api/v1',
  sqldb: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  },
  sendgridKey: process.env.SENDGRID_KEY,
  s3
}
