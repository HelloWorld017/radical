import {ParticleSystem, Particle, CircleParticle} from "./particle.js";

Math.distance = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
Math.toRad = (angle) => angle / 180 * Math.PI;
Math.toPolar = (_x, _y, centerX, centerY) => {
	var x = _x - centerX, y = _y - centerY;
	let r = Math.distance(_x, _y, centerX, centerY);
	let arctan = Math.atan2(y, x);
	let theta;

	if(x >= 0 && y >= 0) theta = arctan;
	else if(x >= 0 && y < 0) theta = arctan + Math.PI / 2;
	else if(x < 0 && y < 0) theta = arctan + Math.PI;
	else theta = arctan + Math.PI * 3 / 2

	return {r, theta};
};
Math.toCartesian = (r, theta, centerX, centerY) => {
	return {
		x: Math.cos(theta) * r + centerX,
		y: Math.sin(theta) * r + centerY
	};
};

if(!Object.values) Object.values = (obj) => Object.keys(obj).map((v) => obj[v]);

const $ = (...args) => document.querySelector(...args);

const WIDTH = 1680;
const HEIGHT = 1050;

const STATUS_START = 0;
const STATUS_INGAME = 1;
const STATUS_END = 2;

const TYPE_DEFAULT = 0;
const TYPE_ADV = 1;
const TYPE_BULLET = 2;

const controllers = {
	mouse: {
		link: (game) => {
			let xRatio = WIDTH / window.innerWidth;
			let yRatio = HEIGHT / window.innerHeight;
			document.addEventListener('mousemove', (e) => {
				game.cursorX = e.pageX * xRatio;
				game.cursorY = e.pageY * yRatio;
			});
		},

		unlink: () => {
			document.removeEventListener('mousemove');
		}
	}
};

const defaultRenderer = (object) => {
	object.game.ctx.fillStyle = object.getColor();
	object.game.ctx.beginPath();
	object.game.ctx.arc(object.x, object.y, object.radius, 0, Math.PI * 2);
	object.game.ctx.fill();
};

const temp = {};
temp.size = Math.sqrt(Math.pow(WIDTH, 2) + Math.pow(HEIGHT, 2)) + 50;

const renderSetting = {
	bulletColor				: '#03a9f4',
	defaultColor			: '#757575',
	lowColor				: '#ef5350',
	normalColor				: '#ffc107',
	highColor				: '#4caf50',
	nextStageAnimationTick 	: 5000,
	stageColor: {
		1: {
			bg				: '#751212',
			fg				: '#b71c1c',
			bulletColor		: '#ffee58',
			highColor		: '#ffc107',
			normalColor		: '#ff9800',
			lowColor		: '#e65100',
			defaultColor	: '#fff59d',
			text			: '1'
		},
		2: {
			bg				: '#9a3600',
			fg				: '#e65100',
			bulletColor		: '#ffee58',
			highColor		: '#ffc107',
			normalColor		: '#ffd600',
			lowColor		: '#ffea00',
			defaultColor	: '#880e4f',
			text			: '2'
		},
		3: {
			bg				: '#004d40',
			fg				: '#006064',
			bulletColor		: '#1de9b6',
			highColor		: '#80cbc4',
			normalColor		: '#64ffda',
			lowColor		: '#b2dfdb',
			defaultColor	: '#a7ffeb',
			text			: '3'
		},
		4: {
			bg				: '#1a237e',
			fg				: '#0d47a1',
			bulletColor		: '#80deea',
			highColor		: '#00bcd4',
			normalColor		: '#26c6da',
			lowColor		: '#00bcd4',
			defaultColor	: '#84ffff',
			text			: '4'
		},
		5: {
			bg				: '#212121',
			fg				: '#424242',
			bulletColor		: '#757575',
			highColor		: '#fafafa',
			normalColor		: '#c5c5c5',
			lowColor		: '#a0a0a0',
			defaultColor	: '#8e8e8e',
			text			: '∞',
			summary			: "There is some games that you can't beat."
		}
	},
	renderer: {
		0					: defaultRenderer,
		1					: defaultRenderer,
		2					: defaultRenderer
	},
	backgroundSetting: {
		animationAmount		: 1,
		size				: temp.size,
		angle				: Math.toRad(45),
		center				: [
			(WIDTH - temp.size) / 2,
			(HEIGHT - temp.size) / 2
		],
		halfSize			: temp.size / 2
	},
	background	: [...Array(Math.ceil(temp.size / 100) + 1)].map((v, k) => k * 100).map((i) => {
		return {
			xPos	: i,
			yPos	: 0,
			width	: temp.size,
			height	: 50
		}
	})
};
delete temp.size;

class EventEmitter{
	constructor(){
		this.listeners = {};
	}

	on(listenerName, callback){
		if(!this.listeners[listenerName]) this.listeners[listenerName] = [];

		this.listeners[listenerName].push(callback);
	}

	emit(listenerName, ...args){
		(this.listeners[listenerName] || []).forEach((v) => v(...args));
	}
}

class Game extends EventEmitter{
	constructor(canvas, noDrawHud){
		super();

		this.noDrawHud = noDrawHud;
		this.canvas = canvas;
		//canvas.width = window.innerWidth;
		//canvas.height = window.innerHeight;
		this.canvas.width = WIDTH;
		this.canvas.height = HEIGHT;

		this.ctx = this.canvas.getContext('2d');

		this.gameSetting = {
			score			: 0,
			width			: WIDTH,
			height			: HEIGHT,
			centerX			: WIDTH / 2,
			centerY			: HEIGHT / 2,
			creationTick	: 50,
			hp				: 1000,
			enemyRadius		: 30,
			playerRadius	: 75,
			enemyCOrbit		: 640,
			advCOrbit		: 360,
			defaultHp		: 15,
			defaultDamage	: 10,
			advDamage		: 20,
			advPercentage	: 0.1,
			fireTick		: 100,
			fireAmount		: 1,
			fireRadius		: 25,
			bulletVelocity	: 40,
			bulletRandom	: 5,
			objectVelocity	: 15,
			advVelocity		: 45,
			maxStage		: 5,
			maxCreation		: 3,
			stageTime		: 1000,
			scoreMultiplier	: 1,
			userFireTick	: 1,
			userDamage		: 300,
			pfScore			: 250,
			scores			: {
				0			: 10,
				1			: 20,
				2			: 3
			},
			misshotScore	: 0,
			stageIncreasement: {
				bulletVelocity	: 1,
				objectVelocity	: 2,
				advVelocity		: -3,
				fireTick		: -5,
				defaultHp		: 2,
				defaultDamage	: 3,
				creationTick	: -10,
				maxCreation		: 1,
				stageTime		: 200,
				scoreMultiplier	: 0.2,
				advPercentage	: 0.05,
				advDamage		: 5,
				hp				: 1000,
				fireAmount		: 1,
				playerRadius	: 5,
				enemyRadius		: -2,
				score			: 750
			},
			maximum: {
				fireAmount		: 4
			}
		};

		this.objects = {};
		this.tick = 0;
		this.stage = 1;
		this.score = 0;
		this.lastId = 0;
		this.cursorX = 640;
		this.cursorY = 360;
		this.isFiring = false;
		this.preHP = 0;
		this.particles = new ParticleSystem();

		this.gameStatus = STATUS_START;

		this.tickHandler = () => {
			this.handleTick();
		};

		this.renderHandler = () => {
			this.render();
		};
	}

	neededStageTime(){
		return this.stage * (1400 + 300 * this.stage) / 2;
	}

	nextStage(){
		this.stage++;
		this.animationTick = 0;

		if(this.gameSetting.hp === this.preHP + this.gameSetting.stageIncreasement.hp){
			this.gameSetting.score += this.gameSetting.pfScore;
		}
		this.preHP = this.gameSetting.hp;

		Object.keys(this.gameSetting.stageIncreasement).forEach((k) => {
			this.gameSetting[k] += this.gameSetting.stageIncreasement[k];
		});
		Object.keys(this.gameSetting.maximum).forEach((k) => {
			this.gameSetting[k] = Math.min(this.gameSetting[k], this.gameSetting.maximum[k]);
		});
		this.emit('next stage');
	}

	handleTick(){
		if(this.gameStatus === STATUS_END) return;

		this.tick++;

		if(this.stage <= this.gameSetting.maxStage && this.tick > this.neededStageTime()){
			this.nextStage();
			setTimeout(this.tickHandler, renderSetting.nextStageAnimationTick);
			return;
		}

		if(this.isFiring && this.tick % this.gameSetting.userFireTick === 0){
			this.handleFire();
		}

		if(this.tick % this.gameSetting.creationTick === 0){
			let creationAmount = Math.floor(Math.random() * (this.gameSetting.maxCreation - 1)) + 1;
			for(let i = 0; i < creationAmount; i++) this.createEnemy();
		}

		Object.values(this.objects).forEach((v) => {
			v.update();
		});

		this.particles.update();
		setTimeout(this.tickHandler, 50);
	}

	addGameObject(object){
		if(this.gameStatus === STATUS_END) return;
		this.objects[object.id] = object;
	}

	createEnemy(){
		if(this.gameStatus === STATUS_END) return;

		let angle = Math.random() * Math.PI * 2;

		let enemy;
		if(Math.random() < this.gameSetting.advPercentage){
			let cartesian = Math.toCartesian(this.gameSetting.advCOrbit, angle, this.gameSetting.width / 2, this.gameSetting.height / 2);
			enemy = new AdvEnemy(
				this,
				this.gameSetting.defaultHp,
				cartesian.x,
				cartesian.y,
				this.gameSetting.defaultDamage,
				angle
			);
		}else{
			let cartesian = Math.toCartesian(this.gameSetting.enemyCOrbit, angle, this.gameSetting.width / 2, this.gameSetting.height / 2);
			enemy = new DefaultEnemy(
				this,
				this.gameSetting.defaultHp,
				cartesian.x,
				cartesian.y,
				this.gameSetting.defaultDamage,
				angle
			);
		}

		this.addGameObject(enemy);
	}

	useController(controllerName){
		if(typeof controllerName === 'object' && controllerName.link) controllerName.link(this);
		else if(controllers[controllerName]) controllers[controllerName].link(this);
	}

	onFire(){
		this.isFiring = true;
	}

	releaseFire(){
		this.isFiring = false;
	}

	handleFire(){
		Object.values(this.objects).forEach((v) => {//.every((v) => {
			if(Math.distance(v.x, v.y, this.cursorX, this.cursorY) < v.radius + this.gameSetting.fireRadius){
				v.hp -= this.gameSetting.userDamage;
				if(v.hp <= 0){
					this.gameSetting.score += this.gameSetting.scores[v.type] * this.gameSetting.scoreMultiplier;
					return v.setDead();
				}

				//return false;
			}
			//return true;
		});
	}

	renderBackground(){
		this.ctx.fillStyle = renderSetting.stageColor[this.stage].bg;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		this.ctx.fillStyle = renderSetting.stageColor[this.stage].fg;
		this.ctx.save();
		this.ctx.translate(...renderSetting.backgroundSetting.center);

		this.ctx.translate(renderSetting.backgroundSetting.halfSize, renderSetting.backgroundSetting.halfSize);
		this.ctx.rotate(renderSetting.backgroundSetting.angle);
		this.ctx.translate(-renderSetting.backgroundSetting.halfSize, -renderSetting.backgroundSetting.halfSize);
		renderSetting.background.forEach((diagonal) => {
			this.ctx.fillRect(diagonal.yPos, diagonal.xPos, diagonal.width, diagonal.height);
			diagonal.xPos += renderSetting.backgroundSetting.animationAmount;
			if(diagonal.xPos > this.canvas.width + 325)
				diagonal.xPos = 0;
		});
		this.ctx.restore();
	}

	renderHP(){
		this.ctx.font = "50px MUSECA";
		this.ctx.fillStyle = renderSetting.stageColor[this.stage].defaultColor;
		this.ctx.textAlign = 'right';
		this.ctx.fillText(`HP ${this.gameSetting.hp}`, this.canvas.width - 200, this.canvas.height - 50);
	}

	renderScore(){
		this.ctx.font = "30px MUSECA";
		this.ctx.fillStyle = renderSetting.stageColor[this.stage].highColor;
		this.ctx.textAlign = 'right';
		this.ctx.fillText(`SCORE ${Math.round(this.gameSetting.score)}`, this.canvas.width - 200, this.canvas.height - 105);
	}

	renderStage(){
		this.ctx.font = "30px MUSECA";
		this.ctx.fillStyle = renderSetting.stageColor[this.stage].bulletColor;
		this.ctx.textAlign = 'right';
		let leftText;
		if(this.stage !== 5){
			let leftSecond = Math.floor((this.neededStageTime() - this.tick) / 20);
			let leftCalculatedSecond = (leftSecond % 60).toString();
			if(leftCalculatedSecond.length === 1) leftCalculatedSecond = "0" + leftCalculatedSecond;
			leftText = `${Math.floor(leftSecond / 60)}:${leftCalculatedSecond}`;
		}else leftText = 'Infinity';
		this.ctx.fillText(
			`STAGE ${renderSetting.stageColor[this.stage].text} (x${Math.round(this.gameSetting.scoreMultiplier * 10) / 10})`
			+ ` LEFT ${leftText}`, this.canvas.width - 200, this.canvas.height - 140
		);
	}

	/*renderAmmo(){
	}*/

	renderCrossHair(){
		this.ctx.beginPath();
		this.ctx.arc(this.cursorX, this.cursorY, 1, 0, Math.PI * 2);
		this.ctx.fill();
		this.ctx.beginPath();
		this.ctx.arc(this.cursorX, this.cursorY, this.gameSetting.fireRadius, 0, Math.PI * 2);
		this.ctx.stroke();
	}

	renderJudgeline(){
		this.ctx.strokeStyle = renderSetting.stageColor[this.stage].highColor;
		if(this.gameSetting.hp < 600) this.ctx.strokeStyle = renderSetting.stageColor[this.stage].normalColor;
		if(this.gameSetting.hp < 100) this.ctx.strokeStyle = renderSetting.stageColor[this.stage].lowColor;
		this.ctx.lineWidth = 20;

		this.ctx.beginPath();
		this.ctx.arc(this.gameSetting.centerX, this.gameSetting.centerY, this.gameSetting.playerRadius, 0, Math.PI * 2);
		this.ctx.stroke();
	}

	renderHUD(){
		this.renderHP();
		//this.renderAmmo();
		this.renderScore();
		this.renderStage();
		this.renderJudgeline();
		this.renderCrossHair();
	}

	render(){
		if(this.gameStatus === STATUS_END) return;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.renderBackground();
		this.particles.renderParticle(this.ctx);
		Object.values(this.objects).forEach((v) => renderSetting.renderer[v.type](v));
		if(!this.noDrawHud) this.renderHUD();

		requestAnimationFrame(this.renderHandler);
	}

	onDamage(){
		if(this.gameStatus === STATUS_END) return;

		if(this.gameSetting.hp <= 0){
			this.gameEnd();
		}
	}

	gameStart(){
		this.gameStatus = STATUS_START;
		this.handleTick();
		this.render();
	}

	gameEnd(){
		this.gameStatus = STATUS_END;
	}
}

class DestructionAnimation{
	constructor(object){
		this.x = object.x;
		this.y = object.y;
		this.radius = object.radius;
		this.color = object.getColor();
		this.game = object.game;
	}

	play(){
		this.game.particles.registerParticle(new CircleParticle({
			life: 20,
			color: this.color,
			x: this.x,
			y: this.y,
			size: this.radius,
			motionSize: this.radius / 20,
			motionX: 0,
			motionY: 0,
			still: true,
			onFinish: () => {
				for(let i = 0; i < 15; i++){
					let particle = new CircleParticle({
						life: 20,
						color: this.color,
						x: this.x,
						y: this.y,
						size: this.radius / 5,
						motionSize: this.radius / 100,
						motionX: Math.random() * 2 - 1,
						motionY: Math.random() * 2 - 1,
						still: false
					});

					this.game.particles.registerParticle(particle);
				}
			}
		}));
	}
}

class GameObject{
	constructor(game, x, y){
		this.game = game;
		this.id = game.lastId;
		game.lastId++;
		this.type = undefined;
		this.x = x;
		this.y = y;
	}

	update(){}
}

class Enemy extends GameObject{
	constructor(game, hp, x, y, damage){
		super(game, x, y);
		this.hp = hp;
		this.defaultHp = hp;
		this.damage = damage;
		this.radius = game.gameSetting.enemyRadius;
	}

	setDead(){
		new DestructionAnimation(this).play();
		this.game.objects[this.id] = undefined;
		delete this.game.objects[this.id];
	}

	getColor(){
		return renderSetting.stageColor[this.game.stage].defaultColor;
	}

	update(){
		super.update();

		if(this.hp <= 0) return this.setDead();

		if(Math.distance(this.x, this.y, this.game.gameSetting.width / 2, this.game.gameSetting.height / 2) < this.game.gameSetting.playerRadius){
			this.setDead();
			this.game.gameSetting.hp -= this.damage;
			this.game.emit('damage');
			this.game.onDamage();
		}
	}
}

class DefaultEnemy extends Enemy{
	constructor(game, hp, x, y, damage, theta){
		super(game, hp, x, y, damage);
		[this.motionX, this.motionY] = [
			Math.cos(theta + Math.PI) * this.game.gameSetting.objectVelocity,
			Math.sin(theta + Math.PI) * this.game.gameSetting.objectVelocity
		];
		this.type = TYPE_DEFAULT;
	}

	getColor(){
		return renderSetting.stageColor[this.game.stage].defaultColor;
	}

	update(){
		super.update();
		this.x += this.motionX;
		this.y += this.motionY;
	}
}

class AdvEnemy extends DefaultEnemy{
	constructor(game, hp, x, y, damage, theta){
		super(game, hp, x, y, damage, theta);
		this.type = TYPE_ADV;
		this.theta = theta;
		this.motionX = 0;
		this.motionY = 0;
		this.innerTick = 0;
	}

	getColor(){
		if(this.hp < this.defaultHp / 3) return renderSetting.stageColor[this.game.stage].lowColor;
		else if(this.hp < this.defaultHp * 2 / 3) return renderSetting.stageColor[this.game.stage].normalColor;
		else return renderSetting.stageColor[this.game.stage].highColor;
	}

	update(){
		super.update();

		this.innerTick++;
		this.theta += Math.PI / this.game.gameSetting.advVelocity;

		let cartesian = Math.toCartesian(
			this.game.gameSetting.advCOrbit - this.innerTick,
			this.theta,
			this.game.gameSetting.centerX,
			this.game.gameSetting.centerY
		);

		[this.x, this.y] = [cartesian.x, cartesian.y];

		if(this.innerTick % this.game.gameSetting.fireTick === 0){
			for(let i = 0; i < this.game.gameSetting.fireAmount; i++){
				let angle = Math.round(Math.random() * 90) + 135;
				let rad = Math.toRad(angle);

				let [motionX, motionY] = [
					Math.cos(rad) * this.game.gameSetting.bulletVelocity,
					Math.sin(rad) * this.game.gameSetting.bulletVelocity
				];

				this.game.addGameObject(new BulletEntity(this.game, this.x, this.y, motionX, motionY));
			}
		}
	}
}

class BulletEntity extends Enemy{
	constructor(game, x, y, motionX, motionY){
		super(game, 1, x, y, game.gameSetting.advDamage);
		this.motionX = motionX;
		this.motionY = motionY;
		this.type = TYPE_BULLET;
	}

	getColor(){
		return renderSetting.stageColor[this.game.stage].bulletColor;
	}

	update(){
		super.update();
		this.x += this.motionX;
		this.y += this.motionY;

		if(this.x < 0 || this.x >= this.game.gameSetting.width){
			this.motionX = -this.motionX;
			this.motionY += Math.random() * this.game.gameSetting.bulletRandom;
		}

		if(this.y < 0 || this.y >= this.game.gameSetting.height){
			this.setDead();
		}
	}
}

export default Game;
