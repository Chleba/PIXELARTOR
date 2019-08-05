class GroundControls {

	constructor(rootElm, view3D){
		this.view3D 			= view3D;
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.inputs 			= [];
		this.groundMesh 	= null;
		this.inputCount 	= 0;
		this.geoUpdate 		= false;
		this.opt 					= {
			groundColor 	: '#ffffff',
			posX 					: 0,
			posY 					: 0,
			posZ 					: 0,
			width 				: 100,
			height 				: 100,
			state 				: false
		};

		this._makeDOM();
		this._makeGroundMesh();
		this._updateInputs();
		this._link();
	}

	_makeGroundMesh(){	
		var groundGeo = new THREE.PlaneBufferGeometry(this.opt.width, this.opt.height);
		var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0xffffff } );
		// groundMat.color.setHSL( 0.095, 1, 0.75 );
		// var groundMat = new THREE.MeshLambertMaterial( {color: 0xffffff, side: THREE.DoubleSide} );
		this.groundMesh = new THREE.Mesh( groundGeo, groundMat );
		this.groundMesh.receiveShadow = true;
		this.groundMesh.rotation.x = -Math.PI/2;
		this.groundMesh.visible = this.opt.state;
		this.view3D.scene.add(this.groundMesh);
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Ground:'
		this.dom.rootElm.appendChild(this.dom.title);

		// ------------------------
		// -- lights
		this._makeGroundInputs();
	}

	_makeGroundInputs(){
		this.dom.groundContainer = document.createElement('div');
		this.dom.groundContainer.className = 'groundContainer';
		this.dom.rootElm.appendChild(this.dom.groundContainer);

		// -- 
		var div = document.createElement('div');
		div.className = 'switcher';
		var label = document.createElement('label');
		label.className = 'switch';
		div.appendChild(label);
		this.dom.groundCheck = document.createElement('input');
		this.dom.groundCheck.type = 'checkbox';
		this.dom.groundCheck.name = 'groundState';
		this.dom.groundCheck.id = 'groundState';
		this.dom.groundCheck.checked = this.opt.state;
		this.dom.groundCheck.value = 1;
		this.dom.groundCheck.addEventListener('change', this.switchGround.bind(this));
		label.appendChild(this.dom.groundCheck);
		var span = document.createElement('span');
		span.className = 'slider';
		label.appendChild(span);
		this.dom.groundContainer.appendChild(div);

		// -- 
		var div = document.createElement('div');
		var label = document.createElement('label');
		label.innerHTML = 'Color:';
		div.appendChild(label);
		var span = document.createElement('span');
		span.className = 'color';
		div.appendChild(span);
		this.dom.groundColor = document.createElement('input');
		this.dom.groundColor.type = 'text';
		this.dom.groundColor.value = this.opt.groundColor;
		this.dom.groundColor.name = 'groundColor';
		this.dom.groundColor.addEventListener('change', this._input.bind(this));
		span.appendChild(this.dom.groundColor);
		this.dom.groundContainer.appendChild(div);

		// --
		this.inputs.push(this.dom.groundColor);

		var width = this._makeRow('width:', 'width', this.opt.width, 0, 1000, 1, false);
		this.dom.groundContainer.appendChild(width);

		var height = this._makeRow('height', 'height', this.opt.height, 0, 1000, 1, false);
		this.dom.groundContainer.appendChild(height);

		var posX = this._makeRow('pos-x:', 'posX', this.opt.posX, -500, 500, 0.1);
		this.dom.groundContainer.appendChild(posX);

		var posY = this._makeRow('pos-y:', 'posY', this.opt.posY, -500, 500, 0.1);
		this.dom.groundContainer.appendChild(posY);

		var posZ = this._makeRow('pos-z:', 'posZ', this.opt.posZ, -500, 500, 0.1);
		this.dom.groundContainer.appendChild(posZ);
	}

	_makeRow(name, key, value, min, max, step, range){
		var min = arguments.length > 3 ? min : -500;
		var max = arguments.length > 4 ? max : 500;
		var step = arguments.length == 5 ? step : 1;
		var range = range != undefined ? range : true;
		var div = document.createElement('div');
		div.className = 'row';

		var label = document.createElement('label');
		label.innerHTML = name;
		div.appendChild(label);

		if(!!range){
			var inputRange 		= document.createElement('input');
			inputRange.type 	= 'range';
			inputRange.name 	= key;
			inputRange.min 		= min;
			inputRange.max 		= max;
			inputRange.step 	= step;
			inputRange.value 	= value;
			inputRange.dataset.name = 'inputGround-'+this.inputCount;
			inputRange.addEventListener('input', this._input.bind(this));
			inputRange.addEventListener('mousewheel', this._wheelInput.bind(this));
			div.appendChild(inputRange);
			this.inputs.push(inputRange);
		}

		var inputNumber 	= document.createElement('input');
		inputNumber.type 	= 'number';
		inputNumber.name 	= key;
		inputNumber.min 	= min;
		inputNumber.max 	= max;
		inputNumber.step 	= step;
		inputNumber.value = value;
		inputNumber.dataset.name = 'inputGround-'+this.inputCount;
		inputNumber.addEventListener('input', this._input.bind(this));
		inputNumber.addEventListener('mousewheel', this._wheelInput.bind(this));
		div.appendChild(inputNumber);
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

	_input(e){
		var value = e.target.value;
		switch(e.target.name){
			case 'groundColor':
				var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(value);
				if (isOk) {
					var parent = e.target.parentNode;
					parent.style.background = e.target.value;
				} else {
					e.target.value = '#ffffff';
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

		this._updateInputs();
	}

	_updateInputs(){
		for(var i in this.inputs){
			var parent = this.inputs[i].parentNode;
			parent.style.background = this.inputs[i].value;
			// -- check for update geometry in mesh
			if ((this.inputs[i].name == 'width' || this.inputs[i].name == 'height') && this.inputs[i].value != this.inputs[i].name) { this.geoUpdate = true; }
			this.opt[this.inputs[i].name] = this.inputs[i].value;
		}
		this.opt.state = this.dom.groundCheck.checked;

		this._updateMesh();
	}

	_updateMesh(){
		if (!!this.geoUpdate) {
			this.view3D.scene.remove(this.groundMesh);
			this._makeGroundMesh();
			this.geoUpdate = false;
		}

		this.groundMesh.position.x 	= this.opt.posX;
		this.groundMesh.position.y 	= this.opt.posY;
		this.groundMesh.position.z 	= this.opt.posZ;
		this.groundMesh.visible 		= this.opt.state;
		this.groundMesh.material.color = new THREE.Color(this.opt.groundColor);
	}

	switchGround(e){ this._updateInputs(); }

	_link(){ }
}
