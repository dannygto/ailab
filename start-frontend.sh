#!/bin/bash
# AILAB前端服务启动脚本 - 避免ESM问题

# 切换到前端目录
cd "$(dirname "$0")/src/frontend"

# 检查build目录是否存在
if [ ! -d "build" ]; then
  echo "错误: build目录不存在，请先构建前端项目"
  exit 1
fi

# 启动静态文件服务器的多种方式
echo "启动前端静态文件服务器..."

# 方法1: 使用http-server (推荐)
if command -v http-server >/dev/null; then
  echo "使用http-server启动..."
  exec http-server build -p 3000 -a 0.0.0.0 --proxy http://localhost:3000?
# 方法2: 使用serve
elif command -v serve >/dev/null; then
  echo "使用serve启动..."
  exec serve -s build -l 3000
# 方法3: 使用npx serve
elif command -v npx >/dev/null; then
  echo "使用npx serve启动..."
  exec npx serve -s build -l 3000
# 方法4: 使用Python简单HTTP服务器
elif command -v python3 >/dev/null; then
  echo "使用Python HTTP服务器启动..."
  cd build
  exec python3 -m http.server 3000
# 方法5: 使用Node.js express服务器
elif command -v node >/dev/null; then
  echo "使用Node.js express服务器启动..."
  cat > simple-server.js << 'EOF'
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static('build'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`前端服务器运行在 http://0.0.0.0:${port}`);
});
EOF
  exec node simple-server.js
else
  echo "错误: 无可用的HTTP服务器"
  exit 1
fi
