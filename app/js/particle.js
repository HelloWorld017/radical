class ParticleSystem{
	constructor(gcTick){
		this.particles = [];
		this.gcTick = gcTick || 5000;
		this.garbageCollect();
	}

	update(){
		this.particles.forEach((v) => {
			if(v.life >= v.current) v.update()
		});
	}

	garbageCollect(){
		this.particles = this.particles.filter((v) => v.life >= v.current);
		setTimeout(() => this.garbageCollect(), this.gcTick);
	}

	renderParticle(context){
		this.particles.forEach((v) => {
			if(v.life >= v.current) v.render(context)
		});
	}

	registerParticle(particle){
		this.particles.push(particle);
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

class CircleParticle extends Particle{
	constructor(options){
		super(options);
		this.life = options.life || 200;
		this.x = options.x || 0;
		this.y = options.y || 0;
		this.size = options.size || 10;
		this.motionX = options.motionX || 0;
		this.motionY = options.motionY || 0;
		this.motionSize = options.motionSize || 0.05;
		this.color = options.color || '#000';
		this.still = options.still;
	}

	update(){
		super.update();
		this.x += this.motionX;
		this.y += this.motionY;
		this.size -= this.motionSize;
		if(!this.still){
			this.motionX = Math.sign(this.motionX) * Math.max(0, Math.abs(this.motionX) - 0.1);
			this.motionY += 0.1;
		}
	}

	render(ctx){
		ctx.fillStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x, this.y, Math.round(this.size), 0, Math.PI * 2);
		ctx.fill();
	}
}

export {ParticleSystem, Particle, CircleParticle};
