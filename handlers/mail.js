const nodemailer = require('nodemailer');
const pug = require('pug');
const juice = require('juice');
const htmlToText = require('html-to-text');
const { promisify } = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

const generateHTML = (filename, options = {}) => {
  const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`, options);
  const htmlWithInlinedCss = juice(html);
  return htmlWithInlinedCss;
};

exports.send = async (options) => {
  const html = generateHTML(options.filename, options);
  const text = htmlToText.fromString(html);

  const mailOptions = {
    from: "Now That's Delicious <noreply@yourdomain.com>",
    to: options.user.email,
    subject: options.subject,
    html,
    text,
  };

  const sendMail = promisify(transport.sendMail.bind(transport));
  return sendMail(mailOptions);
};
