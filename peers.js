var server = require('http').createServer();
var io = require('socket.io')(server);
var ioClient = require('socket.io-client');

class PeerConnection {
    constructor(parent) {
        this.parent = parent;
        this.address = "http://127.0.0.1:3000";
        this.peers = {};
        //Debug code for connecting to a single local instance
        //this.initClient("http://localhost:3001");
        server.listen(3000);
        this.initServerListeners();
    }

    initServerListeners() {
        // Server listener for connections
        io.on('connection', peer => {
            console.log("Connection recieved from new peer");
            peer.on('info', data => {
                if(!this.peers.hasOwnProperty(data.address)) {
                    this.peers[data.address] = null;
                }
                this.newConnections()
            });

            peer.on('peers', function(data) {
                for(var i = 0; i < data.address.lenth; i++) {
                    if(!this.peers.hasOwnProperty(data.addresses[i])) {
                        peers[data.addresses[i]] = null;
                    }
                }
                this.newConnections()
            });

            peer.on('disconnect', function() {
                console.log("Peer disconnceted");
            })
        });
    }

    initClient(client) {
        var socket = ioClient.connect(client, {reconnect: true});
        socket.on('connect', () => {
            console.log("Connected to peer");
            socket.emit('info', {
                'address': this.address
            })
        });

        socket.on('data', function(data) {
            if(!parent.addData(data.hash, data.body)) {
                var interval = setInterval(function() {
                    if(parent.addData(data.hash, data.body)) {
                        clearInterval(interval);
                    }
                }, 100);
            }
        });

        socket.on('block', function(data) {
            parent.addPeerBlock(data.block);
        });

        socket.on('info', data => {
            if(!this.peers.hasOwnProperty(data.address)) {
                this.peers[data.address] = null;
            }
            socket.emit('info', this.address);
            this.newConnections()
        });

        socket.on('peers', function(data) {
            for(var i = 0; i < data.address.lenth; i++) {
                if(!this.peers.hasOwnProperty(data.addresses[i])) {
                    this.peers[data.addresses[i]] = null;
                }
            }
            this.newConnections()
        });

        return socket;
    }

    newConnections() {
        for(var key in this.peers) {
            if(this.peers.hasOwnProperty(key)) {
                if(this.peers[key] == null && key != this.address) {
                    this.peers[key] = this.initClient(key);
                }
            }
        }
    }

    sendData(data) {
        io.sockets.emit('data', data);
    }

    sendBlock(block) {
        io.sockets.emit('data', block);
    }
}

new PeerConnection(null);