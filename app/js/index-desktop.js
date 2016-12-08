import Game from "./radical";
import io from "socket.io-client";

const socket = io();
const $ = (...args) => document.querySelector(...args);

socket.emit('generate token');
socket.on('generate token', (e) => {
	$('.stage-desc').innerHTML = location.href + e;
});

const game = new Game;
game.onFire();
game.useController('mouse');
