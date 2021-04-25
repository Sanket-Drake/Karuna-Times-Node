import { query, eventEmitter } from '../../server'
import { BASE_URL, chatType } from '../../utils/helper'
import moment from 'moment'
import { validateCustomOffer } from '../../validations/custom-offer'
import { validateProjectInquiry } from '../../validations/project-inquiry'
const isEmpty = require('../../validations/is-empty')

export const getAllChat = async (req, res) => {
  try {
    const result = await query(`select chat_conversation.id, chat_conversation.creator_id,
      chat_participants.users_id as participant_id,user_profile.userid,
      c1.id as message_id, c1.message_type, c1.message,c1.message_attach,c1.is_read,c1.created_at,
      users.firstname, users.lastname, users.username, user_profile.profilpic
      from chat_conversation 
      left join chat_participants on chat_conversation.id = chat_participants.conversation_id
      left join users on users.id = chat_conversation.creator_id or users.id = chat_participants.users_id
      left join user_profile on user_profile.userid = users.id
      left join chat_messages c1 on chat_conversation.id = c1.conversation_id
      left outer join  chat_messages c2 on (chat_conversation.id = c2.conversation_id and 
       (c1.created_at<c2.created_at or (c1.created_at=c2.created_at and c1.id<c2.id)))
      where (chat_conversation.creator_id=${req.user[0].id} or chat_participants.users_id=${req.user[0].id})
       and user_profile.userid!=${req.user[0].id} and c2.id is null;`)
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

export const getUserChatByConversationId = async (req, res) => {
  try {
    const result = await query(`select * from chat_messages where conversation_id = ${req.params.conversationId};`)
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

export const getConversationByUserId = async (req, res) => {
  try {
    const result = await query(`select chat_conversation.id, chat_conversation.creator_id, 
     chat_participants.users_id,chat_participants.type
     from chat_conversation left join 
     chat_participants on chat_conversation.id = chat_participants.conversation_id 
     where (chat_conversation.creator_id = ${req.user[0].id} and chat_participants.users_id=${req.query.id}) 
     or (chat_conversation.creator_id = ${req.query.id} and chat_participants.users_id=${req.user[0].id})`)
    if (!isEmpty(result)) {
      const result2 = await query(`select * from chat_messages where conversation_id = ${result[0].id}
        order by chat_messages.created_at desc
        LIMIT ${req.query.limit || 20} 
        OFFSET ${req.query.offset || 0};`)
      if (!isEmpty(result2)) {
        res.status(200).json({ data: result2, message: `Data fetched`, status: true })
      } else {
        res.status(404).json({ data: [], message: `No conversation found`, status: true })
      }
    } else {
      res.status(404).json({ data: [], message: `No conversation found`, status: true })
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}

/**
 data:{
  sender_id: 1,
  reciever_id: 2,
  title: "title"(compulsory),
  description: "des", 
  price:10(>=10), 
  delivery_time:2(>=2),
  revision:2(>=2)
 }
 */
export const customOffer = async (req, res) => {
  const { validationError, isValid } = validateCustomOffer(req.body)
  if (!isValid) {
    return res.status(400).json({ message: 'fail', status: false, error: validationError })
  }
  const result = await query(`insert into custom_offer(creator_id, client_id, title, description,
    price, delivery_time, revision) values 
    (${req.user[0].id},${req.body.reciever_id},"${req.body.title}","${req.body.description}",
    ${req.body.price},${req.body.delivery_time},${req.body.revision})`)
  if (result.affectedRows) {
    if (!isEmpty(req.body.conversation_id)) {
      const result2 = await query(`insert into chat_messages (conversation_id, sender_id,
       message_type, message_attach, message, is_read, is_email_sent, external_id)
       values (${req.body.conversation_id}, ${req.user[0].id},'${chatType.customOffer}'
       , "${BASE_URL}checkout?type=custom&offer_ref_id=${result.insertId}",'0', 0, 0, ${result.insertId})`)
      if (result2.affectedRows) {
        eventEmitter.emit('custom_offer', { message_attach: `${BASE_URL}checkout?type=custom&offer_ref_id=${result.insertId}` })
        return res.status(200).json({
          data: { message_attach: `${BASE_URL}checkout?type=custom&offer_ref_id=${result.insertId}` },
          message: `Data Updated`,
          status: true
        })
      } else {
        return res.status(400).json({ data: false, message: 'fail', status: false })
      }
    } else {
      try {
        const insertConversation = `insert into chat_conversation(creator_id,created_at) 
        values (${req.user[0].id},'${moment().format('YYYY-MM-DD hh:mm:ss')}');`
        await query(`begin;`)
        const resultConversation = await query(insertConversation)
        await query(`insert into chat_participants(conversation_id,users_id,type,updated_at)
        values (${resultConversation.insertId},${req.body.reciever_id},'oneonone',
        '${moment().format('YYYY-MM-DD hh:mm:ss')}');`)
        await query(`insert into chat_messages(conversation_id, sender_id,
          message_type, message_attach, message, is_read, is_email_sent, external_id)
          values (${resultConversation.insertId},${req.user[0].id},'${chatType.customOffer}'
          , '${BASE_URL}checkout?type=custom&offer_ref_id=${result.insertId}','0', 0, 0, ${result.insertId});`)
        await query(`commit;`)
        eventEmitter.emit('custom_offer', {
          message_attach: `${BASE_URL}checkout?type=custom&offer_ref_id=${result.insertId}`
        })
        return res.status(200).json({
          data: { message_attach: `${BASE_URL}checkout?type=custom&offer_ref_id=${result.insertId}` },
          message: `Data Updated`,
          status: true
        })
      } catch (e) {
        try {
          console.log(e)
          await query(`rollback;`)
          return res.status(400).json({ data: e, message: 'fail', status: false })
        } catch (e) {
          console.log('Error rolling back, ', e)
          return res.status(400).json({ data: e, message: 'fail', status: false })
        }
      }
    }
  }
}

export const userProjectInquiry = async (req, res) => {
  const { validationError, isValid } = validateProjectInquiry(req.body)
  if (!isValid) {
    return res.status(400).json({ message: 'fail', status: false, error: validationError })
  }
  try {
    const result = await query(`insert into user_project_inquiry (user_id, sender_id, description, budget, time)
    values (${req.body.user_id}, ${req.user[0].id}, "${req.body.description}", ${req.body.budget},
     ${req.body.duration})`)
    if (result.affectedRows) {
      // logical operation could be of wrong precedence in SQL query) {
      const conversationId = await query(`SELECT DISTINCT (chat_conversation.id) as conversation_id from 
       chat_conversation LEFT JOIN chat_participants 
       ON chat_conversation.id = chat_participants.conversation_id 
       WHERE chat_conversation.creator_id = ${req.user[0].id} AND chat_participants.users_id = ${req.body.user_id} 
       OR chat_conversation.creator_id = ${req.body.user_id} AND chat_participants.users_id = ${req.user[0].id};`)
      if (!isEmpty(conversationId)) {
        const chatMessage = await query(`insert into chat_messages (conversation_id, sender_id,
          message_type, message_attach, message, is_read, is_email_sent, external_id)
          values (${conversationId[0].conversation_id}, ${req.user[0].id},'${chatType.projectEnquiry}'
          , '${BASE_URL}projectenq/${result.insertId}','0', 0, 0, ${result.insertId})`)
        if (chatMessage.affectedRows) {
          eventEmitter.emit('project_inquiry', { message_attach: `${BASE_URL}projectenq/${result.insertId}` })
          return res.status(200).json({ data: true, message: `Project inquiry sent`, status: true })
        } else {
          return res.status(404).json({ data: false, message: `Request failed`, status: false })
        }
      } else {
        try {
          const insertConversation = `insert into chat_conversation(creator_id,created_at) 
          values (${req.user[0].id},'${moment().format('YYYY-MM-DD hh:mm:ss')}');`
          await query(`begin;`)
          const resultConversation = await query(insertConversation)
          await query(`insert into chat_participants(conversation_id,users_id,type,updated_at)
          values (${resultConversation.insertId},${req.body.user_id},'oneonone',
          '${moment().format('YYYY-MM-DD hh:mm:ss')}');`)
          await query(`insert into chat_messages(conversation_id, sender_id,
            message_type, message_attach, message, is_read, is_email_sent, external_id)
            values (${resultConversation.insertId},${req.user[0].id},'${chatType.projectEnquiry}'
            , '${BASE_URL}projectenq/${result.insertId}','0', 0, 0, ${result.insertId});`)
          await query(`commit;`)
          eventEmitter.emit('project_inquiry', { message_attach: `${BASE_URL}projectenq/${result.insertId}` })
          return res.status(200).json({
            data: true,
            message: `Project inquiry sent`,
            status: true
          })
        } catch (e) {
          try {
            await query(`rollback;`)
            console.log(e)
            return res.status(400).json({ data: e, message: 'fail', status: false })
          } catch (e) {
            console.log('Error rolling back, ', e)
            return res.status(400).json({ data: e, message: 'fail', status: false })
          }
        }
      }
    }
  } catch (e) {
    console.log(e)
    return res.status(400).json({ data: e, message: 'fail', status: false })
  }
}
