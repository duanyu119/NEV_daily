// 乘联会数据自动采集模块
// 负责从乘联会官方渠道获取新能源汽车相关数据

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';

// 数据类型定义
interface CPCADataItem {
  id: string;
  title: string;
  content: string;
  category: 'sales' | 'new_model' | 'complaint' | 'policy';
  publishDate: string;
  source: string;
  url: string;
  importance: number; // 1-5，重要性等级
  dataType: 'fact' | 'opinion';
  verificationStatus: 'pending' | 'verified' | 'disputed';
}

interface SalesData extends CPCADataItem {
  brand: string;
  model: string;
  salesVolume: number;
  priceRange: string;
  marketSegment: string;
}

interface NewModelData extends CPCADataItem {
  brand: string;
  model: string;
  specifications: Record<string, any>;
  priceRange: string;
  targetMarket: string;
  launchDate: string;
}

interface ComplaintData extends CPCADataItem {
  brand: string;
  model: string;
  complaintType: string;
  frequency: number;
  severity: number; // 1-5，严重程度
}

// 乘联会数据采集器
export class CPCACollector {
  private readonly baseUrl = 'http://www.cpca.org.cn';
  private readonly dataSources = {
    sales: '/newslist.php?type=sales',
    newModels: '/newslist.php?type=newcar',
    complaints: '/newslist.php?type=quality',
    policies: '/newslist.php?type=policy'
  };

  // 主要采集方法
  async collectDailyData(): Promise<CPCADataItem[]> {
    console.log(`[${new Date().toLocaleString()}] 开始采集乘联会数据...`);
    
    const results: CPCADataItem[] = [];
    
    try {
      // 并行采集各类数据
      const [salesData, newModelsData, complaintsData, policiesData] = await Promise.all([
        this.collectSalesData(),
        this.collectNewModelsData(),
        this.collectComplaintsData(),
        this.collectPoliciesData()
      ]);

      results.push(...salesData, ...newModelsData, ...complaintsData, ...policiesData);
      
      console.log(`[${new Date().toLocaleString()}] 乘联会数据采集完成，共获取 ${results.length} 条数据`);
      return results;
    } catch (error) {
      console.error('乘联会数据采集失败:', error);
      throw new Error(`CPCA data collection failed: ${error.message}`);
    }
  }

  // 采集销量数据
  private async collectSalesData(): Promise<SalesData[]> {
    const url = `${this.baseUrl}${this.dataSources.sales}`;
    
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const salesData: SalesData[] = [];

      // 解析销量排行榜数据
      $('.news-list-item').each((index, element) => {
        const $item = $(element);
        const title = $item.find('.title').text().trim();
        const content = $item.find('.summary').text().trim();
        const publishDate = $item.find('.date').text().trim();
        const detailUrl = $item.find('a').attr('href');

        // 提取品牌和车型信息
        const brandModel = this.extractBrandModel(title);
        const salesVolume = this.extractSalesVolume(content);
        const priceRange = this.extractPriceRange(content);
        const marketSegment = this.classifyMarketSegment(title, content);

        if (brandModel.brand && salesVolume > 0) {
          const data: SalesData = {
            id: createHash('md5').update(title + publishDate).digest('hex'),
            title,
            content,
            category: 'sales',
            publishDate: this.standardizeDate(publishDate),
            source: '乘联会',
            url: detailUrl ? `${this.baseUrl}${detailUrl}` : url,
            importance: this.calculateImportance(title, content),
            dataType: 'fact',
            verificationStatus: 'pending',
            brand: brandModel.brand,
            model: brandModel.model,
            salesVolume,
            priceRange,
            marketSegment
          };

          salesData.push(data);
        }
      });

      return salesData;
    } catch (error) {
      console.error('销量数据采集失败:', error);
      return [];
    }
  }

  // 采集新车型数据
  private async collectNewModelsData(): Promise<NewModelData[]> {
    const url = `${this.baseUrl}${this.dataSources.newModels}`;
    
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const newModelsData: NewModelData[] = [];

      $('.newcar-item').each((index, element) => {
        const $item = $(element);
        const title = $item.find('.car-title').text().trim();
        const content = $item.find('.car-desc').text().trim();
        const publishDate = $item.find('.publish-time').text().trim();
        
        const brandModel = this.extractBrandModel(title);
        const specifications = this.extractSpecifications(content);
        const priceRange = this.extractPriceRange(content);
        const targetMarket = this.extractTargetMarket(content);
        const launchDate = this.extractLaunchDate(content);

        if (brandModel.brand) {
          const data: NewModelData = {
            id: createHash('md5').update(title + publishDate).digest('hex'),
            title,
            content,
            category: 'new_model',
            publishDate: this.standardizeDate(publishDate),
            source: '乘联会',
            url: url,
            importance: this.calculateImportance(title, content),
            dataType: 'fact',
            verificationStatus: 'pending',
            brand: brandModel.brand,
            model: brandModel.model,
            specifications,
            priceRange,
            targetMarket,
            launchDate
          };

          newModelsData.push(data);
        }
      });

      return newModelsData;
    } catch (error) {
      console.error('新车型数据采集失败:', error);
      return [];
    }
  }

  // 采集投诉数据
  private async collectComplaintsData(): Promise<ComplaintData[]> {
    const url = `${this.baseUrl}${this.dataSources.complaints}`;
    
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const complaintsData: ComplaintData[] = [];

      $('.complaint-item').each((index, element) => {
        const $item = $(element);
        const title = $item.find('.complaint-title').text().trim();
        const content = $item.find('.complaint-content').text().trim();
        const publishDate = $item.find('.complaint-date').text().trim();
        
        const brandModel = this.extractBrandModel(title);
        const complaintType = this.classifyComplaintType(title, content);
        const frequency = this.extractComplaintFrequency(content);
        const severity = this.assessComplaintSeverity(title, content);

        if (brandModel.brand) {
          const data: ComplaintData = {
            id: createHash('md5').update(title + publishDate).digest('hex'),
            title,
            content,
            category: 'complaint',
            publishDate: this.standardizeDate(publishDate),
            source: '乘联会',
            url: url,
            importance: severity, // 使用严重程度作为重要性
            dataType: 'fact',
            verificationStatus: 'pending',
            brand: brandModel.brand,
            model: brandModel.model,
            complaintType,
            frequency,
            severity
          };

          complaintsData.push(data);
        }
      });

      return complaintsData;
    } catch (error) {
      console.error('投诉数据采集失败:', error);
      return [];
    }
  }

  // 采集政策数据
  private async collectPoliciesData(): Promise<CPCADataItem[]> {
    const url = `${this.baseUrl}${this.dataSources.policies}`;
    
    try {
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      const policiesData: CPCADataItem[] = [];

      $('.policy-item').each((index, element) => {
        const $item = $(element);
        const title = $item.find('.policy-title').text().trim();
        const content = $item.find('.policy-summary').text().trim();
        const publishDate = $item.find('.policy-date').text().trim();

        const data: CPCADataItem = {
          id: createHash('md5').update(title + publishDate).digest('hex'),
          title,
          content,
          category: 'policy',
          publishDate: this.standardizeDate(publishDate),
          source: '乘联会',
          url: url,
          importance: this.calculatePolicyImportance(title, content),
          dataType: this.classifyPolicyDataType(title, content),
          verificationStatus: 'pending'
        };

        policiesData.push(data);
      });

      return policiesData;
    } catch (error) {
      console.error('政策数据采集失败:', error);
      return [];
    }
  }

  // 辅助方法：提取品牌和车型
  private extractBrandModel(title: string): { brand: string; model: string } {
    const brands = [
      '比亚迪', '特斯拉', '理想', '蔚来', '小鹏', '长城', '吉利', '长安',
      '广汽', '上汽', '北汽', '奇瑞', '江淮', '东风', '一汽', '小米汽车'
    ];

    for (const brand of brands) {
      if (title.includes(brand)) {
        const modelMatch = title.match(new RegExp(`${brand}([\\w\\s]+)`, 'i'));
        const model = modelMatch ? modelMatch[1].trim() : '未知车型';
        return { brand, model };
      }
    }

    return { brand: '其他', model: '未知车型' };
  }

  // 辅助方法：提取销量数字
  private extractSalesVolume(content: string): number {
    const salesMatch = content.match(/(\\d+(?:\\.\\d+)?)\\s*万辆/);
    if (salesMatch) {
      return parseFloat(salesMatch[1]) * 10000; // 转换为辆
    }

    const unitMatch = content.match(/(\\d+(?:\\.\\d+)?)\\s*辆/);
    if (unitMatch) {
      return parseInt(unitMatch[1].replace(/,/g, ''));
    }

    return 0;
  }

  // 辅助方法：提取价格区间
  private extractPriceRange(content: string): string {
    const priceMatch = content.match(/(\\d+(?:\\.\\d+)?)\\s*万(?:\\s*-[\\s*]?(\\d+(?:\\.\\d+)?)\\s*万)?/);
    if (priceMatch) {
      const startPrice = priceMatch[1];
      const endPrice = priceMatch[2] || startPrice;
      return `${startPrice}-${endPrice}万元`;
    }
    return '价格未公布';
  }

  // 辅助方法：标准化日期格式
  private standardizeDate(dateStr: string): string {
    const date = new Date(dateStr.replace(/年|月/g, '-').replace('日', ''));
    return date.toISOString().split('T')[0];
  }

  // 辅助方法：计算重要性等级
  private calculateImportance(title: string, content: string): number {
    let score = 1;

    // 关键词权重
    const keywords = {
      '销量冠军': 5, '第一': 5, '创纪录': 4,
      '新能源': 3, '电动车': 3, '智能汽车': 3,
      '投诉': 2, '问题': 2, '召回': 4
    };

    for (const [keyword, weight] of Object.entries(keywords)) {
      if (title.includes(keyword) || content.includes(keyword)) {
        score = Math.max(score, weight);
      }
    }

    return score;
  }

  // 辅助方法：计算政策重要性
  private calculatePolicyImportance(title: string, content: string): number {
    let score = 2;

    const policyKeywords = {
      '补贴': 4, '购置税': 4, '牌照': 3,
      '双积分': 5, '碳中和': 4, '新能源政策': 5,
      '限行': 3, '限购': 3, '充电基础设施': 3
    };

    for (const [keyword, weight] of Object.entries(policyKeywords)) {
      if (title.includes(keyword) || content.includes(keyword)) {
        score = Math.max(score, weight);
      }
    }

    return score;
  }

  // 辅助方法：分类政策数据类型
  private classifyPolicyDataType(title: string, content: string): 'fact' | 'opinion' {
    if (title.includes('解读') || title.includes('分析') || title.includes('观点')) {
      return 'opinion';
    }
    return 'fact';
  }

  // 辅助方法：分类市场细分
  private classifyMarketSegment(title: string, content: string): string {
    const segments = {
      '轿车': '轿车', 'SUV': 'SUV', 'MPV': 'MPV',
      '微型车': '微型车', '紧凑型': '紧凑型', '中型': '中型', '大型': '大型'
    };

    for (const [keyword, segment] of Object.entries(segments)) {
      if (title.includes(keyword) || content.includes(keyword)) {
        return segment;
      }
    }

    return '其他';
  }

  // 辅助方法：提取规格参数
  private extractSpecifications(content: string): Record<string, any> {
    const specs: Record<string, any> = {};

    // 续航里程
    const rangeMatch = content.match(/(\\d+(?:\\.\\d+)?)\\s*km/);
    if (rangeMatch) {
      specs.range = parseInt(rangeMatch[1]);
    }

    // 电池容量
    const batteryMatch = content.match(/(\\d+(?:\\.\\d+)?)\\s*kWh/);
    if (batteryMatch) {
      specs.batteryCapacity = parseFloat(batteryMatch[1]);
    }

    // 功率
    const powerMatch = content.match(/(\\d+(?:\\.\\d+)?)\\s*kW/);
    if (powerMatch) {
      specs.power = parseFloat(powerMatch[1]);
    }

    return specs;
  }

  // 辅助方法：提取目标市场
  private extractTargetMarket(content: string): string {
    const markets = ['家用', '商用', '出租', '网约', '年轻群体', '家庭用户', '商务'];
    
    for (const market of markets) {
      if (content.includes(market)) {
        return market;
      }
    }

    return '通用市场';
  }

  // 辅助方法：提取上市日期
  private extractLaunchDate(content: string): string {
    const dateMatch = content.match(/(\\d{4})年(\\d{1,2})月/);
    if (dateMatch) {
      return `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}`;
    }
    return '待定';
  }

  // 辅助方法：分类投诉类型
  private classifyComplaintType(title: string, content: string): string {
    const types = {
      '电池': '电池问题', '续航': '续航问题', '充电': '充电问题',
      '质量': '质量问题', '服务': '服务问题', '价格': '价格问题',
      '安全': '安全问题', '软件': '软件问题'
    };

    for (const [keyword, type] of Object.entries(types)) {
      if (title.includes(keyword) || content.includes(keyword)) {
        return type;
      }
    }

    return '其他问题';
  }

  // 辅助方法：提取投诉频率
  private extractComplaintFrequency(content: string): number {
    const freqMatch = content.match(/(\\d+)\\s*起/);
    if (freqMatch) {
      return parseInt(freqMatch[1]);
    }
    return 1;
  }

  // 辅助方法：评估投诉严重程度
  private assessComplaintSeverity(title: string, content: string): number {
    let severity = 1;

    const severeKeywords = {
      '召回': 5, '安全隐患': 5, '起火': 5, '爆炸': 5,
      '刹车失灵': 4, '动力中断': 4, '充电故障': 3,
      '续航虚标': 3, '电池衰减': 3
    };

    for (const [keyword, level] of Object.entries(severeKeywords)) {
      if (title.includes(keyword) || content.includes(keyword)) {
        severity = Math.max(severity, level);
      }
    }

    return severity;
  }
}

// 使用示例
export async function testCPCACollector() {
  const collector = new CPCACollector();
  
  try {
    const data = await collector.collectDailyData();
    console.log('采集到的数据样本:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
    
    // 统计各类数据数量
    const categoryStats = data.reduce((stats, item) => {
      stats[item.category] = (stats[item.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    console.log('数据分类统计:', categoryStats);
    
    return data;
  } catch (error) {
    console.error('测试失败:', error);
    return [];
  }
}