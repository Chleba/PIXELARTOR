var { BrowserWindow, app } 	= require('electron');
var path 					= require('path');
var url 					= require('url');
var APPManager 		= require('./js/main/appmanager.js');
var ExportFile 		= require('./js/main/export.js');
var ENUMS 				= require('./js/render/core/enums.js');

var MainApp = function(){
	this.mainWindow = null;
	this.link();
};

MainApp.prototype = {

	closeAll : function(){ if (process.platform !== 'darwin') { app.quit(); } },
	activateApp : function(){ if (this.mainWindow === null) { this.makeMainWindow(); } },

	start : function(){
		this.makeMainWindow();
		this.makeModules();
	},

	makeModules : function(){
		this.appManager 	= new APPManager.APPManager(this.mainWindow);
		this.export 			= new ExportFile.ExportFile(this.mainWindow);
	},

	makeMainWindow : function(){
		this.mainWindow = new BrowserWindow({
			width 					: 1280,
			height					: 800,
			minWidth 				: 800,
			minHeight				: 600,
			resizable 			: true,
			fullscreenable 	: true,
			maximizable 		: true,
			darkTheme 			: true,
			backgroundColor : '#333',
			icon 						: __dirname + '/icon.png',
			webPreferences	: { nodeIntegration : true }
		});
		this.mainWindow.setMenu(null);
		this.mainWindow.loadURL(url.format({
			pathname: path.join(__dirname, 'templates/app.html'),
			protocol: 'file:',
			slashes: true
		}));
		// this.mainWindow.webContents.openDevTools();

		this.mainWindow.on('closed', function(){
			this.mainWindow = null
  	}.bind(this));
	},

	link : function(){
		app.on('ready', this.start.bind(this));
		app.on('window-all-closed', this.closeAll.bind(this));
		app.on('activate', this.activateApp.bind(this));
	}
};

var _mainApp = new MainApp();
