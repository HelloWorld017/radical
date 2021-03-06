'use strict';
const path = require('path');
const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const motion = require('motion-controller');

const app = express();
app.set('view engine', 'ejs');
app.set('port', process.env.PORT || '3000');

app.use(logger('dev'));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('./dist'));
app.use(express.static('./bower_components'));
app.use('/developer', (req, res, next) => {
	res.render('developer');
});
app.use('*', motion.createRouter('index', 'index-mobile'));

module.exports = app;
