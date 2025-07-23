/**
 * AI数据格式识别服务
 * 用于智能识别设备数据格式并生成解析规则
 */

export interface DataSample {
  rawData: string;
  timestamp?: string;
  source?: string;
}

export interface DataFormatAnalysis {
  confidence: number;
  format: 'json' | 'csv' | 'xml' | 'raw' | 'modbus' | 'custom';
  structure: {
    fields: Array<{
      name: string;
      type: 'number' | 'string' | 'boolean' | 'datetime';
      unit?: string;
      description?: string;
    }>;
    separator?: string;
    encoding?: string;
    nested?: boolean;
  };
  parseRule: string;
  transformScript?: string;
  suggestions: string[];
}

export interface AIParseResult {
  success: boolean;
  analysis: DataFormatAnalysis;
  parsedData?: any[];
  error?: string;
}

class AIDataFormatService {
  private apiBaseUrl = '/api/ai';

  /**
   * 分析数据样本，识别格式
   */
  async analyzeDataFormat(samples: DataSample[]): Promise<AIParseResult> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/analyze-data-format`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ samples })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI数据格式分析失败:', error);
      
      // 本地fallback分析
      return this.fallbackAnalysis(samples);
    }
  }

  /**
   * 智能生成数据解析规则
   */
  async generateParseRule(format: string, samples: DataSample[]): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/generate-parse-rule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format, samples })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      return result.parseRule;
    } catch (error) {
      console.error('生成解析规则失败:', error);
      return this.generateFallbackParseRule(format, samples);
    }
  }

  /**
   * 验证解析规则并测试数据解析
   */
  async validateParseRule(parseRule: string, samples: DataSample[]): Promise<{
    valid: boolean;
    parsedData?: any[];
    errors?: string[];
  }> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/validate-parse-rule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parseRule, samples })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('验证解析规则失败:', error);
      return { valid: false, errors: [error instanceof Error ? error.message : '未知错误'] };
    }
  }

  /**
   * 本地fallback分析
   */
  private fallbackAnalysis(samples: DataSample[]): AIParseResult {
    if (samples.length === 0) {
      return {
        success: false,
        analysis: this.getDefaultAnalysis(),
        error: '没有提供数据样本'
      };
    }

    const firstSample = samples[0].rawData.trim();
    
    // JSON格式检测
    if (this.isJSONFormat(firstSample)) {
      return {
        success: true,
        analysis: this.analyzeJSONFormat(samples)
      };
    }
    
    // CSV格式检测
    if (this.isCSVFormat(firstSample)) {
      return {
        success: true,
        analysis: this.analyzeCSVFormat(samples)
      };
    }
    
    // XML格式检测
    if (this.isXMLFormat(firstSample)) {
      return {
        success: true,
        analysis: this.analyzeXMLFormat(samples)
      };
    }
    
    // 默认为原始格式
    return {
      success: true,
      analysis: this.analyzeRawFormat(samples)
    };
  }

  private isJSONFormat(data: string): boolean {
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  }

  private isCSVFormat(data: string): boolean {
    const lines = data.split('\n');
    if (lines.length < 2) return false;
    
    const firstLine = lines[0];
    const secondLine = lines[1];
    
    // 检查是否有相同数量的分隔符
    const separators = [',', ';', '\t', '|'];
    for (const sep of separators) {
      if (firstLine.split(sep).length > 1 && 
          firstLine.split(sep).length === secondLine.split(sep).length) {
        return true;
      }
    }
    return false;
  }

  private isXMLFormat(data: string): boolean {
    return data.trim().startsWith('<') && data.trim().endsWith('>');
  }

  private analyzeJSONFormat(samples: DataSample[]): DataFormatAnalysis {
    try {
      const parsed = JSON.parse(samples[0].rawData);
      const fields = this.extractFieldsFromObject(parsed);
      
      return {
        confidence: 0.95,
        format: 'json',
        structure: {
          fields,
          nested: this.hasNestedStructure(parsed)
        },
        parseRule: 'JSON.parse(data)',
        suggestions: [
          '数据格式为标准JSON',
          '建议启用字段类型验证',
          '可配置嵌套对象解析'
        ]
      };
    } catch {
      return this.getDefaultAnalysis();
    }
  }

  private analyzeCSVFormat(samples: DataSample[]): DataFormatAnalysis {
    const lines = samples[0].rawData.split('\n');
    const separator = this.detectCSVSeparator(lines[0]);
    const headers = lines[0].split(separator);
    const fields = headers.map(header => ({
      name: header.trim(),
      type: this.inferFieldType(lines.slice(1), headers.indexOf(header), separator),
      description: `从CSV第${headers.indexOf(header) + 1}列解析`
    }));

    return {
      confidence: 0.9,
      format: 'csv',
      structure: {
        fields,
        separator,
        nested: false
      },
      parseRule: `data.split('\\n').map(line => line.split('${separator}'))`,
      suggestions: [
        '数据格式为CSV',
        '已自动检测分隔符',
        '建议验证字段类型推断'
      ]
    };
  }

  private analyzeXMLFormat(samples: DataSample[]): DataFormatAnalysis {
    return {
      confidence: 0.8,
      format: 'xml',
      structure: {
        fields: [
          { name: 'parsed_xml', type: 'string', description: 'XML解析结果' }
        ],
        nested: true
      },
      parseRule: 'new DOMParser().parseFromString(data, "text/xml")',
      suggestions: [
        '数据格式为XML',
        '需要配置XML路径选择器',
        '建议使用XPath表达式提取数据'
      ]
    };
  }

  private analyzeRawFormat(samples: DataSample[]): DataFormatAnalysis {
    return {
      confidence: 0.6,
      format: 'raw',
      structure: {
        fields: [
          { name: 'raw_data', type: 'string', description: '原始数据' }
        ],
        encoding: 'utf8',
        nested: false
      },
      parseRule: 'data.toString()',
      suggestions: [
        '无法识别标准格式',
        '建议手动配置解析规则',
        '可尝试正则表达式提取数据'
      ]
    };
  }

  private extractFieldsFromObject(obj: any, prefix = ''): Array<{
    name: string;
    type: 'number' | 'string' | 'boolean' | 'datetime';
    unit?: string;
    description?: string;
  }> {
    const fields: Array<{
      name: string;
      type: 'number' | 'string' | 'boolean' | 'datetime';
      unit?: string;
      description?: string;
    }> = [];

    for (const [key, value] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}.${key}` : key;
      const fieldType = this.inferJSONFieldType(value);
      
      fields.push({
        name: fieldName,
        type: fieldType,
        unit: this.inferUnit(key, value),
        description: `JSON字段: ${fieldName}`
      });

      // 递归处理嵌套对象（限制深度）
      if (typeof value === 'object' && value !== null && !Array.isArray(value) && prefix.split('.').length < 3) {
        fields.push(...this.extractFieldsFromObject(value, fieldName));
      }
    }

    return fields;
  }

  private inferJSONFieldType(value: any): 'number' | 'string' | 'boolean' | 'datetime' {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'string') {
      // 尝试识别日期时间
      if (this.isDateTimeString(value)) return 'datetime';
      return 'string';
    }
    return 'string';
  }

  private inferFieldType(lines: string[], columnIndex: number, separator: string): 'number' | 'string' | 'boolean' | 'datetime' {
    const values = lines.slice(0, 5).map(line => {
      const cols = line.split(separator);
      return cols[columnIndex]?.trim();
    }).filter(Boolean);

    if (values.length === 0) return 'string';

    // 检查是否为数字
    if (values.every(val => !isNaN(Number(val)))) return 'number';
    
    // 检查是否为布尔值
    if (values.every(val => ['true', 'false', '1', '0', 'yes', 'no'].includes(val.toLowerCase()))) return 'boolean';
    
    // 检查是否为日期时间
    if (values.some(val => this.isDateTimeString(val))) return 'datetime';
    
    return 'string';
  }

  private detectCSVSeparator(firstLine: string): string {
    const separators = [',', ';', '\t', '|'];
    let maxCount = 0;
    let bestSeparator = ',';

    for (const sep of separators) {
      const count = firstLine.split(sep).length;
      if (count > maxCount) {
        maxCount = count;
        bestSeparator = sep;
      }
    }

    return bestSeparator;
  }

  private hasNestedStructure(obj: any): boolean {
    if (typeof obj !== 'object' || obj === null) return false;
    
    for (const value of Object.values(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        return true;
      }
    }
    return false;
  }

  private isDateTimeString(str: string): boolean {
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO 8601
      /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, // SQL datetime
      /^\d{2}\/\d{2}\/\d{4}/, // MM/DD/YYYY
      /^\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
    ];

    return datePatterns.some(pattern => pattern.test(str));
  }

  private inferUnit(fieldName: string, value: any): string | undefined {
    const lowerName = fieldName.toLowerCase();
    
    if (lowerName.includes('temp')) return '°C';
    if (lowerName.includes('humidity')) return '%';
    if (lowerName.includes('pressure')) return 'Pa';
    if (lowerName.includes('voltage')) return 'V';
    if (lowerName.includes('current')) return 'A';
    if (lowerName.includes('power')) return 'W';
    if (lowerName.includes('speed')) return 'm/s';
    if (lowerName.includes('distance') || lowerName.includes('length')) return 'm';
    if (lowerName.includes('weight') || lowerName.includes('mass')) return 'kg';
    if (lowerName.includes('time') && typeof value === 'number') return 's';
    
    return undefined;
  }

  private generateFallbackParseRule(format: string, samples: DataSample[]): string {
    switch (format) {
      case 'json':
        return 'JSON.parse(data)';
      case 'csv':
        return 'data.split("\\n").map(line => line.split(","))';
      case 'xml':
        return 'new DOMParser().parseFromString(data, "text/xml")';
      default:
        return 'data.toString()';
    }
  }

  private getDefaultAnalysis(): DataFormatAnalysis {
    return {
      confidence: 0.5,
      format: 'raw',
      structure: {
        fields: [
          { name: 'raw_data', type: 'string', description: '原始数据' }
        ],
        nested: false
      },
      parseRule: 'data.toString()',
      suggestions: [
        '无法自动识别数据格式',
        '请手动配置解析规则',
        '可提供更多数据样本以提高识别准确率'
      ]
    };
  }
}

export const aiDataFormatService = new AIDataFormatService();
export default aiDataFormatService;
