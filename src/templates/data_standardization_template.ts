// 标准化数据整理模板系统
// 负责将收集到的各类数据整理成标准化的日报格式

import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

// 数据汇总类型
interface DailyDataSummary {
  date: string;
  totalItems: number;
  dataSources: {
    cpca: number;
    autohome: number;
    dongchedi: number;
    yiche: number;
    pcauto: number;
    leaderStatements: number;
  };
  categories: {
    sales: number;
    newModels: number;
    complaints: number;
    policies: number;
    reviews: number;
    forums: number;
    news: number;
    leaderStatements: number;
  };
  brands: Record<string, number>;
  importanceDistribution: {
    high: number;    // 4-5分
    medium: number;  // 2-3分
    low: number;     // 1分
  };
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

// 日报内容结构
interface DailyReport {
  metadata: {
    date: string;
    version: string;
    generatedAt: string;
    dataSummary: DailyDataSummary;
  };
  sections: {
    executiveSummary: ExecutiveSummary;
    salesAnalysis: SalesAnalysis;
    newModels: NewModelAnalysis;
    marketTrends: MarketTrends;
    userFeedback: UserFeedback;
    policyUpdates: PolicyUpdates;
    leaderInsights: LeaderInsights;
    riskAlerts: RiskAlerts;
    upcomingEvents: UpcomingEvents;
  };
}

// 执行摘要
interface ExecutiveSummary {
  keyHighlights: string[];
  marketSentiment: 'positive' | 'negative' | 'neutral';
  topStories: Story[];
  criticalAlerts: Alert[];
}

// 销量分析
interface SalesAnalysis {
  overallTrend: 'growing' | 'declining' | 'stable';
  topPerformers: SalesData[];
  emergingBrands: BrandData[];
  marketShare: MarketShare[];
  segmentAnalysis: SegmentAnalysis;
}

// 新车型分析
interface NewModelAnalysis {
  newlyLaunched: NewModel[];
  upcomingLaunches: UpcomingModel[];
  technologyHighlights: TechHighlight[];
  priceAnalysis: PriceSegment[];
}

// 市场趋势
interface MarketTrends {
  technologyTrends: TechTrend[];
  consumerPreferences: ConsumerPref[];
  competitiveLandscape: CompetitiveUpdate[];
  regionalAnalysis: RegionalUpdate[];
}

// 用户反馈
interface UserFeedback {
  satisfactionOverview: SatisfactionMetrics;
  topComplaints: Complaint[];
  positiveFeedback: PositiveFeedback[];
  brandReputation: BrandReputation[];
}

// 政策更新
interface PolicyUpdates {
  newPolicies: Policy[];
  policyInterpretation: PolicyAnalysis[];
  industryImpact: ImpactAssessment[];
  upcomingRegulations: UpcomingRegulation[];
}

// 领袖洞察
interface LeaderInsights {
  strategicStatements: StrategicStatement[];
  technologyVisions: TechVision[];
    marketOutlooks: MarketOutlook[];
  collaborationAnnouncements: Collaboration[];
}

// 风险预警
interface RiskAlerts {
  urgentAlerts: UrgentAlert[];
  marketRisks: MarketRisk[];
  technologyRisks: TechRisk[];
  policyRisks: PolicyRisk[];
}

// 即将发生的事件
interface UpcomingEvents {
  autoShows: AutoShow[];
  productLaunches: ProductLaunch[];
  industryConferences: Conference[];
  policyDeadlines: PolicyDeadline[];
}

// 支持数据结构
interface Story {
  title: string;
  summary: string;
  importance: number;
  source: string;
  url?: string;
  relatedBrands: string[];
}

interface Alert {
  type: 'urgent' | 'important' | 'info';
  title: string;
  description: string;
  actionRequired: boolean;
  deadline?: string;
}

interface SalesData {
  brand: string;
  model: string;
  salesVolume: number;
  growth: number; // 环比增长率
  marketShare: number;
  priceRange: string;
  segment: string;
}

interface BrandData {
  brand: string;
  totalSales: number;
  growthRate: number;
  marketPosition: number;
  keyModels: string[];
}

interface MarketShare {
  brand: string;
  share: number;
  change: number; // 份额变化
  trend: 'up' | 'down' | 'stable';
}

interface SegmentAnalysis {
  sedan: SegmentData;
  suv: SegmentData;
  mpv: SegmentData;
  luxury: SegmentData;
  budget: SegmentData;
}

interface SegmentData {
  totalSales: number;
  growth: number;
  topBrands: string[];
  averagePrice: number;
  keyTrends: string[];
}

interface NewModel {
  brand: string;
  model: string;
  launchDate: string;
  priceRange: string;
  keyFeatures: string[];
  targetMarket: string;
  expectedImpact: 'high' | 'medium' | 'low';
}

interface UpcomingModel {
  brand: string;
  model: string;
  expectedLaunch: string;
  segment: string;
  previewInfo: string;
  marketExpectation: string;
}

interface TechHighlight {
  technology: string;
  description: string;
  applications: string[];
  marketImpact: string;
  timeline: string;
}

interface PriceSegment {
  range: string;
  models: ModelInSegment[];
  competitiveAnalysis: string;
  marketOpportunity: string;
}

interface ModelInSegment {
  brand: string;
  model: string;
  price: string;
  keyFeatures: string[];
  competitiveAdvantage: string;
}

interface TechTrend {
  trend: string;
  description: string;
  keyPlayers: string[];
  adoptionRate: string;
  futureOutlook: string;
}

interface ConsumerPref {
  preference: string;
  percentage: number;
  trend: 'growing' | 'declining' | 'stable';
  influencingFactors: string[];
}

interface CompetitiveUpdate {
  brand: string;
  action: string;
  impact: string;
  competitorResponse: string;
  marketImplications: string;
}

interface RegionalUpdate {
  region: string;
  salesTrend: string;
  policyChanges: string[];
  localCompetition: string;
  growthOpportunities: string[];
}

interface SatisfactionMetrics {
  overall: number;
  byBrand: BrandSatisfaction[];
  bySegment: SegmentSatisfaction[];
  keyFactors: FactorImportance[];
}

interface BrandSatisfaction {
  brand: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
  mainIssues: string[];
  strengths: string[];
}

interface SegmentSatisfaction {
  segment: string;
  score: number;
  commonComplaints: string[];
  praisedFeatures: string[];
}

interface FactorImportance {
  factor: string;
  importance: number;
  satisfaction: number;
  gap: number;
}

interface Complaint {
  category: string;
  description: string;
  frequency: number;
  severity: number;
  affectedBrands: string[];
  trend: 'increasing' | 'decreasing' | 'stable';
}

interface PositiveFeedback {
  category: string;
  description: string;
  frequency: number;
  praisedBrands: string[];
  keyFeatures: string[];
}

interface BrandReputation {
  brand: string;
  reputationScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  keyMentions: string[];
  influenceFactors: string[];
}

interface Policy {
  title: string;
  summary: string;
  effectiveDate: string;
  scope: string;
  industryImpact: string;
  complianceRequirements: string[];
}

interface PolicyAnalysis {
  policy: string;
  interpretation: string;
  implications: string[];
  recommendedActions: string[];
  timeline: string;
}

interface ImpactAssessment {
  policy: string;
  affectedSegments: string[];
  shortTermImpact: string;
  longTermImpact: string;
    opportunityAreas: string[];
  riskAreas: string[];
}

interface UpcomingRegulation {
  regulation: string;
  expectedDate: string;
  preparationNeeded: string[];
  potentialChallenges: string[];
  industryReadiness: 'low' | 'medium' | 'high';
}

interface StrategicStatement {
  leader: string;
  company: string;
  statement: string;
  context: string;
  implications: string[];
  strategicImportance: 'high' | 'medium' | 'low';
}

interface TechVision {
  leader: string;
  company: string;
  vision: string;
  technology: string;
  timeline: string;
  investmentPlans: string[];
  competitiveAdvantage: string;
}

interface MarketOutlook {
  leader: string;
  company: string;
  outlook: string;
  timeframe: string;
  keyAssumptions: string[];
  riskFactors: string[];
  opportunities: string[];
}

interface Collaboration {
  companies: string[];
  collaborationType: string;
  objectives: string[];
  expectedOutcomes: string[];
  timeline: string;
  strategicSignificance: string;
}

interface UrgentAlert {
  alert: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  immediateActions: string[];
  stakeholders: string[];
  deadline: string;
}

interface MarketRisk {
  risk: string;
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  description: string;
  mitigationStrategies: string[];
  earlyWarningIndicators: string[];
}

interface TechRisk {
  technology: string;
  riskLevel: 'low' | 'medium' | 'high';
  description: string;
  affectedAreas: string[];
  contingencyPlans: string[];
  timeline: string;
}

interface PolicyRisk {
  policyArea: string;
  riskType: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: string;
  preparationStatus: 'inadequate' | 'preparing' | 'ready';
  recommendedActions: string[];
}

interface AutoShow {
  name: string;
  location: string;
  date: string;
  expectedHighlights: string[];
  keyParticipatingBrands: string[];
  significance: string;
}

interface ProductLaunch {
  brand: string;
  product: string;
  expectedDate: string;
  segment: string;
  keyFeatures: string[];
  marketExpectations: string;
  competitivePositioning: string;
}

interface Conference {
  name: string;
  theme: string;
  date: string;
  location: string;
  keySpeakers: string[];
  expectedOutcomes: string[];
  industrySignificance: string;
}

interface PolicyDeadline {
  policy: string;
  deadline: string;
  requirements: string[];
  affectedParties: string[];
  complianceStatus: 'not_started' | 'in_progress' | 'nearly_ready' | 'ready';
  criticality: 'low' | 'medium' | 'high';
}

// 标准化数据整理器
export class DataStandardizationTemplate {
  
  // 主要整理方法
  async generateDailyReport(rawData: any[]): Promise<DailyReport> {
    console.log(`[${new Date().toLocaleString()}] 开始生成标准化日报...`);
    
    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd', { locale: zhCN });
    
    try {
      // 数据预处理
      const processedData = this.preprocessData(rawData);
      
      // 生成数据汇总
      const dataSummary = this.generateDataSummary(processedData, dateStr);
      
      // 生成各章节内容
      const sections = {
        executiveSummary: this.generateExecutiveSummary(processedData),
        salesAnalysis: this.generateSalesAnalysis(processedData),
        newModels: this.generateNewModelsAnalysis(processedData),
        marketTrends: this.generateMarketTrends(processedData),
        userFeedback: this.generateUserFeedback(processedData),
        policyUpdates: this.generatePolicyUpdates(processedData),
        leaderInsights: this.generateLeaderInsights(processedData),
        riskAlerts: this.generateRiskAlerts(processedData),
        upcomingEvents: this.generateUpcomingEvents(processedData)
      };
      
      const report: DailyReport = {
        metadata: {
          date: dateStr,
          version: '1.0.0',
          generatedAt: today.toISOString(),
          dataSummary
        },
        sections
      };
      
      console.log(`[${new Date().toLocaleString()}] 标准化日报生成完成`);
      return report;
      
    } catch (error) {
      console.error('日报生成失败:', error);
      throw new Error(`Daily report generation failed: ${error.message}`);
    }
  }

  // 数据预处理
  private preprocessData(rawData: any[]): any[] {
    return rawData.map(item => ({
      ...item,
      processedAt: new Date().toISOString(),
      dataQuality: this.assessDataQuality(item),
      relevanceScore: this.calculateRelevance(item)
    }));
  }

  // 评估数据质量
  private assessDataQuality(item: any): number {
    let score = 0;
    
    // 完整性检查
    if (item.title) score += 20;
    if (item.content) score += 20;
    if (item.publishDate) score += 15;
    if (item.source) score += 15;
    
    // 可信度评估
    if (item.source === '乘联会') score += 20;
    if (item.dataType === 'fact') score += 10;
    
    return Math.min(score, 100);
  }

  // 计算相关性得分
  private calculateRelevance(item: any): number {
    let score = 0;
    
    const keywords = ['新能源', '电动车', '智能汽车', '自动驾驶', '比亚迪', '特斯拉', '理想', '蔚来', '小鹏'];
    const text = (item.title || '') + ' ' + (item.content || '');
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += 10;
      }
    });
    
    return Math.min(score, 100);
  }

  // 生成数据汇总
  private generateDataSummary(data: any[], date: string): DailyDataSummary {
    const summary: DailyDataSummary = {
      date,
      totalItems: data.length,
      dataSources: {
        cpca: data.filter(item => item.source === '乘联会').length,
        autohome: data.filter(item => item.platform === 'autohome').length,
        dongchedi: data.filter(item => item.platform === 'dongchedi').length,
        yiche: data.filter(item => item.platform === 'yiche').length,
        pcauto: data.filter(item => item.platform === 'pcauto').length,
        leaderStatements: data.filter(item => item.leaderId).length
      },
      categories: {
        sales: data.filter(item => item.category === 'sales').length,
        newModels: data.filter(item => item.category === 'new_model').length,
        complaints: data.filter(item => item.category === 'complaint').length,
        policies: data.filter(item => item.category === 'policy').length,
        reviews: data.filter(item => item.category === 'review').length,
        forums: data.filter(item => item.category === 'forum').length,
        news: data.filter(item => item.category === 'news').length,
        leaderStatements: data.filter(item => item.category === 'leader_statement').length
      },
      brands: this.generateBrandStats(data),
      importanceDistribution: {
        high: data.filter(item => item.importance >= 4).length,
        medium: data.filter(item => item.importance >= 2 && item.importance < 4).length,
        low: data.filter(item => item.importance === 1).length
      },
      sentimentDistribution: {
        positive: data.filter(item => item.sentiment === 'positive').length,
        negative: data.filter(item => item.sentiment === 'negative').length,
        neutral: data.filter(item => item.sentiment === 'neutral').length
      }
    };
    
    return summary;
  }

  // 生成品牌统计
  private generateBrandStats(data: any[]): Record<string, number> {
    const brandStats: Record<string, number> = {};
    
    data.forEach(item => {
      if (item.brand) {
        brandStats[item.brand] = (brandStats[item.brand] || 0) + 1;
      }
    });
    
    return brandStats;
  }

  // 生成执行摘要
  private generateExecutiveSummary(data: any[]): ExecutiveSummary {
    const highImportance = data.filter(item => item.importance >= 4);
    const negativeSentiment = data.filter(item => item.sentiment === 'negative');
    
    return {
      keyHighlights: this.extractKeyHighlights(highImportance),
      marketSentiment: this.calculateOverallSentiment(data),
      topStories: this.generateTopStories(highImportance),
      criticalAlerts: this.generateCriticalAlerts(negativeSentiment)
    };
  }

  // 提取关键亮点
  private extractKeyHighlights(data: any[]): string[] {
    const highlights: string[] = [];
    
    // 销量亮点
    const salesData = data.filter(item => item.category === 'sales' && item.salesVolume > 0);
    if (salesData.length > 0) {
      const topSales = salesData.sort((a, b) => b.salesVolume - a.salesVolume)[0];
      highlights.push(`${topSales.brand} ${topSales.model} 月销量 ${topSales.salesVolume} 辆，表现突出`);
    }
    
    // 新产品亮点
    const newModels = data.filter(item => item.category === 'new_model');
    if (newModels.length > 0) {
      highlights.push(`今日新增 ${newModels.length} 款新车型信息`);
    }
    
    // 政策亮点
    const policies = data.filter(item => item.category === 'policy');
    if (policies.length > 0) {
      const importantPolicy = policies.sort((a, b) => b.importance - a.importance)[0];
      highlights.push(`重要政策更新: ${importantPolicy.title}`);
    }
    
    return highlights.slice(0, 5);
  }

  // 计算整体市场情绪
  private calculateOverallSentiment(data: any[]): 'positive' | 'negative' | 'neutral' {
    const sentimentCounts = {
      positive: data.filter(item => item.sentiment === 'positive').length,
      negative: data.filter(item => item.sentiment === 'negative').length,
      neutral: data.filter(item => item.sentiment === 'neutral').length
    };
    
    if (sentimentCounts.positive > sentimentCounts.negative) return 'positive';
    if (sentimentCounts.negative > sentimentCounts.positive) return 'negative';
    return 'neutral';
  }

  // 生成头条故事
  private generateTopStories(data: any[]): Story[] {
    const stories = data
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 5)
      .map(item => ({
        title: item.title,
        summary: item.content?.slice(0, 200) + '...' || '',
        importance: item.importance,
        source: item.source,
        url: item.url,
        relatedBrands: item.brand ? [item.brand] : []
      }));
    
    return stories;
  }

  // 生成关键预警
  private generateCriticalAlerts(data: any[]): Alert[] {
    const alerts: Alert[] = [];
    
    // 高严重度投诉预警
    const highSeverityComplaints = data.filter(item => 
      item.category === 'complaint' && item.severity >= 4
    );
    
    if (highSeverityComplaints.length > 0) {
      alerts.push({
        type: 'urgent',
        title: '高严重度投诉预警',
        description: `发现 ${highSeverityComplaints.length} 起高严重度投诉，涉及安全问题`,
        actionRequired: true,
        deadline: '24小时内处理'
      });
    }
    
    return alerts;
  }

  // 生成销量分析
  private generateSalesAnalysis(data: any[]): SalesAnalysis {
    const salesData = data.filter(item => item.category === 'sales');
    
    return {
      overallTrend: this.calculateOverallTrend(salesData),
      topPerformers: this.getTopPerformers(salesData),
      emergingBrands: this.getEmergingBrands(salesData),
      marketShare: this.calculateMarketShare(salesData),
      segmentAnalysis: this.analyzeSegments(salesData)
    };
  }

  // 其他分析方法...
  private calculateOverallTrend(data: any[]): 'growing' | 'declining' | 'stable' {
    // 简化实现，实际应该基于历史数据
    const positiveGrowth = data.filter(item => item.growth > 0).length;
    const negativeGrowth = data.filter(item => item.growth < 0).length;
    
    if (positiveGrowth > negativeGrowth) return 'growing';
    if (negativeGrowth > positiveGrowth) return 'declining';
    return 'stable';
  }

  private getTopPerformers(data: any[]): SalesData[] {
    return data
      .sort((a, b) => b.salesVolume - a.salesVolume)
      .slice(0, 10)
      .map(item => ({
        brand: item.brand,
        model: item.model,
        salesVolume: item.salesVolume,
        growth: item.growth || 0,
        marketShare: 0, // 需要计算
        priceRange: item.priceRange,
        segment: item.marketSegment || '其他'
      }));
  }

  private getEmergingBrands(data: any[]): BrandData[] {
    // 简化实现
    const brandGroups = data.reduce((groups, item) => {
      if (!groups[item.brand]) {
        groups[item.brand] = { totalSales: 0, count: 0 };
      }
      groups[item.brand].totalSales += item.salesVolume;
      groups[item.brand].count += 1;
      return groups;
    }, {} as Record<string, { totalSales: number; count: number }>);
    
    return Object.entries(brandGroups)
      .map(([brand, data]) => ({
        brand,
        totalSales: data.totalSales,
        growthRate: 0, // 需要历史数据
        marketPosition: 0, // 需要计算
        keyModels: []
      }))
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 5);
  }

  private calculateMarketShare(data: any[]): MarketShare[] {
    const totalSales = data.reduce((sum, item) => sum + item.salesVolume, 0);
    
    const brandGroups = data.reduce((groups, item) => {
      if (!groups[item.brand]) {
        groups[item.brand] = 0;
      }
      groups[item.brand] += item.salesVolume;
      return groups;
    }, {} as Record<string, number>);
    
    return Object.entries(brandGroups)
      .map(([brand, sales]) => ({
        brand,
        share: (sales / totalSales) * 100,
        change: 0, // 需要历史数据
        trend: 'stable'
      }))
      .sort((a, b) => b.share - a.share)
      .slice(0, 10);
  }

  private analyzeSegments(data: any[]): SegmentAnalysis {
    // 简化实现
    return {
      sedan: { totalSales: 0, growth: 0, topBrands: [], averagePrice: 0, keyTrends: [] },
      suv: { totalSales: 0, growth: 0, topBrands: [], averagePrice: 0, keyTrends: [] },
      mpv: { totalSales: 0, growth: 0, topBrands: [], averagePrice: 0, keyTrends: [] },
      luxury: { totalSales: 0, growth: 0, topBrands: [], averagePrice: 0, keyTrends: [] },
      budget: { totalSales: 0, growth: 0, topBrands: [], averagePrice: 0, keyTrends: [] }
    };
  }

  // 其他章节生成方法类似...
  private generateNewModelsAnalysis(data: any[]): NewModelAnalysis {
    const newModels = data.filter(item => item.category === 'new_model');
    
    return {
      newlyLaunched: newModels.map(item => ({
        brand: item.brand,
        model: item.model,
        launchDate: item.launchDate,
        priceRange: item.priceRange,
        keyFeatures: [],
        targetMarket: item.targetMarket,
        expectedImpact: 'medium'
      })),
      upcomingLaunches: [],
      technologyHighlights: [],
      priceAnalysis: []
    };
  }

  private generateMarketTrends(data: any[]): MarketTrends {
    return {
      technologyTrends: [],
      consumerPreferences: [],
      competitiveLandscape: [],
      regionalAnalysis: []
    };
  }

  private generateUserFeedback(data: any[]): UserFeedback {
    const forumData = data.filter(item => item.category === 'forum');
    
    return {
      satisfactionOverview: {
        overall: 3.5,
        byBrand: [],
        bySegment: [],
        keyFactors: []
      },
      topComplaints: [],
      positiveFeedback: [],
      brandReputation: []
    };
  }

  private generatePolicyUpdates(data: any[]): PolicyUpdates {
    const policyData = data.filter(item => item.category === 'policy');
    
    return {
      newPolicies: policyData.map(item => ({
        title: item.title,
        summary: item.content,
        effectiveDate: item.publishDate,
        scope: '全国',
        industryImpact: '待评估',
        complianceRequirements: []
      })),
      policyInterpretation: [],
      industryImpact: [],
      upcomingRegulations: []
    };
  }

  private generateLeaderInsights(data: any[]): LeaderInsights {
    const leaderData = data.filter(item => item.leaderId);
    
    return {
      strategicStatements: [],
      technologyVisions: [],
      marketOutlooks: [],
      collaborationAnnouncements: []
    };
  }

  private generateRiskAlerts(data: any[]): RiskAlerts {
    return {
      urgentAlerts: [],
      marketRisks: [],
      technologyRisks: [],
      policyRisks: []
    };
  }

  private generateUpcomingEvents(data: any[]): UpcomingEvents {
    return {
      autoShows: [],
      productLaunches: [],
      industryConferences: [],
      policyDeadlines: []
    };
  }
}

// 使用示例
export async function testDataStandardizationTemplate() {
  const template = new DataStandardizationTemplate();
  
  // 模拟数据
  const mockData = [
    {
      id: '1',
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
      publishDate: '2025-11-28'
    },
    {
      id: '2',
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
      publishDate: '2025-11-28'
    }
  ];
  
  try {
    const report = await template.generateDailyReport(mockData);
    console.log('生成的日报摘要:');
    console.log('日期:', report.metadata.date);
    console.log('数据总量:', report.metadata.dataSummary.totalItems);
    console.log('执行摘要:', report.sections.executiveSummary.keyHighlights);
    
    return report;
  } catch (error) {
    console.error('测试失败:', error);
    return null;
  }
}