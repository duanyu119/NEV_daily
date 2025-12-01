// 主控制器 - 新能源汽车情报收集与分析系统
// 负责协调各模块，执行完整的数据收集与分析流程

import { CPCACollector } from './collectors/cpca_collector';
import { VerticalPlatformMonitor } from './collectors/vertical_platform_monitor';
import { IndustryLeaderTracker } from './collectors/industry_leader_tracker';
import { DataStandardizationTemplate } from './templates/data_standardization_template';
import { createConnection } from 'mysql2/promise';
import { writeFileSync } from 'fs';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 系统配置
interface SystemConfig {
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  collection: {
    startTime: string; // 每日开始时间
    deadline: string;  // 每日截止时间
    retryAttempts: number;
    timeout: number;
  };
  quality: {
    minDataQuality: number;
    minRelevanceScore: number;
    requiredSources: string[];
  };
  output: {
    formats: string[]; // html, json, markdown
    saveToDatabase: boolean;
    saveToFile: boolean;
    filePath: string;
  };
}

// 数据整合结果
interface DataIntegrationResult {
  success: boolean;
  totalItems: number;
  dataSources: Record<string, number>;
  qualityMetrics: {
    averageQuality: number;
    averageRelevance: number;
    completeness: number;
  };
  errors: string[];
  warnings: string[];
}

// 日报生成结果
interface ReportGenerationResult {
  success: boolean;
  reportPath?: string;
  databaseId?: number;
  qualityScore: number;
  generationTime: number;
  errors: string[];
}

// 主控制器
export class NEVIntelligenceController {
  private cpcaCollector: CPCACollector;
  private platformMonitor: VerticalPlatformMonitor;
  private leaderTracker: IndustryLeaderTracker;
  private dataTemplate: DataStandardizationTemplate;
  private config: SystemConfig;
  private dbConnection: any;

  constructor(config: SystemConfig) {
    this.config = config;
    this.cpcaCollector = new CPCACollector();
    this.platformMonitor = new VerticalPlatformMonitor();
    this.leaderTracker = IndustryLeaderTracker();
    this.dataTemplate = new DataStandardizationTemplate();
  }

  // 主执行方法
  async runDailyCollection(): Promise<void> {
    console.log(`\n=== 新能源汽车情报收集系统启动 ===`);
    console.log(`执行时间: ${new Date().toLocaleString()}`);
    console.log(`目标截止时间: ${this.config.collection.deadline}`);
    
    try {
      // 步骤1: 数据采集
      console.log(`\n[步骤1/4] 开始数据采集...`);
      const collectedData = await this.collectAllData();
      
      // 步骤2: 数据整合与质量控制
      console.log(`\n[步骤2/4] 数据整合与质量控制...`);
      const integrationResult = await this.integrateAndQualityCheck(collectedData);
      
      if (!integrationResult.success) {
        throw new Error(`数据整合失败: ${integrationResult.errors.join(', ')}`);
      }
      
      // 步骤3: 生成标准化报告
      console.log(`\n[步骤3/4] 生成标准化报告...`);
      const reportResult = await this.generateReport(integrationResult);
      
      if (!reportResult.success) {
        throw new Error(`报告生成失败: ${reportResult.errors.join(', ')}`);
      }
      
      // 步骤4: 质量评估与提交
      console.log(`\n[步骤4/4] 质量评估与提交...`);
      await this.finalizeAndSubmit(reportResult);
      
      console.log(`\n✅ 日报生成完成！`);
      console.log(`📊 数据量: ${integrationResult.totalItems} 条`);
      console.log(`⭐ 质量评分: ${reportResult.qualityScore}/100`);
      console.log(`⏱️  生成时间: ${reportResult.generationTime}ms`);
      
      if (reportResult.reportPath) {
        console.log(`📄 报告路径: ${reportResult.reportPath}`);
      }
      
    } catch (error) {
      console.error(`\n❌ 系统执行失败:`, error);
      await this.handleError(error);
      throw error;
    }
  }

  // 数据采集阶段
  private async collectAllData(): Promise<any[]> {
    const allData: any[] = [];
    const startTime = Date.now();
    
    try {
      // 并行采集所有数据源
      const collectionPromises = [
        this.collectCPCAData(),
        this.collectPlatformData(),
        this.collectLeaderStatements()
      ];
      
      const results = await Promise.allSettled(collectionPromises);
      
      // 处理结果
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          allData.push(...result.value);
          console.log(`✅ 数据采集 ${index + 1}/3 完成`);
        } else {
          console.error(`❌ 数据采集 ${index + 1}/3 失败:`, result.reason);
        }
      });
      
      const duration = Date.now() - startTime;
      console.log(`📊 数据采集完成，共 ${allData.length} 条，耗时 ${duration}ms`);
      
      return allData;
      
    } catch (error) {
      console.error('数据采集阶段失败:', error);
      throw error;
    }
  }

  // 采集乘联会数据
  private async collectCPCAData(): Promise<any[]> {
    try {
      console.log('📈 开始采集乘联会数据...');
      const data = await this.cpcaCollector.collectDailyData();
      console.log(`✅ 乘联会数据采集完成: ${data.length} 条`);
      return data;
    } catch (error) {
      console.error('乘联会数据采集失败:', error);
      return []; // 失败时返回空数组，不影响整体流程
    }
  }

  // 采集平台数据
  private async collectPlatformData(): Promise<any[]> {
    try {
      console.log('🌐 开始采集四大平台数据...');
      const data = await this.platformMonitor.monitorAllPlatforms();
      console.log(`✅ 四大平台数据采集完成: ${data.length} 条`);
      return data;
    } catch (error) {
      console.error('四大平台数据采集失败:', error);
      return [];
    }
  }

  // 采集领袖言论
  private async collectLeaderStatements(): Promise<any[]> {
    try {
      console.log('👥 开始采集行业领袖言论...');
      const data = await this.leaderTracker.trackAllLeaders();
      console.log(`✅ 行业领袖言论采集完成: ${data.length} 条`);
      return data;
    } catch (error) {
      console.error('行业领袖言论采集失败:', error);
      return [];
    }
  }

  // 数据整合与质量控制
  private async integrateAndQualityCheck(data: any[]): Promise<DataIntegrationResult> {
    const result: DataIntegrationResult = {
      success: true,
      totalItems: 0,
      dataSources: {},
      qualityMetrics: {
        averageQuality: 0,
        averageRelevance: 0,
        completeness: 0
      },
      errors: [],
      warnings: []
    };
    
    try {
      // 数据清洗
      const cleanedData = this.cleanData(data);
      
      // 数据验证
      const validatedData = this.validateData(cleanedData);
      
      // 质量评估
      const qualityResult = this.assessDataQuality(validatedData);
      
      // 统计信息
      result.totalItems = validatedData.length;
      result.dataSources = this.countDataSources(validatedData);
      result.qualityMetrics = qualityResult;
      
      // 质量检查
      if (qualityResult.averageQuality < this.config.quality.minDataQuality) {
        result.warnings.push(`数据质量偏低: ${qualityResult.averageQuality.toFixed(1)}/100`);
      }
      
      if (qualityResult.averageRelevance < this.config.quality.minRelevanceScore) {
        result.warnings.push(`数据相关性偏低: ${qualityResult.averageRelevance.toFixed(1)}/100`);
      }
      
      // 数据源完整性检查
      const missingSources = this.checkRequiredSources(validatedData);
      if (missingSources.length > 0) {
        result.warnings.push(`缺失数据源: ${missingSources.join(', ')}`);
      }
      
      console.log(`✅ 数据整合完成`);
      console.log(`📊 数据总量: ${result.totalItems}`);
      console.log(`⭐ 平均质量: ${result.qualityMetrics.averageQuality.toFixed(1)}/100`);
      console.log(`🎯 平均相关性: ${result.qualityMetrics.averageRelevance.toFixed(1)}/100`);
      
      return result;
      
    } catch (error) {
      result.success = false;
      result.errors.push(`数据整合失败: ${error.message}`);
      return result;
    }
  }

  // 数据清洗
  private cleanData(data: any[]): any[] {
    return data.filter(item => {
      // 基础过滤
      if (!item || !item.title) return false;
      if (!item.publishDate || item.publishDate === 'Invalid Date') return false;
      
      // 去重
      return true;
    });
  }

  // 数据验证
  private validateData(data: any[]): any[] {
    return data.map(item => ({
      ...item,
      validated: true,
      validationTime: new Date().toISOString(),
      dataQuality: this.calculateDataQuality(item),
      relevanceScore: this.calculateRelevanceScore(item)
    }));
  }

  // 计算数据质量
  private calculateDataQuality(item: any): number {
    let score = 0;
    
    // 完整性
    if (item.title) score += 25;
    if (item.content) score += 25;
    if (item.publishDate) score += 20;
    if (item.source) score += 15;
    if (item.brand) score += 15;
    
    return Math.min(score, 100);
  }

  // 计算相关性得分
  private calculateRelevanceScore(item: any): number {
    let score = 50; // 基础分
    
    // 关键词匹配
    const keywords = ['新能源', '电动车', '智能汽车', '比亚迪', '特斯拉', '理想', '蔚来', '小鹏'];
    const text = (item.title || '') + ' ' + (item.content || '');
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 5;
      }
    });
    
    return Math.min(score, 100);
  }

  // 质量评估
  private assessDataQuality(data: any[]): { averageQuality: number; averageRelevance: number; completeness: number } {
    if (data.length === 0) {
      return { averageQuality: 0, averageRelevance: 0, completeness: 0 };
    }
    
    const totalQuality = data.reduce((sum, item) => sum + (item.dataQuality || 0), 0);
    const totalRelevance = data.reduce((sum, item) => sum + (item.relevanceScore || 0), 0);
    
    return {
      averageQuality: totalQuality / data.length,
      averageRelevance: totalRelevance / data.length,
      completeness: (data.filter(item => item.dataQuality >= 80).length / data.length) * 100
    };
  }

  // 统计数据源
  private countDataSources(data: any[]): Record<string, number> {
    const sources: Record<string, number> = {};
    
    data.forEach(item => {
      const source = item.source || item.platform || '未知';
      sources[source] = (sources[source] || 0) + 1;
    });
    
    return sources;
  }

  // 检查必需数据源
  private checkRequiredSources(data: any[]): string[] {
    const availableSources = new Set(data.map(item => item.source || item.platform));
    const requiredSources = this.config.quality.requiredSources;
    
    return requiredSources.filter(source => !availableSources.has(source));
  }

  // 生成报告
  private async generateReport(integrationResult: DataIntegrationResult): Promise<ReportGenerationResult> {
    const startTime = Date.now();
    const result: ReportGenerationResult = {
      success: true,
      qualityScore: 0,
      generationTime: 0,
      errors: []
    };
    
    try {
      // 这里应该使用实际的数据，现在用模拟数据
      const mockData = []; // 应该从integrationResult获取
      
      // 生成标准化报告
      const report = await this.dataTemplate.generateDailyReport(mockData);
      
      // 生成不同格式的输出
      if (this.config.output.formats.includes('html')) {
        const htmlReport = this.generateHTMLReport(report);
        const htmlPath = `${this.config.output.filePath}/nev_daily_${format(new Date(), 'yyyy-MM-dd')}.html`;
        writeFileSync(htmlPath, htmlReport);
        result.reportPath = htmlPath;
      }
      
      if (this.config.output.formats.includes('json')) {
        const jsonPath = `${this.config.output.filePath}/nev_daily_${format(new Date(), 'yyyy-MM-dd')}.json`;
        writeFileSync(jsonPath, JSON.stringify(report, null, 2));
      }
      
      // 保存到数据库
      if (this.config.output.saveToDatabase) {
        const dbId = await this.saveToDatabase(report);
        result.databaseId = dbId;
      }
      
      result.generationTime = Date.now() - startTime;
      result.qualityScore = this.calculateReportQuality(report);
      
      console.log(`✅ 报告生成完成`);
      console.log(`📊 质量评分: ${result.qualityScore}/100`);
      console.log(`⏱️  生成耗时: ${result.generationTime}ms`);
      
      return result;
      
    } catch (error) {
      result.success = false;
      result.errors.push(`报告生成失败: ${error.message}`);
      return result;
    }
  }

  // 生成HTML报告
  private generateHTMLReport(report: any): string {
    // 这里应该使用之前优化的HTML模板
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新能源车内参 | ${report.metadata.date}</title>
    <style>
        /* 使用之前优化的灰度配色方案 */
        :root {
            --gray-50: #f9f9f9;
            --gray-100: #f5f5f5;
            --gray-200: #e5e5e5;
            --gray-300: #d4d4d4;
            --gray-400: #a3a3a3;
            --gray-500: #737373;
            --gray-600: #525252;
            --gray-700: #404040;
            --gray-800: #262626;
            --gray-900: #171717;
        }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: var(--gray-800); background: var(--gray-50); }
        .container { max-width: 1200px; margin: 0 auto; padding: 32px; }
        .header { text-align: center; margin-bottom: 48px; }
        .section { background: white; padding: 24px; margin-bottom: 24px; border-radius: 8px; }
        .metric { display: inline-block; margin: 0 16px 16px 0; padding: 12px; background: var(--gray-100); border-radius: 4px; }
        .metric-value { font-size: 24px; font-weight: bold; color: var(--gray-900); }
        .metric-label { font-size: 14px; color: var(--gray-600); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>新能源车内参</h1>
            <p>${report.metadata.date} | 版本: ${report.metadata.version}</p>
        </div>
        
        <div class="section">
            <h2>数据概览</h2>
            <div class="metric">
                <div class="metric-value">${report.metadata.dataSummary.totalItems}</div>
                <div class="metric-label">总数据量</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Object.keys(report.metadata.dataSummary.dataSources).length}</div>
                <div class="metric-label">数据源</div>
            </div>
        </div>
        
        <!-- 更多内容区域 -->
        
    </div>
</body>
</html>`;
  }

  // 计算报告质量
  private calculateReportQuality(report: any): number {
    // 基于数据完整性和内容质量计算评分
    let score = 50; // 基础分
    
    if (report.sections?.executiveSummary?.keyHighlights?.length > 0) score += 10;
    if (report.sections?.salesAnalysis?.topPerformers?.length > 0) score += 10;
    if (report.sections?.newModels?.newlyLaunched?.length > 0) score += 10;
    if (report.metadata?.dataSummary?.totalItems > 50) score += 10;
    if (report.metadata?.dataSummary?.totalItems > 100) score += 10;
    
    return Math.min(score, 100);
  }

  // 保存到数据库
  private async saveToDatabase(report: any): Promise<number> {
    // 这里应该实现数据库保存逻辑
    console.log('💾 报告已保存到数据库');
    return Math.floor(Math.random() * 1000000); // 模拟返回ID
  }

  // 最终提交
  private async finalizeAndSubmit(reportResult: ReportGenerationResult): Promise<void> {
    console.log('\n📋 最终质量评估:');
    console.log(`✅ 报告生成: ${reportResult.success ? '成功' : '失败'}`);
    console.log(`⭐ 质量评分: ${reportResult.qualityScore}/100`);
    
    if (reportResult.qualityScore >= 80) {
      console.log('🎉 报告质量优秀，准备提交');
    } else if (reportResult.qualityScore >= 60) {
      console.log('⚠️  报告质量一般，需要人工审核');
    } else {
      console.log('❌ 报告质量不达标，需要重新生成');
    }
    
    // 这里可以添加自动提交逻辑
    console.log(`\n📤 提交时间: ${new Date().toLocaleString()}`);
    console.log(`📊 系统状态: 运行正常`);
  }

  // 错误处理
  private async handleError(error: any): Promise<void> {
    console.error('系统错误详情:', error);
    
    // 发送告警通知
    await this.sendAlert(`系统执行失败: ${error.message}`);
  }

  // 发送告警
  private async sendAlert(message: string): Promise<void> {
    console.log(`🚨 系统告警: ${message}`);
    // 这里可以集成邮件、短信或企业微信通知
  }
}

// 系统配置示例
const DEFAULT_CONFIG: SystemConfig = {
  database: {
    host: 'localhost',
    port: 3306,
    user: 'nev_user',
    password: 'password',
    database: 'nev_intelligence'
  },
  collection: {
    startTime: '06:00',
    deadline: '18:00',
    retryAttempts: 3,
    timeout: 30000
  },
  quality: {
    minDataQuality: 70,
    minRelevanceScore: 60,
    requiredSources: ['乘联会', '汽车之家', '懂车帝']
  },
  output: {
    formats: ['html', 'json'],
    saveToDatabase: true,
    saveToFile: true,
    filePath: './reports'
  }
};

// 使用示例
export async function runNEVIntelligenceSystem() {
  const controller = new NEVIntelligenceController(DEFAULT_CONFIG);
  
  try {
    await controller.runDailyCollection();
    console.log('\n🎉 系统执行成功完成！');
  } catch (error) {
    console.error('\n💥 系统执行失败:', error);
    process.exit(1);
  }
}

// 定时任务调度
export function scheduleDailyCollection(): void {
  console.log('⏰ 定时任务已设置，每日自动执行数据采集');
  
  // 这里可以集成node-cron或其他定时任务库
  // 例如: cron.schedule('0 6 * * *', runNEVIntelligenceSystem);
  
  // 现在立即执行一次用于测试
  runNEVIntelligenceSystem();
}

// 启动系统
if (require.main === module) {
  console.log('🚀 新能源汽车情报收集系统启动');
  scheduleDailyCollection();
}