const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// 音乐控制
const music = document.getElementById('music');
document.addEventListener('click', () => {
    music.play();
    document.getElementById('hint').style.display = 'none';
});

// 星空粒子系统
class Star {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 2;
        this.opacity = Math.random() * 0.5 + 0.5;
        this.speed = Math.random() * 0.5;
    }
    update() {
        this.y += this.speed;
        if (this.y > height) this.reset();
    }
    draw() {
        ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// 流星系统
class Meteor {
    constructor() {
        this.reset();
        this.tail = [];
    }
    reset() {
        this.x = Math.random() * width;
        this.y = -50;
        this.speed = Math.random() * 8 + 4;
        this.size = Math.random() * 2 + 1;
        this.color = `hsl(${Math.random() * 60 + 200}, 100%, 50%)`;
        this.tail = [];
    }
    update() {
        this.x -= this.speed * 0.5;
        this.y += this.speed;
        this.tail.push({ x: this.x, y: this.y });
        if (this.tail.length > 15) this.tail.shift();
        if (this.y > height || this.x < 0) this.reset();
    }
    draw() {
        this.tail.forEach((pos, i) => {
            ctx.fillStyle = `${this.color}${(1 - i / 15).toString(16).substr(2, 2)}`;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, this.size * (1 - i / 15), 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// 点击特效系统
class ClickEffect {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.particles = Array(10).fill().map(() => ({
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 3 + 2,
            life: 1
        }));
    }
    update() {
        this.particles = this.particles.filter(p => {
            p.life -= 0.03;
            return p.life > 0;
        });
    }
    draw() {
        this.particles.forEach(p => {
            ctx.fillStyle = `hsla(${Math.random() * 60 + 300}, 100%, 50%, ${p.life})`;
            ctx.beginPath();
            const x = this.x + Math.cos(p.angle) * p.speed * (1 - p.life) * 20;
            const y = this.y + Math.sin(p.angle) * p.speed * (1 - p.life) * 20;
            ctx.arc(x, y, 3 * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// 初始化
const stars = Array(200).fill().map(() => new Star());
const meteors = Array(3).fill().map(() => new Meteor());
let clickEffects = [];
let clickCount = 0;

// 心形轨迹生成器
function createHeartPath(centerX, centerY, size = 50) {
    const path = [];
    for (let t = 0; t < Math.PI * 2; t += 0.1) {
        const x = size * (16 * Math.pow(Math.sin(t), 3)) + centerX;
        const y = -size * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) + centerY;
        path.push({ x, y });
    }
    return path;
}

// 逐字显示文字（优化版）
function typeWriter(textElement, speed = 50) {
    const text = textElement.getAttribute("data-text");
    let i = 0;
    textElement.textContent = ''; // 清空原有文字内容

    function addChar() {
        if (i < text.length) {
            textElement.textContent += text.charAt(i);
            i++;
            requestAnimationFrame(addChar); // 使用 requestAnimationFrame 来平滑逐字显示
        }
    }

    addChar(); // 启动逐字显示
}

// 主要动画循环
function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0, 0, width, height);

    // 更新绘制星空
    stars.forEach(star => {
        star.update();
        star.draw();
    });

    // 更新绘制流星
    meteors.forEach(meteor => {
        meteor.update();
        meteor.draw();
    });

    // 处理点击特效
    clickEffects.forEach(effect => {
        effect.update();
        effect.draw();
    });
    clickEffects = clickEffects.filter(e => e.particles.length > 0);

    requestAnimationFrame(animate);
}

// 互动事件
canvas.addEventListener('click', (e) => {
    clickCount++;

    // 添加点击特效
    clickEffects.push(new ClickEffect(e.clientX, e.clientY));

    // 生成心形流星
    if (clickCount === 3) {
        const heartPath = createHeartPath(width / 2, height / 2, 80);
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const m = new Meteor();
                m.path = heartPath;
                meteors.push(m);
            }, i * 50);
        }
    }
});

// 键盘互动
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        clickCount++;
        clickEffects.push(new ClickEffect(Math.random() * width, Math.random() * height));
    }
});

// 窗口自适应
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

// 启动动画
animate();

// 启动逐字显示动画
document.addEventListener("DOMContentLoaded", () => {
    // 设置文字内容
    document.getElementById("title").setAttribute("data-text", "❤️ 大猪蹄子 ❤️");
    document.getElementById("content").setAttribute("data-text", "在这浩瀚的宇宙中，我们如同星辰般渺小，微不足道，可即便如此，我也想成为那颗默默守护你的星星，无论时光如何流转，无论我们是什么关系。");

    // 开始逐字显示
    typeWriter(document.getElementById("title"), 150);  // 控制逐字显示的速度
    setTimeout(() => {
        typeWriter(document.getElementById("content"), 100);  // 逐字显示正文
    }, 2000);  // 延迟一段时间开始显示内容
});
