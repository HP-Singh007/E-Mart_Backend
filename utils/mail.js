import nodemailer from "nodemailer"

export const sendEmail = (mailObj)=>{
    const transporter = nodemailer.createTransport({
        host:process.env.SMTP_HOST,
        port:process.env.SMTP_PORT,
        service:process.env.SMTP_SERVICE,
        auth:{
            user:process.env.SMTP_ID,
            pass:process.env.SMTP_PASSWORD
        }
    })

    const mailOptions = {
        from:process.env.SMTP_ID,
        to:mailObj.email,
        subject:mailObj.subject,
        text:mailObj.message
    }

    transporter.sendMail(mailOptions);
}