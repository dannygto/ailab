#!/usr/bin/env node

/**
 * TCP/Socket设备模拟器
 *
 * 本脚本用于模拟TCP/Socket设备，方便在无法访问实际设备时进行测试
 *
 * @version 1.0.0
 * @date 2025-07-24
 */

const net = require('net');
const fs = require('fs');
const path = require('path');

// 命令行参数解析
const args = process.argv.slice(2);
let configFile = '';
let deviceName = '';

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '--config' && i + 1 < args.length) {
    configFile = args[i + 1];
    i++;
  } else if (arg === '--device' && i + 1 < args.length) {
    deviceName = args[i + 1];
    i++;
  }
}

// 如果指定了设备名称但没有配置文件，尝试查找默认配置文件
if (!configFile && deviceName) {
  const defaultConfigPath = path.join(__dirname, `${deviceName.toLowerCase()}-sim.json`);
  if (fs.existsSync(defaultConfigPath)) {
    configFile = defaultConfigPath;
  }
}

if (!configFile) {
  console.error('错误: 必须指定配置文件 (--config) 或设备名称 (--device)');
  process.exit(1);
}

// 加载配置
let config;
try {
  const configData = fs.readFileSync(configFile, 'utf8');
  config = JSON.parse(configData);
} catch (err) {
  console.error(`无法加载配置文件 ${configFile}:`, err);
  process.exit(1);
}

// 设置默认值
const {
  deviceName: simDeviceName = 'GENERIC',
  host = '0.0.0.0',
  port = 4001,
  responses = {},
  commandDelimiter = '\r\n',
  responseDelay = { min: 10, max: 50 },
  errorProbability = 0.05,
  connectionLifetime = 0, // 0表示无限
  customHandlers = {}
} = config;

// 初始化服务器
const server = net.createServer((socket) => {
  console.log(`设备 ${simDeviceName} 接受来自 ${socket.remoteAddress}:${socket.remotePort} 的连接`);

  let buffer = Buffer.alloc(0);
  let connectionStartTime = Date.now();
  let connectionId = `${socket.remoteAddress}:${socket.remotePort}`;

  // 如果设置了连接生命周期，则设置自动断开连接
  if (connectionLifetime > 0) {
    setTimeout(() => {
      console.log(`设备 ${simDeviceName} 自动断开连接 ${connectionId} (超过生命周期 ${connectionLifetime}ms)`);
      socket.end();
    }, connectionLifetime);
  }

      // 处理数据接收
      socket.on('data', (data) => {
        buffer = Buffer.concat([buffer, data]);

        console.log(`[DEBUG] 收到数据: ${data.toString('utf8').trim()}`);
        console.log(`[DEBUG] 当前缓冲区: ${buffer.toString('utf8').trim()}`);
        console.log(`[DEBUG] 查找分隔符: ${JSON.stringify(commandDelimiter)}`);

        // 尝试从缓冲区中提取完整命令
        let delimiterPos;
        while ((delimiterPos = buffer.indexOf(commandDelimiter)) !== -1) {
          // 提取命令
          const commandBuffer = buffer.slice(0, delimiterPos);
          const command = commandBuffer.toString('utf8').trim();

          // 更新缓冲区，移除已处理的命令
          buffer = buffer.slice(delimiterPos + commandDelimiter.length);

          console.log(`设备 ${simDeviceName} 接收命令: ${command}`);      // 随机生成错误
      if (Math.random() < errorProbability) {
        console.log(`设备 ${simDeviceName} 模拟错误响应`);

        // 延迟响应
        const delay = Math.floor(Math.random() * (responseDelay.max - responseDelay.min)) + responseDelay.min;
        setTimeout(() => {
          const errorResponse = `ERROR: Command failed${commandDelimiter}`;
          socket.write(errorResponse);
        }, delay);

        continue;
      }

      // 检查是否有自定义处理函数
      if (command in customHandlers) {
        // 延迟响应
        const delay = Math.floor(Math.random() * (responseDelay.max - responseDelay.min)) + responseDelay.min;
        setTimeout(() => {
          // 执行自定义处理函数
          const handlerCode = customHandlers[command];
          try {
            const handlerFn = new Function('socket', 'command', 'delimiter', handlerCode);
            handlerFn(socket, command, commandDelimiter);
          } catch (err) {
            console.error(`执行自定义处理函数出错:`, err);
            socket.write(`ERROR: Internal handler error${commandDelimiter}`);
          }
        }, delay);

        continue;
      }

      // 查找响应
      let response = responses[command];

      // 如果没有精确匹配，尝试模式匹配
      if (!response) {
        for (const [pattern, resp] of Object.entries(responses)) {
          if (pattern.startsWith('^') && new RegExp(pattern).test(command)) {
            response = resp;
            break;
          }
        }
      }

      // 如果仍然没有匹配，使用默认响应
      if (!response && '*' in responses) {
        response = responses['*'];
      }

      // 如果仍然没有响应，返回错误
      if (!response) {
        response = `ERROR: Unknown command "${command}"`;
      }

      // 如果响应是函数，执行它
      if (typeof response === 'function') {
        try {
          response = response(command);
        } catch (err) {
          console.error(`执行响应函数出错:`, err);
          response = `ERROR: Internal response error`;
        }
      }

      // 延迟响应
      const delay = Math.floor(Math.random() * (responseDelay.max - responseDelay.min)) + responseDelay.min;
      setTimeout(() => {
        const fullResponse = `${response}${commandDelimiter}`;
        console.log(`设备 ${simDeviceName} 发送响应 (延迟 ${delay}ms): ${response}`);
        socket.write(fullResponse);
      }, delay);
    }
  });

  // 处理连接关闭
  socket.on('close', (hadError) => {
    const connectionDuration = (Date.now() - connectionStartTime) / 1000;
    console.log(`设备 ${simDeviceName} 连接 ${connectionId} 关闭，持续时间: ${connectionDuration.toFixed(1)}秒，错误: ${hadError ? 'Yes' : 'No'}`);
  });

  // 处理错误
  socket.on('error', (err) => {
    console.error(`设备 ${simDeviceName} 连接 ${connectionId} 出错:`, err.message);
  });
});

// 启动服务器
server.listen(port, host, () => {
  console.log(`设备模拟器 ${simDeviceName} 正在监听 ${host}:${port}`);
  console.log(`支持的命令: ${Object.keys(responses).join(', ')}`);
  console.log(`命令分隔符: ${JSON.stringify(commandDelimiter)}`);
  console.log(`响应延迟: ${responseDelay.min}-${responseDelay.max}ms`);
  console.log(`错误概率: ${errorProbability * 100}%`);
  if (connectionLifetime > 0) {
    console.log(`连接生命周期: ${connectionLifetime}ms`);
  } else {
    console.log(`连接生命周期: 无限`);
  }
});

// 处理进程信号
process.on('SIGINT', () => {
  console.log(`\n设备模拟器 ${simDeviceName} 正在关闭...`);
  server.close(() => {
    console.log(`设备模拟器 ${simDeviceName} 已关闭`);
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log(`\n设备模拟器 ${simDeviceName} 正在关闭...`);
  server.close(() => {
    console.log(`设备模拟器 ${simDeviceName} 已关闭`);
    process.exit(0);
  });
});
