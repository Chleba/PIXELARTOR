class Thumbnails {

	constructor(app, rootElm){
		this.app = app;
		this.dom = {};
		this.dom.rootElm = rootElm;
		this.images = {
			outline : [],
			normal : []
		};
		this.imgw = 32;
		this.outline = false;

		this._sizeChange();
		this._link();
	}

	_showImage(img, e){
		GAME.signals.makeEvent('show.frame', window, { img : img });
	}

	_generateDone(e){
		this.images = {
			normal : e.data.normal || [],
			outline : e.data.outline || []
		};
		this._makeImages();
	}

	_makeImages(){
		// -- clear before
		this.dom.rootElm.innerHTML = '';
		// -- sprite images
		// this.images = !!this.outline ? e.data.outlineImages : e.data.normalImages;

		var images = this.outline ? this.images.outline : this.images.normal;
		for(var i in images){
			var img = images[i];
			img.height = 32;
			img.width = this.imgw;
			this.dom.rootElm.appendChild(img);
			img.addEventListener('click', this._showImage.bind(this, img));
		}
	}

	animChange(e){
		var images = !!this.outline ? this.images.outline : this.images.normal;
		if (images.length) {
			this.animTime = e.data.time * 1;
			var frame = Math.round((this.animTime / e.data.maxTime) * (images.length-1));
			// -- set anim active img
			if (frame < images.length) {
				var img = images[frame];
				img.height = 32;
				img.width = this.imgw;
				for(var i in images){
					images[i].className = '';
				}
				img.className = 'active';
			}
		}
	}

	_sizeChange(e){
		// var finalSize = e.data.finalSize;
		var finalSize = CONFIG.finalSize;
		this.imgw = (32 / finalSize.height) * finalSize.width;
	}

	_animSelect(e){
		this.dom.rootElm.innerHTML = '';
		this.images = {
			outline : [],
			normal : []
		};
	}

	_outlineChange(e){
		this.outline = e.data.state;
		this._makeImages();
	}

	_link(){
		GAME.signals.addListener(this, 'generate.anim.done', this._generateDone.bind(this));
		GAME.signals.addListener(this, 'outline.change', this._outlineChange.bind(this));
		GAME.signals.addListener(this, 'anim.change', this.animChange.bind(this));
		GAME.signals.addListener(this, 'size.change', this._sizeChange.bind(this));
		GAME.signals.addListener(this, 'anim.select', this._animSelect.bind(this));
	}
};
