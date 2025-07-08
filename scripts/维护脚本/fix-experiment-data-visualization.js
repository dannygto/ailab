const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/src/components/domain/experiments/ExperimentDataVisualization.tsx');

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the main structure issues
  content = content.replace(
    /if \(isLoading\) \{\s*return \(\s*<React\.Fragment>\s*<Box sx=\{\{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height \}\}>\s*<CircularProgress \/>\s*<\/Box>\s*\);\s*\}/,
    `if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: height }}>
        <CircularProgress />
      </Box>
    );
  }`
  );

  // Fix broken IconButton and Tooltip structure
  content = content.replace(
    /<IconButton onClick={handleRefreshIcon} disabled={RefreshIconing}>\s*<RefreshIcon \/>\s*<\/Box>\s*<\/Tooltip>/g,
    `<IconButton onClick={handleRefreshIcon} disabled={RefreshIconing}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>`
  );

  content = content.replace(
    /<IconButton onClick={handleExportData} disabled={isEmptyData}>\s*<DownloadIcon \/>\s*<\/Tooltip>\s*<\/Tooltip>/g,
    `<IconButton onClick={handleExportData} disabled={isEmptyData}>
                  <DownloadIcon />
                </IconButton>
              </Tooltip>`
  );

  content = content.replace(
    /<IconButton onClick=\{\(\) => setShowsettings\(!showsettings\)\}>\s*<SettingsIcon \/>\s*<\/Tooltip>\s*<\/Tooltip>/g,
    `<IconButton onClick={() => setShowsettings(!showsettings)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>`
  );

  // Fix ToggleButton structure
  content = content.replace(
    /<Tooltip title="����ͼ">\s*<ShowChartIcon fontSize="small" \/>\s*<\/Divider>/g,
    `<Tooltip title="折线图">
                <ShowChartIcon fontSize="small" />
              </Tooltip>`
  );

  content = content.replace(
    /<Tooltip title="��״ͼ">\s*<BarChartIcon fontSize="small" \/>\s*<\/ToggleButton>/g,
    `<Tooltip title="柱状图">
                <BarChartIcon fontSize="small" />
              </Tooltip>`
  );

  content = content.replace(
    /<Tooltip title="��ͼ">\s*<PieChartIcon fontSize="small" \/>\s*<\/ToggleButton>/g,
    `<Tooltip title="饼图">
                <PieChartIcon fontSize="small" />
              </Tooltip>`
  );

  content = content.replace(
    /<Tooltip title="ɢ��ͼ">\s*<BubbleChartIcon fontSize="small" \/>\s*<\/ToggleButton>/g,
    `<Tooltip title="散点图">
                <BubbleChartIcon fontSize="small" />
              </Tooltip>`
  );

  // Fix FormControl and InputLabel structure
  content = content.replace(
    /<InputLabel>ʱ�䷶Χ<\/FormControl>/g,
    '<InputLabel>时间范围</InputLabel>'
  );

  content = content.replace(
    /<MenuItem value="complete">ȫ������<\/Select>/g,
    '<MenuItem value="complete">全部数据</MenuItem>'
  );

  content = content.replace(/�����/g, '选择');
  content = content.replace(/ʱ�䷶Χ/g, '时间范围');
  content = content.replace(/ȫ������/g, '全部数据');
  content = content.replace(/��������/g, '导出数据');
  content = content.replace(/ͼ������/g, '图表设置');
  content = content.replace(/ˢ������/g, '刷新数据');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed ExperimentDataVisualization.tsx structure issues');
} catch (error) {
  console.error('Error fixing file:', error);
}
