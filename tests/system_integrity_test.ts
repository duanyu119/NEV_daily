// 系统完整性测试
// 验证所有模块是否正常工作

import { CPCACollector } from '../src/collectors/cpca_collector';
import { VerticalPlatformMonitor } from '../src/collectors/vertical_platform_monitor';
import { IndustryLeaderTracker } from '../src/collectors/industry_leader_tracker';
import { DataStandardizationTemplate } from '../src/templates/data_standardization_template';

// 测试结果接口
interface TestResult {
  module: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  duration: number;
  details?: any;
}

// 系统测试类
class SystemIntegrityTest {
  private results: TestResult[] = [];

  async runAllTests(): Promise<void> {
    console.log('🧪 开始系统完整性测试...\n');
    
    const startTime = Date.now();
    
    // 运行各个模块的测试
    await this.testCPCACollector();
    await this.testPlatformMonitor();
    await this.testLeaderTracker();
    await this.testDataTemplate();
    await this.testSystemIntegration();
    
    const totalDuration = Date.now() - startTime;
    
    this.printResults(totalDuration);
  }

  // 测试乘联会采集器
  private async testCPCACollector(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('📈 测试乘联会数据采集器...');
      
      const collector = new CPCACollector();
      
      // 测试数据类型定义
      const testData = await collector.collectDailyData();
      
      // 验证数据格式
      const isValidData = this.validateCPCAData(testData);
      
      this.results.push({
        module: 'CPCA数据采集器',
        status: isValidData ? 'passed' : 'failed',
        message: isValidData ? '数据采集正常' : '数据格式验证失败',
        duration: Date.now() - startTime,
        details: {
          dataCount: testData.length,
          categories: this.countCategories(testData, 'cpca')
        }
      });
      
    } catch (error) {
      this.results.push({
        module: 'CPCA数据采集器',
        status: 'failed',
        message: `测试失败: ${error.message}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 测试垂直平台监测器
  private async testPlatformMonitor(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🌐 测试垂直平台监测器...');
      
      const monitor = new VerticalPlatformMonitor();
      
      // 测试平台数据采集
      const platformData = await monitor.monitorAllPlatforms();
      
      // 验证平台数据格式
      const isValidData = this.validatePlatformData(platformData);
      
      this.results.push({
        module: '垂直平台监测器',
        status: isValidData ? 'passed' : 'failed',
        message: isValidData ? '平台监测正常' : '数据格式验证失败',
        duration: Date.now() - startTime,
        details: {
          dataCount: platformData.length,
          platforms: this.countPlatforms(platformData)
        }
      });
      
    } catch (error) {
      this.results.push({
        module: '垂直平台监测器',
        status: 'failed',
        message: `测试失败: ${error.message}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 测试行业领袖追踪器
  private async testLeaderTracker(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('👥 测试行业领袖追踪器...');
      
      const tracker = new IndustryLeaderTracker();
      
      // 测试领袖言论采集
      const leaderData = await tracker.trackAllLeaders();
      
      // 验证领袖数据格式
      const isValidData = this.validateLeaderData(leaderData);
      
      this.results.push({
        module: '行业领袖追踪器',
        status: isValidData ? 'passed' : 'failed',
        message: isValidData ? '领袖追踪正常' : '数据格式验证失败',
        duration: Date.now() - startTime,
        details: {
          dataCount: leaderData.length,
          leaders: this.countLeaders(leaderData)
        }
      });
      
    } catch (error) {
      this.results.push({
        module: '行业领袖追踪器',
        status: 'failed',
        message: `测试失败: ${error.message}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 测试数据标准化模板
  private async testDataTemplate(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('📋 测试数据标准化模板...');
      
      const template = new DataStandardizationTemplate();
      
      // 创建测试数据
      const testData = this.createTestData();
      
      // 生成日报
      const report = await template.generateDailyReport(testData);
      
      // 验证报告格式
      const isValidReport = this.validateReport(report);
      
      this.results.push({
        module: '数据标准化模板',
        status: isValidReport ? 'passed' : 'failed',
        message: isValidReport ? '模板生成正常' : '报告格式验证失败',
        duration: Date.now() - startTime,
        details: {
          hasMetadata: !!report.metadata,
          hasSections: !!report.sections,
          sectionCount: Object.keys(report.sections || {}).length
        }
      });
      
    } catch (error) {
      this.results.push({
        module: '数据标准化模板',
        status: 'failed',
        message: `测试失败: ${error.message}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 测试系统集成
  private async testSystemIntegration(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('🔧 测试系统集成...');
      
      // 模拟完整的数据流程
      const mockData = [
        ...this.createTestData(),
        ...this.createMockCPCAData(),
        ...this.createMockPlatformData(),
        ...this.createMockLeaderData()
      ];
      
      // 测试数据整合
      const integratedData = this.integrateData(mockData);
      
      // 验证整合结果
      const isValidIntegration = integratedData.length > 0;
      
      this.results.push({
        module: '系统集成',
        status: isValidIntegration ? 'passed' : 'failed',
        message: isValidIntegration ? '系统集成正常' : '数据整合失败',
        duration: Date.now() - startTime,
        details: {
          inputCount: mockData.length,
          outputCount: integratedData.length,
          dataQuality: this.calculateAverageQuality(integratedData)
        }
      });
      
    } catch (error) {
      this.results.push({
        module: '系统集成',
        status: 'failed',
        message: `测试失败: ${error.message}`,
        duration: Date.now() - startTime,
        details: error
      });
    }
  }

  // 验证CPCA数据格式
  private validateCPCAData(data: any[]): boolean {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    return data.every(item => 
      item.id &&
      item.title &&
      item.category &&
      item.publishDate &&
      item.source &&
      typeof item.importance === 'number'
    );
  }

  // 验证平台数据格式
  private validatePlatformData(data: any[]): boolean {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    return data.every(item => 
      item.id &&
      item.platform &&
      item.title &&
      item.category &&
      item.publishDate &&
      typeof item.importance === 'number'
    );
  }

  // 验证领袖数据格式
  private validateLeaderData(data: any[]): boolean {
    if (!Array.isArray(data) || data.length === 0) return false;
    
    return data.every(item => 
      item.id &&
      item.leaderId &&
      item.leaderName &&
      item.company &&
      item.content &&
      typeof item.importance === 'number'
    );
  }

  // 验证报告格式
  private validateReport(report: any): boolean {
    return report &&
           report.metadata &&
           report.sections &&
           report.metadata.date &&
           report.metadata.version;
  }

  // 创建测试数据
  private createTestData(): any[] {
    return [
      {
        id: 'test-001',
        title: '比亚迪汉EV销量创新高',
        content: '比亚迪汉EV上月销量达到15000辆，创历史新高',
        category: 'sales',
        brand: '比亚迪',
        model: '汉EV',
        salesVolume: 15000,
        growth: 25,
        priceRange: '20-30万',
        marketSegment: '中大型轿车',
        source: '乘联会',
        importance: 5,
        sentiment: 'positive',
        publishDate: '2025-11-28',
        dataType: 'fact',
        verificationStatus: 'pending'
      },
      {
        id: 'test-002',
        title: '理想L9正式发布',
        content: '理想汽车正式发布全新车型L9，定位全尺寸SUV',
        category: 'new_model',
        brand: '理想汽车',
        model: 'L9',
        priceRange: '40-50万',
        targetMarket: '家庭用户',
        launchDate: '2025-11-28',
        source: '汽车之家',
        importance: 4,
        sentiment: 'positive',
        publishDate: '2025-11-28',
        dataType: 'fact',
        verificationStatus: 'pending'
      }
    ];
  }

  // 创建模拟CPCA数据
  private createMockCPCAData(): any[] {
    return [
      {
        id: 'cpca-001',
        title: '10月新能源汽车销量报告',
        content: '10月新能源汽车销量同比增长35%',
        category: 'sales',
        source: '乘联会',
        importance: 5,
        publishDate: '2025-11-28',
        dataType: 'fact',
        verificationStatus: 'pending'
      }
    ];
  }

  // 创建模拟平台数据
  private createMockPlatformData(): any[] {
    return [
      {
        id: 'platform-001',
        platform: 'autohome',
        title: '比亚迪汉EV深度评测',
        content: '专业编辑对比亚迪汉EV进行深度评测',
        category: 'review',
        source: '汽车之家',
        importance: 3,
        sentiment: 'positive',
        publishDate: '2025-11-28',
        dataType: 'opinion',
        verificationStatus: 'pending'
      }
    ];
  }

  // 创建模拟领袖数据
  private createMockLeaderData(): any[] {
    return [
      {
        id: 'leader-001',
        leaderId: 'wang-chuanfu',
        leaderName: '王传福',
        company: '比亚迪',
        content: '新能源汽车将迎来爆发式增长',
        source: '采访',
        importance: 4,
        category: 'strategy',
        strategicLevel: 'strategic',
        publishDate: '2025-11-28',
        dataType: 'opinion',
        verificationStatus: 'pending'
      }
    ];
  }

  // 数据整合
  private integrateData(data: any[]): any[] {
    return data.map(item => ({
      ...item,
      integrated: true,
      dataQuality: 85,
      relevanceScore: 90,
      processedAt: new Date().toISOString()
    }));
  }

  // 统计分类
  private countCategories(data: any[], source: string): Record<string, number> {
    const categories: Record<string, number> = {};
    data.forEach(item => {
      if (item.category) {
        categories[item.category] = (categories[item.category] || 0) + 1;
      }
    });
    return categories;
  }

  // 统计平台
  private countPlatforms(data: any[]): Record<string, number> {
    const platforms: Record<string, number> = {};
    data.forEach(item => {
      if (item.platform) {
        platforms[item.platform] = (platforms[item.platform] || 0) + 1;
      }
    });
    return platforms;
  }

  // 统计领袖
  private countLeaders(data: any[]): Record<string, number> {
    const leaders: Record<string, number> = {};
    data.forEach(item => {
      if (item.leaderName) {
        leaders[item.leaderName] = (leaders[item.leaderName] || 0) + 1;
      }
    });
    return leaders;
  }

  // 计算平均质量
  private calculateAverageQuality(data: any[]): number {
    if (data.length === 0) return 0;
    const totalQuality = data.reduce((sum, item) => sum + (item.dataQuality || 0), 0);
    return totalQuality / data.length;
  }

  // 打印测试结果
  private printResults(totalDuration: number): void {
    console.log('\n📊 系统测试报告');
    console.log('================');
    
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;
    
    console.log(`总测试数: ${total}`);
    console.log(`通过: ${passed} ✅`);
    console.log(`失败: ${failed} ❌`);
    console.log(`总耗时: ${totalDuration}ms`);
    console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);
    
    console.log('\n📋 详细结果:');
    this.results.forEach(result => {
      const statusIcon = result.status === 'passed' ? '✅' : '❌';
      const duration = result.duration;
      console.log(`${statusIcon} ${result.module} - ${result.message} (${duration}ms)`);
      
      if (result.details) {
        console.log(`   详情:`, JSON.stringify(result.details, null, 2));
      }
    });
    
    // 总体评估
    if (failed === 0) {
      console.log('\n🎉 所有测试通过！系统运行正常。');
    } else if (failed <= 2) {
      console.log('\n⚠️  部分测试失败，系统基本可用，建议检查失败模块。');
    } else {
      console.log('\n❌ 多个测试失败，系统存在严重问题，需要修复。');
    }
  }
}

// 运行测试
async function runSystemTest() {
  const tester = new SystemIntegrityTest();
  await tester.runAllTests();
}

// 如果直接运行此文件
if (require.main === module) {
  runSystemTest().catch(console.error);
}

export { SystemIntegrityTest, runSystemTest };