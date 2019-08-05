var SizeControls = function(rootElm){
	this.dom 					= {};
	this.dom.rootElm 	= rootElm;
	this.inputs 			= [];
	this.renderSize 	= { width : CONFIG.renderSize.width, height : CONFIG.renderSize.height };
	this.finalSize 		= {	width : CONFIG.finalSize.width, height : CONFIG.finalSize.height };
	this.scale 				= CONFIG.scale;
	this.inputCount 	= 0;

	this._makeDOM();
	this._link();
};

SizeControls.prototype = {

	_makeDOM : function(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Size:'
		this.dom.rootElm.appendChild(this.dom.title);

		this.dom.sizeContainer = document.createElement('div');
		this.dom.sizeContainer.className = 'sizeContainer';
		this.dom.rootElm.appendChild(this.dom.sizeContainer);

		// ------------------------
		// -- size inputs
		this.dom.width3d = this._makeRow('3D-width:', 'width3d', this.renderSize.width);
		this.dom.sizeContainer.appendChild(this.dom.width3d);

		this.dom.height3d = this._makeRow('3D-height:', 'height3d', this.renderSize.height);
		this.dom.sizeContainer.appendChild(this.dom.height3d);

		this.dom.scale = this._makeRow('scale:', 'scale', this.scale, 0.125, 0.1, 1.0, 'scale');
		this.dom.sizeContainer.appendChild(this.dom.scale);

		this.dom.width2d = this._makeRow('2D-width:', 'width2d', this.finalSize.width);
		this.dom.sizeContainer.appendChild(this.dom.width2d);

		this.dom.height2d = this._makeRow('2D-height:', 'height2d', this.finalSize.height);
		this.dom.sizeContainer.appendChild(this.dom.height2d);

		// -- disable 2d inputs
		this.dom.width2d.getElementsByTagName('INPUT')[0].disabled 	= true;
		this.dom.height2d.getElementsByTagName('INPUT')[0].disabled = true;
	},

	_makeRow : function(name, key, value, step, min, max, className){
		var className = className || null;
		var min = arguments.length > 3 ? min : null;
		var max = arguments.length > 4 ? max : null;
		var step = step || 1;
		var div = document.createElement('div');
		if (className != null) { div.className = className; }

		var label = document.createElement('label');
		label.innerHTML = name;
		div.appendChild(label);

		var inputNumber 	= document.createElement('input');
		inputNumber.type 	= 'number';
		inputNumber.name 	= key;
		if (min != null) { inputNumber.min = min; }
		if (max != null) { inputNumber.max = max; }
		inputNumber.step 	= step;
		inputNumber.value = value;
		inputNumber.dataset.name = 'input-'+this.inputCount;
		inputNumber.addEventListener('change', this._input.bind(this));
		inputNumber.addEventListener('mousewheel', this._wheelInput.bind(this));
		div.appendChild(inputNumber);

		this.inputs.push(inputNumber);

		// -- input counter
		this.inputCount++;

		return div;
	},

	_wheelInput : function(e){
		if (!!e.target.disabled) { return; }
		e.preventDefault();
		var delta = Math.sign(event.wheelDelta);
		var value = e.target.value * 1;
		var step = e.target.step;
		var newValue = value + (step * delta);
		if (newValue < e.target.min || newValue > e.target.max) { return; }
		e.target.value = newValue;
		this._input(e);
	},

	_input : function(e){
		var value = e.target.value * 1;
		if (!!e.target.disabled) { return; }
		// -- update camera
		switch(e.target.name){
			case 'width3d':
				this.renderSize.width = value;
				this.finalSize.width = Math.round(this.renderSize.width * this.scale);
				break;
			case 'height3d':
				this.renderSize.height = value;
				this.finalSize.height = Math.round(this.renderSize.height * this.scale);
				break;
			case 'width2d':
				this.finalSize.width = value;
				this.renderSize.width = Math.round(this.finalSize.width * (1 - this.scale));
				break;
			case 'height2d':
				this.finalSize.height = value;
				this.renderSize.height = Math.round(this.finalSize.height * (1 - this.scale));
				break;
			case 'scale':
				this.scale = value;
				for(var i in this.finalSize){
					this.finalSize[i] = this.renderSize[i] * this.scale;
				}
				break;
		}
		this._updateInputs();
	},

	_updateInputs : function(){
		this.dom.width3d.getElementsByTagName('INPUT')[0].value = this.renderSize.width;
		this.dom.width2d.getElementsByTagName('INPUT')[0].value = this.finalSize.width;
		this.dom.height3d.getElementsByTagName('INPUT')[0].value = this.renderSize.height;
		this.dom.height2d.getElementsByTagName('INPUT')[0].value = this.finalSize.height;
		this.dom.scale.getElementsByTagName('INPUT')[0].value = this.scale;

		CONFIG.renderSize = this.renderSize;
		CONFIG.finalSize 	= this.finalSize;

		GAME.signals.makeEvent('size.change', window, null);
		// GAME.signals.makeEvent('size.change', window, { renderSize : this.renderSize, finalSize : this.finalSize });
	},

	_link : function(){
		// GAME.signals.addListener(this, 'controls.done', this._bindControls.bind(this));
	},
};
