class View2D {
	constructor(rootElm){
		this.dom = {};
		this.dom.rootElm = rootElm;
		this.animTime = 0;
		this.images = [];
		this.imagesData = { outline : [], normal : [] };
		this.outline = false;

		this._makeDOM();
		this._sizeChange();
		this._link();
	}

	_makeDOM(){
		this.dom.canvasContainer = document.createElement('div');
		this.dom.canvasContainer.className = 'canvasContainer2D';
		this.dom.rootElm.appendChild(this.dom.canvasContainer);

		this.dom.canvas = document.createElement('canvas');
		this.dom.canvasContainer.appendChild(this.dom.canvas);
		this.dom.canvas.width = this.dom.canvasContainer.offsetHeight;
		this.dom.canvas.height = this.dom.canvasContainer.offsetHeight;
		// -- make canvas
		this.canvas = this.dom.canvas.getContext('2d');
		this.canvas.imageSmoothingEnabled = false;
	}

	_generateDone(e){
		this.imagesData = {
			outline : e.data.outline,
			normal : e.data.normal
		}
		this.images = !!this.outline ? this.imagesData.outline : this.imagesData.normal;
	}

	_showImage(e){
		var img = e.data.img;
		this.canvas.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		this.canvas.save();
		// this.canvas.fillStyle = 'red';
		// this.canvas.fillRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
		this.canvas.drawImage(img, 0, 0, CONFIG.finalSize.width, CONFIG.finalSize.height, 0, 0, this.dom.canvas.width, this.dom.canvas.offsetHeight);
		this.canvas.restore();
	}

	animChange(e){
		if (this.images.length) {
			this.animTime = e.data.time * 1;
			var frame = Math.round((this.animTime / e.data.maxTime) * (this.images.length-1));
			if (frame > this.images.length) { return; }
			this._showImage({ data : { img : this.images[frame] } });
		}
	}

	_sizeChange(e){
		// var finalSize = e.data.finalSize;
		var finalSize = CONFIG.finalSize;
		var cs = { width : this.dom.canvasContainer.offsetWidth, height : this.dom.canvasContainer.offsetHeight };
		var p, w, h;

		p = cs.height / finalSize.height;
		w = finalSize.width * p;
		h = finalSize.height * p;

		this.dom.canvas.width = w;
		this.dom.canvas.height = h;
		this.canvas.imageSmoothingEnabled = false;
	}

	_animSelect(e){
		this.canvas.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
	}

	_outlineChange(e){
		this.outline = e.data.state || false;
		this.images = !!this.outline ? this.imagesData.outline : this.imagesData.normal;
	}

	_link(){
		GAME.signals.addListener(this, 'generate.anim.done', this._generateDone.bind(this));
		GAME.signals.addListener(this, 'outline.change', this._outlineChange.bind(this));
		GAME.signals.addListener(this, 'anim.change', this.animChange.bind(this));
		GAME.signals.addListener(this, 'show.frame', this._showImage.bind(this));
		GAME.signals.addListener(this, 'size.change', this._sizeChange.bind(this));
		GAME.signals.addListener(this, 'anim.select', this._animSelect.bind(this));
	}
}