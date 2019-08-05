
const {dialog} = require('electron').remote;
const fs = require('fs');

class App {
	constructor() {
		this.dom = {};
		this._link();
	}

	_startApp(){
		this.spriteRenderer = new SpriteframesRenderer(this);
		this._makeDOM();
		this._makeModules();
	}

	_makeDOM() {
		// // --------------------
		// // -- main containers
		this.dom.rootContainer						= document.createElement('div');
		this.dom.leftContainer						= document.createElement('div');
		this.dom.rightContainer						= document.createElement('div');

		this.dom.rootContainer.className 	= 'rootContainer';
		this.dom.leftContainer.className 	= 'leftContainer';
		this.dom.rightContainer.className = 'rightContainer';

		document.body.appendChild(this.dom.rootContainer);
		this.dom.rootContainer.appendChild(this.dom.leftContainer);
		this.dom.rootContainer.appendChild(this.dom.rightContainer);

		// --------------------
		// -- left
		this.dom.viewControlsContainer 			= document.createElement('div');
		this.dom.sizeControlsContainer 			= document.createElement('div');
		this.dom.groundControlsContainer 		= document.createElement('div');
		this.dom.hemiControlsContainer 			= document.createElement('div');
		this.dom.pointControlsContainer 		= document.createElement('div');
		this.dom.directControlsContainer 		= document.createElement('div');
		this.dom.openFileControlsContainer	= document.createElement('div');
		this.dom.exportControlsContainer		= document.createElement('div');
		this.dom.outlineControlsContainer 	= document.createElement('div');

		this.dom.viewControlsContainer.className 			= 'viewControlsContainer module';
		this.dom.sizeControlsContainer.className 			= 'sizeControlsContainer module';
		this.dom.groundControlsContainer.className 		= 'groundControlsContainer module';
		this.dom.hemiControlsContainer.className 			= 'hemiControlsContainer module';
		this.dom.directControlsContainer.className 		= 'directControlsContainer module';
		this.dom.pointControlsContainer.className 		= 'pointControlsContainer module';
		this.dom.openFileControlsContainer.className 	= 'openFileControlsContainer module';
		this.dom.exportControlsContainer.className 		= 'exportControlsContainer module';
		this.dom.outlineControlsContainer.className 	= 'outlineControlsContainer module';

		this.dom.leftContainer.appendChild(this.dom.openFileControlsContainer);
		this.dom.leftContainer.appendChild(this.dom.exportControlsContainer);
		this.dom.leftContainer.appendChild(this.dom.viewControlsContainer);
		this.dom.leftContainer.appendChild(this.dom.sizeControlsContainer);
		this.dom.leftContainer.appendChild(this.dom.outlineControlsContainer);
		this.dom.leftContainer.appendChild(this.dom.groundControlsContainer);
		this.dom.leftContainer.appendChild(this.dom.hemiControlsContainer);
		this.dom.leftContainer.appendChild(this.dom.directControlsContainer);
		this.dom.leftContainer.appendChild(this.dom.pointControlsContainer);

		// --------------------
		// -- right
		this.dom.view3DContainer 				= document.createElement('div');
		this.dom.animControlsContainer 	= document.createElement('div');
		this.dom.thumbnails 						= document.createElement('div');
		this.dom.view2DContainer				= document.createElement('div');

		this.dom.view2DContainer.className				= 'view2DContainer';
		this.dom.view3DContainer.className				= 'view3DContainer';
		this.dom.animControlsContainer.className 	= 'animControlsContainer';
		this.dom.thumbnails.className							= 'thumbnails';

		this.dom.rightContainer.appendChild(this.dom.view3DContainer);
		this.dom.rightContainer.appendChild(this.dom.animControlsContainer);
		this.dom.rightContainer.appendChild(this.dom.thumbnails);
		this.dom.rightContainer.appendChild(this.dom.view2DContainer);
	}

	_makeModules() {
		this.loadinger 			 = new Loadinger(this.dom.rootContainer);
		this.animControls 	 = new AnimControls(this.dom.animControlsContainer);
		this.sizeControls 	 = new SizeControls(this.dom.sizeControlsContainer);
		this.view3D 				 = new View3D(this.dom.view3DContainer);
		this.viewControls 	 = new ViewControls(this.dom.viewControlsContainer, this.view3D);
		this.groundControls  = new GroundControls(this.dom.groundControlsContainer, this.view3D);
		this.outlineControls = new OutlineControls(this.dom.outlineControlsContainer);
		this.hemiControls 	 = new LightHemiControls(this.dom.hemiControlsContainer);
		this.pointControls 	 = new LightPointControls(this.dom.pointControlsContainer);
		this.directControls  = new LightDirectControls(this.dom.directControlsContainer);
		this.openFile 			 = new OpenFileControls(this.dom.openFileControlsContainer);
		this.exportFile			 = new ExportControls(this, this.dom.exportControlsContainer);
		this.view2D 				 = new View2D(this.dom.view2DContainer);
		this.thumbnails 		 = new Thumbnails(this.dom.thumbnails);

		// -- file loader
		// this.fileLoader 		= new FileLoader(this.dom.rightContainer);
	}

	_windowResize(e) {
		this.view3D._sizeChange();
		this.view2D._sizeChange();
		// GAME.signals.makeEvent('window.resize', window, {});
	}

	_link(){
		window.addEventListener('load', this._startApp.bind(this));
		window.addEventListener('resize', this._windowResize.bind(this));
	}

}

window._app = new App();
