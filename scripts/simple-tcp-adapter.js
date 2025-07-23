"use strict";
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
exports.SimpleTCPAdapter = void 0;
var net = __importStar(require("net"));
// 简化的TCP客户端适配器接口
var SimpleTCPAdapter = /** @class */ (function () {
    function SimpleTCPAdapter(config) {
        this.config = config;
        this.socket = null;
        this.buffer = '';
        this.delimiter = '\r\n';
        this.connected = false;
        if (config.delimiter) {
            this.delimiter = config.delimiter;
        }
    }
    SimpleTCPAdapter.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // 清除之前的连接
                        if (_this.socket) {
                            _this.socket.destroy();
                            _this.socket = null;
                        }
                        _this.socket = new net.Socket();
                        var timeout = _this.config.connectionTimeout || 5000;
                        // 设置连接超时
                        var connectTimeout = setTimeout(function () {
                            if (_this.socket) {
                                _this.socket.destroy();
                                reject(new Error("\u8FDE\u63A5\u8D85\u65F6 (".concat(timeout, "ms)")));
                            }
                        }, timeout);
                        // 连接事件处理
                        _this.socket.on('connect', function () {
                            clearTimeout(connectTimeout);
                            _this.connected = true;
                            resolve();
                        });
                        _this.socket.on('error', function (err) {
                            clearTimeout(connectTimeout);
                            _this.connected = false;
                            reject(err);
                        });
                        _this.socket.on('close', function () {
                            _this.connected = false;
                        });
                        // 数据接收处理
                        _this.socket.on('data', function (data) {
                            _this.buffer += data.toString();
                        });
                        // 连接到服务器
                        _this.socket.connect({
                            host: _this.config.host,
                            port: _this.config.port
                        });
                    })];
            });
        });
    };
    SimpleTCPAdapter.prototype.sendCommand = function (command_1) {
        return __awaiter(this, arguments, void 0, function (command, timeout) {
            var _this = this;
            if (timeout === void 0) { timeout = 5000; }
            return __generator(this, function (_a) {
                if (!this.socket || !this.connected) {
                    throw new Error('未连接到设备');
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // 清除之前的缓冲区
                        _this.buffer = '';
                        // 设置命令超时
                        var commandTimeout = setTimeout(function () {
                            reject(new Error("\u547D\u4EE4\u8D85\u65F6 (".concat(timeout, "ms)")));
                        }, timeout);
                        // 设置响应处理器
                        var responseHandler = function () {
                            // 检查是否包含命令分隔符
                            if (_this.buffer.includes(_this.delimiter)) {
                                clearTimeout(commandTimeout);
                                var response = _this.buffer.split(_this.delimiter)[0].trim();
                                _this.buffer = _this.buffer.substring(response.length + _this.delimiter.length);
                                resolve(response);
                            }
                            else {
                                setTimeout(responseHandler, 10);
                            }
                        };
                        // 开始监听响应
                        responseHandler();
                        // 发送命令
                        if (_this.socket) {
                            _this.socket.write(command + _this.delimiter, function (err) {
                                if (err) {
                                    clearTimeout(commandTimeout);
                                    reject(err);
                                    return;
                                }
                                // 开始处理响应
                                responseHandler();
                            });
                        }
                        else {
                            clearTimeout(commandTimeout);
                            reject(new Error('Socket不可用'));
                        }
                    })];
            });
        });
    };
    SimpleTCPAdapter.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        if (_this.socket) {
                            _this.socket.end(function () {
                                _this.socket = null;
                                _this.connected = false;
                                resolve();
                            });
                        }
                        else {
                            resolve();
                        }
                    })];
            });
        });
    };
    return SimpleTCPAdapter;
}());
exports.SimpleTCPAdapter = SimpleTCPAdapter;
