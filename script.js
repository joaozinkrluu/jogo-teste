const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuração inicial do canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variáveis do jogador
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    color: 'blue',
    speed: 5,
    dx: 0,
    dy: 0,
    displayName: ''
};

// Array para armazenar as balas
const bullets = [];
const bulletSize = 5;
const bulletSpeed = 7;

// Array para armazenar os oponentes
const enemies = [];
const numberOfEnemies = 5;
const enemySpeed = 2; // Velocidade dos inimigos

// Array para armazenar os inimigos mortos aguardando respawn
const deadEnemies = [];

// Variáveis para controle da mira do jogador
let mouseX = player.x;
let mouseY = player.y;

// Flag para controlar o disparo contínuo
let shooting = false;

// Event listener para capturar o movimento do mouse
canvas.addEventListener('mousemove', function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Event listener para capturar o clique do mouse
canvas.addEventListener('mousedown', function(event) {
    if (event.button === 0) { // Botão esquerdo do mouse
        shooting = true;
        shoot();
    }
});

// Event listener para capturar a soltura do clique do mouse
canvas.addEventListener('mouseup', function(event) {
    if (event.button === 0) { // Botão esquerdo do mouse
        shooting = false;
    }
});

// Event listener para capturar as teclas pressionadas
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

// Event listener para capturar as teclas soltas
document.addEventListener('keyup', function(event) {
    if ((event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'd' || event.key === 'a') && !event.repeat) {
        player.dx = 0;
    }

    if ((event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'w' || event.key === 's') && !event.repeat) {
        player.dy = 0;
    }
});

// Função para desenhar o jogador
function drawPlayer() {
    ctx.save(); // Salva o estado atual do contexto
    ctx.translate(player.x, player.y); // Translada o contexto para a posição do jogador
    ctx.rotate(Math.atan2(mouseY - player.y, mouseX - player.x)); // Rotaciona o contexto na direção do mouse

    // Desenha o jogador com base no novo sistema de coordenadas rotacionadas
    ctx.beginPath();
    ctx.arc(0, 0, player.size, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();

    // Desenha o nome do jogador acima dele
    ctx.font = '12px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(player.displayName, 0, -player.size - 5);

    ctx.restore(); // Restaura o estado do contexto para o não-rotacionado
}

// Função para movimentar o jogador
function movePlayer() {
    player.x += player.dx;
    player.y += player.dy;

    // Verifica os limites do canvas
    if (player.x - player.size < 0) player.x = player.size;
    if (player.x + player.size > canvas.width) player.x = canvas.width - player.size;
    if (player.y - player.size < 0) player.y = player.size;
    if (player.y + player.size > canvas.height) player.y = canvas.height - player.size;
}

// Função para desenhar as balas
function drawBullets() {
    bullets.forEach(bullet => {
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bulletSize, 0, Math.PI * 2);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.closePath();
    });
}

// Função para movimentar as balas
function moveBullets() {
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;

        // Remove as balas que saem do canvas
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });
}

// Função para disparar balas
function shoot() {
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    const bullet = {
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * bulletSpeed,
        dy: Math.sin(angle) * bulletSpeed
    };

    bullets.push(bullet);

    // Dispara continuamente enquanto a flag de shooting estiver verdadeira
    if (shooting) {
        setTimeout(shoot, 100); // Intervalo entre os tiros (ajuste conforme necessário)
    }
}

// Função para desenhar os oponentes
function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fillStyle = enemy.color;
        ctx.fill();
        ctx.closePath();

        // Desenha a barra de vida do inimigo
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x - enemy.size, enemy.y - 20, enemy.size * 2 * (enemy.health / 100), 10);
    });
}

// Função para mover os oponentes
function moveEnemies() {
    enemies.forEach(enemy => {
        // Calcula a direção do movimento em direção ao jogador
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        enemy.x += Math.cos(angle) * enemySpeed;
        enemy.y += Math.sin(angle) * enemySpeed;
    });
}

// Função para verificar colisão entre balas e inimigos
function checkBulletEnemyCollision() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            // Calcula a distância entre a bala e o inimigo
            const distance = Math.sqrt((bullet.x - enemy.x) ** 2 + (bullet.y - enemy.y) ** 2);

            // Se houver colisão, reduz a vida do inimigo e remove a bala
            if (distance < bulletSize + enemy.size) {
                enemy.health -= 10; // Reduz a vida do inimigo (ajuste conforme necessário)
                bullets.splice(bulletIndex, 1); // Remove a bala

                // Se a vida do inimigo for menor ou igual a 0, marca-o para respawn
                if (enemy.health <= 0) {
                    // Adiciona o inimigo ao array de mortos para respawn
                    deadEnemies.push(enemy);
                    // Remove o inimigo do array de inimigos ativos
                    enemies.splice(enemyIndex, 1);
                    
                    // Aguarda 5 segundos antes de respawnar o inimigo
                    setTimeout(() => {
                        respawnEnemy(enemy);
                    }, 5000); // 5000 milissegundos = 5 segundos
                }
            }
        });
    });
}

// Função para respawnar o inimigo
function respawnEnemy(enemy) {
    enemy.health = 100; // Reset da vida do inimigo
    enemy.x = Math.random() * canvas.width; // Posição aleatória
    enemy.y = Math.random() * canvas.height;
    enemies.push(enemy); // Adiciona o inimigo de volta ao array de inimigos ativos
}

// Função para verificar se há inimigos mortos aguardando respawn
function updateDeadEnemies() {
    if (deadEnemies.length > 0) {
        deadEnemies.forEach(deadEnemy => {
            respawnEnemy(deadEnemy); // Respawn do inimigo morto
        });
        deadEnemies.length = 0; // Limpa o array de inimigos mortos após respawn
    }
}

// Função para atualizar o jogo
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o jogador
    drawPlayer();

    // Move o jogador
    movePlayer();

    // Desenha as balas
    drawBullets();

    // Move as balas
    moveBullets();

    // Move os inimigos
    moveEnemies();

   // Verifica colisão entre balas e inimigos
    checkBulletEnemyCollision();

    // Desenha os oponentes
    drawEnemies();

    requestAnimationFrame(update);
}

// Função para iniciar o jogo
function startGame() {
    const playerName = document.getElementById('playerNameInput').value.trim();
    if (playerName === '') {
        alert('Por favor, insira seu nome para iniciar o jogo.');
        return;
    }

    player.displayName = playerName;

    // Esconde a tela de login
    document.getElementById('loginScreen').style.display = 'none';

    // Cria o número inicial de oponentes
    for (let i = 0; i < numberOfEnemies; i++) {
        const size = Math.random() * 30 + 10;
        const enemy = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: size,
            color: 'red',
            health: 100
        };
        enemies.push(enemy);
    }

    // Inicia o loop do jogo
    update();
}
