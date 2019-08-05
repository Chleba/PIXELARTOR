class ViewControls{
	constructor(rootElm, view3D){
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.view3D 			= view3D;
		this.inputs 			= [];
		this.lastValue 		= { x : 0, y : 0, z : 0 };
		this.inputCount 	= 0;
		this.cameraType 	= ENUMS.CAMERA_TYPE.orthographic;
		this.ortho = {
			rot : { x : 0, y : 0, z : 0 },
			pos : { x : 0, y : 0, z : .02 }
		};
		this.perspective = {
			rot : { x : 0, y : 0, z : 0 },
			pos : { x : 0, y : 0, z : 1 },
			fov : 75
		};

		this._makeDOM();
		this._link();
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Camera:'
		this.dom.rootElm.appendChild(this.dom.title);

		this.dom.tabOrtho = document.createElement('a');
		this.dom.tabOrtho.innerHTML = 'Orthogonal';
		this.dom.tabOrtho.className = 'cameraSwitch active';
		this.dom.tabOrtho.href = '#';
		this.dom.tabOrtho.id = 'orthographic';
		this.dom.tabOrtho.addEventListener('click', this._switchCamera.bind(this));
		this.dom.rootElm.appendChild(this.dom.tabOrtho);

		this.dom.tabProjective = document.createElement('a');
		this.dom.tabProjective.innerHTML = 'Projective';
		this.dom.tabProjective.className = 'cameraSwitch';
		this.dom.tabProjective.href = '#';
		this.dom.tabProjective.id = 'perspective';
		this.dom.tabProjective.addEventListener('click', this._switchCamera.bind(this));
		this.dom.rootElm.appendChild(this.dom.tabProjective);

		this.dom.orthoContainer = document.createElement('div');
		this.dom.orthoContainer.className = 'controlsContainer';
		this.dom.rootElm.appendChild(this.dom.orthoContainer);
		this.dom.projectiveContainer = document.createElement('div');
		this.dom.projectiveContainer.className = 'controlsContainer';
		this.dom.projectiveContainer.style.display = 'none';
		this.dom.rootElm.appendChild(this.dom.projectiveContainer);

		// ------------------------
		// -- ortho inputs
		var rotationX = this._makeRow('rot-x:', 'rotX', this.ortho.rot.x, 0, 360);
		this.dom.orthoContainer.appendChild(rotationX);

		var rotationY = this._makeRow('rot-y:', 'rotY', this.ortho.rot.y, 0, 360);
		this.dom.orthoContainer.appendChild(rotationY);

		var rotationZ = this._makeRow('rot-z:', 'rotZ', this.ortho.rot.z, 0, 360);
		this.dom.orthoContainer.appendChild(rotationZ);

		var posX = this._makeRow('pos-x:', 'posX', this.ortho.pos.x);
		this.dom.orthoContainer.appendChild(posX);

		var posY = this._makeRow('pos-y:', 'posY', this.ortho.pos.y);
		this.dom.orthoContainer.appendChild(posY);

		var posZ = this._makeRow('poz-z:', 'posZ', this.ortho.pos.z, -10, 10, 0.01);
		this.dom.orthoContainer.appendChild(posZ);

		// ------------------------
		// -- projective inputs
		var rotationX = this._makeRow('rot-x:', 'rotX', this.perspective.rot.x, 0, 360);
		this.dom.projectiveContainer.appendChild(rotationX);

		var rotationY = this._makeRow('rot-y:', 'rotY', this.perspective.rot.y, 0, 360);
		this.dom.projectiveContainer.appendChild(rotationY);

		var rotationZ = this._makeRow('rot-z:', 'rotZ', this.perspective.rot.z, 0, 360);
		this.dom.projectiveContainer.appendChild(rotationZ);

		var posX = this._makeRow('pos-x:', 'posX', this.perspective.pos.x);
		this.dom.projectiveContainer.appendChild(posX);

		var posY = this._makeRow('pos-y:', 'posY', this.perspective.pos.y);
		this.dom.projectiveContainer.appendChild(posY);

		var posZ = this._makeRow('pos-z:', 'posZ', this.perspective.pos.z, 0, 100, 0.01);
		this.dom.projectiveContainer.appendChild(posZ);

		var fov = this._makeRow('fov:', 'fov', this.perspective.fov, 1, 100, 1);
		this.dom.projectiveContainer.appendChild(fov);

		// -- free camera
		var freecamera = document.createElement('div');
		var label = document.createElement('label');
		label.className = 'lTitle';
		label.innerHTML = 'Free Camera';
		freecamera.appendChild(label);

		// -- free look
		var label = document.createElement('label');
		label.className = 'switch';
		this.dom.freeLookCheck = document.createElement('input');
		this.dom.freeLookCheck.type = 'checkbox';
		this.dom.freeLookCheck.name = 'freecamera';
		this.dom.freeLookCheck.id = 'freecamera';
		this.dom.freeLookCheck.checked = false;
		this.dom.freeLookCheck.value = 1;
		this.dom.freeLookCheck.addEventListener('change', this._freeCameraSwitch.bind(this));
		label.appendChild(this.dom.freeLookCheck);
		var span = document.createElement('span');
		span.className = 'slider';
		label.appendChild(span);
		freecamera.appendChild(label);

		// var label1 = document.createElement('label');
		// label1.className = 'switch';
		// // label1.setAttribute('for', 'freecamera');
		// var inputNumber 	= document.createElement('input');
		// inputNumber.type 	= 'checkbox';
		// inputNumber.name 	= 'freecamera';
		// inputNumber.value = 1;
		// inputNumber.addEventListener('input', this._freeCameraSwitch.bind(this));
		// label1.appendChild(inputNumber);
		// var span = document.createElement('span');
		// span.className = 'slider';
		// label1.appendChild(span);
		// freecamera.appendChild(label1);

		// -- camera speed
		var label = document.createElement('label');
		label.className = 'lTitle';
		label.innerHTML = 'camera speed:';
		freecamera.appendChild(label);

		var inputNumber 	= document.createElement('input');
		inputNumber.type 	= 'number';
		inputNumber.name 	= 'cameraspeed';
		inputNumber.value = 1.0;
		inputNumber.addEventListener('input', this._changeCameraSpeed.bind(this));
		freecamera.appendChild(inputNumber);

		this.dom.projectiveContainer.appendChild(freecamera);
	}

	_freeCameraSwitch(e){
		var checkbox = e.target;
		console.log('_freeCameraSwitch', checkbox)
		GAME.signals.makeEvent('camera.free', window, { state : checkbox.checked });
	}

	_changeCameraSpeed(e){
		GAME.signals.makeEvent('camera.free.speed', window, { speed : e.target.value });
	}

	_makeRow(name, key, value, min, max, step){
		var min = arguments.length > 3 ? min : -500;
		var max = arguments.length > 4 ? max : 500;
		var step = step || 1;
		var div = document.createElement('div');
		div.className = 'row';

		var label = document.createElement('label');
		label.innerHTML = name;
		div.appendChild(label);

		var inputRange 		= document.createElement('input');
		inputRange.type 	= 'range';
		inputRange.name 	= key;
		inputRange.min 		= min;
		inputRange.max 		= max;
		inputRange.step 	= step;
		inputRange.value 	= value;
		inputRange.dataset.name = 'input-'+this.inputCount;
		inputRange.addEventListener('input', this._input.bind(this));
		inputRange.addEventListener('mousewheel', this._wheelInput.bind(this));
		div.appendChild(inputRange);

		var inputNumber 	= document.createElement('input');
		inputNumber.type 	= 'number';
		inputNumber.name 	= key;
		inputNumber.min 	= min;
		inputNumber.max 	= max;
		inputNumber.step 	= step;
		inputNumber.value = value;
		inputNumber.dataset.name = 'input-'+this.inputCount;
		inputNumber.addEventListener('input', this._input.bind(this));
		inputNumber.addEventListener('mousewheel', this._wheelInput.bind(this));
		div.appendChild(inputNumber);

		this.inputs.push(inputRange);
		this.inputs.push(inputNumber);

		// -- input counter
		this.inputCount++;

		return div;
	}

	_wheelInput(e){
		e.preventDefault();
		var delta = Math.sign(event.wheelDelta);
		var value = e.target.value * 1;
		var step = e.target.step;
		var newValue = value + (step * delta);
		e.target.value = newValue;
		this._input(e);
	}

	_switchCamera(e){
		e.preventDefault();
		this.cameraType = ENUMS.CAMERA_TYPE[e.target.id];
		if (this.cameraType == ENUMS.CAMERA_TYPE.orthographic) {
			this.dom.tabOrtho.className = 'cameraSwitch active';
			this.dom.tabProjective.className = 'cameraSwitch';
			this.dom.orthoContainer.style.display = 'block';
			this.dom.projectiveContainer.style.display = 'none';
		} else {
			this.dom.tabOrtho.className = 'cameraSwitch';
			this.dom.tabProjective.className = 'cameraSwitch active';
			this.dom.orthoContainer.style.display = 'none';
			this.dom.projectiveContainer.style.display = 'block';
		}
		GAME.signals.makeEvent('camera.switch', window, { type : this.cameraType });
		return false;
	}

	_input(e){
		var value = e.target.value * 1;
	
		// -- update camera
		switch(e.target.name){
			case 'posX':
				if (this.cameraType == ENUMS.CAMERA_TYPE.orthographic) {
					this.view3D.model.scene.position.x = value;
					this.ortho.pos.x = value;
				}
				if (this.cameraType == ENUMS.CAMERA_TYPE.perspective) {
					// this.view3D.model.scene.position.x = value;
					this.view3D.model.scene.position.x = value;
					this.perspective.pos.x = value;
				}
				break;
			case 'posY':
				if (this.cameraType == ENUMS.CAMERA_TYPE.orthographic) {
					this.view3D.model.scene.position.y = value;
					this.ortho.pos.y = value;
				}
				if (this.cameraType == ENUMS.CAMERA_TYPE.perspective) {
					this.view3D.model.scene.position.y = value;
					this.perspective.pos.y = value;
				}
				break;
			case 'posZ':
				if (this.cameraType == ENUMS.CAMERA_TYPE.orthographic) {
					this.view3D.camera.scale.set(value, value, 1);
					this.view3D.camera.updateProjectionMatrix();
					this.ortho.pos.z = value;
				}
				if (this.cameraType == ENUMS.CAMERA_TYPE.perspective) {
					this.view3D.camera.scale.set(value, value, 1);
					this.view3D.camera.updateProjectionMatrix();
					this.perspective.pos.z = value;
				}
				break;
			case 'rotX':
				if (this.cameraType == ENUMS.CAMERA_TYPE.orthographic) {
					console.log(this.view3D.model)
					this.view3D.model.scene.rotation.x = THREE.Math.degToRad(value);
					this.ortho.rot.x = value;
				}
				if (this.cameraType == ENUMS.CAMERA_TYPE.perspective) {
					this.view3D.model.scene.rotation.x = THREE.Math.degToRad(value);
					this.perspective.rot.x = value;
				}
				break;
			case 'rotY':
				if (this.cameraType == ENUMS.CAMERA_TYPE.orthographic) {
					this.view3D.model.scene.rotation.y = THREE.Math.degToRad(value);
					this.ortho.rot.y = value;
				}
				if (this.cameraType == ENUMS.CAMERA_TYPE.perspective) {
					this.view3D.model.scene.rotation.y = THREE.Math.degToRad(value);
					this.perspective.rot.y = value;
				}
				break;
			case 'rotZ':
				if (this.cameraType == ENUMS.CAMERA_TYPE.orthographic) {
					this.view3D.model.scene.rotation.z = THREE.Math.degToRad(value);
					this.ortho.rot.z = value;
				}
				if (this.cameraType == ENUMS.CAMERA_TYPE.perspective) {
					this.view3D.model.scene.rotation.z = THREE.Math.degToRad(value);
					this.perspective.rot.z = value;
				}
				break;
			case 'fov':
				if (this.cameraType == ENUMS.CAMERA_TYPE.perspective) {
					this.perspective.fov = value;
					this.view3D.camera.fov = value;
					this.view3D.camera.updateProjectionMatrix();
				}
				break;
		}
		// -- update same input values
		for(var i in this.inputs){
			var input = this.inputs[i];
			if(input.dataset.name == e.target.dataset.name){
				if(input.type == 'range' && e.target.type == 'number'){
					input.value = value;
					break;
				}
				if(input.type == 'number' && e.target.type == 'range'){
					input.value = value;
					break;
				}
			}
		}
	}

	cameraChange(e){
		var camera = e.data.camera;

		var pos = camera.object.position;
		var rot = { x : THREE.Math.radToDeg(camera.getPolarAngle()), y : THREE.Math.radToDeg(camera.getAzimuthalAngle()) };

		// -- update inputs

	}

	_link(){
		// GAME.signals.addListener(this, 'camera.change', this.cameraChange.bind(this));
		// GAME.signals.addListener(this, 'camera.change', this.cameraChange.bind(this));
		// GAME.signals.addListener(this, 'controls.done', this._bindControls.bind(this));
	}
};