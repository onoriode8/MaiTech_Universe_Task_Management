import "dotenv/config.js"
import nodemailer from 'nodemailer'


export const expressValidatorHelper = (errorResult) => {
    let errorMessage;
    if(!errorResult.isEmpty()) {
        for(const error of errorResult.errors) {
            errorMessage = error
            return { errorMessage }
        }
    } else {
        return { errorMessage }
    }
}


export const nodeMailerHelperFunc = (email, message) => {
    const transporter = nodemailer.createTransport({
        service: "gmail", //process.env.GOOGLE_SERVICE,
        secure: true,
        auth: {
            user: "onosmaster2@gmail.com", //process.env.GOOGLE_SERVICE_ACCOUNT_USER,
            pass: "sztb mghp hvvi mxsm" //process.env.GOOGLE_SERVICE_PASSWORD
        }
    })
    const mailOptions = {
        from: "onosmaster2@gmail.com", //process.env.GOOGLE_SERVICE_ACCOUNT_USER,
        to: email,
        subject: "MaiTech Universe Intern",
        text: message
    }
    transporter.sendMail(mailOptions, (err, data) => {
        // if(err) {
        //     console.err("Failed to send email", err.message)
        // }
        // console.log("email sent", data)
    })
}