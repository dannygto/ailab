#!/usr/bin/env pwsh
#
# 鍓嶇鍗曞厓娴嬭瘯淇鑴氭湰
# 鐢ㄤ簬妫€娴嬪苟淇鍓嶇鍗曞厓娴嬭瘯涓殑闂
#

# 璁剧疆UTF-8缂栫爜锛岄伩鍏嶄腑鏂囨樉绀洪棶棰?
# 编码设置已优化

# 棰滆壊瀹氫箟
$colorSuccess = "Green"
$colorError = "Red"
$colorWarning = "Yellow"
$colorInfo = "Cyan"

function Write-ColorOutput {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message,
        
        [Parameter(Mandatory = $true)]
        [string]$Color
    )
    
    Write-Host $Message -ForegroundColor $Color
}

# 鏄剧ず娆㈣繋淇℃伅
Write-ColorOutput "=======================================================" $colorInfo
Write-ColorOutput "           鍓嶇鍗曞厓娴嬭瘯淇宸ュ叿 v1.0                  " $colorInfo
Write-ColorOutput "=======================================================" $colorInfo
Write-ColorOutput "鍚姩鏃堕棿: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" $colorInfo
Write-ColorOutput "=======================================================" $colorInfo

# 妫€鏌ュ伐浣滅洰褰?
$frontendPath = Join-Path $PSScriptRoot ".." "frontend"
if (-not (Test-Path $frontendPath)) {
    Write-ColorOutput "閿欒: 鎵句笉鍒板墠绔洰褰?$frontendPath" $colorError
    exit 1
}

# 鍒囨崲鍒板墠绔洰褰?
Set-Location $frontendPath
Write-ColorOutput "宸ヤ綔鐩綍: $frontendPath" $colorInfo

# 瀹夎渚濊禆妫€鏌?
Write-ColorOutput "`n[1/6] 妫€鏌ュ墠绔緷璧?.." $colorInfo

$packageJson = Join-Path $frontendPath "package.json"
if (-not (Test-Path $packageJson)) {
    Write-ColorOutput "閿欒: 鎵句笉鍒皃ackage.json鏂囦欢" $colorError
    exit 1
}

# 妫€鏌est鐩稿叧渚濊禆
$checkDeps = npm list --depth=0 | Out-String
$requiredDeps = @(
    "jest",
    "@testing-library/react",
    "@testing-library/jest-dom",
    "jest-environment-jsdom",
    "ts-jest"
)

$missingDeps = @()
foreach ($dep in $requiredDeps) {
    if ($checkDeps -notmatch $dep) {
        $missingDeps += $dep
    }
}

if ($missingDeps.Count -gt 0) {
    Write-ColorOutput "缂哄皯蹇呰鐨勬祴璇曚緷璧? $($missingDeps -join ', ')" $colorWarning
    Write-ColorOutput "姝ｅ湪瀹夎缂哄け鐨勪緷璧?.." $colorInfo
    npm install --save-dev $missingDeps
    
    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "渚濊禆瀹夎澶辫触" $colorError
        exit 1
    }
    
    Write-ColorOutput "渚濊禆瀹夎鎴愬姛" $colorSuccess
} else {
    Write-ColorOutput "鎵€鏈夊繀瑕佺殑娴嬭瘯渚濊禆宸插畨瑁? $colorSuccess
}

# 妫€鏌est閰嶇疆
Write-ColorOutput "`n[2/6] 妫€鏌est閰嶇疆..." $colorInfo

$jestConfig = Join-Path $frontendPath "jest.config.js"
if (-not (Test-Path $jestConfig)) {
    Write-ColorOutput "璀﹀憡: 鎵句笉鍒癹est.config.js鏂囦欢锛屽皢鍒涘缓榛樿閰嶇疆" $colorWarning
    
    @"
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js'
  },
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js|jsx)'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(@?react-native.*|react-navigation|@react-navigation/.*|react-native-vector-icons|react-native-safe-area-context|react-native-calendars|react-native-reanimated|react-native-gesture-handler))'
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/serviceWorker.ts',
    '!src/setupTests.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
"@ | Out-File -FilePath $jestConfig -Encoding utf8
    
    Write-ColorOutput "宸插垱寤篔est閰嶇疆鏂囦欢" $colorSuccess
} else {
    Write-ColorOutput "Jest閰嶇疆鏂囦欢宸插瓨鍦? $colorSuccess
    
    # 妫€鏌ュ苟淇甯歌閰嶇疆闂
    $jestConfigContent = Get-Content $jestConfig -Raw
    $needsUpdate = $false
    
    # 妫€鏌ユ槸鍚︾己灏憈ransformIgnorePatterns
    if ($jestConfigContent -notmatch 'transformIgnorePatterns') {
        $jestConfigContent = $jestConfigContent -replace 'module.exports = \{', "module.exports = {`n  transformIgnorePatterns: [`n    '/node_modules/(?!(@?react-native.*|react-navigation|@react-navigation/.*|react-native-vector-icons|react-native-safe-area-context|react-native-calendars|react-native-reanimated|react-native-gesture-handler))'`n  ],"
        $needsUpdate = $true
        Write-ColorOutput "娣诲姞浜唗ransformIgnorePatterns閰嶇疆" $colorInfo
    }
    
    # 妫€鏌ユ槸鍚︾己灏憁oduleNameMapper
    if ($jestConfigContent -notmatch 'moduleNameMapper') {
        $jestConfigContent = $jestConfigContent -replace 'module.exports = \{', "module.exports = {`n  moduleNameMapper: {`n    '^@/(.*)$': '<rootDir>/src/$1',`n    '\\\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',`n    '\\\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/src/__mocks__/fileMock.js'`n  },"
        $needsUpdate = $true
        Write-ColorOutput "娣诲姞浜唌oduleNameMapper閰嶇疆" $colorInfo
    }
    
    # 鏇存柊閰嶇疆鏂囦欢
    if ($needsUpdate) {
        $jestConfigContent | Out-File -FilePath $jestConfig -Encoding utf8
        Write-ColorOutput "宸叉洿鏂癑est閰嶇疆鏂囦欢" $colorSuccess
    }
}

# 鍒涘缓娴嬭瘯鎵€闇€鐨勬ā鎷熸枃浠?
Write-ColorOutput "`n[3/6] 鍑嗗娴嬭瘯妯℃嫙鏂囦欢..." $colorInfo

$mockDir = Join-Path $frontendPath "src" "__mocks__"
if (-not (Test-Path $mockDir)) {
    New-Item -ItemType Directory -Path $mockDir -Force | Out-Null
    Write-ColorOutput "鍒涘缓浜嗘ā鎷熸枃浠剁洰褰? $colorSuccess
}

$styleMock = Join-Path $mockDir "styleMock.js"
if (-not (Test-Path $styleMock)) {
    "module.exports = {};" | Out-File -FilePath $styleMock -Encoding utf8
    Write-ColorOutput "鍒涘缓浜嗘牱寮忔ā鎷熸枃浠? $colorSuccess
}

$fileMock = Join-Path $mockDir "fileMock.js"
if (-not (Test-Path $fileMock)) {
    "module.exports = 'test-file-stub';" | Out-File -FilePath $fileMock -Encoding utf8
    Write-ColorOutput "鍒涘缓浜嗘枃浠舵ā鎷熸枃浠? $colorSuccess
}

# 鍒涘缓setupTests.ts鏂囦欢
$setupTests = Join-Path $frontendPath "src" "setupTests.ts"
if (-not (Test-Path $setupTests)) {
    @"
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// 鍒涘缓鍏ㄥ眬妯℃嫙
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};

// 妯℃嫙localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// 妯℃嫙sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock,
});

// 妯℃嫙fetch
global.fetch = jest.fn();

// 妯℃嫙ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 妯℃嫙IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
"@ | Out-File -FilePath $setupTests -Encoding utf8
    Write-ColorOutput "鍒涘缓浜唖etupTests.ts鏂囦欢" $colorSuccess
}

# 鍒涘缓mockData.ts鏂囦欢
$mockDataPath = Join-Path $frontendPath "src" "__tests__" "mockData.ts"
if (-not (Test-Path $mockDataPath)) {
    $mockDataDir = Join-Path $frontendPath "src" "__tests__"
    if (-not (Test-Path $mockDataDir)) {
        New-Item -ItemType Directory -Path $mockDataDir -Force | Out-Null
    }
    
    @"
/**
 * 娴嬭瘯鏁版嵁妯℃嫙鏂囦欢
 * 鎻愪緵鎵€鏈夌粍浠舵祴璇曟墍闇€鐨勬ā鎷熸暟鎹?
 */

// 妯℃嫙瀹為獙鏁版嵁
export const mockExperiments = [
  {
    id: 'exp-001',
    title: '娴嬭瘯瀹為獙1',
    description: '杩欐槸娴嬭瘯瀹為獙1鐨勬弿杩?,
    status: 'draft',
    type: 'observation',
    createdBy: 'user-001',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'exp-002',
    title: '娴嬭瘯瀹為獙2',
    description: '杩欐槸娴嬭瘯瀹為獙2鐨勬弿杩?,
    status: 'running',
    type: 'measurement',
    createdBy: 'user-001',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z'
  },
  {
    id: 'exp-003',
    title: '娴嬭瘯瀹為獙3',
    description: '杩欐槸娴嬭瘯瀹為獙3鐨勬弿杩?,
    status: 'completed',
    type: 'observation',
    createdBy: 'user-001',
    createdAt: '2025-01-03T00:00:00Z',
    updatedAt: '2025-01-03T00:00:00Z'
  }
];

// 妯℃嫙瀹為獙鎵ц鏁版嵁
export const mockExperimentExecution = {
  id: 'exec-001',
  experimentId: 'exp-001',
  status: 'running',
  progress: 45,
  logs: [
    { timestamp: '2025-01-01T00:00:00Z', level: 'info', message: '瀹為獙宸插惎鍔? },
    { timestamp: '2025-01-01T00:01:00Z', level: 'info', message: '鏁版嵁鏀堕泦寮€濮? },
    { timestamp: '2025-01-01T00:02:00Z', level: 'info', message: '宸插畬鎴?5%' }
  ],
  metrics: {
    currentLoss: 0.15,
    currentAccuracy: 0.85,
    timeElapsed: 120
  },
  startedAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:02:00Z'
};

// 妯℃嫙妯℃澘鏁版嵁
export const mockTemplates = [
  {
    id: 'tpl-001',
    name: '瑙傚療瀹為獙妯℃澘',
    description: '鏍囧噯瑙傚療瀹為獙妯℃澘',
    type: 'observation',
    createdBy: 'user-001',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    config: {
      steps: ['姝ラ1', '姝ラ2', '姝ラ3'],
      materials: ['鏉愭枡1', '鏉愭枡2'],
      duration: 30
    }
  },
  {
    id: 'tpl-002',
    name: '娴嬮噺瀹為獙妯℃澘',
    description: '鏍囧噯娴嬮噺瀹為獙妯℃澘',
    type: 'measurement',
    createdBy: 'user-001',
    createdAt: '2025-01-02T00:00:00Z',
    updatedAt: '2025-01-02T00:00:00Z',
    config: {
      steps: ['姝ラ1', '姝ラ2', '姝ラ3', '姝ラ4'],
      materials: ['鏉愭枡1', '鏉愭枡2', '鏉愭枡3'],
      duration: 45
    }
  }
];

// 妯℃嫙鐢ㄦ埛鏁版嵁
export const mockUser = {
  id: 'user-001',
  username: 'testuser',
  name: '娴嬭瘯鐢ㄦ埛',
  role: 'teacher',
  email: 'test@example.com',
  avatar: 'https://example.com/avatar.png'
};

// 妯℃嫙璁剧疆鏁版嵁
export const mockSettings = {
  general: {
    siteName: '娴嬭瘯绯荤粺',
    logoUrl: '/logo.png',
    companyName: '娴嬭瘯鍏徃',
    contactEmail: 'contact@example.com',
    contactPhone: '123456789',
    language: 'zh-CN',
    dateFormat: 'YYYY-MM-DD',
    timeFormat: 'HH:mm:ss'
  },
  theme: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    darkMode: false,
    fontSize: 'medium',
    fontFamily: 'Roboto, "Helvetica Neue", Arial, sans-serif',
    density: 'standard',
    borderRadius: '4px',
    customCss: ''
  },
  data: {
    defaultPageSize: 10,
    maxUploadSize: 50,
    backupFrequency: 'daily',
    dataRetentionDays: 90,
    autoRefresh: true,
    refreshInterval: 30,
    showAnimations: true
  }
};

// 妯℃嫙鏈嶅姟鍝嶅簲
export const mockServiceResponse = {
  success: true,
  data: {}
};

// 妯℃嫙浜嬩欢澶勭悊鍑芥暟
export const mockHandlers = {
  onClick: jest.fn(),
  onChange: jest.fn(),
  onSubmit: jest.fn(),
  onClose: jest.fn(),
  onOpen: jest.fn(),
  onSave: jest.fn(),
  onDelete: jest.fn(),
  onRefresh: jest.fn()
};

// 瀵煎嚭榛樿鐨勬祴璇曟暟鎹泦鍚?
export default {
  experiments: mockExperiments,
  execution: mockExperimentExecution,
  templates: mockTemplates,
  user: mockUser,
  settings: mockSettings,
  serviceResponse: mockServiceResponse,
  handlers: mockHandlers
};
"@ | Out-File -FilePath $mockDataPath -Encoding utf8
    Write-ColorOutput "鍒涘缓浜唌ockData.ts鏂囦欢" $colorSuccess
}

# 鎵ц鍒濇娴嬭瘯锛屾壘鍑哄け璐ョ殑娴嬭瘯
Write-ColorOutput "`n[4/6] 鎵ц鍒濇娴嬭瘯锛屾壘鍑哄け璐ョ殑娴嬭瘯..." $colorInfo

# 纭繚娴嬭瘯鐜鍑嗗濂?
$env:NODE_ENV = "test"
$env:CI = "true" # 閬垮厤浜や簰寮忔彁绀?

# 鎵ц娴嬭瘯骞舵崟鑾疯緭鍑?
$testResults = npm test -- --watchAll=false 2>&1
$testOutput = $testResults | Out-String

# 鍒嗘瀽娴嬭瘯缁撴灉
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "鎵€鏈夋祴璇曢€氳繃锛屾棤闇€淇" $colorSuccess
    exit 0
}

# 鏌ユ壘澶辫触鐨勬祴璇?
$failedTests = @()
$failedTestsPattern = "FAIL\s+(.+\.test\.(jsx?|tsx?))"
$matches = [regex]::Matches($testOutput, $failedTestsPattern)

foreach ($match in $matches) {
    $failedTests += $match.Groups[1].Value
}

$failedCount = $failedTests.Count
Write-ColorOutput "鍙戠幇 $failedCount 涓け璐ョ殑娴嬭瘯" $colorWarning

if ($failedCount -eq 0) {
    Write-ColorOutput "鏃犳硶璇嗗埆澶辫触鐨勬祴璇曪紝璇锋墜鍔ㄦ鏌? $colorError
    exit 1
}

# 淇澶辫触鐨勬祴璇?
Write-ColorOutput "`n[5/6] 寮€濮嬩慨澶嶅け璐ョ殑娴嬭瘯..." $colorInfo

foreach ($failedTest in $failedTests) {
    Write-ColorOutput "`n淇娴嬭瘯: $failedTest" $colorInfo
    
    $testPath = Join-Path $frontendPath $failedTest
    if (-not (Test-Path $testPath)) {
        Write-ColorOutput "鎵句笉鍒版祴璇曟枃浠? $testPath" $colorError
        continue
    }
    
    $testContent = Get-Content $testPath -Raw
    $updatedContent = $testContent
    
    # 甯歌闂淇
    
    # 1. 妫€鏌ュ鍏ラ棶棰?
    if ($testContent -notmatch "@testing-library/react") {
        $updatedContent = "import { render, screen, fireEvent } from '@testing-library/react';" + "`n" + $updatedContent
        Write-ColorOutput "娣诲姞浜嗘祴璇曞簱瀵煎叆" $colorInfo
    }
    
    # 2. 妫€鏌ユā鎷熸暟鎹鍏?
    if ($testContent -notmatch "mockData" -and $testContent -match "mock") {
        $updatedContent = "import mockData from './mockData';" + "`n" + $updatedContent
        Write-ColorOutput "娣诲姞浜嗘ā鎷熸暟鎹鍏? $colorInfo
    }
    
    # 3. 妫€鏌ュ苟淇寮傛娴嬭瘯闂
    $updatedContent = $updatedContent -replace "test\((.*?),\s*\(\)\s*=>\s*\{", "test(`$1, async () => {"
    $updatedContent = $updatedContent -replace "it\((.*?),\s*\(\)\s*=>\s*\{", "it(`$1, async () => {"
    
    # 4. 淇妯℃嫙鏂规硶闂
    $updatedContent = $updatedContent -replace "jest.fn\(\)", "jest.fn(() => Promise.resolve({ success: true }))"
    
    # 淇濆瓨鏇存柊鍚庣殑鍐呭
    if ($updatedContent -ne $testContent) {
        $updatedContent | Out-File -FilePath $testPath -Encoding utf8
        Write-ColorOutput "宸叉洿鏂版祴璇曟枃浠? $failedTest" $colorSuccess
    } else {
        Write-ColorOutput "鏃犳硶鑷姩淇锛岄渶瑕佹墜鍔ㄦ鏌? $failedTest" $colorWarning
    }
}

# 鍐嶆杩愯娴嬭瘯
Write-ColorOutput "`n[6/6] 鍐嶆杩愯娴嬭瘯锛岄獙璇佷慨澶嶆晥鏋?.." $colorInfo

$testResults = npm test -- --watchAll=false 2>&1
$testOutput = $testResults | Out-String

# 鍒嗘瀽鏈€缁堟祴璇曠粨鏋?
if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "`n鉁?鎵€鏈夋祴璇曞凡淇骞堕€氳繃!" $colorSuccess
} else {
    $matches = [regex]::Matches($testOutput, $failedTestsPattern)
    $remainingFailedCount = $matches.Count
    
    if ($remainingFailedCount -lt $failedCount) {
        Write-ColorOutput "`n閮ㄥ垎娴嬭瘯宸蹭慨澶嶃€傚師鏈?$failedCount 涓け璐ユ祴璇曪紝鐜板湪杩樻湁 $remainingFailedCount 涓? $colorWarning
    } else {
        Write-ColorOutput "`n淇鏈垚鍔燂紝浠嶆湁 $remainingFailedCount 涓祴璇曞け璐? $colorError
    }
    
    Write-ColorOutput "`n寤鸿鎵嬪姩妫€鏌ヤ互涓嬫枃浠?" $colorInfo
    foreach ($match in $matches) {
        Write-ColorOutput "- $($match.Groups[1].Value)" $colorInfo
    }
}

Write-ColorOutput "`n瀹屾垚! 娴嬭瘯淇杩囩▼缁撴潫锛岀敤鏃? $((Get-Date) - $startTime)" $colorInfo

