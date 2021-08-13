const { ipcMain } = require('electron');

class APPManager {
	constructor(mainWindow){
		this.mainWindow = mainWindow;
		this.makeModules();
		this.link();		
	}

	start(){
		
	}

	makeModules(){
		
	}

	appReady(){
		this.mainWindow.webContents.send('app-ready', { status : true });
	}

	renderReady(e, m){
		this.start();
	}

	link(){
		ipcMain.on('render-ready', this.renderReady.bind(this));
	}
};

exports.APPManager = APPManager;
