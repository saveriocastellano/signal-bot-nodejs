const { default: axios } = require('axios');
const {EventEmitter } = require('node:events');

const PARSE_DATA = 'data:';
const PARSE_EVENT_RECEIVE = 'event:receive';

class SignalBot extends EventEmitter {

    constructor(config) {
        super();
        this._config = config;
        this._validateConfig();
        this._init();
    }

    _validateConfig() {
        if (!this._config) this._config = {};
        if (typeof(this._config.host) == 'undefined') this._config.host = 'localhost';
        if (typeof(this._config.port) == 'undefined') this._config.port = 8080;

        if (typeof(this._config.host)!='string') throw new Error(`invalid host: ${this._config.host}`);
        if (!Number.isInteger(this._config.port)) throw new Error(`invalid port: ${this._config.port}`);   
        if (typeof(this._config.account)!='string' || !this._config.account.startsWith('+')) throw new Error(`invalid account: ${this._config.account}`);     
    }

    _getUrl(path) {
        let url = `http${this._config.ssl?'s':''}://${this._config.host}`;
        url += `:${this._config.port}`;
        return `${url}${path}`;
    }
    
    _getApiUrl() { return this._getUrl('/api/v1/rpc') }
    _getEventsUrl() { return this._getUrl('/api/v1/events') + `?account=${encodeURIComponent(this._config.account)}`}

    async _init() {

        let response;

        try {
            const url = this._getEventsUrl();
            console.log(`Fetching events from ${url}`);
            response = await fetch(url, {method: "GET" });
        } catch(e) {
            this.emit('connectionError', e);
            return;
        }
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        
        this.emit('connected');

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          this._processData(decoder.decode(value));
        }
        this.emit('disconnected');
    }

    async _processData(data) {
        //console.log("DATA = " + data);
        let parts = data.split("\n");
        if (parts.length < 2 || parts[1].indexOf(PARSE_DATA) != 0) return;
        let type = parts[0]; 

        try {
            let json = JSON.parse(parts[1].substring(PARSE_DATA.length));

            if (type==PARSE_EVENT_RECEIVE) {

                this.emit('eventReceive', json);

                if (json.envelope && json.envelope.dataMessage) {
                    let dm = json.envelope.dataMessage;
                    if (dm && Array.isArray(dm.previews) && dm.previews.length > 0 && dm.previews[0].url) {
                        this.emit('joinGroupInvite', json.envelope);

                    } else if (dm && dm.groupInfo && dm.groupInfo.type == 'DELIVER' && dm.message) {
                        this.emit('groupMessage', json.envelope);

                    } else if (dm && !dm.groupInfo) {
                        this.emit('privateMessage', json.envelope);
                    }
                }

            }
        
        } catch(e) {

        }
    }

    async _apiCall(method, params) {
        let res = await axios.post(this._getApiUrl(), {jsonrpc: "2.0", method, params: {...params, account: this._config.account}, "id": 4});
        return res;
    }

    async sendPrivateMessage(numberOrUuid, message) {
        return this._apiCall('send', {recipient :[numberOrUuid], message});
    }

    async sendGroupMessage(groupId, message) {
        return this._apiCall('send', {groupId, message});
    }

    async joinGroupInvite(uri) {
        return this._apiCall('joinGroup', {uri});
    }

}

module.exports = SignalBot;
