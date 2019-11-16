
class OpenFileControls {

	constructor(app, rootElm){
		this.app 					= app;
		this.dom 					= {};
		this.dom.rootElm 	= rootElm;
		this.inputs 			= [];
		this.inputCount 	= 0;

		this._makeDOM();
		this._link();
	}

	_makeDOM(){
		this.dom.title = document.createElement('h3');
		this.dom.title.className = 'title';
		this.dom.title.innerHTML = 'Open 3D File:'
		this.dom.rootElm.appendChild(this.dom.title);

		// ------------------------
		// -- lights
		this._makeInputs();
	}

	_makeInputs(){
		this.dom.openFileContainer = document.createElement('div');
		this.dom.openFileContainer.className = 'openFileContainer';
		this.dom.rootElm.appendChild(this.dom.openFileContainer);

		// -- 
		this.dom.button = document.createElement('button');
		this.dom.button.className = 'glyphicon glyphicon-folder-open'
		// this.dom.button.innerHTML = '>> OPEN FILE <<';
		this.dom.button.addEventListener('click', this.openDialog.bind(this), false);
		this.dom.openFileContainer.appendChild(this.dom.button);

		this.dom.fileInput = document.createElement('input');
		this.dom.fileInput.type = 'text';
		this.dom.fileInput.name = 'file3d';
		this.dom.fileInput.disabled = true;
		this.dom.fileInput.style.display = 'none';
		this.dom.openFileContainer.appendChild(this.dom.fileInput);
	}

	handleOpenFile(res){
		if (res.filePaths.length) {
			var file = res.filePaths[0];
			// -- input
			this.dom.fileInput.value = file;
			this.dom.fileInput.style.display = 'inline-block';
			// -- file process
			var isWin = process.platform === "win32";

			var f = file.split( isWin ? "\\" : "/");
			var path = '';
			var separator = isWin ? '\\' : '/';
			for(var i=0;i<f.length-1;i++){ path += f[i]+separator; }

			fs.readFile(file, (err, data) => {
				if(err){ alert(err); }
				GAME.signals.makeEvent('file3d.loaded', window, { file : data, path : path, name : f[f.length-1] });
			});
		}
	}

	openDialog(e){
		dialog.showOpenDialog(BrowserWindow, {
			properties: ['openFile'],
			filters: [ { name: 'Custom File Type', extensions: ['gltf', 'fbx'] } ]
		}).then(this.handleOpenFile.bind(this))
		// dialog.showOpenDialog({
		// 	properties: ['openFile'],
		// 	filters: [
		// 		{ name: 'Custom File Type', extensions: ['gltf', 'fbx'] },
		// 	]
		// }, this.handleOpenFile.bind(this));
	}

	_link(){ }
}
