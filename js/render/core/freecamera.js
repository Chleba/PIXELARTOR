class FreeControls {
	constructor(camera){
		this.camera = camera;
		this.camera.rotation.set(0, 0, 0);
		this.enabled = true;
		this.speed = 1.0;
		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(this.camera);
		this.pitchObject.rotation.x = 0;

		this.yawObject = new THREE.Object3D();
		this.yawObject.position.y = 0.0;
		this.yawObject.add(this.pitchObject);

		this.PI_2 = Math.PI / 2;

		this.velocity = new THREE.Vector3();
		this.keysPressed = {
			up 		: false,
			down 	: false,
			left 	: false,
			right : false
		};

		this.getDirection()
		this.link();
	}
	setPosition(pos){
		this.yawObject.position.x = pos.x;
		this.yawObject.position.y = pos.y;
		this.yawObject.position.z = pos.z;
	}
	setRotation(rot){
		this.yawObject.rotation.y = rot.x;
		this.pitchObject.rotation.x = rot.y;
	}
	getObject(){ return this.yawObject; }
	getDirection(){
		var direction = new THREE.Vector3( 0, 0, -1 );
		var rotation = new THREE.Euler( 0, 0, 0, 'YXZ' );
		return function ( v ) {
			rotation.set( this.pitchObject.rotation.x, this.yawObject.rotation.y, 0 );
			v.copy( direction ).applyEuler( rotation );
			return v;
		}.bind(this);
	}
	mouseMove(e){
		if (!this.enabled){ return; }

		var movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
		var movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

		this.yawObject.rotation.y -= movementX * 0.002;
		this.pitchObject.rotation.x -= movementY * 0.002;
		this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min( this.PI_2, this.pitchObject.rotation.x));

		// console.log(DEBUG)
		if(typeof DEBUG !== 'undefined'){ DEBUG.log('mouse rot x,y = '+this.yawObject.rotation.y +', '+ this.pitchObject.rotation.x); }
	}
	keyDown(e){
		switch(e.keyCode){
			case 38:
			case 87:
				this.keysPressed.up = true;
				break;
			case 37:
			case 65:
				this.keysPressed.left = true;
				break;
			case 40:
			case 83:
				this.keysPressed.down = true;
				break;
			case 39:
			case 68:
				this.keysPressed.right = true;
				break;
			case 32: this.keysPressed.space = true; break;
			case 16: this.keysPressed.shift = true; break;
		}
		if (this.keysPressed.up) { this.velocity.z = -this.speed; }
		if (this.keysPressed.down) { this.velocity.z = this.speed; }
		if (this.keysPressed.left) { this.velocity.x = -this.speed; }
		if (this.keysPressed.right) { this.velocity.x = this.speed; }
		if (this.keysPressed.space) { this.velocity.y = this.speed; }
		if (this.keysPressed.shift) { this.velocity.y = -this.speed; }
	}
	keyUp(e){
		switch(e.keyCode){
			case 38:
			case 87:
				this.keysPressed.up = false;
				break;
			case 37:
			case 65:
				this.keysPressed.left = false;
				break;
			case 40:
			case 83:
				this.keysPressed.down = false;
				break;
			case 39:
			case 68:
				this.keysPressed.right = false;
				break;
			case 32: this.keysPressed.space = false; break;
			case 16: this.keysPressed.shift = false; break;
		}
		if (!this.keysPressed.up && !this.keysPressed.down) { this.velocity.z = 0; }
		if (!this.keysPressed.down && !this.keysPressed.up) { this.velocity.z = 0; }
		if (!this.keysPressed.left && !this.keysPressed.right ) { this.velocity.x = 0; }
		if (!this.keysPressed.right && !this.keysPressed.left) { this.velocity.x = 0; }
		if (!this.keysPressed.space && !this.keysPressed.shift) { this.velocity.y = 0; }
		if (this.keysPressed.shift && !this.keysPressed.space) { this.velocity.y = 0; }
	}
	update(dt){
		if (!this.enabled) { return; }
		var vx = this.velocity.x * dt;
		var vy = this.velocity.y * dt;
		var vz = this.velocity.z * dt;

		this.yawObject.translateX(vx);
		this.yawObject.translateY(vy);
		this.yawObject.translateZ(vz);

		GAME.signals.makeEvent('camera.update', window, {
			pos : this.yawObject.position,
			rot : { x : this.yawObject.rotation.y, y : this.pitchObject.rotation.x }
			// rot : this.getDirection()(this)
		});
	}
	_changeSpeed(e){ this.speed = e.data.speed; }
	link(){
		window.addEventListener('mousemove', this.mouseMove.bind(this), false);
		window.addEventListener('keydown', this.keyDown.bind(this), false);
		window.addEventListener('keyup', this.keyUp.bind(this), false);

		GAME.signals.addListener(this, 'camera.free.speed', this._changeSpeed.bind(this));
	}
	unlink(){
		window.removeEventListener('mousemove', this.mouseMove.bind(this), false);
	}
}