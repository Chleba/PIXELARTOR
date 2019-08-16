class View3D {

	constructor(rootElm){

		this.dom 			= {};
		this.dom.root = rootElm;

		this.camera 					= null;
		this.controls 				= null;
		this.scene 						= null;
		this.light  					= null;
		this.renderer 				= null;
		this.composer 				= null;
		this.envMap 					= null;
		this.mixer 						= null;
		this.model 						= null;
		this.animTime 				= 0;
		this.playAnim 				= false;
		this.previousAnimTime = 0;
		this.animIndex 				= 0;
		this.outlineMeshes 		= [];
		this.childs 					= [];

		this.clock 			= new THREE.Clock();

		this._makeDOM();
		this._makeCameras();
		this._makeScene();
		this._makeFreeCamera();
		this._makeLight();
		this._loadScene();
		this._makeRenderer();
		this._sizeChange();
		this._tick(0);
		this._link();
	}

	reset(){
		// this._makeCameras
	}

	_makeDOM(){
		this.dom.canvasContainer = document.createElement('div');
		this.dom.canvasContainer.className = 'canvasContainer3D';
		this.dom.root.appendChild(this.dom.canvasContainer);
		this.elmSize = {
			width : this.dom.canvasContainer.offsetHeight,
			height : this.dom.canvasContainer.offsetHeight
		};
	}

	_makeCameras(){
		// -- projective
		this.cameraProjective = new THREE.PerspectiveCamera(75, this.elmSize.width / this.elmSize.height, 0.25, 2200);
		// -- ortho
		this.cameraOrtho = new THREE.OrthographicCamera(this.elmSize.width / - 2, this.elmSize.width / 2, this.elmSize.width / 2, this.elmSize.width / - 2, -1000, 1000);
		// -- set active camera
		this.camera = this.cameraOrtho;

		GAME.signals.makeEvent('controls.done', window, { view3D : this });
	}

	_makeScene(){
		// -- enviro map
		// var path = 'res/cubes/Bridge2/';
		var path = '../res/cubes/skybox/';
		var format = '.jpg';
		this.envMap = new THREE.CubeTextureLoader().load( [
			// path + 'posx' + format, path + 'negx' + format,
			// path + 'posy' + format, path + 'negy' + format,
			// path + 'posz' + format, path + 'negz' + format
			path + 'px' + format, path + 'nx' + format,
			path + 'py' + format, path + 'ny' + format,
			path + 'pz' + format, path + 'nz' + format
		] );

		// -- scene
		this.scene = new THREE.Scene();

		// this.helper = new THREE.CameraHelper(this.cameraProjective);
		// this.scene.add(this.helper);

		// this.composer = new THREE.EffectComposer(this.renderer);
	}

	_makeFreeCamera(){
		// -- free camera
		this.freeControls = new FreeControls(this.cameraProjective);
		this.freeControls.enabled = false;
		this.scene.add(this.freeControls.getObject());

		this.clock = new THREE.Clock();
	}

	_makeLight(){ this.lights = new Lights(this.scene); }

	_makeRenderer(){
		// -- renderer
		this.renderer = new THREE.WebGLRenderer( { antialias: true, preserveDrawingBuffer: true, alpha : true } );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setSize( this.elmSize.width, this.elmSize.height );
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		// this.renderer.shadowMap.type = THREE.PCFShadowMap;
		this.renderer.gammaOutput = true;
		this.renderer.clear();
		this.dom.canvasContainer.appendChild( this.renderer.domElement );
	}

	_loadScene(){
		var scene = new THREE.Scene();

		var geometry = new THREE.BoxGeometry( 10, 10, 10 );
		var material = new THREE.MeshPhongMaterial( {color: 0xdddddd} );
		var cube = new THREE.Mesh( geometry, material );
		scene.add(cube);

		this.model = { scene : scene };
		this.scene.add(scene);

		this._modelLoaded();
	}

	_tick(t){
		// -- animator
		if (this.mixer != null && !!this.playAnim) { this.mixer.update(this.clock.getDelta()); }
		// -- renderer
		if (this.renderer != null) { this.renderer.render(this.scene, this.camera); }
		// -- freelook
		if(this.freeControls != null){ this.freeControls.update(this.clock.getDelta()); }

		requestAnimationFrame(this._tick.bind(this));
	}

	_modelLoaded(){
		GAME.signals.makeEvent('model.loaded', window, { model : this.model });
		GAME.signals.makeEvent('loadinger.hide', window, null);
	}

	stopAnimation(){
		this.playAnim = false;
		if (!!this.mixer) {
			this.animAction.stop();
			this.animAction.reset();
			this.animAction.play();
		}
	}

	animChange(e){
		this.playAnim = false;
		this.animTime = e.data.time * 1;
		this.animAction.time = this.animTime;
		this.mixer.update(0);
	}

	_selectAnimation(e){
		if (this.animAction) { this.animAction.stop(); }
		// if (!this.model.animations.length) { return; }

		this.animIndex = e.data.animIndex || 0;
		var animation = this.model.animations[this.animIndex];
		var action = this.mixer.clipAction(animation);
		action.play();
		this.animAction = action;

		this.animTime = 0;
		this.animAction.time = this.animTime;
		this.mixer.update(0);
	}

	cameraSwitch(e){
		var cameraType = e.data.type;
		this.camera = cameraType == ENUMS.CAMERA_TYPE.orthographic ? this.cameraOrtho : this.cameraProjective;
	}

	updateCameras(){
		this.cameraProjective.aspect = this.elmSize.width / this.elmSize.height;
		this.cameraProjective.updateProjectionMatrix();

		this.cameraOrtho.left = this.elmSize.width / - 2;
		this.cameraOrtho.right = this.elmSize.width / 2;
		this.cameraOrtho.top = this.elmSize.height / 2;
		this.cameraOrtho.bottom = this.elmSize.height / - 2;
		this.cameraOrtho.updateProjectionMatrix();
	}

	_sizeChange(e){
		// var renderSize = e.data.renderSize;
		var renderSize = CONFIG.renderSize;
		var cs = { width : this.dom.canvasContainer.offsetWidth, height : this.dom.canvasContainer.offsetHeight };
		var p, w, h;

		if (renderSize.height > cs.height) {
			p = cs.height / renderSize.height;
			w = renderSize.width * p;
			h = renderSize.height * p;
		} else {
			if (renderSize.width > cs.width) {
				p = cs.width / renderSize.width;
				w = renderSize.width * p;
				h = renderSize.height * p;
			} else {
				p = cs.height / renderSize.height;
				w = renderSize.width * p;
				h = renderSize.height * p;
			}
		}
		this.elmSize.width 	= w;
		this.elmSize.height = h;
		this.renderer.setSize(this.elmSize.width, this.elmSize.height);

		this.updateCameras();
	}

	_outlineChange(e){ }

	_outlineColor(e){  }

	freeCamera(e){
		if (!this.dom.blocker) {
			this.dom.blocker = document.createElement('div');
			this.dom.blocker.id = 'blocker';
			this.dom.instructions = document.createElement('div');
			this.dom.instructions.id = 'instructions';
			this.dom.instructions.innerHTML = '<span style="font-size:30px">click to move</span><br />(W, S, A, D, SPACE, SHIFT, MOUSE)';
			this.dom.blocker.appendChild(this.dom.instructions);
			this.dom.blocker.style.display = 'none';
			this.dom.root.appendChild(this.dom.blocker);
			this.dom.instructions.addEventListener('click', this.startPointerLock.bind(this), false);
			window.addEventListener('keydown', this.keyDownHandle.bind(this), false);
		}
		var state = e.data.state;
		this.dom.blocker.style.display = !!state ? 'block' : 'none';
	}

	pointerLockChange(e){
		if ( document.pointerLockElement === document.body || document.mozPointerLockElement === document.body || document.webkitPointerLockElement === document.body ) {
				this.freeControls.enabled = true;
				this.dom.blocker.style.display = 'none';
		} else {
			this.freeControls.enabled = false;
			this.dom.blocker.style.display = 'block';
			this.dom.instructions.style.display = '';
		}
	}
	pointerLockError(e){ console.log('ERROR', e); }
	startPointerLock(e){
		this.dom.instructions.style.display = 'none';
		document.body.requestPointerLock = document.body.requestPointerLock || document.body.mozRequestPointerLock || document.body.webkitRequestPointerLock;
		document.body.requestPointerLock();
	}
	endPointerLock(){
		document.exitPointerLock = document.exitPointerLock || document.mozexitPointerLock || document.webkitexitPointerLock;
		document.exitPointerLock();
	}

	// -- hack for electron point lock event
	keyDownHandle(e){
		if (e.keyCode == 27) { this.endPointerLock(); }
	}

	uploadedFile(e){
		// -- remove old model
		this.scene.remove(this.model.scene);
		this.model = null;
		this.mixer = null;

		// -- loadinger
		GAME.signals.makeEvent('loadinger.show', window, null);

		// -- load file
		var file = e.data.file;
		var path = e.data.path;
		var fName = e.data.name

		var loader = new ModelLoader()
		loader.load(file, path, fName, function(model){
			var scene = 'scene' in model ? model.scene : model
			scene.traverse( function ( child ) {
				if ( child.isMesh ) {
					child.castShadow 			= true;
					child.receiveShadow 	= true;
				}
			}.bind(this));
			// -- ANIMATIONS
			var animations = model.animations;
			if ( animations && animations.length ) {
				this.mixer = new THREE.AnimationMixer( scene );
			}

			// -- add to the scene
			this.scene.add( scene );
			this.model = model;

			this._modelLoaded();
		}.bind(this))
	}

	_link(){
		GAME.signals.addListener(this, 'anim.select', this._selectAnimation.bind(this));
		GAME.signals.addListener(this, 'anim.change', this.animChange.bind(this));
		GAME.signals.addListener(this, 'camera.switch', this.cameraSwitch.bind(this));
		GAME.signals.addListener(this, 'size.change', this._sizeChange.bind(this));
		GAME.signals.addListener(this, 'outline.change', this._outlineChange.bind(this));
		GAME.signals.addListener(this, 'outline.color', this._outlineColor.bind(this));
		GAME.signals.addListener(this, 'camera.free', this.freeCamera.bind(this));
		GAME.signals.addListener(this, 'file3d.loaded', this.uploadedFile.bind(this));

		document.addEventListener('pointerlockchange', this.pointerLockChange.bind(this), false);
		document.addEventListener('pointerlockerror', this.pointerLockError.bind(this), false);
	}
}
