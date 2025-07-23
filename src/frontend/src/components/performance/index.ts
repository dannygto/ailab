/**
 * 性能优化组件导出索引
 *
 * 这个文件导出所有性能优化相关的组件，包括虚拟列表、虚拟表格和虚拟树等
 * 这些组件专为处理大数据集而设计，可以显著提高渲染性能
 */

// 虚拟列表组件
export { default as VirtualList } from '../common/VirtualList';

// 虚拟数据表格组件
export { default as VirtualDataTable } from '../common/VirtualDataTable';
export type { Column } from '../common/VirtualDataTable';

// 虚拟树组件
export { default as VirtualTree } from '../common/VirtualTree';
export type { TreeNode } from '../common/VirtualTree';

// 示例/演示组件
export { default as VirtualListDemo } from '../examples/VirtualListDemo';
export { default as VirtualDataTableDemo } from '../examples/VirtualDataTableDemo';
export { default as VirtualTreeDemo } from '../examples/VirtualTreeDemo';

// 性能监控工具
export {
  useComponentPerformance,
  useApiPerformance,
  measurePerformance
} from '../../utils/performanceMonitoring';
