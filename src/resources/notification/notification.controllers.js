import { query } from '../../server'
const isEmpty = require('../../validations/is-empty')

export const getUserNotification = async (req, res) => {
  try {
    const result = await query(
      `select notification.*, users.username, users.firstname, users.lastname
      from notification 
      left join users on notification.senderid = users.id 
      where toid = ${req.user[0].id} 
      order by notification.timestamp desc
      LIMIT ${req.query.limit || 20} 
      OFFSET ${req.query.offset || 0}`
    )
    if (!isEmpty(result)) {
      res.status(200).json({ data: result, message: `Notification fetched`, status: true })
    } else {
      res.status(404).json({ data: [], message: `No notifications`, status: true })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const updateUserNotification = async (req, res) => {
  try {
    if (req.body.id && req.body.id.length) {
      var notification = `update notification set is_read=1 where toid=${req.user[0].id} and id=${req.body.id[0]}`
      req.body.id.map((item, index) => {
        if (index != 0) {
          notification += ` or id=${item}`
        }
      })
      const result = await query(notification)
      if (result.affectedRows) {
        res.status(200).json({
          data: true,
          message: 'Notification Read Successfully',
          status: true
        })
      } else {
        res.status(200).json({
          data: false,
          message: 'All notification have been already read',
          status: true
        })
      }
    } else {
      res.status(400).json({ data: false, message: `Invalid request`, status: false })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}
