"use strict";
/**
 * TCP/Socket协议适配器模拟设备集成测试脚本
 *
 * 本脚本用于测试TCP/Socket协议适配器与模拟设备的连接和通信
 * 使用前请确保模拟设备已通过start-all-simulators.js启动
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// 导入必要的模块
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var util = __importStar(require("util"));
var simple_tcp_adapter_1 = require("./simple-tcp-adapter");
// 控制台颜色工具
var colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m"
};
// 全局测试结果收集
var testResults = [];
// 读取模拟器配置获取可用设备信息
function getSimulatedDevices() {
    var simulatorDir = path.join(__dirname, 'simulator');
    var configFiles = fs.readdirSync(simulatorDir)
        .filter(function (file) { return file.endsWith('-sim.json'); })
        .map(function (file) { return path.join(simulatorDir, file); });
    return configFiles.map(function (file) {
        var config = JSON.parse(fs.readFileSync(file, 'utf8'));
        return {
            name: config.deviceName,
            host: 'localhost', // 模拟器运行在本地
            port: config.port
        };
    });
}
// 读取设备配置
function getDeviceConfig(deviceName) {
    try {
        var configPath = path.join(__dirname, '..', 'config', 'devices', "".concat(deviceName.toLowerCase(), ".json"));
        if (!fs.existsSync(configPath)) {
            console.log("".concat(colors.yellow, "\u672A\u627E\u5230\u8BBE\u5907\u914D\u7F6E\u6587\u4EF6: ").concat(configPath).concat(colors.reset));
            return null;
        }
        var configContent = fs.readFileSync(configPath, 'utf8');
        var config = JSON.parse(configContent);
        // 修改配置指向本地模拟器
        config.host = 'localhost';
        return config;
    }
    catch (error) {
        console.error("".concat(colors.red, "\u8BFB\u53D6\u8BBE\u5907\u914D\u7F6E\u51FA\u9519:").concat(colors.reset), error);
        return null;
    }
}
// 记录测试结果
function recordTestResult(result) {
    testResults.push(result);
    var statusSymbol = result.success ? '✓' : '✗';
    var statusColor = result.success ? colors.green : colors.red;
    console.log("".concat(statusColor).concat(statusSymbol, " [").concat(result.deviceName, "] ").concat(result.testName, ": ").concat(result.message).concat(colors.reset));
    if (!result.success && result.error) {
        console.log("  ".concat(colors.dim, "\u9519\u8BEF\u8BE6\u60C5: ").concat(util.inspect(result.error)).concat(colors.reset));
    }
}
// 基本连接测试
function testBasicConnection(deviceName, config) {
    return __awaiter(this, void 0, void 0, function () {
        var adapter, startTime, responseTime, identCommand, identResponse, error_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n".concat(colors.cyan, "\u6B63\u5728\u6D4B\u8BD5 ").concat(deviceName, " \u7684\u57FA\u672C\u8FDE\u63A5...").concat(colors.reset));
                    adapter = new simple_tcp_adapter_1.SimpleTCPAdapter({
                        host: 'localhost',
                        port: config.port,
                        delimiter: deviceName === 'MC-3000' ? '\n' : '\r\n',
                        connectionTimeout: config.connectionTimeout || 5000
                    });
                    startTime = Date.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, adapter.connect()];
                case 2:
                    _a.sent();
                    responseTime = Date.now() - startTime;
                    recordTestResult({
                        deviceName: deviceName,
                        testName: '基本连接测试',
                        success: true,
                        message: "\u6210\u529F\u8FDE\u63A5\u5230\u8BBE\u5907 (".concat(responseTime, "ms)"),
                        responseTime: responseTime
                    });
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 6]);
                    identCommand = deviceName === 'MC-3000' ? '*IDN?' : '*IDN?';
                    return [4 /*yield*/, adapter.sendCommand(identCommand)];
                case 4:
                    identResponse = _a.sent();
                    recordTestResult({
                        deviceName: deviceName,
                        testName: '设备识别测试',
                        success: true,
                        message: "\u6536\u5230\u8BBE\u5907\u6807\u8BC6: ".concat(identResponse)
                    });
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    recordTestResult({
                        deviceName: deviceName,
                        testName: '设备识别测试',
                        success: false,
                        message: '发送识别指令失败',
                        error: error_1
                    });
                    return [3 /*break*/, 6];
                case 6: 
                // 关闭连接
                return [4 /*yield*/, adapter.disconnect()];
                case 7:
                    // 关闭连接
                    _a.sent();
                    recordTestResult({
                        deviceName: deviceName,
                        testName: '断开连接测试',
                        success: true,
                        message: '成功断开连接'
                    });
                    return [3 /*break*/, 9];
                case 8:
                    error_2 = _a.sent();
                    recordTestResult({
                        deviceName: deviceName,
                        testName: '基本连接测试',
                        success: false,
                        message: '连接失败',
                        error: error_2
                    });
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// 设备特定命令测试
function testDeviceSpecificCommands(deviceName, config) {
    return __awaiter(this, void 0, void 0, function () {
        var adapter, commands, _i, commands_1, cmd, startTime, response, responseTime, error_3, invalidResponse, error_4, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\n".concat(colors.cyan, "\u6B63\u5728\u6D4B\u8BD5 ").concat(deviceName, " \u7684\u8BBE\u5907\u7279\u5B9A\u6307\u4EE4...").concat(colors.reset));
                    adapter = new simple_tcp_adapter_1.SimpleTCPAdapter({
                        host: 'localhost',
                        port: config.port,
                        delimiter: deviceName === 'MC-3000' ? '\n' : '\r\n',
                        connectionTimeout: config.connectionTimeout || 5000
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 13, , 14]);
                    return [4 /*yield*/, adapter.connect()];
                case 2:
                    _a.sent();
                    commands = [];
                    switch (deviceName) {
                        case 'GX-5000':
                            commands = ['MEAS:VOLT:DC?', 'MEAS:CURR:DC?', 'MEAS:RES?'];
                            break;
                        case 'OS-2500':
                            commands = ['MEAS:WAVE?', 'MEAS:POWER?', 'MEAS:SPEC?'];
                            break;
                        case 'MC-3000':
                            commands = ['READ:TEMP?', 'READ:HUMID?', 'READ:PRESS?', 'STATUS?'];
                            break;
                        case 'CH-7000':
                            commands = ['ANALYZE:PH?', 'ANALYZE:CONDUCTIVITY?', 'ANALYZE:OXYGEN?', 'CALIBRATION:STATUS?'];
                            break;
                        case 'TH-1200':
                            commands = ['GET:TEMP?', 'GET:SETPOINT?', 'GET:POWER?', 'GET:STATUS?'];
                            break;
                        default:
                            commands = [];
                    }
                    _i = 0, commands_1 = commands;
                    _a.label = 3;
                case 3:
                    if (!(_i < commands_1.length)) return [3 /*break*/, 8];
                    cmd = commands_1[_i];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    startTime = Date.now();
                    return [4 /*yield*/, adapter.sendCommand(cmd)];
                case 5:
                    response = _a.sent();
                    responseTime = Date.now() - startTime;
                    recordTestResult({
                        deviceName: deviceName,
                        testName: "\u547D\u4EE4\u6D4B\u8BD5: ".concat(cmd),
                        success: true,
                        message: "\u54CD\u5E94: ".concat(response, " (").concat(responseTime, "ms)"),
                        responseTime: responseTime
                    });
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    recordTestResult({
                        deviceName: deviceName,
                        testName: "\u547D\u4EE4\u6D4B\u8BD5: ".concat(cmd),
                        success: false,
                        message: '命令执行失败',
                        error: error_3
                    });
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    _a.trys.push([8, 10, , 11]);
                    return [4 /*yield*/, adapter.sendCommand('INVALID_COMMAND')];
                case 9:
                    invalidResponse = _a.sent();
                    recordTestResult({
                        deviceName: deviceName,
                        testName: '无效命令测试',
                        success: true,
                        message: "\u6536\u5230\u9519\u8BEF\u54CD\u5E94: ".concat(invalidResponse)
                    });
                    return [3 /*break*/, 11];
                case 10:
                    error_4 = _a.sent();
                    recordTestResult({
                        deviceName: deviceName,
                        testName: '无效命令测试',
                        success: true, // 抛出错误也是期望的行为
                        message: '设备正确拒绝了无效命令'
                    });
                    return [3 /*break*/, 11];
                case 11: 
                // 关闭连接
                return [4 /*yield*/, adapter.disconnect()];
                case 12:
                    // 关闭连接
                    _a.sent();
                    return [3 /*break*/, 14];
                case 13:
                    error_5 = _a.sent();
                    recordTestResult({
                        deviceName: deviceName,
                        testName: '设备特定命令测试',
                        success: false,
                        message: '连接失败',
                        error: error_5
                    });
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
// 生成测试报告
function generateTestReport() {
    var totalTests = testResults.length;
    var passedTests = testResults.filter(function (r) { return r.success; }).length;
    var failedTests = totalTests - passedTests;
    var successRate = (passedTests / totalTests * 100).toFixed(2);
    console.log("\n".concat(colors.bright).concat(colors.cyan, "========== \u6D4B\u8BD5\u62A5\u544A ==========").concat(colors.reset));
    console.log("".concat(colors.cyan, "\u603B\u6D4B\u8BD5\u6570: ").concat(totalTests).concat(colors.reset));
    console.log("".concat(colors.green, "\u901A\u8FC7: ").concat(passedTests).concat(colors.reset));
    console.log("".concat(colors.red, "\u5931\u8D25: ").concat(failedTests).concat(colors.reset));
    console.log("".concat(colors.cyan, "\u6210\u529F\u7387: ").concat(successRate, "%").concat(colors.reset));
    // 按设备分组
    var deviceResults = new Map();
    testResults.forEach(function (result) {
        if (!deviceResults.has(result.deviceName)) {
            deviceResults.set(result.deviceName, { total: 0, passed: 0 });
        }
        var stats = deviceResults.get(result.deviceName);
        stats.total++;
        if (result.success)
            stats.passed++;
    });
    console.log("\n".concat(colors.cyan, "\u5404\u8BBE\u5907\u6D4B\u8BD5\u7ED3\u679C:").concat(colors.reset));
    deviceResults.forEach(function (stats, deviceName) {
        var deviceSuccessRate = (stats.passed / stats.total * 100).toFixed(2);
        var statusColor = stats.passed === stats.total ? colors.green : colors.yellow;
        console.log("".concat(statusColor).concat(deviceName, ": ").concat(stats.passed, "/").concat(stats.total, " (").concat(deviceSuccessRate, "%)").concat(colors.reset));
    });
    // 保存报告到文件
    var reportDate = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    var reportPath = path.join(__dirname, '..', 'tests', 'reports', "simulator-test-".concat(reportDate, ".json"));
    // 确保报告目录存在
    var reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        summary: {
            totalTests: totalTests,
            passedTests: passedTests,
            failedTests: failedTests,
            successRate: parseFloat(successRate)
        },
        deviceResults: Array.from(deviceResults.entries()).map(function (_a) {
            var name = _a[0], stats = _a[1];
            return ({
                deviceName: name,
                totalTests: stats.total,
                passedTests: stats.passed,
                failedTests: stats.total - stats.passed,
                successRate: parseFloat((stats.passed / stats.total * 100).toFixed(2))
            });
        }),
        detailedResults: testResults
    }, null, 2));
    console.log("\n".concat(colors.green, "\u6D4B\u8BD5\u62A5\u544A\u5DF2\u4FDD\u5B58\u81F3: ").concat(reportPath).concat(colors.reset));
}
// 主测试函数
function runTests() {
    return __awaiter(this, void 0, void 0, function () {
        var simulatedDevices, _i, simulatedDevices_1, device, config;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("".concat(colors.bright).concat(colors.blue, "==========================================").concat(colors.reset));
                    console.log("".concat(colors.bright).concat(colors.blue, "    TCP/Socket\u534F\u8BAE\u9002\u914D\u5668\u6A21\u62DF\u8BBE\u5907\u96C6\u6210\u6D4B\u8BD5    ").concat(colors.reset));
                    console.log("".concat(colors.bright).concat(colors.blue, "==========================================").concat(colors.reset));
                    console.log("".concat(colors.cyan, "\u5F00\u59CB\u65F6\u95F4: ").concat(new Date().toLocaleString()).concat(colors.reset, "\n"));
                    simulatedDevices = getSimulatedDevices();
                    if (simulatedDevices.length === 0) {
                        console.log("".concat(colors.yellow, "\u8B66\u544A: \u672A\u627E\u5230\u4EFB\u4F55\u6A21\u62DF\u8BBE\u5907\u914D\u7F6E").concat(colors.reset));
                        console.log("".concat(colors.yellow, "\u8BF7\u786E\u4FDD\u6A21\u62DF\u5668\u914D\u7F6E\u6587\u4EF6\u4F4D\u4E8E ").concat(path.join(__dirname, 'simulator'), " \u76EE\u5F55\u4E0B").concat(colors.reset));
                        return [2 /*return*/];
                    }
                    console.log("".concat(colors.green, "\u53D1\u73B0 ").concat(simulatedDevices.length, " \u4E2A\u6A21\u62DF\u8BBE\u5907: ").concat(simulatedDevices.map(function (d) { return d.name; }).join(', ')).concat(colors.reset, "\n"));
                    _i = 0, simulatedDevices_1 = simulatedDevices;
                    _a.label = 1;
                case 1:
                    if (!(_i < simulatedDevices_1.length)) return [3 /*break*/, 5];
                    device = simulatedDevices_1[_i];
                    config = getDeviceConfig(device.name);
                    if (!config) {
                        console.log("".concat(colors.yellow, "\u8DF3\u8FC7\u8BBE\u5907 ").concat(device.name, ": \u672A\u627E\u5230\u914D\u7F6E").concat(colors.reset));
                        return [3 /*break*/, 4];
                    }
                    // 更新配置以连接到模拟器
                    config.host = device.host;
                    config.port = device.port;
                    console.log("".concat(colors.cyan, "====== \u5F00\u59CB\u6D4B\u8BD5\u8BBE\u5907: ").concat(device.name, " ======").concat(colors.reset));
                    // 运行基础连接测试
                    return [4 /*yield*/, testBasicConnection(device.name, config)];
                case 2:
                    // 运行基础连接测试
                    _a.sent();
                    // 运行设备特定命令测试
                    return [4 /*yield*/, testDeviceSpecificCommands(device.name, config)];
                case 3:
                    // 运行设备特定命令测试
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 1];
                case 5:
                    // 生成测试报告
                    generateTestReport();
                    console.log("\n".concat(colors.cyan, "\u6D4B\u8BD5\u5B8C\u6210\u65F6\u95F4: ").concat(new Date().toLocaleString()).concat(colors.reset));
                    console.log("".concat(colors.bright).concat(colors.blue, "==========================================").concat(colors.reset));
                    return [2 /*return*/];
            }
        });
    });
}
// 运行测试
runTests().catch(function (error) {
    console.error("".concat(colors.red, "\u6D4B\u8BD5\u6267\u884C\u8FC7\u7A0B\u4E2D\u53D1\u751F\u9519\u8BEF:").concat(colors.reset), error);
    process.exit(1);
});
