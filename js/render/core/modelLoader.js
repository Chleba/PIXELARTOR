class ModelLoader {
	constructor(){
		this.loaders = {
			fbx : THREE.FBXLoader,
			gltf : THREE.GLTFLoader
		}
	}
	load(file, path, name, cb){
		var ext = name.split('.')[name.split('.').length-1]
		var loader = new this.loaders[ext]();
		loader.load(path+'/'+name, cb)
		// -- fbx not working with binary buffer - TODO
		// loader.parse(file, path, cb, function (e) { console.error(e); });
	}
}