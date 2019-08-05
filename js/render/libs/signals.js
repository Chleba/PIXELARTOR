
window.idGenerator = function () {
    this.idCnt = this.idCnt < 10000000 ? this.idCnt : 0;
    var ids = 'm' + new Date().getTime().toString(16) + 'm' + this.idCnt.toString(16);
    this.idCnt++;
    return ids;
};

if (!window.GAME) window.GAME = {};
if (!GAME.Signals) {
    /**
     * Signals Class
     */
    GAME.Signals = function () {
        if (this._init) {
            this._init.apply(this, arguments);
        }
        return this;
    };

    GAME.Signals.prototype._init = function () {
        this._signalsFolder = {};
        this._idFolder = {};
    };

    GAME.Signals.prototype.addListener = function (owner, type, method, sender) {
        try {
            var id = idGenerator();
            var data = {
                owner: owner,
                method: method,
                sender: sender,
                type: type
            };
            if (!(type in this._signalsFolder)) {
                this._signalsFolder[type] = {};
            }
            var typeObj = this._signalsFolder[type];
            typeObj[id] = data;

            this._idFolder[id] = typeObj[id];

            return id;
        } catch (e) {
            return null;
        }
    };

    GAME.Signals.prototype.removeListener = function (id) {
        var typeObj = this._idFolder[id];
        if (!typeObj) {
            throw new Error('Cannot remove non-existed signal ID');
        }
        delete this._signalsFolder[typeObj.type][id];
        delete this._idFolder[id];
    };

    GAME.Signals.prototype.makeEvent = function (type, target, data) {
        var e = {
            type: type,
            target: target,
            timestamp: new Date().getTime(),
            data: (data && typeof(data) == 'object') ? data : null
        };
        this._eventHandler(e);
    };

    GAME.Signals.prototype._eventHandler = function (event) {
        var functions = [];

        for (var type in this._signalsFolder) {
            if (type == event.type || type == '*') {
                for (var p in this._signalsFolder[type]) {
                    var item = this._signalsFolder[type][p];
                    if (!item.sender || item.sender == event.target) {
                        functions.push(item);
                    }
                }
            }
        }

        for (var i = 0; i < functions.length; i++) {
            var item = functions[i];
            var owner = item.owner;
            var method = item.method;
            if (typeof(method) == 'string') {
                owner[method](event);
            } else {
                method(event);
            }
        }
    };

    /*- default created instance of the signals -*/
    GAME.signals = new GAME.Signals();
}
