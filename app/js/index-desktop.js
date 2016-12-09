import Game from "./radical";
import io from "socket.io-client";

const ORIENTATION_SENSITIVITY = 10;
const socket = io();
const $ = (...args) => document.querySelector(...args);

Math.clamp = (min, curr, max) => Math.min(max, Math.max(curr, min));

socket.emit('generate token');
socket.on('generate token', (e) => {
	$('.stage-desc').innerHTML = location.href + e;
});

let game;

socket.on('bind device', (e) => {
	game = new Game;
	game.onFire();
	game.useController({
		link: () => {}
	});
	game.gameStart();
});

let orientationBefore = undefined;

socket.on('event', (e) => {
	if(e.event === 'motion'){
		//game.cursorX += Math.clamp(0, Math.round(e.z), game.gameSetting.width);
		//game.cursorY += Math.clamp(0, Math.round(e.x), game.gameSetting.height);
	}else if(e.event === 'orientation'){
		if(orientationBefore === undefined){
			orientationBefore = e;
			return;
		}

		game.cursorX = Math.clamp(0, game.cursorX + Math.round((orientationBefore.alpha - e.alpha) * ORIENTATION_SENSITIVITY), game.gameSetting.width);
		game.cursorY = Math.clamp(0, game.cursorY + Math.round((e.beta - orientationBefore.beta) * ORIENTATION_SENSITIVITY), game.gameSetting.height);
		orientationBefore = e;
	}
});
