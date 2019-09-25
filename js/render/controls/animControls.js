class AnimControls {
	constructor(app, rootElm){
		this.app 					= app;
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.model 				= null;
		this.renderSize 	= { w : CONFIG.renderSize.width, h : CONFIG.renderSize.height };
		this.time 				= 0;
		this.timeThen 		= 0;
		this.playing 			= false;
		this.reqAnimFrame = null;

		// this._tick();
		this._link();
	}

	setAnimations(anims){

	}

	_modelLoaded(e){
		this.stopAnimation();
		var model = e.data.model;
		this.model = model;
		this._makeAnimControls();
		// this._makeSizeControls();
		this._makeGenerateControls();
	}

	_makeAnimControls(){
		if (!this.dom.animContainer) {
			// -- main container
			this.dom.animContainer = document.createElement('div');
			this.dom.animContainer.className = 'animControls';
			this.dom.rootElm.appendChild(this.dom.animContainer);

			// -- animations
			var label = document.createElement('div');
			label.innerHTML = 'animation:';
			this.dom.animContainer.appendChild(label);

			var selectContainer = document.createElement('div');
			selectContainer.className = 'animSelectContainer';
			this.dom.animContainer.appendChild(selectContainer);

			
			this.dom.select = document.createElement('select');
			this.dom.select.title = 'Select Animation';
			// var animations = this.model.animations;
			// for(var i in animations){
			// 	var option 				= document.createElement('option');
			// 	var name 					= animations[i].name || 'anim-'+i;
			// 	option.innerHTML 	= name;
			// 	option.value 			= i;
			// 	select.appendChild(option);
			// }
			this.dom.select.addEventListener('change', this._selectAnimChange.bind(this));
			selectContainer.appendChild(this.dom.select);

			// -- slider
			this.dom.rangeContainer = document.createElement('div');
			this.dom.rangeContainer.className = 'rangeContainer';
			this.dom.animContainer.appendChild(this.dom.rangeContainer);

			var label = document.createElement('label');
			label.innerHTML = 'loop';
			this.dom.animContainer.appendChild(label);

			this.dom.loop = document.createElement('input');
			this.dom.loop.type = 'checkbox';
			this.dom.loop.title = 'Loop';
			this.dom.animContainer.appendChild(this.dom.loop);

			// -- play button
			var pButton = document.createElement('button');
			// pButton.innerHTML = 'play';
			pButton.title = 'Play';
			pButton.className = 'glyphicon glyphicon-play';
			pButton.addEventListener('click', this.playAnimation.bind(this));
			this.dom.animContainer.appendChild(pButton);

			// -- stop button
			var sButton = document.createElement('button');
			// sButton.innerHTML = 'stop';
			sButton.title = 'Stop';
			sButton.className = 'glyphicon glyphicon-stop';
			sButton.addEventListener('click', this.stopAnimation.bind(this));
			this.dom.animContainer.appendChild(sButton);
		}
		// -- clear old animations select
		this.dom.select.innerHTML = '';
		// -- add animations of loaded model
		var animations = this.model.animations;
		for(var i in animations){
			var option 				= document.createElement('option');
			var name 					= animations[i].name || 'anim-'+i;
			option.innerHTML 	= name;
			option.value 			= i;
			this.dom.select.appendChild(option);
		}

		// -- 
		this._selectAnimChange({ target : this.dom.select });
	}

	_selectAnimChange(e){
		if(!this.model.animations){ return; }
		if(!this.model.animations.length){ return; }
		var select = e.target;
		GAME.signals.makeEvent('anim.select', window, { animIndex : select.value });
		var animation = this.model.animations[select.value];

		if(!this.dom.range){
			this.dom.range = document.createElement('input');
			this.dom.range.type = 'range';
			this.dom.range.title = 'Animation Slider';
			this.dom.range.addEventListener('input', this.animChange.bind(this));
			this.dom.rangeContainer.appendChild(this.dom.range);
		}
		this.dom.range.min 		= 0;
		this.dom.range.max 		= animation.duration;
		this.dom.range.step 	= 1/CONFIG.defaultFps;
		this.dom.range.value 	= 0;
	}

	// playAnimation(e){ GAME.signals.makeEvent('play.anim', window, { loop : this.dom.loop.checked }); }
	// stopAnimation(e){ GAME.signals.makeEvent('stop.anim', window, { }); }

	playAnimation(e){ this.playing = true; this.timeThen = Date.now(); this._tick(); }
	stopAnimation(e){ this.playing = false; window.cancelAnimationFrame(this.reqAnimFrame); }

	animChange(e){
		if (!('fake' in e)) { window.cancelAnimationFrame(this.reqAnimFrame); }
		var time = e.target.value * 1;
		GAME.signals.makeEvent('anim.change', window, { time : time, maxTime : e.target.max });
	}

	_makeSizeControls(){
		var div = document.createElement('div');
		div.className = 'sizeContainer';
		this.dom.rootElm.appendChild(div);

		var label = document.createElement('label');
		label.innerHTML = 'render size(w,h):';
		div.appendChild(label);

		this.dom.renderWidthInput = document.createElement('input');
		this.dom.renderWidthInput.type = 'number';
		this.dom.renderWidthInput.value = this.renderSize.w;
		div.appendChild(this.dom.renderWidthInput);

		this.dom.renderHeightInput = document.createElement('input');
		this.dom.renderHeightInput.type = 'number';
		this.dom.renderHeightInput.value = this.renderSize.h;
		div.appendChild(this.dom.renderHeightInput);
	}

	_makeGenerateControls(){
		if (!this.dom.generalDiv) {
			this.dom.generalDiv = document.createElement('div');
			this.dom.rootElm.appendChild(this.dom.generalDiv);

			this.dom.generateButton = document.createElement('button');
			// this.dom.generateButton.innerHTML = 'generate';
			this.dom.generateButton.title = 'Generate';
			this.dom.generateButton.className = 'glyphicon glyphicon-film';
			this.dom.generateButton.addEventListener('click', this.generateAnimation.bind(this));
			this.dom.generalDiv.appendChild(this.dom.generateButton);

			var label = document.createElement('label');
			label.innerHTML = 'fps:';
			this.dom.generalDiv.appendChild(label);

			this.dom.fps = document.createElement('input');
			this.dom.fps.type = 'number';
			this.dom.fps.value = CONFIG.defaultFps;
			this.dom.fps.addEventListener('input', this.fpsChange.bind(this));
			this.dom.generalDiv.appendChild(this.dom.fps);
		}
	}

	fpsChange(e){
		GAME.signals.makeEvent('fps.change', window, { fps : this.dom.fps.value });
	}

	generateAnimation(e){
		window.cancelAnimationFrame(this.reqAnimFrame);
		GAME.signals.makeEvent('generate.anim')
	}

	_tick(t1){
		var now = Date.now();
		var t = now - this.timeThen;
		t /= 1000;

		if (!!this.playing) {
			this.time = t || 0;
			if (this.time > this.dom.range.max) {
				if (this.dom.loop.checked) {
					this.time = this.time % this.dom.range.max;
				} else {
					this.playing = false;
					window.cancelAnimationFrame(this.reqAnimFrame);
				}
			}
			this.dom.range.value = this.time;
			this.animChange({fake : true, target : { value : this.time, max : this.dom.range.max }});
			if (!this.playing) { return; }
		}

		this.reqAnimFrame = window.requestAnimationFrame(this._tick.bind(this));
	}

	_link(){
		GAME.signals.addListener(this, 'model.loaded', this._modelLoaded.bind(this));
		// GAME.signals.addListener(this, 'model.loaded', this._modelLoaded.bind(this));
	}

}
