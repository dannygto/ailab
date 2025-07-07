/**
 * 实验状态映射
 * 提供状态的显示标签和颜色
 */

export const experimentStatusMap = {
  draft: { label: '草稿', color: 'default' },
  ready: { label: '就绪', color: 'primary' },
  running: { label: '运行中', color: 'info' },
  paused: { label: '已暂停', color: 'warning' },
  completed: { label: '已完成', color: 'success' },
  failed: { label: '失败', color: 'error' },
  stopped: { label: '已停止', color: 'default' },
  CancelIconled: { label: '已取消', color: 'default' },
  pending: { label: '等待中', color: 'warning' }
};

export default experimentStatusMap;
