import { query } from '../../server'
import moment from 'moment'
import { fileTypeValidation, randomString } from '../../utils/helper'
// const isEmpty = require('../../validations/is-empty')
import { s3 } from '../../config/index'

export const uploadAttachment = async (req, res) => {
  const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png']
  const obj = fileTypeValidation(req.file, allowedMimes)
  if (!obj.status) {
    return res.status(500).json({ data: false, message: obj.error, status: false })
  }
  try {
    const uploadParams = {
      Bucket: 'karuna-times',
      Key: '', // pass key
      Body: null, // pass file body
      ACL: 'public-read'
    }
    uploadParams.Key = req.params.attachmentname + '-' + Date.now() + '-' + randomString(10, '#aA')
    uploadParams.Body = req.file.buffer

    s3.upload(uploadParams, async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error -> ' + err })
      }
      const URL = `https://cloud.karunatimes.org/${result.Key}`
      const imgLowRes = `https://cdn.karunatimes.org/filters:autojpg()/fit-in/500x600/${result.Key}`
      const insertResult = await query(`insert into pending_upload(filename,url,timestamp) values
        ("${result.Key}","${URL}","${moment().unix()}")`)
      if (insertResult.affectedRows) {
        res.status(200).json({
          data: { id: insertResult.insertId, url: URL, url_low: imgLowRes },
          message: `File upload successful`,
          status: true
        })
      } else {
        res.status(400).json({ data: false, message: 'Something went wrong', status: false })
      }
    })
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}
