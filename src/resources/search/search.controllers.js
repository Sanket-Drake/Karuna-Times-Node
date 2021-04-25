import moment from 'moment'
import { map, uniq, filter, uniqBy } from 'lodash'
import { query } from '../../server'

export const generalSearch = async (req, res) => {
  const searchQuery = req.query.search
    .replace(/\s{2,}/g, ' ')
    .trim()
    .split(' ')
  console.log(req.query.search)
  const searchQueryTrimmed = req.query.search.replace(/\s{2,}/g, ' ').trim()
  try {
    let user1 = `SELECT u.firstname, u.lastname, u.username, u.id, p.profilpic, p.proftitle FROM users AS u LEFT JOIN user_profile AS p ON u.id = p.userid WHERE CONCAT_WS(' ', u.firstname, u.lastname) LIKE '%${searchQueryTrimmed}%' LIMIT 10 OFFSET ${req
      .query.page * 10 || 0}`
    let user = `SELECT u.firstname, u.lastname, u.username, u.id, p.profilpic, p.proftitle FROM users AS u LEFT JOIN user_profile AS p ON u.id = p.userid  WHERE 
    u.firstname LIKE '%${searchQuery[0]}%' OR 
    u.lastname LIKE '%${searchQuery[0]}%' OR 
    u.username LIKE '%${searchQuery[0]}%'
    `

    let location = `SELECT u.firstname, u.lastname, u.username, u.id, p.profilpic, p.proftitle, p.city, p.state, p.country FROM users AS u LEFT JOIN user_profile AS p
    ON u.id = p.userid  WHERE 
    p.country LIKE '%${searchQuery[0]}%'OR 
    p.city LIKE '%${searchQuery[0]}%' OR 
    p.state LIKE '%${searchQuery[0]}%'`

    let skill = `SELECT u.firstname, u.lastname, u.username, u.id, p.profilpic, p.proftitle, GROUP_CONCAT(DISTINCT d.name SEPARATOR "|") AS skill FROM users AS u LEFT JOIN user_profile AS p
    ON u.id = p.userid LEFT JOIN user_skills AS s ON u.id = s.userid LEFT JOIN skills_dataset AS d ON s.skills = d.id WHERE 
    d.name LIKE '%${searchQuery[0]}%'`

    searchQuery.map((searchWord, index) => {
      if (index != 0) {
        user += `OR u.firstname LIKE '%${searchWord}%' OR u.lastname LIKE '%${searchWord}%' OR u.username LIKE '%${searchWord}%'`

        location += `OR p.country LIKE '%${searchWord}%' OR p.city LIKE '%${searchWord}%' OR p.state LIKE '%${searchWord}%'`

        skill += `OR d.name LIKE '%${searchWord}%'`
      }
    })
    skill += ` GROUP BY u.id LIMIT 10 OFFSET ${req.query.page * 10 || 0}`
    location += ` LIMIT 10 OFFSET ${req.query.page * 10 || 0}`
    user += ` LIMIT 10 OFFSET ${req.query.page * 10 || 0}`

    // eslint-disable-next-line no-undef
    db.query(user1, function(err, users1) {
      if (err) {
        console.log(err)
        return true
      }
      // eslint-disable-next-line no-undef
      db.query(user, function(err, users) {
        if (err) {
          console.log(err)
          return true
        }
        // eslint-disable-next-line no-undef
        db.query(location, function(err, locations) {
          if (err) {
            console.log(err)
            return true
          }
          // eslint-disable-next-line no-undef
          db.query(skill, function(err, skills) {
            if (err) {
              console.log(err)
              return true
            }
            if (searchQuery.length == 1) {
              return res.status(200).json({
                data: {
                  users: [...users],
                  locations,
                  skills
                },
                message: 'success',
                status: true
              })
            }
            const uniqueUser = uniq([...users1, ...users], function(obj) {
              return obj.id
            })
            return res.status(200).json({
              data: {
                users: uniqueUser,
                locations,
                skills
              },
              message: 'success',
              status: true
            })
          })
        })
        // return res.status(200).json({
        //   data: {
        //     users
        //   },
        //   message: 'success',
        //   status: true
        // })
      })
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

export const serviceSearch = async (req, res) => {
  const serviceId = req.query.id
  try {
    let skill = `SELECT u.firstname, u.lastname, u.username, u.id, p.profilpic, p.proftitle, GROUP_CONCAT(DISTINCT d.name SEPARATOR "|") AS skill, sl.name FROM users AS u LEFT JOIN user_profile AS p
    ON u.id = p.userid LEFT JOIN user_skills AS s ON u.id = s.userid LEFT JOIN skills_dataset AS d ON s.skills = d.id LEFT JOIN user_services AS us ON u.id = us.userid LEFT JOIN servicelist AS sl ON us.serviceid = sl.id  WHERE 
    us.serviceid = '${serviceId}'`

    skill += ` GROUP BY u.id LIMIT 10 OFFSET ${req.query.page * 10 || 0}`

    const skills = await query(skill)

    return res.status(200).json({
      data: {
        skills
      },
      message: 'success',
      status: true
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

//
// by location
// by name email
// by by skills
// space usage
export const generalTest = async (req, res) => {
  const searchQuery = req.body.search
  console.log(req.body.search)

  try {
    let user = `SELECT cm.*, u.firstname, u.lastname, u.username, u.id, p.profilpic, p.proftitle FROM conversation_member AS c 
    LEFT JOIN conversation_member AS cm ON c.conversation_id = cm.conversation_id 
    LEFT JOIN users AS u ON cm.member_id = u.id 
    LEFT JOIN user_profile AS p ON cm.member_id = p.userid 
    WHERE c.member_id <> cm.member_id AND c.member_id = '${searchQuery}'`

    // eslint-disable-next-line no-undef
    db.query(user, function(err, users) {
      if (err) {
        console.log(err)
        return true
      }

      return res.status(200).json({
        data: {
          users: [...users]
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
