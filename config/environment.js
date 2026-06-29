const path = require("path");
const development = {
  session_app_name: "Jewellery",
  cookieTime: 7 * 24 * 60 * 60 * 1000,
  asset_path: "/assets",
  session_cookie_key: "blahsomething",
  db: "Jewellery",
  smtp: {
    service: "gmail",
    host: "smtp.gmail.com",
    port: "587",
    secure: "false",
    auth: {}
  },
  backupTime: "59 23 * * *"
  // mailUser: "gckittyapp",
  // mailPassword: "fteqefubfnmqdjoa",
  // mailFrom: "gckittyapp@gmail.com",
  // backUpMail: "gckittyapp@gmail.com",
  // google_clientID: '1040813539779-e2bm980dlnbra89pmsiscont0q4om6rp.apps.googleusercontent.com',
  // google_clientSecret: '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',
  // google_callbackURL: 'http://stock.divyanshbansal.com/users/auth/google/callback',
  // google_callbackURL: 'http://localhost:8001/users/auth/google/callback',
};
module.exports = development;
