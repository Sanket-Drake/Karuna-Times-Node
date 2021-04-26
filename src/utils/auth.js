import jwt from 'jsonwebtoken'
import compose from 'composable-middleware'
import expressJwt from 'express-jwt'
import bcrypt from 'bcrypt'
import moment from 'moment'
import { randomString, BASE_URL } from './helper'
import { sendEmailOtp } from './sendGridHelper'
import { query } from '../server'
import { secrets } from '../config'
const validateLoginInput = require('../validations/signin')
const validateRegisterInput = require('../validations/signup')
// const isEmpty = require('../validations/is-empty')

export const newToken = user => {
  return jwt.sign({ id: user.id }, secrets.jwt, {
    expiresIn: secrets.jwtExp
  })
}
console.log(secrets.jwt);
var validateJwt = expressJwt({
  secret: secrets.jwt
})

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
// authenticated API only from browsers until test user
export function isAuthenticated() {
  return (
    compose()
      // Validate jwt
      .use(function(req, res, next) {
        // allow access_token to be passed through query parameter as well

        if (req.query && req.query.hasOwnProperty('access_token')) {
          req.headers.authorization = `Bearer ${req.query.access_token}`
        }

        // IE11 forgets to set Authorization header sometimes. Pull from cookie instead.
        // for now ignoring the cookies
        // if (req.query && !req.headers.authorization) {
        //   // req.headers.authorization = `Bearer ${req.cookies.token}`
        // }

        const attachUser = () => {
          query(`SELECT * FROM users WHERE  id = '${req.user.id}'`)
            .then(responseUser => {
              req.user = responseUser
              return next()
            })
            .catch(e => {
              console.error(e)
              return res.status(401).json({
                error: 'Not Authorized. Login to continue',
                message: 'unauthorized access',
                status: false
              })
            })
        }

        if (req.headers.authorization) {
          validateJwt(req, res, attachUser)
          // query(`SELECT * FROM users WHERE  id = '${req.user.id}'`)
          //   .then(responseUser => {
          //     req.user = responseUser
          //     return next()
          //   })
          //   .catch(e => {
          //     console.error(e)
          //     return res.status(401).json({
          //       error: 'Not Authorized. Login to continue',
          //       message: 'unauthorized access',
          //       status: false
          //     })
          //   })
        } else {
          return res.status(401).json({
            error: 'Not Authorized. Login to continue',
            message: 'unauthorized access',
            status: false
          })
        }
      })
  )
}

export const verifyToken = token =>
  new Promise((resolve, reject) => {
    jwt.verify(token, secrets.jwt, (err, payload) => {
      if (err) return reject(err)
      resolve(payload)
    })
  })

export const menuPermission = (req, res) => {
  return res.status(200).send({
    data: {
      home: true
    },
    message: 'Data Found.',
    status: true
  })
}

// check if username exists
// check if email exists

export const signup = async (req, res) => {
  const { validationError, isValid } = validateRegisterInput(req.body)
  const error = []
  if (!isValid) {
    return res
      .status(400)
      .json({ message: 'fail', status: false, error: validationError[0] })
  }
  var sqlEmail = `SELECT * from users WHERE email = '${req.body.email}'`
  var sqlUser = `SELECT * from users WHERE username = '${req.body.username}'`

  try {
    // Check email exists
    // eslint-disable-next-line no-undef
    db.query(sqlEmail, function(err, result) {
      if (err)
        return res
          .status(400)
          .json({ data: err, message: 'fail', status: false })

      // Check username exists
      // eslint-disable-next-line no-undef
      db.query(sqlUser, function(err, resultUser) {
        if (err)
          return res
            .status(400)
            .json({ data: err, message: 'fail', status: false })

        if (!result[0] && !resultUser[0]) {
          let userBody = req.body
          const timestamp = moment().unix()
          const emailToken = randomString(50, '#aA')
          const otp = parseInt(Math.random() * 10000000)
          userBody.timestamp = timestamp

          // email otp
          sendEmailOtp(
            req.body.email,
            otp,
            req.body.firstname,
            req.body.lastname
          )

          // Ip address
          // email otp db entry
          var sql =
            "INSERT INTO email_verify_user (email, token, otp, ipaddress, timestamp) VALUES ('" +
            req.body.email +
            "','" +
            emailToken +
            "','" +
            otp +
            "','" +
            req.body.ipaddress +
            "','" +
            timestamp +
            "')"

          // eslint-disable-next-line no-undef
          db.query(sql, function(err, result) {
            if (err)
              return res
                .status(400)
                .json({ data: err, message: 'fail', status: false })

            // create password hash
            bcrypt.hash(req.body.password, parseInt(secrets.saltRounds, 10), (err, hash) => {
              if (err) {
                console.log('sql2', err)
              }

              // create db entry
              var sqlUserNew =
                "INSERT INTO users (firstname, lastname, username, email, password, nodepassword, timestamp) VALUES ('" +
                req.body.firstname +
                "','" +
                req.body.lastname +
                "','" +
                req.body.username +
                "','" +
                req.body.email +
                "','" +
                hash +
                "','" +
                hash +
                "','" +
                timestamp +
                "')"
              // eslint-disable-next-line no-undef
              db.query(sqlUserNew, function(err, createUser) {
                if (err)
                  return res
                    .status(400)
                    .json({ data: err, message: 'fail', status: false })

                // user_profile add entry
                var sqlProfile =
                  "INSERT INTO user_profile (profilpic, cover_image_lowres, userid) VALUES ('" +
                  // eslint-disable-next-line prettier/prettier
                  BASE_URL +
                  "assets/img/holder.svg','" +
                  BASE_URL +
                  "assets/img/holder.svg','" +
                  createUser.insertId +
                  "')"
                // eslint-disable-next-line no-undef
                db.query(sqlProfile, function(err, newConnection) {
                  if (err)
                    return res
                      .status(400)
                      .json({ data: err, message: 'fail', status: false })

                  // connection_list add an entry with
                  var sqlConnection =
                    "INSERT INTO connection_list (sender_id, connecting_to, approved_con, timestamp) VALUES ('" +
                    createUser.insertId +
                    "',1,1,'" +
                    timestamp +
                    "')"
                  // eslint-disable-next-line no-undef
                  db.query(sqlConnection, function(err, newProfile) {
                    if (err)
                      return res
                        .status(400)
                        .json({ data: err, message: 'fail', status: false })

                    const token = newToken(userBody)
                    console.log('userBody', userBody)

                    return res.status(201).send({
                      data: userBody,
                      message: 'success',
                      token: token,
                      status: true
                    })
                  })
                })
              })
            })
          })
        } else {
          res.status(409).json({
            message: 'fail',
            status: false,
            error: 'User already exist'
          })
        }
      })
    })
  } catch (e) {
    console.log(e)

    return res.status(500).send(e)
  }
}

export const signin = async (req, res) => {
  console.log('Comes in here')
  const { error, isValid } = validateLoginInput(req.body)

  if (!isValid) {
    return res.status(400).json({ error })
  }

  try {
    var sql = `SELECT * from users WHERE email = '${req.body.email}'`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, result) {
      if (err)
        return res
          .status(400)
          .json({ data: err, message: 'fail', status: false })

      if (!result[0]) {
        error.push('Invalid Credentials')
        return res
          .status(404)
          .send({ data: { error }, message: 'fail', status: false })
      }

      // const passwordHash = result[0].password
      let hash = ''
      if (result[0].nodepassword) {
        hash = result[0].nodepassword
      } else {
        hash = result[0].password.replace(/^\$2y(.+)$/i, '$2a$1')
      }
      bcrypt.hash(req.body.password, parseInt(secrets.saltRounds, 10), (err, newHash) => {
        if (err) {
          error.push('Invalid Credentials')
          return res
            .status(401)
            .send({ data: { error }, message: 'fail', status: false })
        }
        bcrypt.compare(req.body.password, hash, (err, same) => {
          if (err) {
            error.push('Invalid Credentials')
            return res
              .status(401)
              .send({ data: { error }, message: 'fail', status: false })
          }

          if (same) {
            const token = newToken(result[0])
            // create node password if not created
            if (result[0].nodepassword) {
              return res.status(200).send({
                data: {
                  email: result[0].email,
                  username: result[0].username
                },
                message: 'Logged In',
                status: true,
                token: token
              })
            } else {
              var sql =
                "UPDATE users SET nodepassword = '" +
                newHash +
                "' WHERE email = '" +
                req.body.email +
                "'"
              // eslint-disable-next-line no-undef
              db.query(sql, function(err, result1) {
                if (err) console.log(err)
                // return res
                //   .status(400)
                //   .json({ data: err, message: 'fail', status: false })

                return res.status(200).send({
                  data: {
                    email: result1[0].email,
                    username: result1[0].username
                  },
                  message: 'Logged In',
                  status: true,
                  token: token
                })
              })
            }
          } else {
            error.push('Invalid Credentials')
            return res
              .status(401)
              .send({ data: { error }, message: 'fail', status: false })
          }
        })
      })
    })
  } catch (e) {
    console.log('error: ', e)
    res.status(500).json({ data: { e }, message: 'fail', status: false })
  }
}

// export const protect = async (req, res, next) => {
//   const bearer = req.headers.authorization

//   if (!bearer || !bearer.startsWith('Bearer ')) {
//     return res.status(401).end()
//   }

//   const token = bearer.split('Bearer ')[1].trim()
//   let payload
//   try {
//     payload = await verifyToken(token)
//   } catch (e) {
//     return res.status(401).end()
//   }

//   const user = await User.findById(payload.id)
//     .select('-password')
//     .lean()
//     .exec()

//   if (!user) {
//     return res.status(401).end()
//   }

//   req.user = user
//   next()
// }
