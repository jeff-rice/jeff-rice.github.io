const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// MongoDB Config
mongoose.connect('mongodb://localhost:27017/coaching', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  videos: [String] // Array to store user-specific videos
});

const User = mongoose.model('User', UserSchema);

// Passport Config
passport.use(new LocalStrategy((username, password, done) => {
  User.findOne({ username: username }, (err, user) => {
    if (err) return done(err);
    if (!user) return done(null, false, { message: 'Incorrect username.' });
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) return done(null, user);
      else return done(null, false, { message: 'Incorrect password.' });
    });
  });
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'secret',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Set storage engine for videos
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Initialize upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // Limit file size to 100MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).single('videoFile');

// Check file type
function checkFileType(file, cb) {
  const filetypes = /mp4|avi|mkv|mov/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Videos Only!');
  }
}

// Serve static files from the "uploads" directory
app.use('/uploads', express.static('uploads'));

// Routes
app.get('/', (req, res) => res.send('Home Page'));

app.get('/register', (req, res) => res.send('Register Page'));

app.post('/register', (req, res) => {
  const { username, password } = req.body;
  let errors = [];

  if (!username || !password) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.status(400).json({ errors });
  } else {
    User.findOne({ username: username }).then(user => {
      if (user) {
        res.status(400).json({ errors: [{ msg: 'Username already exists' }] });
      } else {
        const newUser = new User({ username, password });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.status(201).json({ user }))
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

app.get('/login', (req, res) => res.send('Login Page'));

app.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.json(req.user);
});

app.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
});

// Upload endpoint for user-specific videos
app.post('/upload', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Please log in to upload videos' });
  }

  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err });
    } else {
      if (req.file == undefined) {
        res.status(400).json({ error: 'No file selected!' });
      } else {
        req.user.videos.push(`/uploads/${req.file.filename}`);
        req.user.save().then(user => {
          res.status(200).json({
            message: 'File uploaded!',
            file: `/uploads/${req.file.filename}`,
            user
          });
        });
      }
    }
  });
});

// Check if authenticated
app.get('/isAuthenticated', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ isAuthenticated: true, user: req.user });
  } else {
    res.json({ isAuthenticated: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
