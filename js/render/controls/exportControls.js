
var {remote, ipcRenderer} 	= require('electron');
// var gifshot = require('gifshot')

class ExportControls {

	constructor(app, rootElm){
		this.app 					= app;
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.inputs 			= [];
		this.inputCount 	= 0;

		this.exportType = ENUMS.EXPORT_TYPE.frames;

		this._makeDOM();
		this._link();
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Export:'
		this.dom.rootElm.appendChild(this.dom.title);

		// ------------------------
		// -- lights
		this._makeInputs();
	}

	_makeInputs(){
		this.dom.exportContainer = document.createElement('div');
		this.dom.exportContainer.className = 'exportContainer';
		this.dom.rootElm.appendChild(this.dom.exportContainer);

		// -- radio buttons
		this.dom.radioDiv = document.createElement('div');
		this.dom.exportContainer.appendChild(this.dom.radioDiv);
		for(var i in ENUMS.EXPORT_TYPE){
			var d = document.createElement('div');
			d.className = 'radiobtn';

			var inp = document.createElement('input');
			inp.type = 'radio';
			inp.id = 'exportType_'+i;
			inp.name = 'exportType';
			inp.value = ENUMS.EXPORT_TYPE[i];
			inp.addEventListener('change', this._changeExportType.bind(this), false);
			d.appendChild(inp);
			if (ENUMS.EXPORT_TYPE[i] == ENUMS.EXPORT_TYPE.frames) { inp.setAttribute('checked', 'checked'); }

			var l = document.createElement('label');
			l.setAttribute('for', 'exportType_'+i);
			l.innerHTML = i;
			d.appendChild(l);

			this.dom.radioDiv.appendChild(d);
		}

		// -- export button
		this.dom.button = document.createElement('button');
		this.dom.button.className = 'glyphicon glyphicon-export'
		// this.dom.button.innerHTML = '<< EXPORT FILE >>';
		this.dom.button.addEventListener('click', this._export.bind(this), false);
		this.dom.exportContainer.appendChild(this.dom.button);
	}

	_changeExportType(e){
		this.exportType = e.target.value;
	}

	_exportGif(images){
		var gifImages = [];
		var canvas = document.createElement('canvas')
		canvas.width = CONFIG.finalSize.width, canvas.height = CONFIG.finalSize.height;
		var c = canvas.getContext('2d');
		for(var i=0;i<images.length;i++){
			c.fillStyle = '#fff';
			c.fillRect(0, 0, canvas.width, canvas.height);
			c.drawImage(images[i], 0, 0);

			var img = new Image();
			img.src = canvas.toDataURL();
			gifImages.push(img);
		}

		var gif = new GIF({
			workerScript 	: '../js/render/libs/gif.worker.js',
			repeat 				: 0,
			width 				: CONFIG.finalSize.width,
			height 				: CONFIG.finalSize.height
		});
		for(var i=0;i<gifImages.length;i++){
			gif.addFrame(gifImages[i], { delay : (1/CONFIG.fps) * 1000 });
		}
		gif.on('finished', function(blob){
			var fr = new FileReader();
			fr.readAsDataURL(blob);
			fr.onloadend = function(fr){
				var base64Data = fr.result;
				this.openSaveDialog(base64Data, {
					title : 'Save GIF',
					buttonLabel : 'Save',
					filters :[
		  			{ name: 'Images', extensions: ['gif'] }
		  		]
				});
			}.bind(this, fr);
		}.bind(this));
		gif.render();
	}

	_exportZip(images){
		var b64imgs = [];
		for(var i=0;i<images.length;i++){
			b64imgs.push(images[i].src);
		}
		this.openSaveDialog(b64imgs, {
			title : 'Save ZIP',
			buttonLabel : 'Save',
			filters :[
  			{name: 'Files', extensions: ['zip']}
  		]
		});
	}

	_export(e){
		GAME.signals.makeEvent('loadinger.show', window, null);
		var images = !!CONFIG.outline ? this.app.spriteRenderer.outlineImages : this.app.spriteRenderer.normalImages;
		if (this.exportType == ENUMS.EXPORT_TYPE.gif) {
			this._exportGif(images);
		} else if(this.exportType == ENUMS.EXPORT_TYPE.frames){
			this._exportZip(images);
		}
	}

	openSaveDialog(images, saveOptions){
		GAME.signals.makeEvent('loadinger.hide', window, null);
		dialog.showSaveDialog(remote.getCurrentWindow(), saveOptions).then(filename => {
			console.log(filename)
			if (filename !== undefined) {
				ipcRenderer.send('export-file', {
					images : images,
					type : this.exportType,
					file : filename.filePath
				})
			}
		});
	}

  decodeBase64Image(dataString) {
    var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    var response = {};
    if (matches.length !== 3){
      return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    return response;
  }

	_exportDone(){
		console.log(arguments, 'export done');
	}

	_link(){
		ipcRenderer.on('export-done', this._exportDone.bind(this));
	}
}
