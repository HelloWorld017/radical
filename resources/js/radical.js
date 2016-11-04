(function(){
	const $ = document.querySelectAll;

	let canvas = $('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	let tick = 0;
	const gameSetting = {
		creationTick: 50,
		defaultHp: 100,
		advPercentage: 0.1
	};

	const objects = [];

	class GameObject{
		constructor(x, y){
			this.id = objects.length;
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
		constructor(hp){
			super();
			this.hp = hp;
		}

		update(){
			super.update();
		}
	}

	class DefaultEnemy extends Enemy{

	}

	const handleTick = () => {
		tick++;

		if(tick % creationTick === 20){
			createEnemy();
		}

		setTimeout(handleTick, 50);
	};

	const createEnemy = () => {
		objects.push(new DefaultEnemy);
	};
});
