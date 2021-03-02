const express = require('express');
const mongoose = require('mongoose');
const todoRoutes = require('./routes/route_auth');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./models/users');
const cors = require('cors');
const bcrypt = require('bcrypt');
const morgan = require('morgan')

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const { MONGO_USERNAME, MONGO_PASSWORD, MONGO_HOST, SESSION_SECRET } = process.env;
const URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}/sample_analytics`;

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(cookieParser());
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(session({ secret: SESSION_SECRET }));

// Logger
app.use(morgan('combined'));

// Passport
app.use(passport.initialize());
app.use(passport.session());

app.use(todoRoutes);

passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            results: 'results',
        },
        function (username, password, done) {
            User.findOne({ username: username }, async function (err, user) {
                let isPassMatch = await bcrypt.compare(password, user.password);
                return err ? done(err) : user ? (isPassMatch ? done(null, user) : done(null, false, { message: 'Incorrect password.' })) : done(null, false, { message: 'Incorrect username.' });
            });
        }
    )
);

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        err ? done(err) : done(null, user);
    });
});

async function start() {
    try {
        await mongoose.connect(URL, {
            useNewUrlParser: true,
            useFindAndModify: false,
        });
        app.listen(PORT, () => {
            console.log('Server has been started...');
        });
    } catch (err) {
        console.log(err);
    }
}

start();
