(function(){
	const $ = document.querySelectAll;

	let canvas = $('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	const STATUS_START = 0;
	const STATUS_INGAME = 1;
	const STATUS_END = 2;

	let currentGame = new Game;

	Math.toRad = (angle) => angle / 180 * Math.PI;

	class EventEmitter{
		constructor(){
			this.listeners = {};
		}

		get listeners(){
			return undefined;
		}

		on(listenerName, callback){
			if(!this.listeners[listenerName]) this.listeners[listenerName] = [];

			this.listeners[listenerName].push(callback);
		}

		emit(listenerName, ...arguments){
			this.listeners[listenerName].forEach((v) => v(...arguments));
		}
	}

	class Game extends EventEmitter{
		constructor(){
			this.gameSetting = {
				width: 1280,
				height: 720,
				creationTick: 50,
				hp: 100,
				advPercentage: 0.1,
				fireTick: 200,
				bulletVelocity: 50
			};
			this.objects = {};
			this.tick = 0;

			this.gameStatus = STATUS_START;
		}

		handleTick(){
			if(this.gameStatus === STATUS_END) return;

			this.tick++;

			if(this.tick % this.gameSetting.creationTick === 20){
				this.createEnemy();
			}

			setTimeout(this.handleTick, 50);
		}

		addGameObject(object){
			if(this.gameStatus === STATUS_END) return;
			this.objects[object.id] = object;
		}

		createEnemy(){
			if(this.gameStatus === STATUS_END) return;

			let args = [this, 10, Math.round(Math.random() * this.gameSetting.width), this.gameSetting.height, 10];
			let enemy = new DefaultEnemy(...args);
			if(Math.random() < advPercentage) enemy = new AdvEnemy(...args);

			this.addGameObject(enemy);
		}

		render(){
			if(this.gameStatus === STATUS_END) return;

			this.objects.forEach((v) => {
				//TODO
			});

			requestAnimationFrame(render);
		}

		onDamage(){
			if(this.gameSetting.hp < 0){
				
			}
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

		get id(){
			return this.id;
		}

		set id(){}

		get type(){
			return this.type;
		}

		set type(){}

		update(){}
	}

	class Enemy extends GameObject{
		constructor(game, hp, x, y, damage){
			super(game, x, y);
			this.hp = hp;
			this.damage = damage;
		}

		update(){
			super.update();

			if(this.y < 0){
				this.game.gameSetting.hp -= this.damage;
				this.game.emit('damage');
				this.game.onDamage();
			}
		}
	}

	class DefaultEnemy extends Enemy{}

	class AdvEnemy extends Enemy{
		update(){
			super.update();

			if(this.game.tick % this.game.gameSetting.fireTick === 0){
				let angle = Math.round(Math.random() * 90) + 135;
				let rad = Math.toRad(angle);

				let [motionX, motionY] = [
					Math.cos(rad) * this.game.gameSetting.bulletVelocity,
					Math.sin(rad) * this.game.gameSetting.bulletVelocity
				];

				let bullet = new BulletEntity(this.game, this.x, this.y, motionX, motionY);

			}
		}
	}

	class BulletEntity extends Enemy{
		constructor(game, x, y, motionX, motionY){
			super(game, 1, x, y);
			this.motionX = motionX;
			this.motionY = motionY;
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
});
