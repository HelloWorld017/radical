const path = require('path');
const express = require('express');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const favicon = require('serve-favicon');
const logger = require('morgan');
const motion = require('motion-controller');

let app = express();
app.set('view engine', 'pug');
app.set('port', process.env.PORT || '3000');

app.use(logger('dev'));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(translator);

app.use('/', require('../routes'));
app.use('/rad', motion.createRouter('init-desktop', 'init-mobile'));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '7d' }));

module.exports = app;