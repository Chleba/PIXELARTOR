class LightHemiControls {

	constructor(rootElm){
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.inputs 			= [];
		this.renderSize 	= { width : CONFIG.renderSize.width, height : CONFIG.renderSize.height };
		this.finalSize 		= {	width : CONFIG.finalSize.width, height : CONFIG.finalSize.height };
		this.opt 					= {
			skyColor 			: '#ffffbb',
			groundColor 	: '#080820',
			state 				: false
		};

		this._makeDOM();
		this._updateInputs();
		this._link();
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Hemisphere light:'
		this.dom.rootElm.appendChild(this.dom.title);

		// ------------------------
		// -- lights
		this._makeHemisphereLight();
	}

	_makeHemisphereLight(){
		this.dom.hemiContainer = document.createElement('div');
		this.dom.hemiContainer.className = 'hemiContainer';
		this.dom.rootElm.appendChild(this.dom.hemiContainer);

		var div = document.createElement('div');
		div.className = 'switcher';
		var label = document.createElement('label');
		label.className = 'switch';
		div.appendChild(label);
		this.dom.hemiCheck = document.createElement('input');
		this.dom.hemiCheck.type = 'checkbox';
		this.dom.hemiCheck.name = 'hemiLight';
		this.dom.hemiCheck.id = 'hemiLight';
		this.dom.hemiCheck.checked = this.opt.state;
		this.dom.hemiCheck.value = 1;
		this.dom.hemiCheck.addEventListener('change', this.switchHemiLight.bind(this));
		label.appendChild(this.dom.hemiCheck);
		var span = document.createElement('span');
		span.className = 'slider';
		label.appendChild(span);
		this.dom.hemiContainer.appendChild(div);

		var div = document.createElement('div');
		var label = document.createElement('label');
		label.innerHTML = 'Sky:';
		div.appendChild(label);
		var span = document.createElement('span');
		span.className = 'color';
		div.appendChild(span);
		this.dom.skyColor = document.createElement('input');
		this.dom.skyColor.type = 'text';
		this.dom.skyColor.value = this.opt.skyColor;
		this.dom.skyColor.name = 'skyColor';
		this.dom.skyColor.addEventListener('change', this._input.bind(this));
		span.appendChild(this.dom.skyColor);
		this.dom.hemiContainer.appendChild(div);

		var div = document.createElement('div');
		var label = document.createElement('label');
		label.innerHTML = 'Ground:';
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
		this.dom.hemiContainer.appendChild(div);

		this.inputs.push(this.dom.skyColor);
		this.inputs.push(this.dom.groundColor);
	}

	_input(e){
		var value = e.target.value;
		switch(e.target.name){
			case 'skyColor':
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
		this._updateInputs();
	}

	_updateInputs(){
		for(var i in this.inputs){
			var parent = this.inputs[i].parentNode;
			parent.style.background = this.inputs[i].value;
			this.opt[this.inputs[i].name] = this.inputs[i].value;
		}
		this.opt.state = this.dom.hemiCheck.checked;

		GAME.signals.makeEvent('light.hemi.change', window, this.opt);
	}

	switchHemiLight(e){ console.log('hemi light'); this._updateInputs(); }

	_link(){ }
}
