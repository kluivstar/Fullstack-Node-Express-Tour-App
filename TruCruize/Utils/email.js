const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email; // Accepts a user object (with email and name) and a url 
        this.firstName = user.name.split(' ')[0]; // Extracts first name from user.name.
        this.url = url;
        this.from = `X Support <${process.env.EMAIL_FROM}>` // Sets email sender
    }

    // Configures Email Transport
    newTransport() {
        if (process.env.NODE_ENV === 'production'){
            return nodemailer.createTransport({
                host: 'smtp.resend.com', // Correct SMTP host for Resend
                port: 587, // Resend uses port 587 for TLS
                secure: false, // Set to true if using port 465
                auth: {
                    user: 'resend', // Resend requires "resend" as the username
                    pass: process.env.RESEND_API_KEY // Use API key as password
                }
            })
        }
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false,
            auth:{
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
        })
    }
    
    // Send the actual email
    async send(template, subject){
        // 1. Render HTML based on a pug template welcome.pug, passwordReset.pug
        const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
            // First name, url and subject passed here contractor above then plugged in welcome.pug
            firstName: this.firstName,
            url: this.url,
            subject
        })
    
        // 2. Define Email Options
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html) // Email is sent as plain text

        }
        // 3. Create a transport and send email
        await this.newTransport().sendMail(mailOptions)
    }

    // Prebuilt Email Types
    async sendWelcome(){
        await this.send('Welcome', 'Welcome to the Trucruize family') // Sends a welcome Subject
    }
    async sendPasswordReset(){
        await this.send('passwordReset', 'Your password reset token (Valid for 10 minutes)')
    }
}

