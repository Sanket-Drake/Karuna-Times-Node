import { query } from '../../server'
import { randomString } from '../../utils/helper'
import moment from 'moment'
import { secrets } from '../../config/index'
import bcrypt from 'bcrypt'
import { validateChangePassword } from '../../validations/password'
import { sendEmailOtp2 } from '../../utils/sendGridHelper'
const isEmpty = require('../../validations/is-empty')

export const sendEmailOTP = async (req, res) => {
  try {
    const result = await query(`select * from users where email="${req.body.email}"`)
    if (!isEmpty(result)) {
      const emailExist = await query(`select * from user_forgot_pass 
      where email="${result[0].email}" and is_consumed='0' 
      order by timestamp desc`)
      // check whether email exist in table and it is not more than 24 hours
      if (!isEmpty(emailExist) && !moment().diff(`${moment.unix(emailExist[0].timestamp).format('YYYY-MM-DD')}`, 'days')) {
        // check if email resent is 0, if so insert data but with email resent 1
        if (!emailExist[0].email_resent) {
          const result2 = await query(`update user_forgot_pass set email_resent=1 where id=${emailExist[0].id}`)
          if (result2.affectedRows) {
            await sendEmailOtp2(result[0].email, emailExist[0].otp, result[0].firstname, result[0].lastname)
            return res.status(200).json({ data: true, message: 'Otp has been sent to your email', status: true })
          } else {
            return res.status(400).json({ data: false, message: 'Something went wrong', status: false })
          }
        } else {
          return res.status(406).json({ data: true, message: 'Email has already been sent', status: false })
        }
      } else {
        const result2 = await query(`insert into user_forgot_pass (email, token, otp, timestamp)
        values ("${result[0].email}","${randomString(50, '#aA')}","${randomString(7, '#')}","${moment().unix()}")`)
        if (result2.affectedRows) {
          await sendEmailOtp2(result[0].email, randomString(7, '#'), result[0].firstname, result[0].lastname)
          return res.status(200).json({ data: true, message: 'Otp has been sent to your email', status: true })
        } else {
          return res.status(400).json({ data: false, message: 'Something went wrong', status: false })
        }
      }
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const changePassword = async (req, res) => {
  const { validationError, isValid } = validateChangePassword(req.body)
  if (!isValid) {
    return res.status(400).json({ message: 'fail', status: false, error: validationError })
  }
  try {
    const result = await query(`select * from user_forgot_pass where 
    email='${req.body.email}' and is_consumed=0 
    order by timestamp desc limit 1`)
    if (!isEmpty(result)) {
      if (
        result[0].timestamp >
        moment()
          .subtract(1, 'days')
          .unix()
      ) {
        console.log(result[0].otp , req.body.otp);
        if (result[0].otp === req.body.otp) {
          const encryptPassword = await bcrypt.hash(req.body.password, parseInt(secrets.saltRounds, 10))
          const result2 = await query(`update users set password="${encryptPassword}" where email='${req.body.email}'`)
          if (result2.affectedRows) {
            const result3 = await query(`update user_forgot_pass set is_consumed=1 where id=${result[0].id}`)
            if (result3.affectedRows) {
              return res.status(200).json({ data: true, message: 'Password changed', status: true })
            } else {
              return res.status(400).json({ data: false, message: 'Request fail', status: false })
            }
          } else {
            return res.status(400).json({ data: false, message: 'Request fail', status: false })
          }
        } else {
          return res.status(401).json({ data: false, message: 'Otp invalid', status: false })
        }
      } else {
        return res.status(404).json({ data: false, message: "Invalid otp, it's been more than 24 hours", status: false })
      }
    } else {
      return res.status(404).json({ data: false, message: "Couldn't find otp", status: false })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}
