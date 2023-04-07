const nodemailer = require('nodemailer')
const htmlToText = require('html-to-text')
const pug = require('pug')
// require('dotenv').config()

// const Sib = require('sib-api-v3-sdk')


// const client = Sib.ApiClient.instance
// const apikey = client.authentications['api-key']
// apikey.apikey = process.env.API_KEY


module.exports = class Email {
  constructor(user, url) {
    this.to = user.email
    this.firstname = user.name.split(' ')[0]
    this.url = url
    this.from = `Team FOW FARM <${process.env.EMAIL_FROM}>`
  }

  newTransport() {
    if(process.env.NODE_ENV === 'production') {
      // sendinblue
      // return nodemailer.createTransport({
      //   service: 'Sendinblue',
      //   auth: {
      //     user: process.env.SENDINBLUE_USERNAME,
      //     pass: process.env.SENDINBLUE_PASSWORD
      //   }
      // })
      // return new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
      //   mailOptions
      // })
      // const tranEmailApi = new Sib.TransactionalEmailsApi()
      // return tranEmailApi.sendTransacEmail({
      //   sender: this.from,
      //   to: this.to,
      //   subject: this.subject,
      //   htmlContent: this.htmlContent
      // }).then(function(data) {
      //   console.log(data);
      // }, function(error) {
      //   console.error(error);
      // })
      return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        }
      })
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      }
    })
  }

  // sendEmail() {
  //   // let options = this.mailOptions
  //   return new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail({
  //     "sender": "ankushbanik263@gmail.com",
  //     "to": this.to,
  //     "subject": this.subject,
  //     "htmlContent": this.htmlContent
  //   }).then(function(data) {
  //     console.log(data);
  //   }, function(error) {
  //     console.error(error);
  //   });
  // }

  // send the actual email
  async send(template, subject) {
    // 1) Render HTML as pug Template
    const name = this.firstname
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: name,
      url: this.url,
      subject
    })

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.convert.toString(html)
    }

    // 3) Create a transport and send email
    
    await this.newTransport().sendMail(mailOptions)
  }

  async sendWelcome() {
    await this.send('Welcome', 'Welcome to the FOW-FARM!')
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset', 
      'Your password reset token (valid for only 10 minutes)'
    )
  }

}


