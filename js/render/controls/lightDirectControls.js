class LightDirectControls {

	constructor(rootElm){
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.inputCount 	= 0;
		this.inputs 			= [];
		this.opt 					= {
			directColor 		: '#ffffff',
			// pos 					: { x : 0, y : 0, z : 0 },
			posX 					: 0,
			posY 					: 0,
			posZ 					: 0,
			directShadow		: false,
			state 				: false
		};

		this._makeDOM();
		this._updateInputs();
		this._link();
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Direct light:'
		this.dom.rootElm.appendChild(this.dom.title);

		// ------------------------
		// -- lights
		this._makePointLight();
	}

	_makePointLight(){
		this.dom.directContainer = document.createElement('div');
		this.dom.directContainer.className = 'directContainer';
		this.dom.rootElm.appendChild(this.dom.directContainer);

		// --
		var div = document.createElement('div');
		div.className = 'switcher';
		var label = document.createElement('label');
		label.className = 'switch';
		div.appendChild(label);
		this.dom.directCheck = document.createElement('input');
		this.dom.directCheck.type = 'checkbox';
		this.dom.directCheck.name = 'pointLight';
		this.dom.directCheck.id = 'pointLight';
		this.dom.directCheck.checked = this.opt.state;
		this.dom.directCheck.value = 1;
		this.dom.directCheck.addEventListener('change', this.switchDirectLight.bind(this));
		label.appendChild(this.dom.directCheck);
		var span = document.createElement('span');
		span.className = 'slider';
		label.appendChild(span);
		this.dom.directContainer.appendChild(div);

		// --
		var div = document.createElement('div');
		div.className = 'shadowRow';
		var label = document.createElement('label');
		label.innerHTML = 'Shadow:';
		div.appendChild(label);
		var label = document.createElement('label');
		label.className = 'switch';
		div.appendChild(label);
		this.dom.directShadowCheck = document.createElement('input');
		this.dom.directShadowCheck.type = 'checkbox';
		this.dom.directShadowCheck.name = 'directShadow';
		this.dom.directShadowCheck.id = 'directShadow';
		this.dom.directShadowCheck.checked = this.opt.directShadow;
		this.dom.directShadowCheck.value = 1;
		this.dom.directShadowCheck.addEventListener('change', this.switchDirectShadow.bind(this));
		label.appendChild(this.dom.directShadowCheck);
		var span = document.createElement('span');
		span.className = 'slider';
		label.appendChild(span);
		this.dom.directContainer.appendChild(div);

		// --
		var div = document.createElement('div');
		var label = document.createElement('label');
		label.innerHTML = 'Color:';
		div.appendChild(label);
		var span = document.createElement('span');
		span.className = 'color';
		div.appendChild(span);
		this.dom.directColor = document.createElement('input');
		this.dom.directColor.type = 'text';
		this.dom.directColor.value = this.opt.directColor;
		this.dom.directColor.name = 'directColor';
		this.dom.directColor.addEventListener('change', this._input.bind(this));
		span.appendChild(this.dom.directColor);
		this.dom.directContainer.appendChild(div);

		var posX = this._makeRow('pos-x:', 'posX', this.opt.posX, -500, 500, 0.1);
		this.dom.directContainer.appendChild(posX);

		var posY = this._makeRow('pos-y:', 'posY', this.opt.posY, -500, 500, 0.1);
		this.dom.directContainer.appendChild(posY);

		var posZ = this._makeRow('pos-z:', 'posZ', this.opt.posZ, -500, 500, 0.1);
		this.dom.directContainer.appendChild(posZ);

		this.inputs.push(this.dom.directColor);
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
		inputRange.dataset.name = 'inputDirect-'+this.inputCount;
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
		inputNumber.dataset.name = 'inputDirect-'+this.inputCount;
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
			case 'directColor':
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
		this.opt.state = this.dom.directCheck.checked;
		this.opt.directShadow = this.dom.directShadowCheck.checked;

		GAME.signals.makeEvent('light.direct.change', window, this.opt);
	}

	switchDirectShadow(e){ this._updateInputs(); }
	switchDirectLight(e){ this._updateInputs(); }

	_link(){ }
}
