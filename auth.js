const passport = require('passport');
const User = require('./models/users');
const bcrypt = require('bcrypt');

// Here we check, transfer the user data to the verification function, which we defined above
// If authorization is successful, user data will be stored in req.user
module.exports.login = function (req, res, next) {
    passport.authenticate('local', function (err, user) {
        if (err) {
            return res.status(400).json({ errors: err });
        }
        if (!user) {
            return res.status(400).json({ errors: 'No user found' });
        }
        req.logIn(user, function (err) {
            if (err) {
                return res.status(400).json({ errors: err });
            }
            return res.status(200).json({ success: user.username });
        });
    })(req, res, next);
};

// Logout
module.exports.logout = function (req, res) {
    req.logout();
    return res.status(200).json({ logout: true });
};

// User registration. Create it in the database
module.exports.register = async function (req, res, next) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    var user = new User({
        username: req.body.email,
        password: hashedPassword,
    });
    user.save(function (err) {
        return err ? next(err) : res.status(200).json({ success: user.username });
    });
};

// Check authentication
module.exports.mustAuthenticatedMw = function (req, res) {
    req.isAuthenticated() ? res.json({ authorized: true }) : res.json({ authorized: false });
};

// Save game progress to database
module.exports.save = async function (req, res) {
    try {
        User.findOneAndUpdate(
            { username: req.body.username },
            { results: req.body.results },
            (err, docs) => {
                if (err) {
                    return res.status(400).json({ errors: err });
                } else {
                    res.status(200).json({ success: docs });
                }
            }
        );
    } catch (error) {
        return res.status(400).json({ errors: 'No user found' });
    }
};

// Get progress from database
module.exports.getsave = async function (req, res) {
    User.findOne({ username: req.body.username }, (err, docs) => {
        if (err) {
            return res.status(400).json({ errors: err });
        } else {
            try {
                if (docs.length !== 0) {
                    res.status(200).json({ success: docs });
                }
            } catch (error) {
                return res.status(400).json({ errors: 'No user found' });
            }
        }
    });
};
