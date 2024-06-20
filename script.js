const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    color: 'blue',
    speed: 5,
    dx: 0,
    dy: 0,
    displayName: '',
    id: null
};

const bullets = [];
const bulletSize = 5;
const bulletSpeed = 7;

let players = {};

const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    console.log('Connected to server');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
        case 'updatePlayers':
            players = data.players;
            break;
        case 'shoot':
            bullets.push(data.bullet);
            break;
    }
};

canvas.addEventListener('mousemove', function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

canvas.addEventListener('mousedown', function(event) {
    if (event.button === 0) {
        shooting = true;
        shoot();
    }
});

canvas.addEventListener('mouseup', function(event) {
    if (event.button === 0) {
        shooting = false;
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight' || event.key === 'd') {
        player.dx = player.speed;
    } else if (event.key === 'ArrowLeft' || event.key === 'a') {
        player.dx = -player.speed;
    }

    if (event.key === 'ArrowUp' || event.key === 'w') {
        player.dy = -player.speed;
    } else if (event.key === 'ArrowDown' || event.key === 's') {
        player.dy = player.speed;
    }
});

document.addEventListener('keyup', function(event) {
    if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'd' || event.key === 'a') && !event.repeat) {
        player.dx = 0;
    }

    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'w' || event.key === 's') && !event.repeat) {
        player.dy = 0;
    }
});

function drawPlayer(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(Math.atan2(mouseY - p.y, mouseX - p.x));

    ctx.beginPath();
    ctx.arc(0, 0, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();

    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(p.displayName, 0, -p.size - 5);

    ctx.restore();
}

function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    if (player.x - player.size < 0) player.x = player.size;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y - player.size < 0) player.y = player.size;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;

    socket.send(JSON.stringify({ type: 'movePlayer', id: player.id, x: player.x, y: player.y }));
}

function drawBullets() {
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bulletSize, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    });
}

function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}

function shoot() {
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    const bullet = {
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * bulletSpeed,
        dy: Math.sin(angle) * bulletSpeed
    };

    bullets.push(bullet);
    socket.send(JSON.stringify({ type: 'shoot', bullet }));

    if (shooting) {
        setTimeout(shoot, 100);
    }
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let id in players) {
        if (players[id].id !== player.id) {
            drawPlayer(players[id]);
        }
    }

    drawPlayer(player);
    movePlayer();
    drawBullets();
    moveBullets();

    requestAnimationFrame(update);
}

function startGame() {
    const playerName = document.getElementById('playerNameInput').value.trim();
    if (playerName === '') {
        alert('Por favor, insira seu nome para iniciar o jogo.');
        return;
    }

    player.displayName = playerName;
    player.id = Math.random().toString(36).substr(2, 9);

    document.getElementById('loginScreen').style.display = 'none';

    socket.send(JSON.stringify({ type: 'newPlayer', id: player.id, x: player.x, y: player.y, size: player.size, color: player.color, displayName: player.displayName }));

    update();
}
