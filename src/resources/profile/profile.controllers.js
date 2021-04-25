import { query } from '../../server'
import { socialLink } from '../../validations/social-link'
const isEmpty = require('../../validations/is-empty')
import { s3 } from '../../config/index'

export const viewSelfProfile = async (req, res) => {
  try {
    const result = await query(
      `select user_profile.usertype, user_profile.cover_image, user_profile.profilpic, user_profile.perhour, user_profile.company,
      user_profile.website, user_profile.city, user_profile.country, user_profile.description, user_profile.proftitle,
      user_social_profile.linkedin, user_social_profile.dribbble, user_social_profile.github, user_social_profile.instagram,
      user_social_profile.twitter, user_social_profile.medium, GROUP_CONCAT(distinct skills_dataset.name separator '|') AS 'Skills',
      GROUP_CONCAT(distinct servicelist.name separator '|') as 'Services',
      (AVG(user_reputation.affected_factor_rating) - AVG(user_reputation.affecting_factor_negative)) as profile_strength 
      from user_profile left JOIN user_skills on user_profile.userid = user_skills.userid left JOIN skills_dataset on user_skills.skills =skills_dataset.id 
      left JOIN user_social_profile on user_social_profile.userid = user_profile.userid left JOIN user_services on user_services.userid = user_profile.userid 
      left JOIN servicelist on servicelist.id = user_services.serviceid left JOIN user_reputation on user_reputation.user_id = user_profile.userid 
      where user_profile.userid = ${req.user[0].id};`
    )
    const connectionCount = await query(
      `select count(sender_id) as connection_count from connection_list where approved_con = 1 and sender_id = ${req.user[0].id} group by sender_id;`
    )

    if (!isEmpty(result[0])) {
      res.status(200).json({
        data: {
          ...result[0],
          ...connectionCount[0],
          id: req.user[0].id,
          firstname: req.user[0].firstname,
          lastname: req.user[0].lastname
        },
        message: `Data fetched.`,
        status: true
      })
    } else {
      res.status(404).json({
        data: {},
        message: 'No data found',
        status: true
      })
    }
  } catch (e) {
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const getUserProfile = async (req, res) => {
  try {
    const result = await query(
      `select users.firstname, users.lastname, users.username, user_profile.profilpic, user_profile.usertype, 
      user_profile.proftitle, user_profile.description, user_profile.perhour, user_profile.country, 
      user_profile.state, user_profile.city, user_profile.country_code, user_profile.mobile, user_profile.company,
      user_profile.website, user_profile.cover_image, user_profile.cover_image_lowres, user_profile.city_id,
      user_social_profile.linkedin, user_social_profile.dribbble, user_social_profile.github, 
      user_social_profile.instagram, user_social_profile.twitter, user_social_profile.medium, 
      GROUP_CONCAT(distinct skills_dataset.name separator '|') AS 'Skills', 
      GROUP_CONCAT(distinct servicelist.name separator '|') as 'Services', 
      (AVG(user_reputation.affected_factor_rating) - AVG(user_reputation.affecting_factor_negative)) as profile_strength 
      from users 
      left join user_profile on users.id = user_profile.userid 
      left JOIN user_skills on users.id = user_skills.userid 
      left join user_social_profile on users.id = user_social_profile.userid 
      left JOIN skills_dataset on user_skills.skills =skills_dataset.id 
      left JOIN user_services on user_services.userid = users.id 
      left JOIN servicelist on servicelist.id = user_services.serviceid 
      left JOIN user_reputation on user_reputation.user_id = users.id 
      where users.id = ${req.params.id} group by users.id`
    )
    const connectionCount = await query(
      `select count(sender_id) as connection_count from connection_list where approved_con = 1 and sender_id = ${req.params.id} group by sender_id;`
    )
    var resultConnection = await query(
      `select approved_con from connection_list where sender_id = ${req.user[0].id} and connecting_to = ${req.params.id}`
    )
    if (!resultConnection[0]) {
      resultConnection = [{ approved_con: null }]
    }
    if (!isEmpty(result[0])) {
      res.status(200).json({
        data: { ...result[0], ...resultConnection[0], ...connectionCount[0] },
        message: `Data fetched`,
        status: true
      })
    } else {
      res.status(404).json({ data: {}, message: `User not found`, status: false })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const updateSocialProfile = async (req, res) => {
  const { validationError, isValid } = socialLink(req.body)
  if (!isValid) {
    return res.status(400).json({ message: 'fail', status: false, error: validationError })
  }
  try {
    const result = await query(`select userid from user_social_profile where userid=${req.user[0].id}`)
    if (isEmpty(result)) {
      const socialprofile = await query(`insert into user_social_profile (userid,github,dribbble,linkedin,instagram,twitter,medium)
      values (${req.user[0].id},'${req.body.github ? req.body.github : ``}','${req.body.dribbble ? req.body.dribbble : ``}',
      '${req.body.linkedin ? req.body.linkedin : ``}','${req.body.instagram ? req.body.instagram : ``}',
      '${req.body.twitter ? req.body.twitter : ``}','${req.body.medium ? req.body.medium : ``}')`)
      if (socialprofile.affectedRows) {
        res.status(200).json({ data: true, message: `Data Inserted`, status: true })
      } else {
        res.status(400).json({ data: false, message: `Something went wrong`, status: false })
      }
    } else {
      const socialprofile = await query(`update user_social_profile set github='${req.body.github ? req.body.github : ``}', 
      dribbble='${req.body.dribbble ? req.body.dribbble : ``}',
      linkedin='${req.body.linkedin ? req.body.linkedin : ``}',
      instagram='${req.body.instagram ? req.body.instagram : ``}',
      twitter='${req.body.twitter ? req.body.twitter : ``}',
      medium='${req.body.medium ? req.body.medium : ``}' where userid=${req.user[0].id}`)
      if (socialprofile.affectedRows) {
        res.status(200).json({ data: true, message: `Data Updated`, status: true })
      } else {
        res.status(400).json({ data: false, message: `Something went wrong`, status: false })
      }
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const uploadProfilePicture = async (req, res) => {
  try {
    const uploadParams = {
      Bucket: 'karuna-times',
      Key: '', // pass key
      Body: null, // pass file body
      ACL: 'public-read'
    }
    uploadParams.Key = 'profilepic-' + Date.now() + '-' + req.file.originalname
    uploadParams.Body = req.file.buffer
    s3.upload(uploadParams, async (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Error -> ' + err })
      }
      const updateResult = await query(`update user_profile set profilpic='https://cloud.karunatimes.org/${result.Key}' 
      where userid=${req.user[0].id}`)
      if (updateResult.affectedRows) {
        res.status(200).json({ data: true, message: `Data Updated`, status: true })
      } else {
        res.status(400).json({ data: false, message: `Something went wrong`, status: false })
      }
    })
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const getUsersProfile = async (req, res) => {
  try {
    const result = await query(
      `select users.id,users.firstname, users.lastname, users.username, user_profile.profilpic, user_profile.usertype, 
      user_profile.proftitle, user_profile.description, user_profile.perhour, user_profile.country, 
      user_profile.state, user_profile.city, user_profile.country_code, user_profile.mobile, user_profile.company,
      user_profile.website, user_profile.cover_image, user_profile.cover_image_lowres, user_profile.city_id,
      user_social_profile.linkedin, user_social_profile.dribbble, user_social_profile.github, 
      user_social_profile.instagram, user_social_profile.twitter, user_social_profile.medium, 
      GROUP_CONCAT(distinct skills_dataset.name separator '|') AS 'Skills', 
      GROUP_CONCAT(distinct servicelist.name separator '|') as 'Services', 
      (AVG(user_reputation.affected_factor_rating) - AVG(user_reputation.affecting_factor_negative)) as profile_strength 
      from users 
      left join user_profile on users.id = user_profile.userid 
      left JOIN user_skills on users.id = user_skills.userid 
      left join user_social_profile on users.id = user_social_profile.userid 
      left JOIN skills_dataset on user_skills.skills =skills_dataset.id 
      left JOIN user_services on user_services.userid = users.id 
      left JOIN servicelist on servicelist.id = user_services.serviceid 
      left JOIN user_reputation on user_reputation.user_id = users.id 
      where users.username = '${req.params.username}' group by users.id`
    )
    if (!isEmpty(result)) {
      const connectionCount = await query(
        `select count(sender_id) as connection_count from connection_list where approved_con = 1 and sender_id = ${result[0].id} group by sender_id;`
      )
      var resultConnection = await query(
        `select approved_con from connection_list where sender_id = ${req.user[0].id} and connecting_to = ${result[0].id}`
      )
      if (!resultConnection[0]) {
        resultConnection = [{ approved_con: null }]
      }
      res.status(200).json({
        data: { ...result[0], ...resultConnection[0], ...connectionCount[0] },
        message: `Data fetched`,
        status: true
      })
    } else {
      res.status(404).json({ data: {}, message: `User not found`, status: false })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const updateDescription = async (req, res) => {
  try {
    const result = await query(`update user_profile set description="${req.body.description}" where userid=${req.user[0].id}`)
    if (result.affectedRows) {
      res.status(200).json({ data: true, message: `Data Updated`, status: true })
    } else {
      res.status(404).json({ data: false, message: `Invalid request`, status: true })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}
