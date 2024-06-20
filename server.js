// server.js
const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static('public'));

let players = {};

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'newPlayer':
                players[data.id] = data;
                broadcast({ type: 'updatePlayers', players });
                break;
            case 'movePlayer':
                if (players[data.id]) {
                    players[data.id].x = data.x;
                    players[data.id].y = data.y;
                }
                broadcast({ type: 'updatePlayers', players });
                break;
            case 'shoot':
                broadcast(data);
                break;
        }
    });

    ws.on('close', () => {
        for (let id in players) {
            if (players[id].ws === ws) {
                delete players[id];
                break;
            }
        }
        broadcast({ type: 'updatePlayers', players });
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

server.listen(8080, () => {
    console.log('Server is listening on port 8080');
});
