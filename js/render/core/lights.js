class Lights {
	constructor(scene){
		this.scene 	= scene;
		this.lights = {};

		this._premadeLights();
		this._link();
	}

	_premadeLights(){
		// -- hemisphere light
		this.lights.hemi = this._makeHemiLight();
		this.scene.add(this.lights.hemi);

		// -- point light
		this.lights.point = this._makePointLight();
		this.scene.add(this.lights.point);

		// -- point light
		this.lights.direct = this._makeDirectLight();
		this.scene.add(this.lights.direct);
	}

	// -- hemisphere light
	_makeHemiLight(){
		var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
		hemiLight.color.setHSL( 0.6, 1, 0.6 );
		hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
		hemiLight.position.set( 0, 50, 0 );
		hemiLight.visible = false;
		return hemiLight;
	}
	_changeHemi(e){
		var state = e.data.state;
		this.lights.hemi.visible 			= state;
		this.lights.hemi.color				= new THREE.Color(e.data.skyColor);
		this.lights.hemi.groundColor 	= new THREE.Color(e.data.groundColor);
	}

	// -- point light
	_makePointLight(){
		var pLight = new THREE.PointLight( 0xffffff, 1);
		pLight.position.set(0, 0, 0);
		pLight.castShadow = false;
		pLight.shadow.mapSize.width = 1024;
		pLight.shadow.mapSize.height = 1024;
		pLight.shadow.camera.near = 0.01;
		pLight.shadow.camera.far = 5000;
		pLight.visible = false;
		return pLight;
	}
	_changePoint(e){
		var state = e.data.state;
		var pos = { x : e.data.posX, y : e.data.posY, z : e.data.posZ };
		this.lights.point.visible = state;
		this.lights.point.castShadow = e.data.pointShadow;
		this.lights.point.position.set(pos.x, pos.y, pos.z);
		this.lights.point.color	= new THREE.Color(e.data.pointColor);
	}

	// -- direct light
	_makeDirectLight(){
		var dLight = new THREE.DirectionalLight( 0xffffff, 1.0);
		dLight.position.set(0, 0, 0);
		dLight.castShadow = false;
		// dLight.shadowCameraVisible = true;
		dLight.shadow.mapSize.width = 1024;
		dLight.shadow.mapSize.height = 1024;
		dLight.shadow.camera.near = 0.01;
		dLight.shadow.camera.far = 5000;

		var d = 50;
    dLight.shadow.camera.left = -d;
    dLight.shadow.camera.right = d;
    dLight.shadow.camera.top = d;
    dLight.shadow.camera.bottom = -d;

		dLight.visible = false;
		return dLight;
	}
	_changeDirect(e){
		var state = e.data.state;
		var pos = { x : e.data.posX, y : e.data.posY, z : e.data.posZ };
		this.lights.direct.visible = state;
		this.lights.direct.castShadow = e.data.directShadow;
		this.lights.direct.position.set(pos.x, pos.y, pos.z);
		this.lights.direct.color = new THREE.Color(e.data.directColor);
	}

	_link(){
		GAME.signals.addListener(this, 'light.hemi.change', this._changeHemi.bind(this));
		GAME.signals.addListener(this, 'light.point.change', this._changePoint.bind(this));
		GAME.signals.addListener(this, 'light.direct.change', this._changeDirect.bind(this));
	}
}