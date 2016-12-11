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

	//TODO remove debug code
	window.game = game;

	game.on('next stage', () => {
		stageHeader.innerHTML = "STAGE " + game.renderSetting.stageColor[game.stage].text;
		stageDesc.innerHTML = game.renderSetting.stageColor[game.stage].summary;
		stageIndicator.style.animationName = "fadein";
		setTimeout(() => {
			stageIndicator.style.animationName = "fadeout";
		}, 4500);
	});

	game.on('damage', () => {
		socket.emit('e', false);
	});

	game.on('game end', (score) => {
		console.log(score);
		let handleGameEnd = () => {
			stageHeader.style.marginTop = "20%";
			stageHeader.innerHTML = "Thx for playing!";
			stageIndicator.style.animationName = "fadein";
			let left = 10;
			let refresher = () => {
				if(left <= 0){
					location.reload();
					return;
				}
				stageDesc.innerHTML = `Your score: ${score}
				<br>
				Refreshes in ${left}s...`;
				left--;
				setTimeout(refresher, 1000);
			};
			refresher();
		};

		let handleRanking = () => {
			socket.emit('ranking get');
			socket.on('ranking get', (ranking) => {
				stageHeader.style.marginTop = "10%";
				stageHeader.innerHTML = "LEADERBOARD";
				stageIndicator.style.animationName = "fadein";
				ranking = JSON.parse(ranking).map((v, k) => `${k}. ${v[0]} : ${v[1]}`).join('<br>');
				let left = 10;
				let ender = () => {
					if(left <= 0){
						handleGameEnd();
						return;
					}
					stageDesc.innerHTML = `${ranking}
					<br>
					Proceeds in ${left}s...`;
					left--;
					setTimeout(ender, 1000);
				};

				ender();
			});
		};

		socket.emit('ranking enabled');
		socket.on('ranking enabled', (isEnabled) => {
			if(isEnabled){
				$('.score-input').style.animationName = "fadein";
				$('.score-submit').addEventListener('click', () => {
					let grade = $('.score-grade').value;
					let classNumber = $('.score-class').value;
					let name = $('.score-name').value;
					if(classNumber.length < 2) classNumber = "0" + classNumber;
					let final = grade + classNumber + ' ' + name;
					if(!/^\d{3} [a-zA-Zㄱ-ㅎ가-힣0-9]{1,5}$/.test(final)){
						return alert("정확하게 입력해주세요!");
					}
					socket.emit('ranking push', {
						name: final,
						score
					});
					$('.score-input').style.animationName = "fadeout";
					setTimeout(() => {
						handleRanking();
					}, 500);
				});
			}else handleGameEnd();
		});
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
