var { ipcMain }			= require('electron');
var fs 							= require('fs');
var zipFolder 			= require('zip-a-folder');
var ENUMS 					= require('../../js/render/core/enums.js');

function SaveB64File(path, base64data, cb){
	var data = base64data.replace(/^data:image\/\w+;base64,/, '');
	fs.writeFile(path, data, { encoding : 'base64' }, cb);
}

// -------------------------------------------------------------------------------------
// -- ZIP
// -------------------------------------------------------------------------------------
class ExportZip {
	constructor(){
		this.imgNum = 0;
		this.dirPath = null;
		this.savePath = null;
		this.cb = null;
	}
	export(imgs, path, cb){
		this.cb = cb;
		this.savePath = path;
		this.imgNum = 0;
		var tmpDir = new Date().getTime();

		// -- create data dir if not exist
		if (!fs.existsSync('./data/')){ fs.mkdirSync('./data/'); }

		this.dirPath = './data/' + tmpDir
		if (!fs.existsSync(this.dirPath)){ fs.mkdirSync(this.dirPath); }
		for(var i=0;i<imgs.length;i++){
			var imgName = 'sprite'+i+'.png';
			var imgPath = this.dirPath+'/'+imgName;
			SaveB64File(imgPath, imgs[i], this._fileCreated.bind(this, imgs.length));
		}
	}
	_fileCreated(numOgImgs){
		this.imgNum++
		if (numOgImgs == this.imgNum) {
			zipFolder.zipFolder(this.dirPath, this.savePath, function(err) {
        if(err) {
          console.log('Something went wrong!', err);
        } else {
        	this.cb();
        }
      }.bind(this));
		}
	}
}

// -------------------------------------------------------------------------------------
// -- GIF
// -------------------------------------------------------------------------------------
class ExportGif {
	constructor(){}
	export(img, path, cb){
		SaveB64File(path, img, cb)
	}
}

// -------------------------------------------------------------------------------------
// -- EXPORT CLASS
// -------------------------------------------------------------------------------------
class ExportFile {
	constructor(mainWindow){
		this.mainWindow = mainWindow;
		
		this.exportGif = new ExportGif();
		this.ExportZip = new ExportZip();

		this.link();
	}
	_export(e, m){
		var type = m.type;
		var images = m.images;
		var file = m.file;

		if (type == ENUMS.EXPORT_TYPE.gif) {
			this.exportGif.export(images, file, this._exportDone.bind(this));
		} else if(type == ENUMS.EXPORT_TYPE.frames){
			this.ExportZip.export(images, file, this._exportDone.bind(this))
		}
	}
	_exportDone(){
		this.mainWindow.webContents.send('export-done', { status : true });
	}
	link(){
		ipcMain.on('export-file', this._export.bind(this));
	}
}

exports.ExportFile = ExportFile;