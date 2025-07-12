"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 默认设置
const defaultSettings = {
    general: {
        siteName: 'AICAM系统',
        logoUrl: '/assets/logo.png',
        companyName: '智能实验教学系统',
        contactEmail: 'support@aicam.example.com',
        contactPhone: '010-12345678',
        language: 'zh-CN',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: 'HH:mm:ss',
    },
    theme: {
        primaryColor: '#1976d2',
        secondaryColor: '#dc004e',
        darkMode: false,
        fontSize: 'medium',
        fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
        density: 'standard',
        borderRadius: '4px',
        customCss: '',
    },
    data: {
        defaultPageSize: 10,
        maxUploadSize: 50, // MB
        backupFrequency: 'daily',
        dataRetentionDays: 90,
        autoRefresh: true,
        refreshInterval: 30, // 秒
        showAnimations: true,
    },
};
// 存储当前设置
let currentSettings = { ...defaultSettings };
/**
 * 系统设置控制器
 * 处理系统设置相关的API请求
 */
class SystemSettingsController {
    constructor() {
        /**
         * 获取通用设置
         */
        this.getGeneralSettings = async (req, res) => {
            try {
                res.status(200).json({
                    success: true,
                    data: currentSettings.general
                });
            }
            catch (error) {
                console.error('获取通用设置失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取通用设置失败'
                });
            }
        };
        /**
         * 更新通用设置
         */
        this.updateGeneralSettings = async (req, res) => {
            try {
                const updatedSettings = req.body;
                // 验证必要字段
                if (!updatedSettings) {
                    res.status(400).json({
                        success: false,
                        error: '设置数据不能为空'
                    });
                    return;
                }
                // 更新设置
                currentSettings.general = {
                    ...currentSettings.general,
                    ...updatedSettings
                };
                res.status(200).json({
                    success: true,
                    data: currentSettings.general
                });
            }
            catch (error) {
                console.error('更新通用设置失败:', error);
                res.status(500).json({
                    success: false,
                    error: '更新通用设置失败'
                });
            }
        };
        /**
         * 获取主题设置
         */
        this.getThemeSettings = async (req, res) => {
            try {
                res.status(200).json({
                    success: true,
                    data: currentSettings.theme
                });
            }
            catch (error) {
                console.error('获取主题设置失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取主题设置失败'
                });
            }
        };
        /**
         * 更新主题设置
         */
        this.updateThemeSettings = async (req, res) => {
            try {
                const updatedSettings = req.body;
                // 验证必要字段
                if (!updatedSettings) {
                    res.status(400).json({
                        success: false,
                        error: '设置数据不能为空'
                    });
                    return;
                }
                // 更新设置
                currentSettings.theme = {
                    ...currentSettings.theme,
                    ...updatedSettings
                };
                res.status(200).json({
                    success: true,
                    data: currentSettings.theme
                });
            }
            catch (error) {
                console.error('更新主题设置失败:', error);
                res.status(500).json({
                    success: false,
                    error: '更新主题设置失败'
                });
            }
        };
        /**
         * 获取数据设置
         */
        this.getDataSettings = async (req, res) => {
            try {
                res.status(200).json({
                    success: true,
                    data: currentSettings.data
                });
            }
            catch (error) {
                console.error('获取数据设置失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取数据设置失败'
                });
            }
        };
        /**
         * 更新数据设置
         */
        this.updateDataSettings = async (req, res) => {
            try {
                const updatedSettings = req.body;
                // 验证必要字段
                if (!updatedSettings) {
                    res.status(400).json({
                        success: false,
                        error: '设置数据不能为空'
                    });
                    return;
                }
                // 更新设置
                currentSettings.data = {
                    ...currentSettings.data,
                    ...updatedSettings
                };
                res.status(200).json({
                    success: true,
                    data: currentSettings.data
                });
            }
            catch (error) {
                console.error('更新数据设置失败:', error);
                res.status(500).json({
                    success: false,
                    error: '更新数据设置失败'
                });
            }
        };
        /**
         * 重置所有设置
         */
        this.resetAllSettings = async (req, res) => {
            try {
                // 重置为默认设置
                currentSettings = { ...defaultSettings };
                res.status(200).json({
                    success: true,
                    data: currentSettings
                });
            }
            catch (error) {
                console.error('重置设置失败:', error);
                res.status(500).json({
                    success: false,
                    error: '重置设置失败'
                });
            }
        };
        /**
         * 获取所有设置
         */
        this.getAllSettings = async (req, res) => {
            try {
                res.status(200).json({
                    success: true,
                    data: currentSettings
                });
            }
            catch (error) {
                console.error('获取所有设置失败:', error);
                res.status(500).json({
                    success: false,
                    error: '获取所有设置失败'
                });
            }
        };
    }
}
exports.default = new SystemSettingsController();
