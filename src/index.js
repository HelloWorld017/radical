'use strict';
const app = require('./app');
const debug = require('debug')('radical:server');
const fs = require('fs');
const http = require('http');
const motion = require('motion-controller');

const port = ((val) => {
	const port = parseInt(val, 10);

	if(isNaN(port)) return val;
	if(port >= 0) return port;
	return false;
})(process.env.PORT || '3000');

app.set('port', port);

const RANKING_ENABLED = process.env.ranking === 'true';

global.server = http.createServer(app);
if(RANKING_ENABLED) global.ranking = require('./ranking');

server.listen(port);
server.on('error', (error) => {
	if(error.syscall !== 'listen') throw error;

	const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

	switch(error.code){
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
});

server.on('listening', () => {
	const addr = server.address();
	const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
	debug('Listening on ' + bind);
});

const io = require('socket.io')(server);
io.on('connection', (socket) => {
	motion.bindSocket(socket);

	socket.on('ranking enabled', () => {
		socket.emit('ranking enabled', RANKING_ENABLED);
	});

	socket.on('ranking get', () => {
		if(!RANKING_ENABLED) return;
		socket.emit('ranking get', ranking.get());
	});

	socket.on('ranking push', (ev) => {
		if(!RANKING_ENABLED) return;
		if(!ev) return;
		if(typeof ev.name !== 'string') return;
		if(typeof ev.score !== 'number') return;
		ranking.push(ev.name, ev.score);
	});
});
