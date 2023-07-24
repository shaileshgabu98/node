var nodemailer = require('nodemailer');
const mailer = (mailOptions) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'shailesh.gabu@creditt.in',
            pass: 'hegaixrozpzbcjpf'
        }
    });
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = { mailer }
