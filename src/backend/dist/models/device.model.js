"use strict";
// 仪器设备远程接入系统模型定义
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceConnectionStatus = exports.DeviceType = void 0;
// 设备类型枚举
var DeviceType;
(function (DeviceType) {
    DeviceType["SENSOR"] = "sensor";
    DeviceType["METER"] = "meter";
    DeviceType["MICROSCOPE"] = "microscope";
    DeviceType["SPECTROSCOPE"] = "spectroscope";
    DeviceType["DATALOGGER"] = "datalogger";
    DeviceType["CAMERA"] = "camera";
    DeviceType["CONTROL_UNIT"] = "control_unit";
    DeviceType["OTHER"] = "other";
})(DeviceType || (exports.DeviceType = DeviceType = {}));
// 设备连接状态
var DeviceConnectionStatus;
(function (DeviceConnectionStatus) {
    DeviceConnectionStatus["ONLINE"] = "online";
    DeviceConnectionStatus["OFFLINE"] = "offline";
    DeviceConnectionStatus["CONNECTING"] = "connecting";
    DeviceConnectionStatus["ERROR"] = "error";
    DeviceConnectionStatus["MAINTENANCE"] = "maintenance";
})(DeviceConnectionStatus || (exports.DeviceConnectionStatus = DeviceConnectionStatus = {}));
