#!/bin/bash
# 运行设备注册服务测试

# 进入后端目录
cd ../src/backend

# 编译TypeScript文件
echo "编译TypeScript文件..."
npm run build

# 运行测试
echo "运行设备注册服务测试..."
node ./dist/test/device-registration-test.js

echo "测试完成！"
