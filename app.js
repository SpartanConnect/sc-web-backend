var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

// --- Require Spartan Connect Modules here! ---
var databaseConnection = require('./database-development.js');

// --- Sample Query ---
// To query, simply import the database module, and call query(String query, function(error, result) {}) on the module.
databaseConnection.query('SELECT * FROM test WHERE id = 3', function(error, result) {
    if (error) throw error;
    console.log(result[0]);
});

// --- Declare API routes here! ---   
var announcements = require('./routes/announcements');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// --- Route API calls here! ---
app.use('/api', announcements);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
});

module.exports = app;
