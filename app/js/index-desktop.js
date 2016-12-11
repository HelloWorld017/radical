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

const stageIndicator = $('.stage-indicator');
const stageHeader = $('.stage-header');
const stageDesc = $('.stage-desc');

socket.on('bind device', (e) => {
	previewGame.gameEnd();
	$('.index-view').remove();
	game = new Game($('#playground'));
	game.onFire();
	game.useController({
		link: () => {}
	});
	game.gameStart();

	game.on('next stage', () => {
		stageHeader.innerHTML = "STAGE " + game.renderSetting.stageColor[game.stage].text;
		stageDesc.innerHTML = game.renderSetting.stageColor[game.stage].summary;
		stageIndicator.style.animationName = "fadein";
		setTimeout(() => {
			stageIndicator.style.animationName = "fadeout";
		}, 4500);
	});

	game.on('game end', (score) => {
		
	});
});

let orientationBefore = undefined;

socket.on('e', (ev) => {
	let e = {};
	e.alpha = ev[0] * 255 + ev[1] + ev[2] / 100;
	e.beta = ev[3] * 255 + ev[4] + ev[5] / 100;

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
});

/*document.addEventListener('load', (e) => {
	if(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) $('.fullscreen').remove();

	$('.fullscreen').addEventListener('click', (e) => {
		$('.fullscreen').remove();
		if(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement) return;

		if(document.documentElement.requestFullscreen) return document.documentElement.requestFullscreen();
		if(document.documentElement.mozRequestFullScreen) return document.documentElement.mozRequestFullScreen();
		if(document.documentElement.webkitRequestFullscreen) return document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	});
});*/
