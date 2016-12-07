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

global.server = http.createServer(app);

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
});
