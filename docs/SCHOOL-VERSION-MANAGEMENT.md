# AILAB平台版本区分方案总结

## 📋 版本区分设计

### 1. **版本类型**
- **普教版 (general)** - 面向普通中小学
- **职教版 (vocational)** - 面向职业学校  
- **高校版 (higher)** - 面向大学院校

### 2. **区分机制**

#### 🔧 **环境变量配置**
```bash
# 核心环境变量
AILAB_EDITION=general|vocational|higher
AILAB_SCHOOL_ID=demo-school-001
AILAB_SCHOOL_NAME=示范学校
```

#### 📁 **配置文件驱动**
- `config/deployment/edition.config.json` - 版本主配置
- `config/deployment/.env.{edition}` - 环境变量文件
- `config/deployment/ecosystem.{edition}.config.js` - PM2配置
- `src/frontend/public/config/app-config.{edition}.json` - 前端配置

#### 🚀 **部署脚本**
```bash
# 生成版本配置
./scripts/deployment/generate-edition-config.sh general demo-school-001 "示范学校"

# 版本化部署
./scripts/deployment/minimal-fix.sh general demo-school-001 "示范学校"
```

## 🏫 学校信息管理

### 1. **数据结构设计**

#### 基本信息
```typescript
interface SchoolInfo {
  schoolId: string;           // 学校唯一标识
  schoolName: string;         // 学校名称
  schoolType: SchoolType;     // 学校类型
  schoolCode?: string;        // 教育部门编码
  principalName: string;      // 校长姓名（必填）
  establishedYear?: number;   // 建校年份
  // ... 更多字段
}
```

#### 校区管理
```typescript
interface Campus {
  id: string;
  name: string;
  address: string;
  isMain: boolean;           // 主校区标识
  isActive: boolean;         // 激活状态
  // ... 联系信息等
}
```

### 2. **默认主校区机制**
- ✅ 系统自动创建默认主校区
- ✅ 主校区不能为空，不可删除
- ✅ 支持多校区数据隔离
- ✅ 校区切换权限控制

## 🎯 版本特性差异

### 普教版 (General)
```json
{
  "features": [
    "实验管理", "学生管理", "教师管理", "AI助手",
    "设备管理", "数据分析", "校区管理", "课程模板"
  ],
  "limits": {
    "maxStudents": 5000,
    "maxTeachers": 500,
    "maxCampuses": 10
  },
  "theme": { "primaryColor": "#1976d2" }
}
```

### 职教版 (Vocational)
```json
{
  "features": [
    "基础功能 +",
    "实训管理", "技能评估", "企业合作", "认证管理"
  ],
  "limits": {
    "maxStudents": 8000,
    "maxTeachers": 800,
    "maxCampuses": 15
  },
  "theme": { "primaryColor": "#ff9800" }
}
```

### 高校版 (Higher)
```json
{
  "features": [
    "基础功能 +",
    "研究管理", "学术分析", "论文管理", "实验室预约",
    "研究生管理", "协作平台"
  ],
  "limits": {
    "maxStudents": 20000,
    "maxTeachers": 2000,
    "maxCampuses": 20
  },
  "theme": { "primaryColor": "#9c27b0" }
}
```

## 🔐 部署架构

### 1. **单校部署模式**
- 每个学校独立部署一套完整系统
- 数据完全隔离，互不干扰
- 支持学校自定义配置和品牌

### 2. **校区隔离机制**
- 主校区作为默认校区，不可删除
- 分校区数据独立存储
- 用户可切换校区（可配置权限）
- 数据隔离开关可控制

### 3. **版本识别流程**
```
部署时 → 环境变量 → 配置文件 → 前端加载 → UI适配
```

## 📂 文件结构

```
ailab/
├── config/
│   ├── deployment/
│   │   ├── edition.config.json              # 版本主配置
│   │   ├── .env.general                     # 普教版环境变量
│   │   ├── .env.vocational                  # 职教版环境变量
│   │   ├── .env.higher                      # 高校版环境变量
│   │   ├── ecosystem.general.config.js     # 普教版PM2配置
│   │   ├── ecosystem.vocational.config.js  # 职教版PM2配置
│   │   └── ecosystem.higher.config.js      # 高校版PM2配置
│   └── environment/
│       └── edition.config.js               # 运行时版本配置
├── src/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── version.ts               # 前端版本管理
│   │   │   │   └── schoolConfig.ts          # 学校配置管理
│   │   │   └── pages/settings/
│   │   │       └── GeneralSettings.tsx     # 学校信息设置页面
│   │   └── public/config/
│   │       ├── app-config.general.json     # 普教版前端配置
│   │       ├── app-config.vocational.json  # 职教版前端配置
│   │       └── app-config.higher.json      # 高校版前端配置
│   └── backend/
│       └── src/controllers/
│           └── settings.controller.ts       # 后端设置控制器
└── scripts/
    └── deployment/
        ├── generate-edition-config.sh       # 版本配置生成脚本
        └── minimal-fix.sh                   # 主部署脚本
```

## 🚀 快速部署指南

### 1. **普教版部署**
```bash
# 生成配置
./scripts/deployment/generate-edition-config.sh general school-001 "示范小学"

# 部署启动
./scripts/deployment/minimal-fix.sh general school-001 "示范小学"

# 验证部署
curl http://localhost:3001/api/settings/version
```

### 2. **职教版部署**
```bash
# 生成配置
./scripts/deployment/generate-edition-config.sh vocational tech-001 "职业技术学校"

# 部署启动
./scripts/deployment/minimal-fix.sh vocational tech-001 "职业技术学校"
```

### 3. **高校版部署**
```bash
# 生成配置
./scripts/deployment/generate-edition-config.sh higher univ-001 "示范大学"

# 部署启动
./scripts/deployment/minimal-fix.sh higher univ-001 "示范大学"
```

## 📊 管理界面

### 学校信息设置页面功能
- ✅ 基本信息（学校名称、类型、校长等）
- ✅ 联系信息（地址、电话、邮箱等）
- ✅ 品牌形象（Logo、校训、简介等）
- ✅ 校区管理（主校区+分校区）
- ✅ 系统配置（学年、学期、权限等）
- ✅ 版本信息显示

### 数据验证
- ✅ 必填字段验证（学校名称、校长姓名、地址、电话、邮箱）
- ✅ 主校区保证机制（至少一个主校区）
- ✅ 数据格式验证（邮箱、电话、网址等）

## 🔄 同步机制

### 本地 ↔ 远程 ↔ Git 三端同步
1. 本地修改完成 → 测试验证
2. 推送到Git仓库 → 版本控制
3. 远程服务器拉取 → 自动部署

```bash
# 同步脚本示例
git add -A
git commit -m "feat: 完善学校信息管理和版本区分"
git push origin main

# 远程部署
ssh -i ailab.pem ubuntu@82.156.75.232 "cd /home/ubuntu/ailab && git pull && ./scripts/deployment/minimal-fix.sh general demo-school-001 '示范学校'"
```

## ✅ 完成状态

### 已完成 ✅
- [x] 版本区分机制设计
- [x] 学校信息数据结构
- [x] 前端设置页面重构
- [x] 后端API支持
- [x] 默认主校区机制
- [x] 配置文件生成脚本
- [x] 部署脚本集成
- [x] 文档完善

### 待优化 🔄
- [ ] 前端UI进一步美化
- [ ] 校区管理功能完善（添加/编辑/删除校区界面）
- [ ] 版本切换功能（如果需要）
- [ ] 数据库持久化存储
- [ ] 用户权限与校区关联
- [ ] 批量数据导入导出

## 💡 核心优势

1. **清晰的版本区分** - 通过环境变量和配置文件实现
2. **以学校为单位** - 独立部署，数据隔离
3. **默认主校区** - 确保基础功能正常运行
4. **灵活的校区管理** - 支持多校区和数据隔离
5. **统一的部署流程** - 一套脚本支持所有版本
6. **完整的文档支持** - 每个版本都有详细说明

这个方案确保了系统的可扩展性、可维护性，并且符合教育行业的实际需求。
