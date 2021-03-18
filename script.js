/*---Set up the project
-----------------------------*/
const canvas = document.querySelector('canvas')
const context = canvas.getContext('2d')
//Take the full width of the window of the player
canvas.width = innerWidth
canvas.height = innerHeight

//Set the score 
const scoreE1 = document.querySelector('#ScoreE1')
const bigScoreE1 = document.querySelector('#bigScoreE1')

//Set the play button 
const StartGameBtn = document.querySelector('#startGameBtn')

//Popup the replay button
const modalE1 = document.querySelector('#modalE1')

//Add the sound audios 
const startGameAudio = new Audio('https://github.com/JackCree/asteroidGame/blob/main/audio/startGame.mp3')
const endGameAudio = new Audio('https://github.com/JackCree/asteroidGame/blob/main/audio/endGame.mp3')
const shootAudio = new Audio('https://github.com/JackCree/asteroidGame/blob/main/audio/shoot.mp3')
const enemyHitAudio = new Audio('https://github.com/JackCree/asteroidGame/blob/main/audio/enemyHit.mp3')
const obtainPowerUpAudio = new Audio('https://github.com/JackCree/asteroidGame/blob/main/audio/obtainPowerUp.mp3')
const enemyEliminatedAudio = new Audio('https://github.com/JackCree/asteroidGame/blob/main/audio/enemyEliminated.mp3')
const backgroundMusicAudio = new Audio('https://github.com/JackCree/asteroidGame/blob/main/audio/backgroundMusic.mp3?raw=true')
backgroundMusicAudio.loop = true

const scene = {
	active: false,
}

/*---Create a player
-----------------------------*/
class Player {
	constructor(x, y, radius, color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = {
			x: 0,
			y: 0
		}
		this.friction = 0.99
	}
	//Draw the player on the screen
	draw() {
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
		context.fillStyle = this.color
		context.fill()
	}
	update() {
		this.draw()
		//Add friction to the player's movement
		this.velocity.x *= this.friction
		this.velocity.y *= this.friction
		//Limit the velocity to the screen
		if (this.x - this.radius + this.velocity.x > 0 && this.x + this.radius + this.velocity.x < canvas.width) {
			this.x = this.x + this.velocity.x
		} else this.velocity.x = 0
		if (this.y -this.radius + this.velocity.y > 0 && this.y + this.radius + this.velocity.y < canvas.height) {
			this.y = this.y + this.velocity.y	
		} else this.velocity.y = 0;
	}
	//Shoot function
	shoot(mouse, color = 'white') {
		//Calculate the angle when there is a click
			const angle = Math.atan2(
				mouse.y - this.y, 
				mouse.x - this.x
		)
			//Set up the velocity into positive value to push the projective wherever the player clicks on the screen
			//Multiply the speed of projectile by 5
			const velocity = {
				x: Math.cos(angle) * 5,
				y: Math.sin(angle) * 5
			}
			projectiles.push(new Projectile(this.x, this.y, 5, color, velocity)
		)
		shootAudio.cloneNode().play()			
	}
}

/*---Create the projectile
-----------------------------*/
class Projectile {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
	}
	draw() {
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
		context.fillStyle = this.color
		context.fill()
	}
	//Update the position of the projectile by adding the click event position
	update() {
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}
/*---Create the power up 
-----------------------------*/
const powerUpImg = new Image()
powerUpImg.src = 'https://github.com/JackCree/asteroidGame/blob/main/img/lightning.png?raw=true'

class PowerUp {
	constructor(x, y, velocity) {
		this.x = x
		this.y = y
		this.velocity = velocity
		this.width = 14
		this.height = 18
		this.radians = 0
	}
	draw() {
		context.save()
		context.translate(this.x + this.width/ 2, this.y + this.height / 2)
		context.rotate(this.radians)
		context.translate(-this.x - this.width/ 2, -this.y - this.height / 2)
		context.drawImage(powerUpImg, this.x, this.y, 14, 18)
		context.restore()
	}
	//Update the position of the projectile by adding the click event position
	update() {
		this.radians += 0.003
		this.draw()
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
	}
}
/*---Create the enemies
-----------------------------*/
class Enemy {
	constructor(x, y, radius, color, velocity) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		//Add a type for tracking or normal enemies with 25% chance of rendering
		this.type = 'linear'
		//Add a center for the rotation of spinning enemies
		this.center = {
			x,
			y
		}
		this.radians = 0 

		//Probability of spinning enemies rendering 
		if (Math.random() > 0.75) {
			this.type = 'homing'
			//Probability of rotating enemies rendering 
			if (Math.random() > 0.75) {
				this.type = 'spinning'
				if (Math.random() > 0.9) {
					this.type = 'homingspinning'
				}			
			}			
		}
	}
	draw() {
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
		context.fillStyle = this.color
		context.fill()
	}	
	update() {
		this.draw()
		//Add the tracking velocity to types of enemies
		if (this.type === 'linear') {
			this.x = this.x + this.velocity.x
			this.y = this.y + this.velocity.y
		} else if (this.type === 'homing') {

			const angle = Math.atan2(player.y - this.y, player.x - this.x)

			this.velocity = {
				x: Math.cos(angle),
				y: Math.sin(angle)
			}
			this.x = this.x + this.velocity.x
			this.y = this.y + this.velocity.y
		} else if (this.type === 'spinning') {
			this.radians += 0.05
			this.center.x += this.velocity.x
			this.center.y += this.velocity.y

			this.x = this.center.x + Math.cos(this.radians) * 100
			this.y = this.center.y + Math.sin(this.radians) * 100
		} else if (this.type === 'homingspinning') {
			const angle = Math.atan2(player.y - this.y, player.x - this.x)

			this.velocity = {
				x: Math.cos(angle),
				y: Math.sin(angle)
			}

			this.radians += 0.05
			this.center.x += this.velocity.x
			this.center.y += this.velocity.y

			this.x = this.center.x + Math.cos(this.radians) * 100
			this.y = this.center.y + Math.sin(this.radians) * 100
		}

		//Linear travel
		//this.x = this.x + this.velocity.x
		//this.y = this.y + this.velocity.y
	}
}

/*---Create the enemies
-----------------------------*/

//Make the blueprint of the particles 
const friction = 0.97

class Particle {
	constructor(x, y, radius, color, velocity, ) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.velocity = velocity
		//variable to fade out the particles after a certain time
		this.alpha = 1
	}
	draw() {
		context.save();
		context.globalAlpha = this.alpha
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
		context.fillStyle = this.color
		context.fill()
		context.restore()
	}	
	update() {
		this.draw()
		//friction and slow down of the speed of particles
		this.velocity.x *= friction
		this.velocity.y *= friction
		this.x = this.x + this.velocity.x
		this.y = this.y + this.velocity.y
		this.alpha -= 0.01
	}
}

//Create the bckground
class BackgroundParticle {
	constructor(x, y, radius, color) {
		this.x = x
		this.y = y
		this.radius = radius
		this.color = color
		this.alpha = 0.05
		this.initalAlpha = this.alpha
	}
	draw() {
		context.save();
		context.globalAlpha = this.alpha
		context.beginPath()
		context.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
		context.fillStyle = this.color
		context.fill()
		context.restore()
	}	
	update() {
		this.draw()
	}
}

let player
//Create an array to group all projectiles when they are multiple click
let projectiles = []

//Contain each instance of each enemy created
let enemies = []

//Contain each instance of particles for the hit
let particles = []
//contain each instance of powerup for the game
let powerUps = []
//contains the particles for the background
let backgroundParticles= []

/*---Initiate the Game
-----------------------------*/
function init() {
	//Position of the player at the beginnng of the game
	const x = canvas.width / 2
	const y = canvas.height / 2

	player = new Player(x, y, 10, 'rgba(255, 255, 255,0.8')
	powerUps = []
	projectiles = []
	enemies = []
	particles = []
	//Avoid the freeze in the game when screen resizing
	backgroundParticles = []

	//Create the grid
	for (let x = 0; x < canvas.width; x += 30) {
		for (let y = 0; y < canvas.height; y += 30) {
			backgroundParticles.push(new BackgroundParticle(x, y, 3, 'blue'))
		}
	}
}

//Spawn randomnly enemies 
function spawnEnemies() {
		//Set different size for enemies with a minimum size
		const radius = Math.random() * (30 - 4) + 4

		let x
		let y

		if (Math.random() < 0.5) {
		//Generate randoms coordonates by making them appear at the border of the canvas
			x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
		    y = Math.random() * canvas.height
	} else {
		x = Math.random() * canvas.width
		y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
	}
		//Randomize the color of enemies with hsl propertyes
		//Compute the formula random with the abriavtion $
		const color = `hsl(${Math.random() * 360}, 50%, 50%)`
		
		//Calculate the angle when there is a click
		const angle = Math.atan2(
			canvas.height/2-y, 
			canvas.width/2-x
	)
		//Set up the velocity into positions of enemies to move to the center
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		}
	enemies.push(new Enemy(x, y , radius, color, velocity))
}

//Spawn randomnly powerups
function spawnPowerups() {
		let x
		let y

		if (Math.random() < 0.5) {
		//Generate randoms coordonates by making them appear at the border of the canvas
			x = Math.random() < 0.5 ? 0 - 7 : canvas.width + 7
		    y = Math.random() * canvas.height
	} else {
		x = Math.random() * canvas.width
		y = Math.random() < 0.5 ? 0 - 9 : canvas.height + 9
	}
		
		//Calculate the angle when there is a click
		const angle = Math.atan2(
			canvas.height/2-y, 
			canvas.width/2-x
	)
		//Set up the velocity into positions of powerup to move to the center
		const velocity = {
			x: Math.cos(angle),
			y: Math.sin(angle)
		}
	powerUps.push(new PowerUp(x, y, velocity))
}

//Dynamic Score Label
function createScoreLabel(projectile, score) {
	const scoreLabel = document.createElement('label')
	scoreLabel.innerHTML = score
	scoreLabel.style.position = 'absolute'
	scoreLabel.style.color = 'white'
	scoreLabel.style.userSelect = 'none'
  	scoreLabel.style.left =projectile.x + 'px'
  	scoreLabel.style.top = projectile.y + 'px' 
	document.body.appendChild(scoreLabel)

	//Make dissapear the label after a certain amount of time
	gsap.to(scoreLabel, {
		opacity: 0,
		y: -30,
		duration: 0.75,
		onComplete: () => {
			scoreLabel.parentNode.removeChild(scoreLabel)
		}
	})
}

//Spawn of the projectile
const projectile = new Projectile(
		canvas.width / 2, 
		canvas.height / 2, 
		5, 
		'red',
		{
			x:1,
			y:1
		}
	)

//Add velocity to the projectile : loop with animate to move the projectile to the click position event
let animationId
let score = 0
let frame = 9

function animate() {
	animationId = requestAnimationFrame(animate)
	frame++

	if (frame % 40 === 0) spawnEnemies() //Prevent bugs keeping spawing even after the game has ended
		if (frame % 300 === 0) spawnPowerups() //Prevent bugs spwaning one power-up 

	//Colorize game : blur effect on moves
	context.fillStyle = 'rgba(0, 0, 0, 0.1)'
	context.fillRect(0, 0, canvas.width, canvas.height)	
	//Clear all previous particles of the animation of the projectile to let a simple circle
	
	//Add the grid 
	backgroundParticles.forEach(backgroundParticle => {
		//give the distance between particles and the player dot
		const dist = Math.hypot(player.x - backgroundParticle.x, player.y - backgroundParticle.y)
		const hideRadius = 100

		//Variation of the grid particles color on player's moves
		if (dist < hideRadius ) {
			if (dist < 70) {
				backgroundParticle.alpha = 0
			} else {
				backgroundParticle.alpha = 0.5
			}
		} else if (dist >= hideRadius && backgroundParticle.alpha < backgroundParticle.initalAlpha) {
			backgroundParticle.alpha += 0.01
		} else if (dist >= hideRadius && backgroundParticle.alpha > backgroundParticle.initalAlpha) {
			backgroundParticle.alpha -= 0.01
		}

		backgroundParticle.update()
		}
	)

	player.update()
	//Call of particles effect
	particles.forEach((particle, index) => {
		if (particle.alpha <= 0) {
			particles.splice(index, 1)
		} else {
			particle.update()
		}
	})
	//Add the action of automatic shoots
	if (player.powerUp === 'Automatic' && mouse.down) {
		//Automatic shoot every 4 frames
		if (frame % 4 === 0) {
			player.shoot(mouse, '#FFF500')
		}
	}

	powerUps.forEach((powerUp, index) => {
		/*Detect collision on powerup / player*/
		const dist = Math.hypot(player.x - powerUp.x, player.y - powerUp.y)

		//Active one power up when the player is passing on powerup
		if (dist - player.radius - powerUp.width /2 < 1) {
			player.color = '#FFF500'
			player.powerUp = 'Automatic'
			obtainPowerUpAudio.cloneNode().play()
			powerUps.splice(index, 1)

			//Add a time for the powerup
			setTimeout(() => {
				player.powerUp = null
				player.color = '#FFFFFF'
			}, 5000)
		} else {
			powerUp.update()
		}
	})
	
	/*---Remove projectiles off the screen
	-----------------------------*/
	projectiles.forEach((projectile, index) => 
	{
		projectile.update()

		if (projectile.x + projectile.radius < 0 || 
			projectile.x - projectile.radius > canvas.width ||
			projectile.y + projectile.radius < 0 ||
			projectile.y - projectile.radius > canvas.height) {
			setTimeout(() => {					
				projectiles.splice(index, 1)
			}, 0)	
		}
	})
	enemies.forEach((enemy, index) => {
		enemy.update()

		/*Detect collision on enemy / player hit
		-----------------------------*/
		const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
		//End of the game : make a pause
		if (dist - enemy.radius - player.radius < 1) {
			cancelAnimationFrame(animationId);
			//Pop up the Star Game Popup
			modalE1.style.display = 'flex'
			bigScoreE1.innerHTML = score
			endGameAudio.play()	
			scene.active = false

			gsap.to('#whiteModalEl', {
					opacity: 1,
					scale: 1,
					duration: 0.35,
					ease: 'expo.in'				
				})			
			}

				/*Detect collision on enemy / projectile hit
		-----------------------------*/
		projectiles.forEach((projectile, projectileIndex) => {
			const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
			//Object touched : condition if the radius of the enemy is too short

			if (dist - enemy.radius - projectile.radius < 0.25) //Prevent a bug of mupltiple enemies disappearing when just one is hit
			{				
				//create explosions ! 
				for (var i = 0; i < enemy.radius + 2; i++) {
					particles.push(new Particle(
						projectile.x, 
						projectile.y, 
						Math.random()*2, 
						enemy.color, 
						{
							x:(Math.random() - 0.5) * (Math.random()* 8),
							y:(Math.random() - 0.5) * (Math.random()* 8)
						}
					)
				)
			}

				
			/*Detect collision on enemy / Shrink enemies on hit
			-----------------------------*/
			//decrease the size till a limit where it shrinks into particles
			//detect and clear all little enemies
			if (enemy.radius - 10 > 5) {	
				enemyHitAudio.cloneNode().play()
				//Increase the score
				score += 100
				scoreE1.innerHTML = score

				//Add dynamic score	labels
				createScoreLabel(projectile, 100)

				//Skrink effect : call from the library gsap
				gsap.to(enemy.y, {
					radius: enemy.radius - 10
				})
				enemy.radius -= 10
				setTimeout(() => {
					const enemyFound = 	enemies.find((enemyValue) => {
						return enemyValue === enemy
					})
					if (enemyFound) {
						enemies.splice(index, 1)
						projectiles.splice(projectileIndex, 1)
					}
				}, 0)	

			} else {	
				//Increase the score
				score += 250
				scoreE1.innerHTML = score
				//sound when the enmy is eliminated
				enemyEliminatedAudio.cloneNode().play()

				//Add dynamic score labels
				createScoreLabel(projectile, 250)
				//Change BackgroundParitcle Color when a hit is made
				backgroundParticles.forEach((backgroundParticle) => {
            		backgroundParticle.color = enemy.color

            		gsap.to(backgroundParticle, {
            			alpha: 0.5,
            			duration: 0.015,
            			onComplete: () => {
            				gsap.to(backgroundParticle, {
            					alpha: backgroundParticle.initalAlpha,
            					duration: 0.015
            				})
            			}
            		})
				})

				//remove the flash effect when an enemy is removed
				setTimeout(() => {
					enemies.splice(index, 1)
					projectiles.splice(projectileIndex, 1)
				}, 0)	
				}							
			}
		})
	})
}
//Createn event for the powerup to shoot automaticaly and expires after a certain aount of time has passed
const mouse = {
	down: false,
	x: undefined,
	y: undefined
}
addEventListener('mousedown', ({ clientX, clientY }) => {
	mouse.x = clientX
	mouse.y = clientY

	mouse.down = true	
})
addEventListener('mousemove', ({ clientX, clientY }) => {
	mouse.x = clientX
	mouse.y = clientY	
})
addEventListener('mouseup', () => {
	mouse.down = false
})
//-------------------
//	Mobile Events
//-------------------
addEventListener('touchstart', (event) => {
	mouse.x = event.touches[0].clientX
	mouse.y = event.touches[0].clientY

	mouse.down = true
})
addEventListener('touchmove', (event) => {
	mouse.x = event.touches[0].clientX
	mouse.y = event.touches[0].clientY
	
})
addEventListener('touchend', () => {
	mouse.down = false
})

//Shoot projectile : when the user clicks, a projectiles is shooting from the player ship
addEventListener('click', ({ clientX, clientY }) => {
	if (scene.active && player.powerUp !== 'Automatic') //Prevent a bug wwhen shooting creates two colors of projectiles when a power-up is obtained
	 {
		mouse.x = clientX
		mouse.y = clientY
		player.shoot(mouse)
	}
})
//Resize the screen
addEventListener('resize', () => {
	canvas.width = innerWidth
	canvas.height = innerHeight

	init()
})

/*---Add the start game button
-----------------------------*/
StartGameBtn.addEventListener('click', () => {
	init()
	animate()
	startGameAudio.play()
	scene.active = true

	score= 0
	scoreE1.innerHTML = score
	bigScoreE1.innerHTML = score
	backgroundMusicAudio.play()

	gsap.to('#whiteModalEl', {
		opacity: 0,
		scale: 0.75,
		duration: 0.35,
		ease: 'expo.in',
		onComplete: () => {
			modalE1.style.display = 'none';
		} 
	})
})
/*-----Player movements------
----------------------------*/
addEventListener('keydown', ({keyCode}) => {
	switch(keyCode) {
		//Arrow Controls
		case 38 :
			player.velocity.y -= 1;
			break; 
		case 40 :
			player.velocity.y += 1;
			break; 
		case 37 :
			player.velocity.x -= 1;
			break; 
		case 39 :
			player.velocity.x += 1;
			break; 
		//ASWD Controls
		case 65 :
			player.velocity.y -= 1;
			break; 
		case 83 :
			player.velocity.y += 1;
			break; 
		case 87 :
			player.velocity.x -= 1;
			break; 
		case 68 :
			player.velocity.x += 1;
      			break;
     			//ZQSD Controls
    		case 90 :
			player.velocity.y -= 1;
      			break;
    		case 81 :
			player.velocity.x -= 1;
		      break;
		}			
	})
