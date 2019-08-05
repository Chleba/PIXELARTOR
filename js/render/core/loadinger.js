class Loadinger {
	constructor(rootElm){
		this.dom = {};
		this.dom.rootElm = rootElm;
		this.enabled = true;
		this.loadProgress = .0;
		this.bars = [];
		this.loadGIFs = [];

		this._makeGIFs();
		this._makeDOM();
		this._updateProgress();
		this._link();
		this.enable(false);
	}
	_makeGIFs(){
		for(var i=0;i<5;i++){ this.loadGIFs.push('../res/loading'+i+'.gif'); }
	}
	_makeDOM(){
		this.dom.overlay = document.createElement('div');
		this.dom.overlay.className = 'loadOverlay';
		this.dom.rootElm.appendChild(this.dom.overlay);

		this.dom.container = document.createElement('div');
		this.dom.container.className = 'loadContainer';
		this.dom.overlay.appendChild(this.dom.container);

		this.dom.title = document.createElement('label');
		this.dom.title.innerHTML = 'Loading..';
		this.dom.container.appendChild(this.dom.title);

		this._makeProgressBar();

		this.dom.loader = new Image();
		this.dom.loader.src = this.loadGIFs[Math.randRange(0, this.loadGIFs.length-1)];
		this.dom.container.appendChild(this.dom.loader);
	}
	_makeProgressBar(){
		this.dom.progressBar = document.createElement('div');
		this.dom.progressBar.className = 'progressBar';
		this.dom.container.appendChild(this.dom.progressBar);

		this.bars = [];
		for(var i=0;i<40;i++){
			var bar = document.createElement('span');
			bar.className = 'bar';
			this.dom.progressBar.appendChild(bar);
			bar.style.visibility = 'hidden';
			this.bars.push(bar);
		}
	}
	_updateProgress(){
		this.dom.progressBar.style.display = this.loadProgress > 0 ? 'block' : 'none';
		for(var i=0;i<this.bars.length;i++){
			var b = this.bars[i];
			var visible = (i/this.bars.length) >= this.loadProgress ? 'hidden' : 'visible';
			b.style.visibility = visible;
		}
	}
	enable(state){
		this.dom.overlay.style.display = !!state ? 'flex' : 'none';
		if (!!state) {
			this.loadProgress = 0.0;
			this._updateProgress();
		}
	}
	setProgress(p){
		this.loadProgress = p;
		this._updateProgress();
	}
	_showHide(e){ this.enable(e.data.state); }
	_progress(e){ this.setProgress(e.data.progress); }
	_link(){
		GAME.signals.addListener(this, 'loadinger.show', this._showHide.bind(this, { data : { state : true } }));
		GAME.signals.addListener(this, 'loadinger.hide', this._showHide.bind(this, { data : { state : false } }));
		GAME.signals.addListener(this, 'loadinger.progress', this._progress.bind(this));
	}
}