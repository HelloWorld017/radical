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
			/*window.addEventListener('devicemotion', (ev) => {
				socket.emit('event', {
					event: 'motion',
					x: ev.acceleration.x,
					y: ev.acceleration.y,
					z: ev.acceleration.z
				});
			});*/

			window.addEventListener('deviceorientation', (ev) => {
				socket.emit('event', {
					event: 'orientation',
					alpha: ev.alpha,
					beta: ev.beta,
					gamma: ev.gamma
				});
			});
		}
	});

	socket.emit('bind device', match[1]);
}
