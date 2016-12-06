class ParticleSystem{
	constructor(gcTick){
		this.particles = [];
		this.gcTick = gcTick || 5000;
	}

	update(){
		this.particles.forEach((v) => v.update);
	}

	garbageCollect(){
		this.particles = this.particles.filter((v) => v.life >= v.current);
		setTimeout(this.garbageCollect, gcTick);
	}

	renderParticle(context){
		this.particles.forEach((v) => if(v.life >= v.current) v.render(context));
	}
}

class Particle{
	constructor(options){
		this.life = options.life || 0;
		this.current = 0;
		this.onFinish = options.onFinish || function(){};
	}

	update(){
		this.current++;
		if(this.life < this.current){
			this.onFinish();
			return;
		}
	}

	render(context){}
}

class CircleParticle{
	constructor(options){
		super(options);
		this.life = options.life || 200;
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.size = options.size || 10;
		this.motionX = options.motionX || 0;
		this.motionY = options.motionY || 0;
		this.motionSize = options.motionSize || -0.05;
		this.color = options.color || '#000';
	}

	update(){
		super.update();
		this.x += this.motionX;
		this.y += this.motionY:
		this.size -= this.motionSize;
		this.motionX = Math.sign(this.motionX) * Math.max(0, Math.abs(this.motionX) - 0.1);
		this.motionY -= 0.1;
	}

	render(ctx){
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
		ctx.fill();
	}
}

export ParticleSystem, Particle, CircleParticle;
