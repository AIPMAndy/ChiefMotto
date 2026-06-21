const fs = require('fs');
const { createCanvas } = require('canvas');

const canvas = createCanvas(1024, 1024);
const ctx = canvas.getContext('2d');

// 背景渐变
const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
gradient.addColorStop(0, '#667eea');
gradient.addColorStop(1, '#764ba2');
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, 1024, 1024);

// 圆角
ctx.fillStyle = gradient;
const radius = 180;
ctx.beginPath();
ctx.moveTo(radius, 0);
ctx.lineTo(1024 - radius, 0);
ctx.quadraticCurveTo(1024, 0, 1024, radius);
ctx.lineTo(1024, 1024 - radius);
ctx.quadraticCurveTo(1024, 1024, 1024 - radius, 1024);
ctx.lineTo(radius, 1024);
ctx.quadraticCurveTo(0, 1024, 0, 1024 - radius);
ctx.lineTo(0, radius);
ctx.quadraticCurveTo(0, 0, radius, 0);
ctx.closePath();
ctx.fill();

// 装饰圆
ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
ctx.lineWidth = 40;
ctx.beginPath();
ctx.arc(512, 512, 350, 0, Math.PI * 2);
ctx.stroke();

// 主文字
ctx.fillStyle = '#ffffff';
ctx.font = 'bold 480px Arial';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('座', 512, 520);

// 底部文字
ctx.font = 'bold 80px Arial';
ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
ctx.fillText('右铭', 512, 820);

// 保存为 PNG
const buffer = canvas.toBuffer('image/png');
fs.writeFileSync('icon-1024.png', buffer);
console.log('Icon generated: icon-1024.png');
