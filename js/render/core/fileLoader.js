const {dialog} = require('electron').remote;
const fs = require('fs');

class FileLoader {
	constructor(rootElm){
		this.dom = {};
		this.dom.rootElm = rootElm;

		this._makeDOM();
		this._link();
	}

	_makeDOM(){
		this.dom.uploadLink = document.createElement('label');
		this.dom.uploadLink.innerHTML = '<a href="#">open file >></a>';
		this.dom.uploadLink.classList.add('uploadLink');
		this.dom.uploadLink.addEventListener('click', this.openDialog.bind(this), false);
		this.dom.rootElm.appendChild(this.dom.uploadLink);
	}

	openDialog(e){ dialog.showOpenDialog({ properties: ['openFile'] }, this.handleOpenFile.bind(this)); }

	handleOpenFile(res){
		var file = res[0];
		var f = file.split('/');
		var path = '';
		for(var i=0;i<f.length-1;i++){
			path += f[i]+'/';
		}
		fs.readFile(file, (err, data) => {
			if(err){ console.log(err); }
			GAME.signals.makeEvent('file3d.loaded', window, { file : data, path : path });
		});
	}

	_link(){  }
}



// class FileLoader {
// 	constructor(rootElm){
// 		this.dom = {};
// 		this.dom.rootElm = rootElm;

// 		this._makeFileReader();
// 		this._makeDOM();
// 		this._link();
// 	}

// 	_makeFileReader(){
// 		this.fileReader = new FileReader();
// 		this.fileReader.onerror = this.errorHandler.bind(this);
// 		this.fileReader.onabort = this.abortHandler.bind(this);
// 		this.fileReader.onprogress = this.progressHandler.bind(this);
// 		this.fileReader.onload = this.loadHandler.bind(this);
// 		// this.fileReader.readAsDataURL(f);
// 	}

// 	_makeDOM(){
// 		this.dom.drop = document.createElement('div');
// 		this.dom.drop.className = 'fileDrop';
// 		this.dom.rootElm.appendChild(this.dom.drop);

// 		this.dom.label1 = document.createElement('label');
// 		this.dom.label1.innerHTML = 'DRAG & DROP FILE HERE';
// 		this.dom.drop.appendChild(this.dom.label1);

// 		this.dom.label2 = document.createElement('label');
// 		this.dom.label2.innerHTML = 'supported format: glTF';
// 		this.dom.label2.style.fontSize = '12px';
// 		this.dom.drop.appendChild(this.dom.label2);

// 		this.dom.progress = document.createElement('div');
// 		this.dom.progress.classList.add('progressBar');
// 		this.dom.progressBar = document.createElement('span');
// 		this.dom.drop.appendChild(this.dom.progress);
// 		this.dom.progress.appendChild(this.dom.progressBar);
// 	}

// 	abortHandler(e){}
// 	errorHandler(e){
// 		switch(e.target.error.code) {
// 			case e.target.error.NOT_FOUND_ERR:
// 				alert('File not found!');
// 				break;
// 			case e.target.error.NOT_READABLE_ERR:
// 				alert('File is not readable');
// 				break;
// 			case e.target.error.ABORT_ERR:
// 				break;
// 			default:
// 				alert('An error occurred reading this file.');
// 		}
// 	}

// 	progressHandler(e){
// 		if (e.lengthComputable) {
// 			var loaded = Math.round((e.loaded / e.total) * 100);
// 			this.dom.progressBar.style.width = loaded + '%';
// 		}
// 	}

// 	loadHandler(e){ GAME.signals.makeEvent('file3d.loaded', window, { file : e.target }); }

// 	handleDragEnter(e){
// 		e.stopPropagation();
// 		e.preventDefault();
// 		this.dom.drop.classList.add('dragover');
// 	}

// 	handleDragLeave(e){
// 		e.stopPropagation();
// 		e.preventDefault();
// 		this.dom.drop.classList.remove('dragover');
// 	}

// 	handleDragOver(e){
// 		e.stopPropagation();
// 		e.preventDefault();
// 		e.dataTransfer.dropEffect = 'copy';
// 	}

// 	handleFileSelect(e){
// 		e.stopPropagation();
// 		e.preventDefault();
		
// 		this.dom.drop.classList.remove('dragover');
// 		this.dom.progressBar.style.width = '0%';

// 		var file = e.dataTransfer.files[0];
// 		this.activeFile = file;
// 		this.fileReader.readAsArrayBuffer(file);
// 	}

// 	_link(){
// 		this.dom.drop.addEventListener('dragenter', this.handleDragEnter.bind(this), false)
// 		this.dom.drop.addEventListener('dragleave', this.handleDragLeave.bind(this), false)
// 		this.dom.drop.addEventListener('dragover', this.handleDragOver.bind(this), false);
// 		this.dom.drop.addEventListener('drop', this.handleFileSelect.bind(this), false);
// 	}
// }