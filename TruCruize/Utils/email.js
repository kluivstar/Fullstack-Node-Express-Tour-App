const nodemailer = require('nodemailer');

const sendEmail = async (option)=> {
    // 1. Create Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth:{
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        
        logger: true,
        debug: true
    });

    // 2. Define Email Options
    const emailOptions = {
        from: 'Sins support<support@sins.com>',
        to: option.email,
        subject: option.subject,
        text: option.message
    }
    // 3. Verify connection configuration - optional
    transporter.verify(function (error, success) {
        if (error) {
        console.log(error);
        } else {
        console.log("Server is ready to take our messages.");
        }
    });
    
    // 4. Actually send the mail
    await transporter.sendMail(emailOptions)
};

module.exports = sendEmail;