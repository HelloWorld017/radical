//(function(){
	'use strict';
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

	const canvas = $('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const ctx = canvas.getContext('2d');

	const STATUS_START = 0;
	const STATUS_INGAME = 1;
	const STATUS_END = 2;

	const TYPE_DEFAULT = 0;
	const TYPE_ADV = 1;
	const TYPE_BULLET = 2;

	const defaultRenderer = (object) => {
		ctx.fillStyle = object.getColor();
		ctx.beginPath();
		ctx.arc(object.x, object.y, remderSetting.defaultEnemyRadius);
		ctx.closePath();
	};

	const temp = {};
	temp.size = Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) + 50;

	const renderSetting = {
		defaultEnemyRadius		: 30,
		bulletColor				: '#03a9f4',
		defaultColor			: '#ab47bc',
		lowColor				: '#ef5350',
		normalColor				: '#ffc107',
		highColor				: '#4caf50',
		nextStageAnimationTick 	: 5000,
		stageColor: {
			1: ['#751212', '#b71c1c', '1'],
			2: ['#9a3600', '#e65100', '2'],
			3: ['#004d40', '#006064', '3'],
			4: ['#1a237e', '#0d47a1', '4'],
			5: ['#212121', '#fafafa', '∞']
		},
		renderer: {
			TYPE_DEFAULT	: defaultRenderer,
			TYPE_ADV		: defaultRenderer,
			TYPE_BULLET		: defaultRenderer
		},
		backgroundSetting: {
			animationAmount: 50,
			size	: temp.size,
			angle	: Math.toRad(45),
			center	: [
				(canvas.width - temp.size) / 2,
				(canvas.height - temp.size) / 2
			],
			halfSize: temp.size / 2
		},
		background	: [...Array(Math.ceil(temp.size / 100))].map((v, k) => k * 100).map((i) => {
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

		set listeners(v){}

		on(listenerName, callback){
			if(!this.listeners[listenerName]) this.listeners[listenerName] = [];

			this.listeners[listenerName].push(callback);
		}

		emit(listenerName, ...args){
			console.log(this);
			(this.listeners[listenerName] || []).forEach((v) => v(...args));
		}
	}

	class Game extends EventEmitter{
		constructor(){
			super();
			this.gameSetting = {
				width			: 1280,
				height			: 720,
				creationTick	: 50,
				hp				: 100,
				defaultHp		: 15,
				defaultDamage	: 10,
				advPercentage	: 0.1,
				fireTick		: 200,
				bulletVelocity	: 50,
				objectVelocity	: 25,
				maxStage		: 5,
				stageTime		: 400,
				scoreMultiplier	: 1,
				stageIncreasement: {
					bulletVelocity	: 5,
					objectVelocity	: 5,
					fireTick		: -10,
					defaultHp		: 2,
					defaultDamage	: 3,
					creationTick	: -5,
					stageTime		: 200,
					scoreMultiplier	: 0.2
				}
			};

			this.animationTick = 0;
			this.objects = {};
			this.tick = 0;
			this.stage = 1;
			this.score = 0;

			this.gameStatus = STATUS_START;

			this.tickHandler = () => {
				this.handleTick();
			};

			this.renderHandler = () => {
				this.render();
			};
		}

		neededStageTime(){
			return 200 * (this.stage + 1);
		}

		nextStage(){
			this.stage++;
			this.animationTick = 0;
			Object.keys(this.gameSetting.stageIncreasement.forEach).forEach((k) => {
				this.gameSetting[k] += this.gameSetting.stageIncreasement[k];
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

			if(this.tick % this.gameSetting.creationTick === 20){
				this.createEnemy();
			}

			Object.values(this.objects).forEach((v) => {
				v.update();
			});
			setTimeout(this.tickHandler, 50);
		}

		addGameObject(object){
			if(this.gameStatus === STATUS_END) return;
			this.objects[object.id] = object;
		}

		createEnemy(){
			if(this.gameStatus === STATUS_END) return;

			let args = [
				this,
				this.gameSetting.defaultHp,
				Math.round(Math.random() * this.gameSetting.width),
				this.gameSetting.height,
				this.gameSetting.defaultDamage
			];

			let enemy = new DefaultEnemy(...args);
			if(Math.random() < this.gameSetting.advPercentage) enemy = new AdvEnemy(...args);

			this.addGameObject(enemy);
		}

		renderBackground(){
			ctx.fillStyle = renderSetting.stageColor[this.stage];
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.save();
			ctx.translate(...renderSetting.backgroundSetting.center);

			ctx.translate(renderSetting.backgroundSetting.halfSize, renderSetting.backgroundSetting.halfSize);
			ctx.rotate(renderSetting.backgroundSetting.angle);
			ctx.translate(-renderSetting.backgroundSetting.halfSize, -renderSetting.backgroundSetting.halfSize);
			renderSetting.background.forEach((diagonal) => {
				ctx.fillRect(diagonal.yPos, diagonal.xPos, diagonal.width, diagonal.height);
				diagonal.xPos += renderSetting.backgroundSetting.animationAmount;
			});
			ctx.restore();
		}

		render(){
			if(this.gameStatus === STATUS_END) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			this.renderBackground();
			Object.values(this.objects).forEach((v) => {
				ctx.fillStyle = v.getColor();
				ctx.beginPath();
				ctx.arc(v.x, v.y, renderSetting.defaultEnemyRadius, 0, 2 * Math.PI);
				ctx.fill();
			});

			requestAnimationFrame(this.renderHandler);
		}

		onDamage(){
			if(this.gameStatus === STATUS_END) return;

			if(this.gameSetting.hp < 0){
				gameEnd();
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

	class GameObject{
		constructor(game, x, y){
			this.game = game;
			this.id = game.objects.length;
			this.type = undefined;
			this.x = x;
			this.y = y;
		}

		set id(v){}

		set type(v){}

		update(){}
	}

	class Enemy extends GameObject{
		constructor(game, hp, x, y, damage){
			super(game, x, y);
			this.hp = hp;
			this.defaultHp = hp;
			this.damage = damage;
		}

		getColor(){
			return renderSetting.defaultColor;
		}

		update(){
			super.update();

			if(Math.distance(this.x, this.y, this.game.gameSetting.width / 2, this.game.gameSetting.height / 2)){
				this.game.gameSetting.hp -= this.damage;
				this.game.emit('damage');
				this.game.onDamage();
			}
		}
	}

	class DefaultEnemy extends Enemy{
		constructor(...args){
			super(...args);
			let centerX = this.game.gameSetting.width / 2;
			let centerY = this.game.gameSetting.height / 2;
			let polar = Math.toPolar(this.x, this.y, centerX, centerY);
			[this.motionX, this.motionY] = [
				Math.cos(polar.theta) * this.game.gameSetting.objectVelocity,
				Math.sin(polar.theta) * this.game.gameSetting.objectVelocity
			];
			this.type = TYPE_DEFAULT;
		}

		getColor(){
			return renderSetting.defaultColor;
		}

		update(){
			super.update();
			this.x += this.motionX;
			this.y += this.motionY;
		}
	}

	class AdvEnemy extends DefaultEnemy{
		constructor(...args){
			super(...args);
			this.type = TYPE_ADV;
		}

		getColor(){
			if(this.hp < this.defaultHp / 3) return renderSetting.lowColor;
			else if(this.hp < this.defaultHp * 2 / 3) return renderSetting.normalColor;
			else return renderSetting.highColor;
		}

		update(){
			super.update();

			if(this.game.tick % this.game.gameSetting.fireTick === 0){
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

	class BulletEntity extends Enemy{
		constructor(game, x, y, motionX, motionY){
			super(game, 1, x, y);
			this.motionX = motionX;
			this.motionY = motionY;
			this.type = TYPE_BULLET;
		}

		getColor(){
			return renderSetting.bulletColor;
		}

		update(){
			this.x += this.motionX;
			this.y += this.motionY;

			if(this.x < 0 || this.x >= gameSetting.width){
				this.motionX = -this.motionX;
			}
		}
	}

	let game = new Game;
	game.gameStart();
//})();
