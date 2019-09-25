class ViewControls{
	constructor(app, rootElm){
		this.app 					= app;
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.view3D 			= null;
		this.inputs 			= [];
		this.lastValue 		= { x : 0, y : 0, z : 0 };
		this.inputCount 	= 0;
		this.cameraType 	= ENUMS.CAMERA_TYPE.orthographic;
		this.ortho = {
			rot : { x : 0, y : 0, z : 0 },
			pos : { x : 0, y : 0, z : 1 }
		};
		this.perspective = {
			rot : { x : 0, y : 0, z : 0 },
			pos : { x : 0, y : 0, z : 1 },
			fov : 75,
			free : false,
			speed : 10
		};
		this.cInputs = {};
		this.cInputs[ENUMS.CAMERA_TYPE.orthographic] = {}
		this.cInputs[ENUMS.CAMERA_TYPE.perspective] = {}

		this._makeDOM();
		this._link();
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Camera:'
		this.dom.rootElm.appendChild(this.dom.title);

		var div = document.createElement('div');
		this.dom.rootElm.appendChild(div);

		this.dom.tabOrtho = document.createElement('a');
		this.dom.tabOrtho.innerHTML = 'Orthogonal';
		this.dom.tabOrtho.className = 'cameraSwitch active';
		this.dom.tabOrtho.href = '#';
		this.dom.tabOrtho.id = 'orthographic';
		this.dom.tabOrtho.addEventListener('click', this._switchCamera.bind(this));
		div.appendChild(this.dom.tabOrtho);

		this.dom.tabProjective = document.createElement('a');
		this.dom.tabProjective.innerHTML = 'Projective';
		this.dom.tabProjective.className = 'cameraSwitch';
		this.dom.tabProjective.href = '#';
		this.dom.tabProjective.id = 'perspective';
		this.dom.tabProjective.addEventListener('click', this._switchCamera.bind(this));
		div.appendChild(this.dom.tabProjective);

		this.dom.orthoContainer = document.createElement('div');
		this.dom.orthoContainer.className = 'controlsContainer';
		div.appendChild(this.dom.orthoContainer);
		this.dom.projectiveContainer = document.createElement('div');
		this.dom.projectiveContainer.className = 'controlsContainer';
		this.dom.projectiveContainer.style.display = 'none';
		div.appendChild(this.dom.projectiveContainer);

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

		var posZ = this._makeRow('zoom:', 'posZ', this.ortho.pos.z, 0.1, 100, 0.05);
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

		var posZ = this._makeRow('pos-z:', 'posZ', this.perspective.pos.z);
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

		// -- camera speed
		var label = document.createElement('label');
		label.className = 'lTitle';
		label.innerHTML = 'camera speed:';
		freecamera.appendChild(label);

		var inputNumber 	= document.createElement('input');
		inputNumber.type 	= 'number';
		inputNumber.name 	= 'cameraspeed';
		inputNumber.value = this.perspective.speed;
		inputNumber.addEventListener('input', this._changeCameraSpeed.bind(this));
		freecamera.appendChild(inputNumber);

		this.dom.projectiveContainer.appendChild(freecamera);
	}

	_freeCameraSwitch(e){
		var ch = 'data' in e ? e.data.checked : e.target.checked;
		GAME.signals.makeEvent('camera.free', window, { state : ch });
	}

	_changeCameraSpeed(e){
		this.perspective.speed = e.target.value
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
			
			this.dom.freeLookCheck.checked = false;
			this._freeCameraSwitch({data:{checked : false}});
		} else {
			this.dom.tabOrtho.className = 'cameraSwitch';
			this.dom.tabProjective.className = 'cameraSwitch active';
			this.dom.orthoContainer.style.display = 'none';
			this.dom.projectiveContainer.style.display = 'block';
		}
		GAME.signals.makeEvent('camera.switch', window, { type : this.cameraType });
		return false;
	}

	_input(e, cameraUpdate){
		var cameraUpdate = cameraUpdate || true;
		var value = e.target.value * 1;
		var scene = 'scene' in this.view3D.model ? this.view3D.model.scene : this.view3D.model
		
		var CO = {};
		CO[ENUMS.CAMERA_TYPE.orthographic] = { camera : this.view3D.cameraOrtho, obj : this.ortho };
		CO[ENUMS.CAMERA_TYPE.perspective] = { camera : this.view3D.freeControls, obj : this.perspective };
		var C = CO[this.cameraType];
		// -- update camera
		switch(e.target.name){
			case 'posX':
				C.obj.pos.x = value
				break;
			case 'posY':
				C.obj.pos.y = value
				break;
			case 'posZ':
				C.obj.pos.z = value
				break;
			case 'rotX':
				C.obj.rot.x = value
				break;
			case 'rotY':
				C.obj.rot.y = value
				break;
			case 'rotZ':
				C.obj.rot.z = value
				break;
			case 'fov':
				C.obj.fov = value
				break;
		}
		if (!!cameraUpdate) {
			var p = C.obj.pos;
			var r = C.obj.rot;
			if (this.cameraType == ENUMS.CAMERA_TYPE.orthographic) {
				C.camera.position.x = p.x;
				C.camera.position.y = p.y;
				C.camera.zoom = p.z;

				C.camera.rotation.x = THREE.Math.degToRad(r.x);
				C.camera.rotation.y = THREE.Math.degToRad(r.y);
				C.camera.rotation.z = THREE.Math.degToRad(r.z);
				C.camera.updateProjectionMatrix()
			} else { // -- PROJECTIVE

				C.camera.setPosition(p);
				C.camera.setRotation({x:THREE.Math.degToRad(r.x), y:THREE.Math.degToRad(r.y)});
			}
			// C.camera.updateProjectionMatrix()
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

	cameraUpdate(e){
		let pos = e.data.pos;
		let rot = e.data.rot;
		this.perspective.pos = pos;
		this.perspective.rot.x = rot.x;
		this.perspective.rot.y = rot.y;

		var inputs = this.dom.projectiveContainer.getElementsByTagName('INPUT');
		for(var i=0;i<inputs.length;i++){
			var input = inputs[i];
			switch(input.name){
				case 'posX':
					input.value = this.perspective.pos.x;
					break;
				case 'posY':
					input.value = this.perspective.pos.y;
					break;
				case 'posZ':
					input.value = this.perspective.pos.z;
					break;
				case 'rotX':
					input.value = THREE.Math.radToDeg(this.perspective.rot.x);
					break;
				case 'rotY':
					input.value = THREE.Math.radToDeg(this.perspective.rot.y);
					break;
			}
		}
	}

	view3DInit(e){ this.view3D = e.data.view3D; }

	_link(){
		GAME.signals.addListener(this, 'view3D.init', this.view3DInit.bind(this));
		GAME.signals.addListener(this, 'camera.update', this.cameraUpdate.bind(this));
	}
};
