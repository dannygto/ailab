"use strict";
/**
 * AI模型配置测试脚本
 * 验证31个模型配置的完整性和正确性
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testModelConfigurations = testModelConfigurations;
const ai_service_1 = require("./src/services/ai.service");
// 模拟配置用于测试
const testConfigs = {
    // OpenAI测试配置
    'gpt-4o': { selectedModel: 'gpt-4o', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'gpt-4-turbo': { selectedModel: 'gpt-4-turbo', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'gpt-3.5-turbo': { selectedModel: 'gpt-3.5-turbo', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // Anthropic测试配置
    'claude-3-5-sonnet': { selectedModel: 'claude-3-5-sonnet', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'claude-3-opus': { selectedModel: 'claude-3-opus', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'claude-3-haiku': { selectedModel: 'claude-3-haiku', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // DeepSeek测试配置
    'deepseek-v3': { selectedModel: 'deepseek-v3', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'deepseek-coder': { selectedModel: 'deepseek-coder', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'deepseek-chat': { selectedModel: 'deepseek-chat', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // 智谱GLM测试配置
    'glm-4-plus': { selectedModel: 'glm-4-plus', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'glm-4-0520': { selectedModel: 'glm-4-0520', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'glm-4-long': { selectedModel: 'glm-4-long', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // 火山方舟测试配置
    'doubao-pro-256k': { selectedModel: 'doubao-pro-256k', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'doubao-pro-128k': { selectedModel: 'doubao-pro-128k', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'doubao-pro-32k': { selectedModel: 'doubao-pro-32k', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // 百度文心测试配置（需要client_id:client_secret格式）
    'ernie-4.0-turbo': { selectedModel: 'ernie-4.0-turbo', apiKey: 'test_id:test_secret', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'ernie-4.0': { selectedModel: 'ernie-4.0', apiKey: 'test_id:test_secret', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'ernie-3.5': { selectedModel: 'ernie-3.5', apiKey: 'test_id:test_secret', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // 阿里通义测试配置
    'qwen-max': { selectedModel: 'qwen-max', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'qwen-plus': { selectedModel: 'qwen-plus', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'qwen-turbo': { selectedModel: 'qwen-turbo', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // 月之暗面测试配置
    'moonshot-v1-128k': { selectedModel: 'moonshot-v1-128k', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'moonshot-v1-32k': { selectedModel: 'moonshot-v1-32k', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'moonshot-v1-8k': { selectedModel: 'moonshot-v1-8k', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // 讯飞星火测试配置
    'spark-max': { selectedModel: 'spark-max', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'spark-pro': { selectedModel: 'spark-pro', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'spark-lite': { selectedModel: 'spark-lite', apiKey: 'test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // 腾讯混元测试配置（需要secret_id:secret_key格式）
    'hunyuan-pro': { selectedModel: 'hunyuan-pro', apiKey: 'test_id:test_key', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'hunyuan-standard': { selectedModel: 'hunyuan-standard', apiKey: 'test_id:test_key', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    'hunyuan-lite': { selectedModel: 'hunyuan-lite', apiKey: 'test_id:test_key', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test' },
    // 自定义OpenAI兼容测试配置
    'custom-openai': { selectedModel: 'custom-openai', apiKey: 'sk-test123', temperature: 0.7, maxTokens: 1000, systemPrompt: 'Test', customEndpoint: 'https://api.example.com/v1/chat/completions' }
};
async function testModelConfigurations() {
    console.log('🧪 开始测试AI模型配置...');
    console.log('============================================');
    const totalModels = Object.keys(ai_service_1.AI_MODEL_CONFIGS).length;
    let configuredModels = 0;
    let errors = [];
    // 按厂商分组统计
    const providerStats = {};
    for (const [modelId, modelConfig] of Object.entries(ai_service_1.AI_MODEL_CONFIGS)) {
        console.log(`\n📋 测试模型: ${modelId}`);
        console.log(`   厂商: ${modelConfig.provider}`);
        console.log(`   名称: ${modelConfig.name}`);
        console.log(`   端点: ${modelConfig.endpoint}`);
        try {
            // 检查配置完整性
            if (!modelConfig.provider || !modelConfig.name || !modelConfig.endpoint) {
                throw new Error('模型配置不完整：缺少provider、name或endpoint');
            }
            if (!modelConfig.headers || typeof modelConfig.headers !== 'function') {
                throw new Error('模型配置不完整：缺少headers函数');
            }
            if (!modelConfig.buildRequest || typeof modelConfig.buildRequest !== 'function') {
                throw new Error('模型配置不完整：缺少buildRequest函数');
            }
            if (!modelConfig.parseResponse || typeof modelConfig.parseResponse !== 'function') {
                throw new Error('模型配置不完整：缺少parseResponse函数');
            }
            // 测试配置函数调用
            const testConfig = testConfigs[modelId];
            if (!testConfig) {
                throw new Error('缺少测试配置');
            }
            // 测试headers函数
            const headers = modelConfig.headers(testConfig.apiKey);
            if (!headers || typeof headers !== 'object') {
                throw new Error('headers函数返回无效');
            }
            // 测试buildRequest函数
            const testMessages = [{ role: 'user', content: 'test' }];
            const request = modelConfig.buildRequest(testMessages, testConfig);
            if (!request || typeof request !== 'object') {
                throw new Error('buildRequest函数返回无效');
            }
            // 统计厂商
            if (!providerStats[modelConfig.provider]) {
                providerStats[modelConfig.provider] = 0;
            }
            providerStats[modelConfig.provider]++;
            configuredModels++;
            console.log(`   ✅ 配置验证通过`);
        }
        catch (error) {
            console.log(`   ❌ 配置错误: ${error.message}`);
            errors.push(`${modelId}: ${error.message}`);
        }
    }
    console.log('\n============================================');
    console.log('🎯 测试结果总结:');
    console.log(`   总模型数: ${totalModels}`);
    console.log(`   配置正确: ${configuredModels}`);
    console.log(`   配置错误: ${totalModels - configuredModels}`);
    console.log('\n📊 厂商分布:');
    for (const [provider, count] of Object.entries(providerStats)) {
        console.log(`   ${provider}: ${count}个模型`);
    }
    if (errors.length > 0) {
        console.log('\n❌ 错误详情:');
        errors.forEach(error => console.log(`   - ${error}`));
    }
    // 验证是否为10厂商各3模型+1自定义
    const expectedProviders = [
        'OpenAI', 'Anthropic', 'DeepSeek', '智谱GLM', '火山方舟',
        '百度文心', '阿里通义', '月之暗面', '讯飞星火', '腾讯混元'
    ];
    console.log('\n🔍 规格验证:');
    const actualProviders = Object.keys(providerStats).filter(p => p !== '自定义OpenAI兼容');
    const hasCustom = providerStats['自定义OpenAI兼容'] === 1;
    if (actualProviders.length === 10 && hasCustom && totalModels === 31) {
        console.log('   ✅ 符合规格要求: 10厂商各3模型 + 1自定义模型 = 31模型');
    }
    else {
        console.log('   ❌ 不符合规格要求:');
        console.log(`      期望: 10厂商各3模型 + 1自定义 = 31模型`);
        console.log(`      实际: ${actualProviders.length}厂商 + ${hasCustom ? 1 : 0}自定义 = ${totalModels}模型`);
    }
    // 检查每个厂商是否都有3个模型
    for (const provider of expectedProviders) {
        const count = providerStats[provider] || 0;
        if (count === 3) {
            console.log(`   ✅ ${provider}: ${count}个模型 (符合TOP3要求)`);
        }
        else {
            console.log(`   ❌ ${provider}: ${count}个模型 (不符合TOP3要求)`);
        }
    }
    console.log('\n🎉 测试完成!');
    return { totalModels, configuredModels, errors: errors.length };
}
// 运行测试
if (require.main === module) {
    testModelConfigurations()
        .then(result => {
        if (result.errors === 0) {
            console.log('\n🎊 所有模型配置验证通过！');
            process.exit(0);
        }
        else {
            console.log('\n💥 发现配置错误，请修复后重试。');
            process.exit(1);
        }
    })
        .catch(error => {
        console.error('\n💥 测试过程出现异常:', error);
        process.exit(1);
    });
}
