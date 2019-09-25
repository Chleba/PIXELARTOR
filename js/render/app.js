const {dialog} = require('electron').remote;
const fs = require('fs');

class App {
	constructor() {
		this.dom = {};
		this.modules = [];
		this._startApp();
		this._link();
	}

	_startApp(){
		// -- sprite frame maker from loaded animation
		this.spriteRenderer = new SpriteframesRenderer(this);

		// -- make DOM & controls modules
		this._makeMAIN();
		this._makeLEFT();
		this._makeRIGHT();
	}

	_loadApp(){
		Hider.addNodes(this.hideNodes);
	}

	_makeLEFT(){
		this.hideNodes = [];
		let controls = [
			OpenFileControls,
			ExportControls,
			ViewControls,
			SizeControls,
			OutlineControls,
			GroundControls,
			LightHemiControls,
			LightDirectControls,
			LightPointControls
		];
		controls.forEach(cVal => {
			var d = document.createElement('div');
			d.className = cVal.name+' module'
			this.dom.leftContainer.appendChild(d);
			var c = new cVal(this, d);
			this.modules.push(c);

			this.hideNodes.push(d);
		});

		// Hider.addNodes(this.hideNodes);
	}

	_makeRIGHT(){
		let views = [
			View3D,
			AnimControls,
			Thumbnails,
			View2D
		];
		views.forEach(cVal => {
			var d = document.createElement('div');
			d.className = cVal.name
			this.dom.rightContainer.appendChild(d);
			var c = new cVal(this, d);
			this.modules.push(c);
		});
	}

	_makeMAIN() {
		// ----------------------------------------
		// -- main containers ROOT | LEFT | RIGHT
		this.dom.rootContainer						= document.createElement('div');
		this.dom.leftContainer						= document.createElement('div');
		this.dom.rightContainer						= document.createElement('div');

		this.dom.rootContainer.className 	= 'rootContainer';
		this.dom.leftContainer.className 	= 'leftContainer';
		this.dom.rightContainer.className = 'rightContainer';

		document.body.appendChild(this.dom.rootContainer);
		this.dom.rootContainer.appendChild(this.dom.leftContainer);
		this.dom.rootContainer.appendChild(this.dom.rightContainer);

		this.loadinger = new Loadinger(this.dom.rootContainer);
	}

	_windowResize(e) {
		this.view3D._sizeChange();
		this.view2D._sizeChange();
	}

	_link(){
		window.addEventListener('load', this._loadApp.bind(this));
		window.addEventListener('resize', this._windowResize.bind(this));
	}

}

window._app = new App();
