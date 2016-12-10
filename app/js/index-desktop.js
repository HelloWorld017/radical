import Game from "./radical";
import io from "socket.io-client";

const ORIENTATION_SENSITIVITY = 50;
//const MOTION_SENSITIVITY = 100;
const socket = io();
const $ = (...args) => document.querySelector(...args);

Math.clamp = (min, curr, max) => Math.min(max, Math.max(curr, min));

socket.emit('generate token');
socket.on('generate token', (e) => {
	$('.auth-link').innerHTML = location.href + e;
});

let game;
let previewGame = new Game($('#playground'), true);
previewGame.useController({
	link: () => {}
});
previewGame.gameStart();
previewGame.nextStage();
previewGame.nextStage();
previewGame.gameSetting.hp = Infinity;

socket.on('bind device', (e) => {
	previewGame.gameEnd();
	$('.index-view').remove();
	game = new Game($('#playground'));
	game.onFire();
	game.useController({
		link: () => {}
	});
	game.gameStart();
});

let orientationBefore = undefined;

socket.on('event', (e) => {
	//if(e.event === 'motion'){
	//	game.cursorX += Math.clamp(0, Math.round(e.z * MOTION_SENSITIVITY), game.gameSetting.width);
	//	game.cursorY += Math.clamp(0, Math.round(e.x * MOTION_SENSITIVITY), game.gameSetting.height);
	//}else
	if(e.event === 'orientation'){
		if(orientationBefore === undefined){
			orientationBefore = e;
			return;
		}

		let xAmount = orientationBefore.alpha - e.alpha;

		if(180 < xAmount) xAmount = 360 - xAmount;
		if(-180 > xAmount) xAmount = xAmount + 360;

		game.cursorX = Math.clamp(0, game.cursorX + Math.round((xAmount) * ORIENTATION_SENSITIVITY), game.gameSetting.width);
		game.cursorY = Math.clamp(0, game.cursorY + Math.round((orientationBefore.beta - e.beta) * ORIENTATION_SENSITIVITY), game.gameSetting.height);
		orientationBefore = e;
	}
});
