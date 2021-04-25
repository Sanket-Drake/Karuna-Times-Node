// import { Offer } from './taskboard.model'

import { query } from '../../server'

const isEmpty = require('../../validations/is-empty')

export const getCountry = async (req, res) => {
  try {
    const country = await query(`select * from countries;`)
    if (!isEmpty(country)) {
      return res
        .status(200)
        .json({ data: country, message: 'Countries Fetched', status: true })
    } else {
      return res
        .status(400)
        .json({ data: false, message: 'Error fetching country', status: false })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const getState = async (req, res) => {
  try {
    var country = req.params.cid
    if (!isEmpty(country)) {
      const state = await query(
        `select * from states where country_id=${country};`
      )
      if (!isEmpty(state)) {
        return res
          .status(200)
          .json({ data: state, message: 'States Fetched', status: true })
      } else {
        return res.status(400).json({
          data: false,
          message: 'No States Found',
          status: false
        })
      }
    } else {
      return res.status(400).json({
        data: false,
        message: 'Invalid Country',
        status: false
      })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const getCity = async (req, res) => {
  try {
    var state = req.params.sid
    if (!isEmpty(state)) {
      const city = await query(`select * from cities where state_id=${state};`)
      if (!isEmpty(city)) {
        return res
          .status(200)
          .json({ data: city, message: 'Cities Fetched', status: true })
      } else {
        return res.status(400).json({
          data: false,
          message: 'No cities found',
          status: false
        })
      }
    } else {
      return res.status(400).json({
        data: false,
        message: 'Invalid State',
        status: false
      })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const getUserLocation = async (req, res) => {
  try {
    const result = await query(
      `select user_profile.country,countries.id as 'country_id',user_profile.state,states.id as 'state_id',user_profile.city,cities.id as 'city_id' from user_profile left join cities on user_profile.city_id=cities.id left join states on cities.state_id=states.id left join countries on states.country_id=countries.id where user_profile.userid=${req.user[0].id};`
    )
    if (result) {
      return res
        .status(200)
        .json({ data: result, message: 'Location Fetched', status: true })
    } else {
      return res.status(400).json({
        data: false,
        message: 'something went wrong',
        status: false
      })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}


export const getUserSocialPlatforms = async (req, res) => {
  try {
    const platform = await query(
      `select * from user_platform_list where user_id=${req.user[0].id};`
    )
    if (!isEmpty(platform)) {
      return res
        .status(200)
        .json({ data: platform, message: 'Platforms Fetched', status: true })
    } else {
      return res.status(404).json({
        data: [],
        message: 'No Platforms Available',
        status: true
      })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const getSocialPlatforms = async (req, res) => {
  try {
    const result = await query(`select * from similarplatform;`)
    if (!isEmpty(result)) {
      return res
        .status(200)
        .json({ data: result, message: 'Platforms Fetched', status: true })
    } else {
      return res.status(404).json({
        data: [],
        message: 'No Platforms Available',
        status: true
      })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

// API function to get all services from database
export const getService = async (req, res) => {
  try {
    const result = await query(`select * from servicelist where is_live = 1;`)
    if (!isEmpty(result)) {
      return res
        .status(200)
        .json({ data: result, message: 'Service List fetched', status: true })
    } else {
      return res.status(404).json({
        data: [],
        message: 'No Service is live currently',
        status: true
      })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

// API function to get all skills from database
export const getSkills = async (req, res) => {
  try {
    const skills = await query('select * from skills_dataset')
    if (!isEmpty(skills)) {
      return res
        .status(200)
        .json({ data: skills, message: 'Skills fetched', status: true })
    } else {
      return res
        .status(404)
        .json({ data: [], message: 'No skills available ', status: false })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const getPortfolioTags = async(req,res)=>{
  try {
    const tags = await query('select * from portfolio_tags')
    if (!isEmpty(tags)) {
      return res
        .status(200)
        .json({ data: tags, message: "Tag's fetched", status: true })
    } else {
      return res
        .status(404)
        .json({ data: [], message: "No tag's available", status: false })
    }
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}