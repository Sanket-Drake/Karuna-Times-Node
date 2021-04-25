import { query } from '../../server'
import { validatePortfolio } from '../../validations/portfolio'
import moment from 'moment'
const isEmpty = require('../../validations/is-empty')

/**
 Data:{
   type:"image",
   title:"An art"
   description:"A beautiful landscape art",
   img_url:"http://www.art.com",
   img_low_url:"https://www.art-low.com",
   video_url:0,
   live_url:0,
   tags:{
     old:[1,2],
     new:["mynewtag"]
   }
 } 
 */
export const uploadPortfolio = async (req, res) => {
  const { validationError, isValid } = validatePortfolio(req.body)
  if (!isValid) {
    return res.status(400).json({ message: 'fail', status: false, error: validationError })
  }
  try {
    try {
      const portfolioData = `insert into portfolio_data(user_id, type, art_title, art_desc, 
          img_url, img_low_url, video_url, live_url, timestamp)
          values (${req.user[0].id},'${req.body.type}',"${req.body.title}","${req.body.description}",
            "${req.body.type === 'video' ? '0' : req.body.img_url}","${req.body.type === 'video' ? '0' : req.body.img_low_url}",
            "${req.body.type === 'video' ? req.body.video_url : '0'}","${req.body.live_url}","${Math.floor(Date.now() / 1000)}")`

      await query(`begin;`)
      const result = await query(portfolioData)

      // If new tag, we insert into portfolio tags table
      // and then add their id to an array of id's which we will use to insert in portfolio_tag table(art_id,tag_id)
      if (!isEmpty(req.body.tags.new)) {
        let newTag = `insert into portfolio_tags (name) values("${req.body.tags.new[0]}")`
        req.body.tags.new.map((item, index) => {
          if (index != 0) {
            newTag += `,("${item}")`
          }
        })
        const newTagResult = await query(newTag)
        req.body.tags.new.map(() => {
          req.body.tags.old.push(newTagResult.insertId)
          newTagResult.insertId += 1
        })
      }

      let artTag = `insert into portfolio_tag (art_id,tag_id) values (${result.insertId},${req.body.tags.old[0]})`
      req.body.tags.old.map((item, index) => {
        if (index != 0) {
          artTag += `,(${result.insertId},${item})`
        }
      })

      await query(artTag)
      await query(`commit;`)

      res.status(200).json({ data: true, message: `Data Updated`, status: true })
    } catch (err) {
      await query(`rollback;`)
      console.log(err)
      return res.status(400).json({ data: err, message: 'fail', status: false })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail in rollback', status: false })
  }
}

export const viewPortfolioById = async (req, res) => {
  try {
    var isUserHimselfFlag = true
    var result = await query(`select portfolio_data.*, count(portfolio_view.art_id) as view_count,
    users.username,users.firstname,users.lastname, user_profile.profilpic,user_social_profile.linkedin,
    user_social_profile.dribbble, user_social_profile.github, 
    user_social_profile.instagram, user_social_profile.twitter, user_social_profile.medium from 
    users 
    left join user_profile on users.id = user_profile.userid
    left join user_social_profile on users.id = user_social_profile.userid 
    left join portfolio_data on users.id = portfolio_data.user_id
    left join portfolio_view on portfolio_data.id = portfolio_view.art_id
    where portfolio_data.id = ${req.params.id};`)
    const likeCount = await query(`select count(portfolio_id) as like_count from portfolio_like 
    where portfolio_id = ${req.params.id}`)
    if (!isEmpty(result)) {
      if (result[0].user_id !== req.user[0].id) {
        var resultConnection = await query(
          `select approved_con from connection_list where sender_id = ${req.user[0].id} and connecting_to = ${result[0].user_id}`
        )
        if (!resultConnection[0]) {
          resultConnection = [{ approved_con: null }]
        }
        isUserHimselfFlag = false
        const date = await query(
          `SELECT date FROM portfolio_view WHERE art_id=${req.params.id} and userid=${req.user[0].id} order by date desc`
        )
        // If user has seen portfolio before and it's been more than 24 hours or he has never seen the portfolio before.
        if (isEmpty(date) || moment().diff(`${date[0].date}`, 'days')) {
          const insertView = await query(
            `insert into portfolio_view(art_id,userid,date) values (${req.params.id},${req.user[0].id},
              '${moment().format('YYYY-MM-DD')}');`
          )
          if (insertView.affectedRows) {
            result[0].view_count = result[0].view_count + 1
          }
        }
      }
      res.status(200).json({
        data: {
          ...result[0],
          ...likeCount[0],
          ...(resultConnection ? resultConnection[0] : {}),
          ...{ isUserHimself: isUserHimselfFlag }
        },
        message: `Data fetched`,
        status: true
      })
    } else {
      res.status(404).json({ data: {}, message: `Data fetched`, status: true })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const viewPortfolioByUser = async (req, res) => {
  try {
    const result = await query(`select portfolio_data.*, 
    users.username,users.firstname,users.lastname, user_profile.profilpic from 
    users 
    left join user_profile on users.id = user_profile.userid
    left join portfolio_data on users.id = portfolio_data.user_id
    where users.id = ${req.query.id} order by portfolio_data.timestamp desc
    LIMIT ${req.query.limit || 4} 
    OFFSET ${req.query.offset || 0};`)
    if (!isEmpty(result)) {
      res.status(200).json({ data: result, message: `Data fetched`, status: true })
    } else {
      res.status(404).json({ data: [], message: `Data fetched`, status: true })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const viewMyPortfolio = async (req, res) => {
  try {
    const result = await query(`select portfolio_data.*, 
    users.username,users.firstname,users.lastname, user_profile.profilpic from 
    users 
    left join user_profile on users.id = user_profile.userid
    left join portfolio_data on users.id = portfolio_data.user_id
    where users.id = ${req.user[0].id} order by portfolio_data.timestamp desc
    LIMIT ${req.query.limit || 4} 
    OFFSET ${req.query.offset || 0};`)
    if (!isEmpty(result)) {
      res.status(200).json({ data: result, message: `Data fetched`, status: true })
    } else {
      res.status(404).json({ data: [], message: `Data fetched`, status: true })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}
