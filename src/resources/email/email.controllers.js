import moment from 'moment'
import { map, uniq, filter, uniqBy } from 'lodash'
import {
  sendCompleteEmail,
  sendPendingMessages,
  sendJobNewsletter
} from '../../utils/sendGridHelper'
// import { Offer } from './taskboard.model'

export const completeProfile = async () => {
  try {
    const sql = `SELECT id, email FROM users`
    // const sql = `SELECT id, email FROM users WHERE id >= 63`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, users) {
      if (err) {
        console.log(err)
        return true
      }
      const sql1 = `SELECT userid FROM user_profile`
      // eslint-disable-next-line no-undef
      db.query(sql1, function(err, userProfile) {
        if (err) {
          console.log(err)
          return true
        }
        const sql2 = `SELECT * FROM complete_profile`
        // eslint-disable-next-line no-undef
        db.query(sql2, function(err, completeProfile) {
          if (err) {
            console.log(err)
            return true
          }
          const userList = []
          const completeProfileList = []
          const userProfileList = []
          if (users && users.length) {
            users.filter(user => {
              userList.push(user.id)
            })
          }
          if (completeProfile && completeProfile.length) {
            completeProfile.filter(user => {
              completeProfileList.push(user.user_id)
            })
          }
          if (userProfile && userProfile.length) {
            userProfile.filter(user => {
              userProfileList.push(user.userid)
            })
          }
          let difference = users.filter(x => !userProfileList.includes(x.id))
          let differenceSentEmail = difference.filter(
            x => !completeProfileList.includes(x.id)
          )
          differenceSentEmail.map(user => {
            sendCompleteEmail(user)
            var sql3 = `INSERT INTO complete_profile (user_id, email) VALUES ('${user.id}', '${user.email}')`
            // eslint-disable-next-line no-undef
            db.query(sql3, function(err, result) {
              if (err) {
                console.log(err)
                return true
              }
              // return res
              //   .status(200)
              //   .json({ data: result, message: 'success', status: true })
            })
          })
          return true
          // res.status(200).json({
          //   data: {
          //     users,
          //     userList,
          //     completeProfileList,
          //     userProfileList,
          //     difference,
          //     differenceSentEmail
          //   },
          //   message: 'success',
          //   status: true
          // })
        })
      })
    })
  } catch (e) {
    console.error(e)
    // return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const messagePending = async () => {
  const endTime = Math.floor(
    moment()
      .subtract(5, 'minute')
      .unix()
  )
  const startTime = Math.floor(
    moment()
      .subtract(10, 'minute')
      .unix()
  )
  try {
    const sql = `SELECT chat.*, s.email ,CONCAT(u.firstname, ' ', u.lastname) AS sender_name, CONCAT(s.firstname, ' ', s.lastname) AS user_name FROM chat, users AS u, users AS s WHERE is_read = 0 AND chat.timestamp < ${endTime} AND chat.timestamp > ${startTime} AND chat.fromid = u.id AND chat.toid = s.id`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, users) {
      if (err) {
        console.log(err)
        return true
      }
      users.map(user => {
        sendPendingMessages(user)
        // var sql3 = `INSERT INTO complete_profile (conversationid, email) VALUES ('${user.conversationid}', '${user.email}')`
        // // eslint-disable-next-line no-undef
        // db.query(sql3, function(err, result) {
        //   if (err) {
        //     console.log(err)
        //     return true
        //   }
        // })
      })
      return true
    })
  } catch (e) {
    console.error(e)
    // return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const messagePendingForever = async (req, res) => {
  try {
    const sql = `SELECT messages.*, s.email ,CONCAT(u.firstname, ' ', u.lastname) AS sender_name, CONCAT(s.firstname, ' ', s.lastname) AS user_name FROM messages, users AS u, users AS s WHERE is_read = 0 AND messages.sender_id = u.id AND messages.receiver_id = s.id`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, users) {
      if (err) {
        console.log(err)
        return true
      }

      // users.map(user => {
      // sendPendingMessages(user)
      // var sql3 = `INSERT INTO pending_message_email (conversationid, email) VALUES ('${
      //   user.conversationid ? user.conversationid : 0
      // }', '${user.email}')`
      // // eslint-disable-next-line no-undef
      // db.query(sql3, function(err, result) {
      //   if (err) {
      //     console.log(err)
      //     return true
      //   }
      // })
      // })
      // return true

      return res.status(200).json({
        data: {
          users
        },
        message: 'success',
        status: true
      })
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const newNotifications = async (req, res) => {
  const endTime = Math.floor(moment().unix())
  const startTime = Math.floor(
    moment()
      .subtract(24, 'hour')
      .unix()
  )
  try {
    const sql = `SELECT notification.*, CONCAT(u.firstname, ' ', u.lastname) AS user_name FROM notification, users AS u WHERE notification.is_read = 0 AND notification.timestamp < ${endTime} AND notification.timestamp > ${startTime} AND notification.toid = u.id`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, users) {
      if (err) {
        console.log(err)
        return true
      }
      return res
        .status(200)
        .json({ data: users, message: 'success', status: true })
      users.map(user => {
        // sendPendingMessages(user)
        // var sql3 = `INSERT INTO complete_profile (conversationid, email) VALUES ('${user.conversationid}', '${user.email}')`
        // // eslint-disable-next-line no-undef
        // db.query(sql3, function(err, result) {
        //   if (err) {
        //     console.log(err)
        //     return true
        //   }
        // })
      })
      // return true
    })
  } catch (e) {
    console.error(e)
    // return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const connectionPending = async () => {
  const endTime = Math.floor(moment().unix())
  const startTime = Math.floor(
    moment()
      .subtract(24, 'hour')
      .unix()
  )
  try {
    const sql = `SELECT chat.*, s.email ,CONCAT(u.firstname, ' ', u.lastname) AS sender_name, CONCAT(s.firstname, ' ', s.lastname) AS user_name FROM chat, users AS u, users AS s WHERE is_read = 0 AND chat.timestamp < ${endTime} AND chat.timestamp > ${startTime} AND chat.fromid = u.id AND chat.toid = s.id`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, users) {
      if (err) {
        console.log(err)
        return true
      }
      users.map(user => {
        sendPendingMessages(user)
        // var sql3 = `INSERT INTO complete_profile (conversationid, email) VALUES ('${user.conversationid}', '${user.email}')`
        // // eslint-disable-next-line no-undef
        // db.query(sql3, function(err, result) {
        //   if (err) {
        //     console.log(err)
        //     return true
        //   }
        // })
      })
      return true
    })
  } catch (e) {
    console.error(e)
    // return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const jobsPendingForever = async (req, res) => {
  const endTime = Math.floor(
    moment()
      .subtract(48, 'hour')
      .unix()
  )
  try {
    const sql = `SELECT s.serviceid, u.id AS userId, u.email, CONCAT(u.firstname, ' ', u.lastname) AS user_name, j.* FROM users AS u RIGHT JOIN user_services AS s ON s.userid = u.id INNER JOIN job_service AS js ON s.serviceid = js.serviceid LEFT JOIN job_post AS j ON js.job_id = j.id WHERE j.timestamp > ${endTime} AND j.status=0`
    // JOIN job_skills AS js ON s.skills = js.skillsid`

    // eslint-disable-next-line no-undef
    db.query(sql, function(err, users) {
      if (err) {
        console.log(err)
        return true
      }

      const filterUser = uniq(map(users, 'userId'))
      filterUser.map(userId => {
        const filterUniqueJobsByUser = uniqBy(
          filter(users, { userId: userId }),
          'id'
        )

        if (userId == 468) {
          // sendJobNewsletter(filterUniqueJobsByUser)
          console.log(userId, filterUniqueJobsByUser)
        }
      })
      return res.status(200).json({
        data: {
          users,
          filterUser
        },
        message: 'success',
        status: true
      })
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const jobsPending = async () => {
  const endTime = Math.floor(
    moment()
      .subtract(48, 'hour')
      .unix()
  )
  try {
    const sql = `SELECT s.serviceid, u.id AS userId, u.email, CONCAT(u.firstname, ' ', u.lastname) AS user_name, j.* FROM users AS u RIGHT JOIN user_services AS s ON s.userid = u.id INNER JOIN job_service AS js ON s.serviceid = js.serviceid LEFT JOIN job_post AS j ON js.job_id = j.id WHERE j.timestamp > ${endTime} AND j.status=0`
    // eslint-disable-next-line no-undef
    db.query(sql, function(err, users) {
      if (err) {
        console.log(err)
        return true
      }

      const filterUser = uniq(map(users, 'userId'))
      filterUser.map(userId => {
        const filterUniqueJobsByUser = uniqBy(
          filter(users, { userId: userId }),
          'id'
        )

        sendJobNewsletter(filterUniqueJobsByUser)
      })
    })
  } catch (e) {
    console.error(e)
  }
}
