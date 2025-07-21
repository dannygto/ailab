"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceConnectionStatus = exports.DeviceType = void 0;
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
var DeviceConnectionStatus;
(function (DeviceConnectionStatus) {
    DeviceConnectionStatus["ONLINE"] = "online";
    DeviceConnectionStatus["OFFLINE"] = "offline";
    DeviceConnectionStatus["CONNECTING"] = "connecting";
    DeviceConnectionStatus["ERROR"] = "error";
    DeviceConnectionStatus["MAINTENANCE"] = "maintenance";
})(DeviceConnectionStatus || (exports.DeviceConnectionStatus = DeviceConnectionStatus = {}));
//# sourceMappingURL=device.model.js.map