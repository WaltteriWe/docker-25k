import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'nihadazzam96@gmail.com',
        pass: 'kppy lrqp uvcq mbhx'
    },
    port: 587,
    secure: true,
});

export const sendEmail = async (to: string, subject: string, text: string) => {
    try {
        const mailOptions = {
            from: 'nihadazzam96@gmail.com',
            to,
            subject,
            text,
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
}
