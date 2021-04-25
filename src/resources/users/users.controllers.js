// import { Offer } from './taskboard.model'

import { query } from '../../server'
import moment from 'moment'
import { randomString } from '../../utils/helper'
import { sendEmailOtp } from '../../utils/sendGridHelper'
import { validateOnboarding4 } from '../../validations/wageserviceskill'
import { validateOnboardingProfessionData } from '../../validations/profession'
const isEmpty = require('../../validations/is-empty')

export const getUser = async (req, res) => {
  const userId = req.query.userId
  try {
    const sql = `SELECT * FROM users JOIN user_profile ON users.id = user_profile.userid WHERE users.id = '${userId}'`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, result) {
      if (err) {
        return res.status(400).json({ data: err, message: 'fail', status: false })
      }
      const sql1 = `SELECT dribbleshots.*, dribbleshotimages.normal, dribbleshotimages.hidpi FROM dribbleshots LEFT JOIN dribbleshotimages ON dribbleshots.id = dribbleshotimages.id  WHERE freelancerid = '${userId}'`
      // eslint-disable-next-line no-undef
      db.query(sql1, function(err, dribble) {
        if (err) {
          return res.status(400).json({ data: err, message: 'fail', status: false })
        }
        const sql2 = `SELECT * FROM githubimport WHERE freelancerid = '${userId}'`
        // eslint-disable-next-line no-undef
        db.query(sql2, function(err, github) {
          if (err) {
            return res.status(400).json({ data: err, message: 'fail', status: false })
          }
          return res.status(200).json({
            data: { ...result[0], github, dribble },
            message: 'success',
            status: true
          })
        })
      })
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const getList = async (req, res) => {
  try {
    var sql = `SELECT * FROM users LIMIT ${req.query.limit || 20} OFFSET ${req.query.offset || 0}`
    var sql2 = `SELECT COUNT(*) FROM users`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, result) {
      if (err) return res.status(400).json({ data: err, message: 'fail', status: false })
      // eslint-disable-next-line no-undef
      db.query(sql2, function(err, result2) {
        if (err) return res.status(400).json({ data: err, message: 'fail', status: false })
        return res.status(200).json({
          data: result,
          total_count: result2[0]['COUNT(*)'],
          message: 'success',
          status: true
        })
      })
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const scoreUser = async (req, res) => {
  try {
    var sql = `UPDATE users SET is_profile_accepted = 1, profile_score=${req.body.profile_score} WHERE  id = '${req.body.userId}'`

    // eslint-disable-next-line no-undef
    db.query(sql, function(err, result) {
      if (err) {
        console.error(err)
        return res.status(400).json({ data: false, message: 'fail', status: false })
      }
      return res.status(200).json({ data: true, message: 'success', status: true })
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

// api to get city state country
export const updateUserLocation = async (req, res) => {
  try {
    const updateUserLocation = await query(
      `UPDATE user_profile SET country = ${req.body.country}, state=${req.body.state}, city=${req.body.city} WHERE userid = '${req.user[0].id}'`
    )

    if (updateUserLocation.affectedRows) {
      return res.status(200).json({ data: true, message: 'Location updated', status: true })
    } else {
      return res.status(400).json({ data: false, message: 'something went wrong', status: false })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

// limit to single use
// DB: case - email_verify_user
// already consumed
export const emailVerify = async (req, res) => {
  try {
    const emailVerify = await query(
      `SELECT * FROM email_verify_user WHERE  email = '${req.user[0].email}' ORDER BY timestamp DESC LIMIT 1 `
    )
    if (
      moment
        .unix(emailVerify[0].timestamp)
        .add(15, 'm')
        .isBefore()
    ) {
      return res.status(400).json({ data: false, message: 'otp expired', status: false })
    } else if (emailVerify[0].is_consumed || req.user[0].is_mail_verify) {
      return res.status(400).json({ data: false, message: 'otp already verified', status: false })
    } else if (emailVerify[0].otp == req.body.otp) {
      const updateUser = await query(`UPDATE users SET is_mail_verify = 1 WHERE  id = '${req.user[0].id}'`)
      const updateUserVerify = await query(
        `UPDATE email_verify_user SET is_consumed = 1 WHERE email = '${req.user[0].email}' AND otp = '${emailVerify[0].otp}'`
      )
      if (updateUser.affectedRows && updateUserVerify.affectedRows) {
        return res.status(200).json({ data: true, message: 'otp verified', status: true })
      } else {
        return res.status(400).json({ data: false, message: 'something went wrong', status: false })
      }
    } else {
      return res.status(400).json({ data: false, message: 'otp mismatch', status: false })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

// Send email
// ip address
// limit calls to time reduciing attacks and misuse
// DB: remove sendiing timestamp to db
export const emailVerifyResend = async (req, res) => {
  try {
    const emailToken = randomString(50, '#aA')
    const otp = parseInt(Math.random() * 10000000)
    if (!req.user[0].is_mail_verify) {
      sendEmailOtp(req.user[0].email, otp, req.user[0].firstname, req.user[0].lastname)
      const updateUserVerify = await query(
        `INSERT INTO email_verify_user (email, otp, token, ipaddress, timestamp) VALUES ('${
          req.user[0].email
        }','${otp}','${emailToken}','${req.connection.remoteAddress}', ${moment().unix()})`
      )
      if (updateUserVerify.affectedRows) {
        return res.status(200).json({
          data: true,
          message: 'OTP Sent successfully',
          status: true
        })
      } else {
        return res.status(400).json({ data: false, message: 'something went wrong', status: false })
      }
    } else {
      return res.status(400).json({ data: false, message: 'Already verified', status: false })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const insertUserPlatforms = async (req, res) => {
  try {
    if (!isEmpty(req.body.platforms)) {
      let insertUserPlatformQuery = `insert into user_platform_list (user_id,name,platform_id) values (${req.user[0].id},'${req.body.platforms[0].name}',${req.body.platforms[0].id})`
      req.body.platforms.map((item, index) => {
        if (index != 0) {
          insertUserPlatformQuery += `,(${req.user[0].id},'${item.name}',${item.id})`
        }
      })
      var result = await query(insertUserPlatformQuery)
      if (result.affectedRows > 0) {
        res.status(200).json({
          data: true,
          message: 'Data Inserted Succesfully',
          status: true
        })
      } else {
        res.status(400).json({
          data: false,
          message: 'something went wrong',
          status: false
        })
      }
    } else {
      return res.status(400).json({
        data: true,
        message: 'No platform selected',
        status: false
      })
    }
  } catch (error) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

// Update User Location

export const updateUserLocations = async (req, res) => {
  try {
    if (!isEmpty(req.body.city) && !isEmpty(req.body.state) && !isEmpty(req.body.country) && !isEmpty(req.body.city_id)) {
      var result = await query(
        `update user_profile set country='${req.body.country}',state='${req.body.state}',city='${req.body.city}',city_id=${req.body.city_id} where userid=${req.user[0].id}`
      )
      if (result.affectedRows) {
        res.status(200).json({ data: true, message: 'Data Updated', status: true })
      } else {
        return res.status(400).json({ data: false, message: 'Something went wrong', status: false })
      }
    } else {
      return res.status(400).json({ data: false, message: 'Invalid Input ', status: false })
    }
  } catch (error) {
    console.error(error)
    return res.status(400).json({ data: error, message: 'fail', status: false })
  }
}

// Update Profession Data
export const updateUserProfession = async (req, res) => {
  const { validationError, isValid } = validateOnboardingProfessionData(req.body)

  if (!isValid) {
    return res.status(400).json({ message: 'fail', status: false, error: validationError })
  }
  try {
    const result = await query(
      `update user_profile set usertype=${req.body.usertype},proftitle='${req.body.professional_title}',company='${req.body.company}',website='${req.body.website}' where userid=${req.user[0].id};`
    )
    if (result.affectedRows) {
      res.status(200).json({ data: true, message: `Data Updated`, status: true })
    } else {
      res.status(400).json({
        data: false,
        message: `something went wrong, Try again!`,
        status: false
      })
    }
  } catch (error) {
    console.error(error)
    return res.status(400).json({ data: error, message: 'fail', status: false })
  }
}

// Insert Wage Per Hour, Service, Skills while Onboarding
export const Onboarding4 = async (req, res) => {
  const { validationError, isValid } = validateOnboarding4(req.body)
  if (!isValid) {
    return res.status(400).json({ message: 'fail', status: false, error: validationError })
  }
  try {
    await query(`delete from user_services where userid=${req.user[0].id}`)
    await query(`delete from user_skills where userid=${req.user[0].id}`)
    const phResult = await query(`update user_profile set perhour=${req.body.perhour} where userid=${req.user[0].id};`)
    if (phResult.affectedRows) {
      let service = `insert into user_services (serviceid,userid) values (${req.body.serviceid[0]},${req.user[0].id})`
      req.body.serviceid.map((item, index) => {
        if (index != 0) {
          service += `,(${item},${req.user[0].id})`
        }
      })
      const sResult = await query(service)
      if (sResult.affectedRows) {
        // checking for new skills
        if (!isEmpty(req.body.skills.new)) {
          let newSkill = `insert into skills_dataset (name) values('${req.body.skills.new[0]}')`
          req.body.skills.new.map((item, index) => {
            if (index != 0) {
              newSkill += `,('${item}')`
            }
          })
          const newSkillResult = await query(newSkill)
          // adding new id's to old id's list(if there)
          req.body.skills.new.map(() => {
            req.body.skills.old.push(newSkillResult.insertId)
            newSkillResult.insertId += 1
          })
        }
        let userSkill = `insert into user_skills (userid,skills) values (${req.user[0].id},${req.body.skills.old[0]})`
        req.body.skills.old.map((item, index) => {
          if (index != 0) {
            userSkill += `,(${req.user[0].id},${item})`
          }
        })
        const skillResult = await query(userSkill)
        if (skillResult.affectedRows) {
          return res.status(200).json({ data: true, message: 'Data Updated', status: true })
        } else {
          return res.status(400).json({
            data: false,
            message: `Error occured while inserting your skill's.`,
            status: false
          })
        }
      } else {
        return res.status(400).json({
          data: false,
          message: `Error occured while inserting your service's.`,
          status: false
        })
      }
    } else {
      return res.status(400).json({
        data: false,
        message: `Error occured while inserting your wage.`,
        status: false
      })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}
