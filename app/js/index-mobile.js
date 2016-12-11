import io from "socket.io-client";

const BIND_REGEX = /\/([a-zA-Z0-9]{5})\/?$/;
const socket = io();
const $ = (...args) => document.querySelector(...args);

let match = location.href.match(BIND_REGEX);

console.log('Location token', match);
if(match){
	socket.on('bind device', (e) => {
		console.log('Attempted to bind. Result : ' + e);
		if(e){
			$('.default-main').style.display = "none";
			$('.controller-section').style.display = "block";

			window.addEventListener('deviceorientation', (ev) => {
				let alphaInteger = Math.floor(ev.alpha);
				let alphaLeft = Math.floor((ev.alpha - alphaInteger) * 100);
				let betaInteger = Math.floor(ev.beta);
				let betaLeft = Math.floor((ev.beta - betaInteger) * 100);
				let buffer = new Uint8Array(6);
				buffer[0] = Math.floor(alphaInteger / 256);
				buffer[1] = alphaInteger % 256;
				buffer[2] = alphaLeft;
				buffer[3] = Math.floor(betaInteger / 256);
				buffer[4] = betaInteger % 256;
				buffer[5] = betaLeft;
				socket.emit('e', buffer);
			});
		}
	});

	socket.emit('bind device', match[1]);
}
