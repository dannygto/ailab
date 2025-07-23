# AILAB平台前端组件文档

## UI组件库概述

AILAB平台前端UI组件库为开发者提供了一套统一的、可复用的UI组件，用于构建一致的用户界面。该组件库基于Material UI构建，并添加了特定于AILAB平台的定制组件和功能。

## 核心组件

### 数据展示组件

#### LoadingState
用于处理数据加载状态的统一组件，包括加载中、错误状态、空数据状态的处理。

```jsx
import LoadingState from '../components/common/ui/LoadingState';

// 基本用法
<LoadingState
  loading={isLoading}
  error={error?.message}
  isEmpty={!data || data.length === 0}
  emptyMessage="暂无数据"
  onRetry={handleRefresh}
>
  {/* 正常内容显示区域 */}
  <YourComponent data={data} />
</LoadingState>

// 高级用法 - 带骨架屏
<LoadingState
  loading={isLoading}
  error={error?.message}
  isEmpty={!data || data.length === 0}
  emptyMessage="暂无数据"
  onRetry={handleRefresh}
  skeletonProps={{ type: 'card', rows: 3 }}
>
  {/* 正常内容显示区域 */}
  <YourComponent data={data} />
</LoadingState>
```

#### SkeletonLoader
提供不同类型的骨架屏加载效果。

```jsx
import SkeletonLoader from '../components/common/ui/SkeletonLoader';

// 表格骨架屏
<SkeletonLoader type="table" rows={5} />

// 卡片骨架屏
<SkeletonLoader type="card" rows={3} />

// 列表骨架屏
<SkeletonLoader type="list" rows={8} />

// 详情骨架屏
<SkeletonLoader type="detail" showTitle={true} />
```

#### DataContainer
数据容器组件，提供统一的数据展示容器，包含标题、刷新功能等。

```jsx
import DataContainer from '../components/common/ui/DataContainer';

<DataContainer 
  title="系统状态" 
  showRefresh={true} 
  onRefresh={handleRefresh}
  loading={isLoading}
>
  <YourDataComponent />
</DataContainer>
```

#### StatusBadge
显示状态徽章，用于表示不同的状态。

```jsx
import StatusBadge from '../components/common/StatusBadge';

<StatusBadge status="active" />  // 显示"活跃"状态徽章
<StatusBadge status="error" />   // 显示"错误"状态徽章
<StatusBadge status="warning" /> // 显示"警告"状态徽章
<StatusBadge status="inactive" /> // 显示"不活跃"状态徽章
```

### 表单组件

#### EnhancedForm
增强的表单组件，提供实时验证、表单状态保存和智能提示。

```jsx
import { FormProvider } from '../hooks/FormContext';
import { useForm, useFormField } from '../hooks/useForm';

const MyForm = () => {
  const handleSubmit = (values) => {
    console.log('表单提交:', values);
  };

  return (
    <FormProvider
      initialValues={{ name: '', email: '' }}
      onSubmit={handleSubmit}
    >
      <FormContent />
    </FormProvider>
  );
};

const FormContent = () => {
  const { submitForm, resetForm } = useForm();
  const { 
    value: name,
    setValue: setName,
    error: nameError
  } = useFormField('name', '', (value) => {
    if (!value) return '请输入名称';
    return null;
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); submitForm(); }}>
      <TextField
        label="名称"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={!!nameError}
        helperText={nameError}
      />
      <Button type="submit">提交</Button>
      <Button onClick={resetForm}>重置</Button>
    </form>
  );
};
```

### 交互组件

#### ConfirmDialog
确认对话框，用于用户进行确认操作。

```jsx
import ConfirmDialog from '../components/common/ui/ConfirmDialog';

const [open, setOpen] = useState(false);

<ConfirmDialog
  open={open}
  title="confirm.delete"
  content="confirm.deleteMessage"
  onConfirm={handleDelete}
  onCancel={() => setOpen(false)}
  confirmButtonColor="error"
/>

<Button onClick={() => setOpen(true)}>删除</Button>
```

#### Toast
统一的消息提示组件。

```jsx
import Toast from '../components/common/ui/Toast';
// 或者使用提供的Hook
import { useToast } from '../components/common/providers/ToastProvider';

// 直接使用组件
const [open, setOpen] = useState(false);

<Toast
  open={open}
  message="操作成功"
  severity="success"
  onClose={() => setOpen(false)}
  duration={3000}
/>

// 使用Hook (推荐)
const { showSuccess, showError } = useToast();

const handleOperation = async () => {
  try {
    await saveData();
    showSuccess('保存成功');
  } catch (error) {
    showError('保存失败: ' + error.message);
  }
};
```

### 导航组件

#### PageHeader
页面头部组件，包含标题、副标题、面包屑导航和操作区域。

```jsx
import PageHeader from '../components/common/ui/PageHeader';

<PageHeader
  title="实验管理"
  subtitle="管理和监控所有实验"
  breadcrumbs={[
    { label: 'home', path: '/', useTranslation: true },
    { label: 'experiments', path: '/experiments', useTranslation: true },
    { label: '实验详情', useTranslation: false }
  ]}
  actions={
    <Button variant="contained" color="primary">
      新建实验
    </Button>
  }
/>
```

## 国际化支持

所有组件都支持国际化，使用I18nContext上下文和react-i18next库。

```jsx
// 使用国际化版本的LoadingState
import I18nLoadingState from '../components/common/ui/I18nLoadingState';

<I18nLoadingState
  loading={isLoading}
  error={error?.message}
  isEmpty={!data || data.length === 0}
  emptyMessageKey="common.noData"
  onRetry={handleRefresh}
>
  {/* 正常内容显示区域 */}
  <YourComponent data={data} />
</I18nLoadingState>
```

## 最佳实践

1. **一致性**: 使用提供的UI组件库，确保UI一致性
2. **加载状态**: 所有数据加载操作都应使用LoadingState组件
3. **表单处理**: 使用FormProvider和useForm系列Hooks处理表单逻辑
4. **错误处理**: 使用Toast组件展示错误和成功消息
5. **国际化**: 使用国际化版本的组件和react-i18next的useTranslation钩子

## 贡献指南

如需添加新组件或修改现有组件，请遵循以下规范：

1. 添加完善的JSDoc注释
2. 提供TypeScript类型定义
3. 确保组件支持国际化
4. 编写单元测试
5. 更新本文档

## 更新日志

- **2025-07-22**: 
  - 添加了Toast通知系统
  - 优化了LoadingState组件
  - 添加了表单处理Hooks
  - 添加了DataContainer组件
  - 完善了骨架屏加载效果

- **2025-07-15**:
  - 初始版本发布
  - 添加了基础UI组件
