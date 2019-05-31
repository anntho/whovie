const createError = require('http-errors');
const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');

//routes
const pages = require('./routes/pages');

// app
const app = express();

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middleware
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Static Folders
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/', pages);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('404 caught')
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  if (err.status == 404) {
    res.status(404);
    res.render('404');
  } else {
    res.status(err.status || 500);
    res.send('an error occured')
  }
});

module.exports = app;
