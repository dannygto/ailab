/**
 * 传感器设备模拟器启动脚本
 */

const net = require('net');

// 传感器设备配置
const config = {
  id: 'sens001',
  name: 'SensorSimulator',
  port: 8002,
  responseDelay: 20,
  errorRate: 0.02,
  useJson: true,
  updateInterval: 5000 // 自动更新数据间隔 (ms)
};

// 保存当前的传感器数据
let sensorData = {
  temperature: 25.0,
  humidity: 45.0,
  pressure: 1013.2,
  light: 500,
  motion: false,
  timestamp: Date.now()
};

// 更新传感器数据
function updateSensorData() {
  // 模拟温度变化 (±0.5°C)
  sensorData.temperature += (Math.random() - 0.5);
  sensorData.temperature = parseFloat(sensorData.temperature.toFixed(1));

  // 模拟湿度变化 (±2%)
  sensorData.humidity += (Math.random() - 0.5) * 4;
  sensorData.humidity = Math.max(0, Math.min(100, parseFloat(sensorData.humidity.toFixed(1))));

  // 模拟压力变化 (±0.5 hPa)
  sensorData.pressure += (Math.random() - 0.5);
  sensorData.pressure = parseFloat(sensorData.pressure.toFixed(1));

  // 模拟光线变化
  sensorData.light += Math.floor((Math.random() - 0.5) * 50);
  sensorData.light = Math.max(0, sensorData.light);

  // 模拟运动检测 (10%概率改变状态)
  if (Math.random() < 0.1) {
    sensorData.motion = !sensorData.motion;
  }

  // 更新时间戳
  sensorData.timestamp = Date.now();
}

// 命令处理器
const commandHandlers = {
  'GET_DATA': () => {
    return sensorData;
  },

  'GET_TEMPERATURE': () => {
    return { temperature: sensorData.temperature };
  },

  'GET_HUMIDITY': () => {
    return { humidity: sensorData.humidity };
  },

  'GET_PRESSURE': () => {
    return { pressure: sensorData.pressure };
  },

  'GET_LIGHT': () => {
    return { light: sensorData.light };
  },

  'GET_MOTION': () => {
    return { motion: sensorData.motion };
  },

  'SET_UPDATE_INTERVAL': (params) => {
    const interval = parseInt(params);
    if (isNaN(interval) || interval < 1000) {
      return { error: 'Invalid interval. Must be at least 1000ms.' };
    }

    config.updateInterval = interval;
    return { status: 'ok', updateInterval: interval };
  },

  'RESET': () => {
    sensorData = {
      temperature: 25.0,
      humidity: 45.0,
      pressure: 1013.2,
      light: 500,
      motion: false,
      timestamp: Date.now()
    };
    return { status: 'ok', message: 'Sensor data reset to defaults' };
  },

  'HELP': () => {
    return {
      commands: [
        'GET_DATA',
        'GET_TEMPERATURE',
        'GET_HUMIDITY',
        'GET_PRESSURE',
        'GET_LIGHT',
        'GET_MOTION',
        'SET_UPDATE_INTERVAL',
        'RESET',
        'HELP'
      ]
    };
  }
};

// 创建TCP服务器
const server = net.createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`[${config.id}] New connection from ${clientAddress}`);

  // 处理数据
  socket.on('data', (data) => {
    let command, params;

    try {
      if (config.useJson) {
        // JSON格式解析
        const request = JSON.parse(data.toString());
        command = request.command;
        params = request.params;
      } else {
        // 文本格式解析
        const cmdString = data.toString().trim();
        const spaceIndex = cmdString.indexOf(' ');

        if (spaceIndex === -1) {
          command = cmdString;
          params = null;
        } else {
          command = cmdString.substring(0, spaceIndex);
          params = cmdString.substring(spaceIndex + 1);
        }
      }

      console.log(`[${config.id}] Received command: ${command}`);

      // 模拟处理延迟
      setTimeout(() => {
        // 模拟随机错误
        if (Math.random() < config.errorRate) {
          console.log(`[${config.id}] Simulating error response`);
          const errorResponse = config.useJson
            ? JSON.stringify({ error: 'Command processing failed' })
            : 'ERROR: Command processing failed';
          socket.write(errorResponse + '\r\n');
          return;
        }

        // 执行命令
        const handler = commandHandlers[command];
        if (handler) {
          const response = handler(params);
          const responseStr = config.useJson
            ? JSON.stringify(response)
            : formatTextResponse(response);

          console.log(`[${config.id}] Sending response: ${responseStr.substring(0, 50)}${responseStr.length > 50 ? '...' : ''}`);
          socket.write(responseStr + '\r\n');
        } else {
          console.log(`[${config.id}] Unknown command: ${command}`);
          const errorResponse = config.useJson
            ? JSON.stringify({ error: `Unknown command: ${command}` })
            : `ERROR: Unknown command: ${command}`;
          socket.write(errorResponse + '\r\n');
        }
      }, config.responseDelay);
    } catch (err) {
      console.error(`[${config.id}] Error processing request: ${err.message}`);
      const errorResponse = config.useJson
        ? JSON.stringify({ error: 'Invalid request format' })
        : 'ERROR: Invalid request format';
      socket.write(errorResponse + '\r\n');
    }
  });

  // 处理连接关闭
  socket.on('close', (hadError) => {
    console.log(`[${config.id}] Connection closed from ${clientAddress}${hadError ? ' due to error' : ''}`);
  });

  // 处理错误
  socket.on('error', (err) => {
    console.error(`[${config.id}] Socket error: ${err.message}`);
  });
});

// 格式化文本响应
function formatTextResponse(response) {
  if (typeof response !== 'object') {
    return String(response);
  }

  let result = '';
  for (const [key, value] of Object.entries(response)) {
    if (Array.isArray(value)) {
      result += `${key}:${value.join(',')};`;
    } else if (typeof value === 'object' && value !== null) {
      result += `${key}:{${formatTextResponse(value)}};`;
    } else {
      result += `${key}:${value};`;
    }
  }

  return result;
}

// 启动服务器
server.listen(config.port, () => {
  console.log(`[${config.id}] ${config.name} started on port ${config.port}`);
});

// 错误处理
server.on('error', (err) => {
  console.error(`[${config.id}] Server error: ${err.message}`);

  if (err.code === 'EADDRINUSE') {
    console.error(`[${config.id}] Port ${config.port} is already in use. Please choose another port.`);
    process.exit(1);
  }
});

// 定期更新传感器数据
setInterval(() => {
  updateSensorData();
  console.log(`[${config.id}] Sensor data updated: Temp=${sensorData.temperature}°C, Humidity=${sensorData.humidity}%`);
}, config.updateInterval);

// 处理程序退出
process.on('SIGINT', () => {
  console.log(`[${config.id}] Shutting down...`);
  server.close(() => {
    console.log(`[${config.id}] Server stopped`);
    process.exit(0);
  });
});

console.log(`[${config.id}] Sensor simulator running. Press Ctrl+C to stop.`);
