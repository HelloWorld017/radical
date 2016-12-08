const BIND_REGEX = /\/([a-zA-Z0-9]{5})\/?$/;
const socket = io();

let match = location.href.match(BIND_REGEX);

if(match){
	socket.on('bind device', (e) => {
		if(e){
			
		}
	});

	socket.emit('bind device', match[1]);
}
