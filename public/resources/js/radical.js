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
		defaultColor			: '#757575',
		lowColor				: '#ef5350',
		normalColor				: '#ffc107',
		highColor				: '#4caf50',
		nextStageAnimationTick 	: 5000,
		stageColor: {
			1: {
				bg: '#751212',
				fg: '#b71c1c',
				bulletColor: '#ffee58',
				highColor: '#ffc107',
				normalColor: '#ff9800',
				lowColor: '#e65100',
				defaultColor: '#fff59d',
				text: '1'
			},
			2: {
				bg: '#9a3600',
				fg: '#e65100',
				bulletColor: '#ffee58',
				highColor: '#ffc107',
				normalColor: '#ffea00',
				lowColor: '#ffd600',
				defaultColor: '#880e4f',
				text: '2'
			},
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
			animationAmount: 1,
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

		on(listenerName, callback){
			if(!this.listeners[listenerName]) this.listeners[listenerName] = [];

			this.listeners[listenerName].push(callback);
		}

		emit(listenerName, ...args){
			(this.listeners[listenerName] || []).forEach((v) => v(...args));
		}
	}

	class Game extends EventEmitter{
		constructor(){
			super();
			this.gameSetting = {
				width			: 1280,
				height			: 720,
				centerX			: 640,
				centerY			: 360,
				creationTick	: 50,
				//hp				: 100,
				hp				: Infinity,
				playerRadius	: 75,
				enemyCOrbit		: 640,
				advCOrbit		: 360,
				defaultHp		: 15,
				defaultDamage	: 10,
				advDamage		: 20,
				advPercentage	: 0.1,
				fireTick		: 100,
				bulletVelocity	: 40,
				bulletRandom	: 5,
				objectVelocity	: 15,
				advVelocity		: 45,
				maxStage		: 5,
				stageTime		: 1000,
				scoreMultiplier	: 1,
				stageIncreasement: {
					bulletVelocity	: 5,
					objectVelocity	: 5,
					fireTick		: -10,
					defaultHp		: 2,
					defaultDamage	: 3,
					creationTick	: -5,
					stageTime		: 200,
					scoreMultiplier	: 0.2,
					advPercentage	: 0.1,
					advDamage		: 5,
					hp				: 10
				}
			};

			this.animationTick = 0;
			this.objects = {};
			this.tick = 0;
			this.stage = 1;
			this.score = 0;
			this.lastId = 0;
			this.cursorX = 640;
			this.cursorY = 360;

			this.gameStatus = STATUS_START;

			this.tickHandler = () => {
				this.handleTick();
			};

			this.renderHandler = () => {
				this.render();
			};
		}

		neededStageTime(){
			return 800 + 200 * this.stage;
		}

		nextStage(){
			this.stage++;
			this.animationTick = 0;
			Object.keys(this.gameSetting.stageIncreasement).forEach((k) => {
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

			if(this.tick % this.gameSetting.creationTick === 0){
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

		renderBackground(){
			ctx.fillStyle = renderSetting.stageColor[this.stage].bg;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = renderSetting.stageColor[this.stage].fg;
			ctx.save();
			ctx.translate(...renderSetting.backgroundSetting.center);

			ctx.translate(renderSetting.backgroundSetting.halfSize, renderSetting.backgroundSetting.halfSize);
			ctx.rotate(renderSetting.backgroundSetting.angle);
			ctx.translate(-renderSetting.backgroundSetting.halfSize, -renderSetting.backgroundSetting.halfSize);
			renderSetting.background.forEach((diagonal) => {
				ctx.fillRect(diagonal.yPos, diagonal.xPos, diagonal.width, diagonal.height);
				diagonal.xPos += renderSetting.backgroundSetting.animationAmount;
				if(diagonal.xPos > canvas.width + 200)
					diagonal.xPos = 0;
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
		}

		setDead(){
			this.game.objects[this.id] = undefined;
			delete this.game.objects[this.id];
		}

		getColor(){
			return renderSetting.stageColor[this.game.stage].defaultColor;
		}

		update(){
			super.update();

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
				for(let i = 0; i < 2; i++){
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
			super(game, 1, x, y);
			this.motionX = motionX;
			this.motionY = motionY;
			this.type = TYPE_BULLET;
		}

		getColor(){
			return renderSetting.stageColor[this.game.stage].bulletColor;
		}

		update(){
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

	let game = new Game;
	game.gameStart();
//})();
