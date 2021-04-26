import usersRouter from './resources/users/users.router'
import emailRouter from './resources/email/email.router'
import searchRouter from './resources/search/search.router'
import prefetchRouter from './resources/prefetch/prefetch.router'
import notificationRouter from './resources/notification/notification.router'
import profileRouter from './resources/profile/profile.router'
import hospitalRouter from './resources/hospital/hospital.router'
import chatRouter from './resources/chat/chat.router'
import uploadsRouter from './resources/uploads/uploads.router'
import settingsRouter from './resources/settings/settings.router'
// import { signup, signin, menuPermission } from './utils/auth'
import {
  // completeProfile,
  // messagePending,
  jobsPending
} from './resources/email/email.controllers'
import cron from 'node-cron'
import moment from 'moment'
import { sqldb, port, env } from './config'
import { chatType } from './utils/helper'
// Import events module
var events = require('events')
export const eventEmitter = new events.EventEmitter()
// import { sendCompleteEmail } from './utils/sendGridHelper'

var socket = require('socket.io')
var express = require('express')
var cors = require('cors')
var morgan = require('morgan')
var mysql = require('mysql')
var https = require('https')
var http = require('http')
// var fs = require('fs')
const bodyParser = require('body-parser')
const util = require('util')
const isEmpty = require('./validations/is-empty')

console.log('--------------------------------------')
console.log(`Server starting at ${port}`)
console.log('Database: ', sqldb)
console.log('Type: ', env)
// console.log('Secrets: ', secrets )
console.log()
console.log("Type 'rs' and press enter to restart")
console.log('--------------------------------------')
console.log()

var db = mysql.createConnection({
  host: sqldb.host,
  user: sqldb.user,
  password: sqldb.password,
  database: sqldb.database
})

// connect to database
db.connect(err => {
  if (err) {
    throw err
  }
  console.log('Connected to database 12')
})
global.db = db

// node native promisify
export const query = util.promisify(db.query).bind(db)

// setting up server
var app = express()

app.use(cors({ credentials: false }))
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true
  })
)
app.use(morgan('dev'))

// app.use('/api/v1/login', signin)
// app.use('/api/v1/signup', signup)
// app.use('/api/v1/user/menu', menuPermission)
app.use('/api/v1/users', usersRouter)
app.use('/api/v1/email', emailRouter)
app.use('/api/v1/search', searchRouter)
app.use('/api/v1/prefetch', prefetchRouter)
app.use('/api/v1/profile', profileRouter)
app.use('/api/v1/hospital', hospitalRouter)
app.use('/api/v1/chat', chatRouter)
app.use('/api/v1/notification', notificationRouter)
app.use('/api/v1/uploads', uploadsRouter)
app.use('/api/v1/settings', settingsRouter)

// if (env === 'production') {
//   // everyday @11:00 AM (00:00)
//   // cron.schedule('0 11 * * *', completeProfile)
//   // every 5 minutes
//   // cron.schedule('*/5 * * * *', messagePending)
//   // everyday @11:00 AM (00:00)
//   cron.schedule('0 2 * * *', jobsPending)
// }

app.get('/api/v1/test', (req, res) => {
  console.log(req.ips)
  res.status(200)
  res.json({
    data: 'api is wokring'
  })
})

app.get('/offers', (req, res) => {
  var sql =
    "SELECT c.*, u.email, u.firstname, u.lastname, u.username, u.profile_score, p.*, s.name FROM custom_offer c JOIN users u ON c.fromuserid = u.id JOIN user_profile p ON p.userid = c.fromuserid JOIN servicelist s ON s.id = c.offerservice WHERE s.name = '" +
    req.query.title +
    "'"

  db.query(sql, function(err, result) {
    if (err) console.log(err)

    res.status(200).json({
      data: result
    })
  })
})

var httpServer = http.createServer(app).listen(port)

// var https_server = https.createServer({
//     key: fs.readFileSync('mykey.key'),
//     cert: fs.readFileSync('cert.key')
// }, app).listen(3000);

// emit new order
function emitNewOrder(httpServer) {
  var io = socket.listen(httpServer)
  io.set('origins', '*:*')
  io.sockets.on('connection', function(socket) {
    console.log('connection established')
    eventEmitter.on('custom_offer', data => {
      // send only to the reciever
      io.sockets.emit('chat_message', data)
    })
    eventEmitter.on('project_inquiry', data => {
      // send only to the reciever
      io.sockets.emit('chat_message', data)
    })
    socket.on('chat_message', async function(data) {
      try {
        try {
          if (!isEmpty(data.conversation_id)) {
            const result = await query(`insert into chat_messages (conversation_id, sender_id,
             message_type, message_attach, message, is_read, is_email_sent)
             values (${data.conversation_id}, ${data.sender_id},'${data.message_type}'
             , '${data.message_type === chatType.text ? '0' : data.message_attach}','${
              data.message_type === chatType.text ? data.message : '0'
            }', 0, 0)`)
            if (
              data.message_type === chatType.image ||
              data.message_type === chatType.video ||
              data.message_type === chatType.zip
            ) {
              await query(`update pending_upload set is_used=1 where id = ${data.message_attachement_id}`)
            }
            if (result.affectedRows) {
              io.emit('chat_message', { message: data.message_type === chatType.text ? data.message : data.message_attach })
            } else {
              io.emit('chat_message', { error: 'fail' })
            }
          } else {
            const insertConversation = `insert into chat_conversation(creator_id,created_at) 
             values (${data.sender_id},'${moment().format('YYYY-MM-DD hh:mm:ss')}');`
            const pendingUpload = `update pending_upload set is_used=1 where id = ${data.message_attachement_id}`
            await query(`begin;`)
            const result = await query(insertConversation)
            await query(`insert into chat_participants(conversation_id,users_id,type,updated_at)
             values (${result.insertId},${data.reciever_id},'oneonone','${moment().format('YYYY-MM-DD hh:mm:ss')}');`)
            await query(`insert into chat_messages(conversation_id, sender_id,
             message_type, message_attach, message, is_read, is_email_sent)
             values (${result.insertId},${data.sender_id},'${data.message_type}'
          , '${data.message_type === chatType.text ? '0' : data.message_attach}','${
              data.message_type === chatType.text ? data.message : '0'
            }', 0, 0);`)
            if (
              data.message_type === chatType.image ||
              data.message_type === chatType.video ||
              data.message_type === chatType.zip
            ) {
              await query(pendingUpload)
            }
            await query(`commit;`)
            io.emit('chat_message', { message: data.message_type === chatType.text ? data.message : data.message_attach })
          }
        } catch (err) {
          await query(`rollback;`)
          console.log(err)
          io.emit('chat_message', { error: err })
        }
      } catch (e) {
        console.log('Error rolling back, ', e)
        io.emit('chat_message', { error: e })
      }
    })
    socket.on('live_message', function(data) {
      io.emit('live_message', data)
    })

    socket.on('video_call', function(data) {
      io.emit('video_call', data)
    })

    socket.on('new_order', function(data) {
      io.emit('new_order', data)
      // var userid = data.userid
    })
    socket.on('onlineuser', function(data) {
      socket.id = data.userid
    })
    socket.on('chatmessage', function(data) {
      console.log(data)
      var toid = data.sendtoid
      var fromid = data.fromid
      var message = data.message
      var timestamp = data.timestamp
      var conversationid = data.conversationid
      // save chat message to database

      var sql =
        "INSERT INTO chat (conversationid,toid, fromid, message, timestamp) VALUES ('" +
        conversationid +
        "','" +
        toid +
        "','" +
        fromid +
        "','" +
        message +
        "','" +
        timestamp +
        "')"
      db.query(sql, function(err, result) {
        console.log(err)
      })
      var sql1 = "UPDATE conversation SET lastupdate = '" + timestamp + "' WHERE id = '" + conversationid + "'"
      db.query(sql1, function(err, result) {
        console.log(err)
      })
      io.emit('chatmessage', data)
    })
    socket.on('Typing', function(data) {
      io.emit('Typing', data)
    })
    socket.on('MessageRead', function(data) {
      var fromid = data.fromid
      var sendtoid = data.sendtoid

      var sql =
        "UPDATE chat SET is_read = '1' WHERE(fromid='" +
        fromid +
        "' AND toid='" +
        sendtoid +
        "' AND is_read = '0') OR (fromid='" +
        sendtoid +
        "' AND toid='" +
        fromid +
        "' AND is_read = '0')"
      db.query(sql, function(err, result) {
        console.log(err)
      })
    })
    socket.on('img-msg', function(data) {
      var fromid = data.fromid
      var conversationid = data.conversationid
      var toid = data.sendtoid
      var msg_type = 'image'
      var file_path = data.imgsrc
      var timestamp = data.timestamp
      var sql =
        "INSERT INTO chat (conversationid,msg_type,file_path,toid, fromid, timestamp) VALUES ('" +
        conversationid +
        "','" +
        msg_type +
        "','" +
        file_path +
        "','" +
        toid +
        "','" +
        fromid +
        "','" +
        timestamp +
        "')"
      db.query(sql, function(err, result) {
        console.log(err)
      })
      io.emit('img-msg', data)
    })
    socket.on('disconnect', function() {
      var sql = "UPDATE users SET status = 'offline' WHERE id = '" + socket.id + "'"
      db.query(sql, function(err, result) {
        console.log(err)
      })
    })
  })
}

// emitNewOrder(https_server);

const start = async () => {
  emitNewOrder(httpServer)
}

export default start
