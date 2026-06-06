const common_function = require('../controllers/common_function');
const passportController = require('../config/passport_google_oauth2_strategy');
module.exports.signin = async function (req, res) {
    if (req.isAuthenticated()) {
        req.flash('success', 'Already Signed In!');
        return res.redirect('/');
    }
    passportController.UpdateStrategy();
    return res.render('_user_signin', {
        title: await common_function.AppName() + " | Sign In"
    });
}
module.exports.checkuser = function (req, res) {
    req.flash('success', 'Logged In Successfully');
    return res.redirect('/');
}
module.exports.destroysession = function (req, res) {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'You have been Logged Out');
        return res.redirect('/users/signin');
    });
}