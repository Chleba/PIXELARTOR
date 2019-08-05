 class OutlineControls {

	constructor(rootElm){
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.inputs 			= [];
		this.renderSize 	= { width : CONFIG.renderSize.width, height : CONFIG.renderSize.height };
		this.finalSize 		= {	width : CONFIG.finalSize.width, height : CONFIG.finalSize.height };
		this.opt 					= {
			state : false,
			width : 1,
			color : '#ff0000'
		};

		this._makeDOM();
		this._updateInputs();
		this._link();
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Outline:'
		this.dom.rootElm.appendChild(this.dom.title);

		// ------------------------
		// -- lights
		this._makeOutlines();
	}

	_makeOutlines(){
		this.dom.outlineContainer = document.createElement('div');
		this.dom.outlineContainer.className = 'outlineContainer';
		this.dom.rootElm.appendChild(this.dom.outlineContainer);

		var div = document.createElement('div');
		div.className = 'switcher';
		var label = document.createElement('label');
		label.className = 'switch';
		div.appendChild(label);
		this.dom.outlineCheck = document.createElement('input');
		this.dom.outlineCheck.type = 'checkbox';
		this.dom.outlineCheck.name = 'outline';
		this.dom.outlineCheck.id = 'outline';
		this.dom.outlineCheck.checked = this.opt.state;
		this.dom.outlineCheck.value = 1;
		this.dom.outlineCheck.addEventListener('change', this.switchOutlines.bind(this));
		label.appendChild(this.dom.outlineCheck);
		var span = document.createElement('span');
		span.className = 'slider';
		label.appendChild(span);
		this.dom.outlineContainer.appendChild(div);

		var div = document.createElement('div');
		var label = document.createElement('label');
		label.innerHTML = 'Color:';
		div.appendChild(label);
		var span = document.createElement('span');
		span.className = 'color';
		div.appendChild(span);
		this.dom.color = document.createElement('input');
		this.dom.color.type = 'text';
		this.dom.color.value = this.opt.color;
		this.dom.color.name = 'color';
		this.dom.color.addEventListener('change', this._input.bind(this));
		span.appendChild(this.dom.color);
		this.dom.outlineContainer.appendChild(div);

		var div = document.createElement('div');
		var label = document.createElement('label');
		label.innerHTML = 'Width:';
		div.appendChild(label);
		this.dom.width = document.createElement('input');
		this.dom.width.type = 'number';
		this.dom.width.value = this.opt.width;
		this.dom.width.name = 'width';
		this.dom.width.addEventListener('change', this._input.bind(this));
		div.appendChild(this.dom.width);
		this.dom.outlineContainer.appendChild(div);

		this.inputs.push(this.dom.color);
		this.inputs.push(this.dom.width);
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
		this._updateInputs();
	}

	_updateInputs(){
		for(var i in this.inputs){
			if (this.inputs[i].type == 'color') {}
			var parent = this.inputs[i].parentNode;
			parent.style.background = this.inputs[i].value;
			this.opt[this.inputs[i].name] = this.inputs[i].value;
		}
		this.opt.state = this.dom.outlineCheck.checked;
		CONFIG.outline = this.dom.outlineCheck.checked;

		GAME.signals.makeEvent('outline.change', window, this.opt);
	}

	switchOutlines(e){ this._updateInputs(); }

	_link(){ }
}
