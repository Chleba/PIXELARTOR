class LightPointControls {

	constructor(rootElm){
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.inputCount 	= 0;
		this.inputs 			= [];
		this.opt 					= {
			pointColor 		: '#ffffff',
			// pos 					: { x : 0, y : 0, z : 0 },
			posX 					: 0,
			posY 					: 0,
			posZ 					: 0,
			pointShadow		: false,
			state 				: false
		};

		this._makeDOM();
		this._updateInputs();
		this._link();
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Point light:'
		this.dom.rootElm.appendChild(this.dom.title);

		// ------------------------
		// -- lights
		this._makePointLight();
	}

	_makePointLight(){
		this.dom.pointContainer = document.createElement('div');
		this.dom.pointContainer.className = 'pointContainer';
		this.dom.rootElm.appendChild(this.dom.pointContainer);

		// --
		var div = document.createElement('div');
		div.className = 'switcher';
		var label = document.createElement('label');
		label.className = 'switch';
		div.appendChild(label);
		this.dom.pointCheck = document.createElement('input');
		this.dom.pointCheck.type = 'checkbox';
		this.dom.pointCheck.name = 'pointLight';
		this.dom.pointCheck.id = 'pointLight';
		this.dom.pointCheck.checked = this.opt.state;
		this.dom.pointCheck.value = 1;
		this.dom.pointCheck.addEventListener('change', this.switchPointLight.bind(this));
		label.appendChild(this.dom.pointCheck);
		var span = document.createElement('span');
		span.className = 'slider';
		label.appendChild(span);
		this.dom.pointContainer.appendChild(div);

		// --
		var div = document.createElement('div');
		div.className = 'shadowRow';
		var label = document.createElement('label');
		label.innerHTML = 'Shadow:';
		div.appendChild(label);
		var label = document.createElement('label');
		label.className = 'switch';
		div.appendChild(label);
		this.dom.pointShadowCheck = document.createElement('input');
		this.dom.pointShadowCheck.type = 'checkbox';
		this.dom.pointShadowCheck.name = 'pointShadow';
		this.dom.pointShadowCheck.id = 'pointShadow';
		this.dom.pointShadowCheck.checked = this.opt.pointShadow;
		this.dom.pointShadowCheck.value = 1;
		this.dom.pointShadowCheck.addEventListener('change', this.switchPointShadow.bind(this));
		label.appendChild(this.dom.pointShadowCheck);
		var span = document.createElement('span');
		span.className = 'slider';
		label.appendChild(span);
		this.dom.pointContainer.appendChild(div);

		// --
		var div = document.createElement('div');
		var label = document.createElement('label');
		label.innerHTML = 'Color:';
		div.appendChild(label);
		var span = document.createElement('span');
		span.className = 'color';
		div.appendChild(span);
		this.dom.pointColor = document.createElement('input');
		this.dom.pointColor.type = 'text';
		this.dom.pointColor.value = this.opt.pointColor;
		this.dom.pointColor.name = 'pointColor';
		this.dom.pointColor.addEventListener('change', this._input.bind(this));
		span.appendChild(this.dom.pointColor);
		this.dom.pointContainer.appendChild(div);

		var posX = this._makeRow('pos-x:', 'posX', this.opt.posX, -500, 500, 0.1);
		this.dom.pointContainer.appendChild(posX);

		var posY = this._makeRow('pos-y:', 'posY', this.opt.posY, -500, 500, 0.1);
		this.dom.pointContainer.appendChild(posY);

		var posZ = this._makeRow('pos-z:', 'posZ', this.opt.posZ, -500, 500, 0.1);
		this.dom.pointContainer.appendChild(posZ);

		this.inputs.push(this.dom.pointColor);
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
		inputRange.dataset.name = 'inputPoint-'+this.inputCount;
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
		inputNumber.dataset.name = 'inputPoint-'+this.inputCount;
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

	_input(e){
		var value = e.target.value;
		switch(e.target.name){
			case 'color':
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
			this.opt[this.inputs[i].name] = this.inputs[i].value;
		}
		this.opt.state = this.dom.pointCheck.checked;
		this.opt.pointShadow = this.dom.pointShadowCheck.checked;

		GAME.signals.makeEvent('light.point.change', window, this.opt);
	}

	switchPointShadow(e){ this._updateInputs(); }
	switchPointLight(e){ this._updateInputs(); }

	_link(){ }
}
