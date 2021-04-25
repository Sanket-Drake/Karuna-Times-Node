import { sendgridKey } from '../config'

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(sendgridKey)
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendCompleteEmail = user => {
  // const hostUrl = config.hostURL
  const msg = {
    to: user.email,
    from: {
      name: 'Karuna-Times',
      email: 'admin@karunatimes.org'
    },
    subject: 'Hey, we see you signed up but never completed profile',
    // dynamic_template_data: {
    //   receiver_first: user.firstname,
    //   receiver_last: user.lastname,
    //   verification_url: `${hostUrl}/user/verification?token=${token}&email=${user.email}`
    // },
    template_id: 'd-a6de659a66844225a9c56a81cc73570f',
    trackingSettings: {
      clickTracking: {
        enable: true
      },
      openTracking: {
        enable: true
      }
    }
  }

  sgMail.send(msg, (error, response) => {
    if (error) {
      console.error(error.toString())
    } else {
      console.log('success', response)
      return response
    }
  })
}

export const sendPendingMessages = user => {
  // const hostUrl = config.hostURL
  let htmlMessage = `Hello ${user[0].user_name} <br> below shown is your unread message.<br> <ul>`
  let textMessage = `Hello ${user[0].user_name}, below shown is your unread message.\n`
  user.map(job => {
    htmlMessage += `<li style="margin-left:0px">
      <a title="${job.title} - $${job.budget} (${job.days} days)" href="https://www.karunatimes.org/jobdetails/${
      job.id
    }" target="_blank"> ${job.title} - $${job.budget} (${job.days} days)</a>

      <br>$${job.budget} ${job.budget_type ? job.budget_type : ''}
      </li> <br style="padding:10px 10px">`
    textMessage += `\n ${job.title} - $${job.budget} ${job.budget_type ? job.budget_type : ''} (${job.days} days)`
  })
  htmlMessage += '</ul> <br> Cheers,<br>karunatimes.org Team.'
  textMessage += '\nCheers, karunatimes.org Team.'
  const msg = {
    to: {
      name: user.user_name,
      email: user.email
    },
    from: {
      name: 'karunatimes.org Team',
      email: 'admin@karunatimes.org'
    },
    subject: 'Hey, you have unread messages',
    // dynamic_template_data: {
    //   userName: user.user_name,
    //   senderName: user.sender_name,
    //   message: user.message
    // },
    text: textMessage,
    html: htmlMessage,
    template_id: 'd-302519e9e9304f258393f3fbdb35999d',
    trackingSettings: {
      clickTracking: {
        enable: true
      },

      openTracking: {
        enable: true
      }
    }
  }

  sgMail.send(msg, (error, response) => {
    if (error) {
      console.error(error.toString())
    } else {
      console.log('success', response)
      return response
    }
  })
}

export const sendEmailOtp = (email, otp, firstname, lastname) => {
  // $email->addContent(
  //     "text/html", "Hi ".$firstname." ".$lastname." <br> below shown is your verification code. Thank you for choosing karunatimes.org! <br> <h1>YOUR OTP : ".$otp."</h1> <br> Cheers,<br>karunatimes.org Team."
  // );

  let htmlMessage = `Hi ${firstname} ${lastname} <br> below shown is your verification code. Thank you for choosing karunatimes.org! <br> <h1>YOUR OTP : ${otp}</h1> <br> Cheers,<br>karunatimes.org Team.`
  let textMessage = `Hi ${firstname} ${lastname}, below shown is your verification code. Thank you for choosing karunatimes.org! YOUR OTP : ${otp} Cheers, karunatimes.org Team.`
  const msg = {
    to: {
      name: firstname,
      email: email
    },
    from: {
      name: 'karunatimes.org Team',
      email: 'admin@karunatimes.org'
    },
    subject: `${otp} is your karunatimes.org verification code`,
    text: textMessage,
    html: htmlMessage,
    trackingSettings: {
      clickTracking: {
        enable: true
      },

      openTracking: {
        enable: true
      }
    }
  }

  // promisify and handle errors
  sgMail.send(msg, (error, response) => {
    if (error) {
      console.error(error)
      throw error
    } else {
      // console.log('success', response)
      return response
    }
  })
}

export const sendJobNewsletter = user => {
  if (user && user.length) {
    let htmlMessage = `Hello ${user[0].user_name} <br> Below are the top Matching jobs based on your service industry. Click on any job link to apply.<br> <ul>`
    let textMessage = `Hello ${user[0].user_name}, Below are the top Matching jobs based on your service industry. Click on any job link to apply.\n`
    user.map(job => {
      htmlMessage += `<li style="margin-left:0px">
      <a title="${job.title} - $${job.budget} (${job.days} days)" href="https://www.karunatimes.org/jobdetails/${
        job.id
      }" target="_blank"> ${job.title} - $${job.budget} (${job.days} days)</a>

      <br>$${job.budget} ${job.budget_type ? job.budget_type : ''}
      </li> <br style="padding:10px 10px">`
      textMessage += `\n ${job.title} - $${job.budget} ${job.budget_type ? job.budget_type : ''} (${job.days} days)`
    })
    htmlMessage += '</ul> <br> Cheers,<br>karunatimes.org Team.'
    textMessage += '\nCheers, karunatimes.org Team.'
    const msg = {
      to: {
        name: user[0].user_name,
        email: user[0].email
      },
      from: {
        name: 'karunatimes.org Team',
        email: 'admin@karunatimes.org'
      },
      subject: `New Jobs for you`,
      text: textMessage,
      html: htmlMessage,
      trackingSettings: {
        clickTracking: {
          enable: true
        },

        openTracking: {
          enable: true
        }
      }
    }

    sgMail.send(msg, (error, response) => {
      if (error) {
        console.error(error.toString())
      } else {
        // console.log('success', response)
        return response
      }
    })
  }
}

// export const sendReminderEmail = (user, token) => {
//   const hostUrl = config.hostURL
//   const msg = {
//     to: user.email,
//     from: 'hello@karunatimes.org',
//     subject: 'Verify Your Email',
//     dynamic_template_data: {
//       receiver_first: user.firstname,
//       receiver_last: user.lastname,
//       verification_url: `${hostUrl}/user/verification?token=${token}&email=${user.email}`
//     },
//     template_id: 'd-9a81dbe2e0d24288a7af78ec15747e43',
//     trackingSettings: {
//       clickTracking: {
//         enable: true
//       },
//       openTracking: {
//         enable: true
//       }
//     }
//   }

//   sgMail.send(msg, (error, response) => {
//     if (error) {
//       console.error(error.toString())
//     } else {
//       console.log('success', response)
//       return response
//     }
//   })
// }

export const sendEmailOtp2 = async (email, otp, firstname, lastname) => {
  // $email->addContent(
  //     "text/html", "Hi ".$firstname." ".$lastname." <br> below shown is your verification code. Thank you for choosing karunatimes.org! <br> <h1>YOUR OTP : ".$otp."</h1> <br> Cheers,<br>karunatimes.org Team."
  // );

  let htmlMessage = `Hi ${firstname} ${lastname} <br> below shown is your OTP to change password.<br> <h1>YOUR OTP : ${otp}</h1> <br> Cheers,<br>karunatimes.org Team.`
  let textMessage = `Hi ${firstname} ${lastname}, below shown is your OTP to change password. YOUR OTP : ${otp} Cheers, karunatimes.org Team.`
  const msg = {
    to: {
      name: firstname,
      email: email
    },
    from: {
      name: 'karunatimes.org Team',
      email: 'admin@karunatimes.org'
    },
    subject: `${otp} is your karunatimes.org verification code`,
    text: textMessage,
    html: htmlMessage,
    trackingSettings: {
      clickTracking: {
        enable: true
      },

      openTracking: {
        enable: true
      }
    }
  }

  // promisify and handle errors
  try {
    const response = await sgMail.send(msg)
    return response
  } catch (e) {
    console.error(error)
    throw error
  }
  // sgMail.send(msg, (error, response) => {
  //   if (error) {
  //     console.error(error)
  //     throw error
  //   } else {
  //     // console.log('success', response)
  //     return response
  //   }
  // })
}
