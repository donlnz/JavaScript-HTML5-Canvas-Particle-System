/**
 * @author Henrik Linusson
 */
var context;

/**
 * Particle system
 * @param canvasId Id of HTML5 canvas element on which to draw the particle system. Default = "canvas".
 */
function ParticleSystem(canvasId) {

	// Canvas properties
	this.autoResize = false;
	this.backgroundColor = { r : 0, g : 0, b : 0, a : 1 };

	// Particle spawning
	this.maxParticles = 500;
	this.particlesPerUpdate = 1;

	// Particle properties
	this.particleSpeed = 0;
	this.particleSize = { x : 1, y : 1 };
	this.particleColor = { r : 255, g : 255, b : 255, a : 1 };
	this.particleOrigin = { x : 0.5, y : 0.5 };
	this.particleRenderer = new RoundParticleRenderer();
	this.particleAnimator = new DefaultParticleAnimator();

	var particles = [];
	var particleOrigin = { x : 0, y : 0 };
	var height = 0;
	var width = 0;

	/**
	 * Initializes the particle system.
	 */
	ParticleSystem.prototype.initialize = function() {
		this.canvas = document.getElementById(canvasId || 'canvas');
		context = this.canvas.getContext('2d');
		this.resize();
		context.fillStyle = rgbaToString(this.backgroundColor);
		context.save();
	}

	/**
	 * Resizes the particle system canvas to fit the browser window if autoresizing is enabled.
	 */
	ParticleSystem.prototype.resize = function() {
		if (this.autoResize) {
			context.canvas.width = window.innerWidth * 0.99;
			context.canvas.height = window.innerHeight * 0.99;
		}
		
		width = context.canvas.width;
		height = context.canvas.height;
	}

	/**
	 * Updates all particles in the particle system, using the current particle animator.
	 */
	ParticleSystem.prototype.update = function() {
		this.particleAnimator.update(particles);
		particleOrigin = { x : width * this.particleOrigin.x, y : height * this.particleOrigin.y };

		for (var i = 0; i < this.particlesPerUpdate; i++) {
			var particle = new Particle(jQuery.extend(true, {}, particleOrigin),
											jQuery.extend(true, {}, this.particleSize),
											jQuery.extend(true, {}, this.particleColor),
											this.particleSpeed);

			particles.push(particle);
		}

		while (particles.length > this.maxParticles)
			particles.shift();
	}

	/**
	 * Draws all particles in the particle system, using the current particle renderer.
	 */
	ParticleSystem.prototype.draw = function() {
		context.restore();
		context.clearRect(0, 0, width, height);
		context.fillRect(0, 0, width, height);
		context.save();

		this.particleAnimator.draw(particles, this.particleRenderer);
	}

	/**
	 * Starts the particle system.
	 */
	ParticleSystem.prototype.run = function() {
		this.initialize();
		
		// Fix the scope, can't use setInterval with this.x
		var me = this;
		function loop() {
			me.draw();
			me.update();
		}

		setInterval(loop, 30);
	}
}

/**
 * Particle
 * @param xypos Particle center : { x : float, y : float }
 * @param xysize Particle size : { x : float, y : float }
 * @param rgbacolor Particle color : { r : int, g : int, b : int, a : float }
 * @param speed Particle speed : int
 */
function Particle(xypos, xysize, rgbacolor, speed) {
	this.pos = xypos;
	this.size = xysize;
	this.color = rgbacolor;
	this.velocity = { x : (Math.random() - 0.5) * speed, y : (Math.random() - 0.5) * speed };
}

/****************************************************************************
 * Particle Animators
 ****************************************************************************/

/**
 * Default particle animator.
 * Moves particles in a straight line from emission point.
 * Reduces size of particles every update.
 */
function DefaultParticleAnimator() {
	this.options = { };

	/**
	 * Updates a list of particles.
	 * @param particles List of particles to update.
	 */
	DefaultParticleAnimator.prototype.update = function(particles) {
		for (var i = 0; i < particles.length; i++){
			var p = particles[i];
			p.pos.x += p.velocity.x;
			p.pos.y += p.velocity.y;
			p.size.x *= 0.98;
			p.size.y *= 0.98;
		}
	}

	/**
	 * Draws a list of particles using a particle renderer.
	 * @param particles List of particles to render.
	 * @param particleRenderer Particle renderer used to draw the particles.
	 */
	DefaultParticleAnimator.prototype.draw = function(particles, particleRenderer) {
		for (var i = 0; i < particles.length; i++)
			particleRenderer.draw(particles[i]);
	}
}

/**
 * Fancier particle animator (compared to default one).
 * Moves particles in a straight line from emission point.
 * Reduces size of particles every update.
 * Shifts color of particles every update.
 * Blends particles using lightening composition.
 */
function FancyParticleAnimator() {
	this.options = { };

	/**
	 * Updates a list of particles.
	 * @param particles List of particles to update.
	 */
	FancyParticleAnimator.prototype.update = function(particles) {
		for (var i = 0; i < particles.length; i++){
			var p = particles[i];
			p.pos.x += p.velocity.x;
			p.pos.y += p.velocity.y;
			p.size.x *= 0.98;
			p.size.y *= 0.98;
			p.color.a *= 0.99;
			p.color.r *= 1.02;
			p.color.b *= 0.98;
			p.color.g *= 0.98;
		}
	}

	/**
	 * Draws a list of particles using a particle renderer.
	 * @param particles List of particles to render.
	 * @param particleRenderer Particle renderer used to draw the particles.
	 */
	FancyParticleAnimator.prototype.draw = function(particles, particleRenderer) {
		context.globalCompositeOperation = 'lighter';
		for (var i = 0; i < particles.length; i++)
			particleRenderer.draw(particles[i]);
	}
}

/****************************************************************************
 * Particle Renderers
 ****************************************************************************/

/**
 * Particle renderer used for square particles.
 */
function SquareParticleRenderer() {

	/**
	 * Renders a particle as a square.
	 * @param particle Particle to render.
	 */
	SquareParticleRenderer.prototype.draw = function(particle) {
		context.fillStyle = rgbaToString(particle.color);
		context.fillRect(particle.pos.x, particle.pos.y, particle.size.x, particle.size.y);
	}
}

/**
 * Particle renderer used for round particles.
 */
function RoundParticleRenderer() {

	/**
	 * Renders a particle as a circle.
	 * @param particle Particle to render.
	 */
	RoundParticleRenderer.prototype.draw = function(particle) {
		context.beginPath();
		context.fillStyle = rgbaToString(particle.color);
		var radius = Math.max(particle.size.x, particle.size.y) / 2;
		context.arc(particle.pos.x + radius,
					particle.pos.y + radius,
					radius,
					0,
					2 * Math.PI,
					false);
		context.fill();
	}
}

/****************************************************************************
 * Help functions
 ****************************************************************************/

/**
 * Convers a color object to string format.
 * @param color Color object { r : int, g : int, b : int, a : float }
 * @returns Returns color as string "rgba(r,g,b,a)"
 */
function rgbaToString(color) {
	return 'rgba(' +
				Math.round(color.r) + ', ' +
				Math.round(color.g) + ', ' +
				Math.round(color.b) + ', ' +
				color.a + ')';

}

/**
 * Translates a mousemouve event to canvas x,y-coordinates [0,1].
 * @param mouseevent Mouse event.
 * @param canvas Canvas.
 * @returns Mousemove event in canvas x,y-coordinates [0,1].
 */
function getCanvasPos(mouseevent, canvas) {
	this.x = mouseevent.clientX;
	this.y = mouseevent.clientY;
	this.x -= canvas.offsetLeft;
	this.y -= canvas.offsetTop;

	return { x : this.x / canvas.width , y : this.y / canvas.height };
}