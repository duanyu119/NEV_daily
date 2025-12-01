// 四大汽车垂直平台监测模块
// 负责监测汽车之家、懂车帝、易车网、太平洋汽车的信息

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';

// 平台类型定义
export type PlatformType = 'autohome' | 'dongchedi' | 'yiche' | 'pcauto';

// 数据类型定义
interface PlatformDataItem {
  id: string;
  platform: PlatformType;
  title: string;
  content: string;
  category: 'new_car' | 'review' | 'comparison' | 'forum' | 'news';
  publishDate: string;
  author: string;
  url: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  importance: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  dataType: 'fact' | 'opinion' | 'user_feedback';
  verificationStatus: 'pending' | 'verified' | 'disputed';
  brand?: string;
  model?: string;
  keywords: string[];
}

interface ForumData extends PlatformDataItem {
  userLevel: string;
  userReputation: number;
  replyCount: number;
  helpfulCount: number;
  complaintType?: string;
  satisfaction?: number; // 1-5 满意度评分
}

interface ReviewData extends PlatformDataItem {
  editorName: string;
  rating: number; // 1-10 评分
  pros: string[];
  cons: string[];
  specifications: Record<string, any>;
}

// 平台配置
const PLATFORM_CONFIGS = {
  autohome: {
    name: '汽车之家',
    baseUrl: 'https://www.autohome.com.cn',
    endpoints: {
      newCars: '/newcar/',
      reviews: '/test/',
      forums: '/bbs/',
      news: '/news/'
    },
    selectors: {
      listItem: '.article-list-item',
      title: '.article-title',
      content: '.article-summary',
      date: '.article-time',
      author: '.article-author',
      viewCount: '.article-viewcount',
      likeCount: '.article-likecount'
    }
  },
  dongchedi: {
    name: '懂车帝',
    baseUrl: 'https://www.dongchedi.com',
    endpoints: {
      newCars: '/news',
      reviews: '/evaluate',
      forums: '/community',
      news: '/newslist'
    },
    selectors: {
      listItem: '.dc-news-item',
      title: '.news-title',
      content: '.news-summary',
      date: '.news-time',
      author: '.news-author',
      viewCount: '.news-view',
      likeCount: '.news-like'
    }
  },
  yiche: {
    name: '易车网',
    baseUrl: 'https://www.yiche.com',
    endpoints: {
      newCars: '/news/newcar/',
      reviews: '/pingce/',
      forums: '/bbs/',
      news: '/news/'
    },
    selectors: {
      listItem: '.news-item',
      title: '.news-title',
      content: '.news-desc',
      date: '.news-date',
      author: '.news-source',
      viewCount: '.news-read',
      likeCount: '.news-like'
    }
  },
  pcauto: {
    name: '太平洋汽车',
    baseUrl: 'https://www.pcauto.com.cn',
    endpoints: {
      newCars: '/newcar/',
      reviews: '/pingce/',
      forums: '/bbs/',
      news: '/news/'
    },
    selectors: {
      listItem: '.art-item',
      title: '.art-title',
      content: '.art-desc',
      date: '.art-time',
      author: '.art-author',
      viewCount: '.art-view',
      likeCount: '.art-like'
    }
  }
};

// 垂直平台监测器
export class VerticalPlatformMonitor {
  private readonly platforms: PlatformType[] = ['autohome', 'dongchedi', 'yiche', 'pcauto'];
  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  ];

  // 主要监测方法
  async monitorAllPlatforms(): Promise<PlatformDataItem[]> {
    console.log(`[${new Date().toLocaleString()}] 开始监测四大汽车垂直平台...`);
    
    const allData: PlatformDataItem[] = [];
    
    // 并行监测所有平台
    const platformPromises = this.platforms.map(platform => 
      this.monitorSinglePlatform(platform)
    );
    
    try {
      const results = await Promise.allSettled(platformPromises);
      
      results.forEach((result, index) => {
        const platform = this.platforms[index];
        if (result.status === 'fulfilled') {
          console.log(`[${platform}] 成功采集 ${result.value.length} 条数据`);
          allData.push(...result.value);
        } else {
          console.error(`[${platform}] 采集失败:`, result.reason);
        }
      });
      
      console.log(`[${new Date().toLocaleString()}] 四大平台监测完成，共获取 ${allData.length} 条数据`);
      return allData;
    } catch (error) {
      console.error('平台监测失败:', error);
      throw new Error(`Platform monitoring failed: ${error.message}`);
    }
  }

  // 监测单个平台
  private async monitorSinglePlatform(platform: PlatformType): Promise<PlatformDataItem[]> {
    const config = PLATFORM_CONFIGS[platform];
    const platformData: PlatformDataItem[] = [];
    
    try {
      // 监测各类内容
      const [newCarsData, reviewsData, forumsData, newsData] = await Promise.all([
        this.collectNewCars(platform),
        this.collectReviews(platform),
        this.collectForums(platform),
        this.collectNews(platform)
      ]);

      platformData.push(...newCarsData, ...reviewsData, ...forumsData, ...newsData);
      
      return platformData;
    } catch (error) {
      console.error(`[${platform}] 监测失败:`, error);
      return [];
    }
  }

  // 采集新车信息
  private async collectNewCars(platform: PlatformType): Promise<PlatformDataItem[]> {
    const config = PLATFORM_CONFIGS[platform];
    const url = `${config.baseUrl}${config.endpoints.newCars}`;
    
    try {
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      const newCarsData: PlatformDataItem[] = [];

      $(config.selectors.listItem).each((index, element) => {
        const $item = $(element);
        const title = $item.find(config.selectors.title).text().trim();
        const content = $item.find(config.selectors.content).text().trim();
        const publishDate = $item.find(config.selectors.date).text().trim();
        const author = $item.find(config.selectors.author).text().trim();
        const viewCount = this.extractNumber($item.find(config.selectors.viewCount).text());
        const likeCount = this.extractNumber($item.find(config.selectors.likeCount).text());
        
        const brandModel = this.extractBrandModel(title);
        const importance = this.calculateImportance(title, content, viewCount);
        const sentiment = this.analyzeSentiment(title, content);
        const keywords = this.extractKeywords(title + ' ' + content);

        const data: PlatformDataItem = {
          id: createHash('md5').update(`${platform}-${title}-${publishDate}`).digest('hex'),
          platform,
          title,
          content,
          category: 'new_car',
          publishDate: this.standardizeDate(publishDate),
          author,
          url: this.extractUrl($item, config.baseUrl),
          viewCount,
          likeCount,
          importance,
          sentiment,
          dataType: 'fact',
          verificationStatus: 'pending',
          brand: brandModel.brand,
          model: brandModel.model,
          keywords
        };

        newCarsData.push(data);
      });

      return newCarsData;
    } catch (error) {
      console.error(`[${platform}] 新车信息采集失败:`, error);
      return [];
    }
  }

  // 采集专业评测
  private async collectReviews(platform: PlatformType): Promise<ReviewData[]> {
    const config = PLATFORM_CONFIGS[platform];
    const url = `${config.baseUrl}${config.endpoints.reviews}`;
    
    try {
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      const reviewsData: ReviewData[] = [];

      $(config.selectors.listItem).each((index, element) => {
        const $item = $(element);
        const title = $item.find(config.selectors.title).text().trim();
        const content = $item.find(config.selectors.content).text().trim();
        const publishDate = $item.find(config.selectors.date).text().trim();
        const author = $item.find(config.selectors.author).text().trim();
        
        const brandModel = this.extractBrandModel(title);
        const rating = this.extractRating(content);
        const pros = this.extractPros(content);
        const cons = this.extractCons(content);
        const specifications = this.extractSpecifications(content);
        const importance = this.calculateImportance(title, content);
        const sentiment = this.analyzeSentiment(title, content);
        const keywords = this.extractKeywords(title + ' ' + content);

        const data: ReviewData = {
          id: createHash('md5').update(`${platform}-${title}-${publishDate}`).digest('hex'),
          platform,
          title,
          content,
          category: 'review',
          publishDate: this.standardizeDate(publishDate),
          author,
          url: this.extractUrl($item, config.baseUrl),
          importance,
          sentiment,
          dataType: 'opinion',
          verificationStatus: 'pending',
          brand: brandModel.brand,
          model: brandModel.model,
          keywords,
          editorName: author,
          rating,
          pros,
          cons,
          specifications
        };

        reviewsData.push(data);
      });

      return reviewsData;
    } catch (error) {
      console.error(`[${platform}] 评测信息采集失败:`, error);
      return [];
    }
  }

  // 采集用户论坛反馈
  private async collectForums(platform: PlatformType): Promise<ForumData[]> {
    const config = PLATFORM_CONFIGS[platform];
    const url = `${config.baseUrl}${config.endpoints.forums}`;
    
    try {
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      const forumsData: ForumData[] = [];

      $('.forum-post, .bbs-item, .topic-item').each((index, element) => {
        const $item = $(element);
        const title = $item.find('.post-title, .topic-title').text().trim();
        const content = $item.find('.post-content, .topic-content').text().trim();
        const publishDate = $item.find('.post-time, .topic-time').text().trim();
        const author = $item.find('.post-author, .topic-author').text().trim();
        const replyCount = this.extractNumber($item.find('.reply-count, .comment-count').text());
        const viewCount = this.extractNumber($item.find('.view-count, .read-count').text());
        
        const brandModel = this.extractBrandModel(title + ' ' + content);
        const userLevel = this.extractUserLevel($item);
        const userReputation = this.calculateUserReputation(userLevel, replyCount);
        const satisfaction = this.extractSatisfaction(content);
        const complaintType = this.extractComplaintType(content);
        const helpfulCount = this.extractNumber($item.find('.helpful-count, .like-count').text());
        const importance = this.calculateForumImportance(userReputation, replyCount, viewCount);
        const sentiment = this.analyzeSentiment(title, content);
        const keywords = this.extractKeywords(title + ' ' + content);

        const data: ForumData = {
          id: createHash('md5').update(`${platform}-forum-${title}-${publishDate}`).digest('hex'),
          platform,
          title,
          content,
          category: 'forum',
          publishDate: this.standardizeDate(publishDate),
          author,
          url: this.extractUrl($item, config.baseUrl),
          viewCount,
          likeCount: helpfulCount,
          commentCount: replyCount,
          importance,
          sentiment,
          dataType: 'user_feedback',
          verificationStatus: 'pending',
          brand: brandModel.brand,
          model: brandModel.model,
          keywords,
          userLevel,
          userReputation,
          replyCount,
          helpfulCount,
          complaintType,
          satisfaction
        };

        forumsData.push(data);
      });

      return forumsData;
    } catch (error) {
      console.error(`[${platform}] 论坛信息采集失败:`, error);
      return [];
    }
  }

  // 采集新闻资讯
  private async collectNews(platform: PlatformType): Promise<PlatformDataItem[]> {
    const config = PLATFORM_CONFIGS[platform];
    const url = `${config.baseUrl}${config.endpoints.news}`;
    
    try {
      const response = await this.makeRequest(url);
      const $ = cheerio.load(response.data);
      const newsData: PlatformDataItem[] = [];

      $(config.selectors.listItem).each((index, element) => {
        const $item = $(element);
        const title = $item.find(config.selectors.title).text().trim();
        const content = $item.find(config.selectors.content).text().trim();
        const publishDate = $item.find(config.selectors.date).text().trim();
        const author = $item.find(config.selectors.author).text().trim();
        const viewCount = this.extractNumber($item.find(config.selectors.viewCount).text());
        const likeCount = this.extractNumber($item.find(config.selectors.likeCount).text());
        
        const brandModel = this.extractBrandModel(title);
        const importance = this.calculateImportance(title, content, viewCount);
        const sentiment = this.analyzeSentiment(title, content);
        const keywords = this.extractKeywords(title + ' ' + content);
        const dataType = this.classifyNewsDataType(title, content);

        const data: PlatformDataItem = {
          id: createHash('md5').update(`${platform}-news-${title}-${publishDate}`).digest('hex'),
          platform,
          title,
          content,
          category: 'news',
          publishDate: this.standardizeDate(publishDate),
          author,
          url: this.extractUrl($item, config.baseUrl),
          viewCount,
          likeCount,
          importance,
          sentiment,
          dataType,
          verificationStatus: 'pending',
          brand: brandModel.brand,
          model: brandModel.model,
          keywords
        };

        newsData.push(data);
      });

      return newsData;
    } catch (error) {
      console.error(`[${platform}] 新闻信息采集失败:`, error);
      return [];
    }
  }

  // HTTP请求方法
  private async makeRequest(url: string): Promise<any> {
    const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
    
    return axios.get(url, {
      timeout: 30000,
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      }
    });
  }

  // 辅助方法：提取数字
  private extractNumber(text: string): number {
    const match = text.match(/(\d+(?:\.\d+)?)/);
    return match ? parseInt(match[1]) : 0;
  }

  // 辅助方法：提取URL
  private extractUrl($item: cheerio.Cheerio, baseUrl: string): string {
    const href = $item.find('a').attr('href');
    if (!href) return baseUrl;
    
    if (href.startsWith('http')) {
      return href;
    } else if (href.startsWith('/')) {
      return `${baseUrl}${href}`;
    } else {
      return `${baseUrl}/${href}`;
    }
  }

  // 辅助方法：标准化日期
  private standardizeDate(dateStr: string): string {
    const now = new Date();
    
    // 处理相对时间
    if (dateStr.includes('分钟前')) {
      const minutes = parseInt(dateStr.match(/(\d+)/)?.[1] || '0');
      return new Date(now.getTime() - minutes * 60000).toISOString().split('T')[0];
    }
    
    if (dateStr.includes('小时前')) {
      const hours = parseInt(dateStr.match(/(\d+)/)?.[1] || '0');
      return new Date(now.getTime() - hours * 3600000).toISOString().split('T')[0];
    }
    
    if (dateStr.includes('天前')) {
      const days = parseInt(dateStr.match(/(\d+)/)?.[1] || '0');
      return new Date(now.getTime() - days * 86400000).toISOString().split('T')[0];
    }
    
    // 处理绝对时间
    const date = new Date(dateStr.replace(/年|月/g, '-').replace('日', ''));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return now.toISOString().split('T')[0];
  }

  // 辅助方法：提取品牌和车型
  private extractBrandModel(text: string): { brand: string; model: string } {
    const brands = [
      '比亚迪', '特斯拉', '理想', '蔚来', '小鹏', '长城', '吉利', '长安',
      '广汽', '上汽', '北汽', '奇瑞', '江淮', '东风', '一汽', '小米汽车',
      '华为', '问界', '极氪', '零跑', '哪吒', '岚图', '极狐', '阿维塔'
    ];

    for (const brand of brands) {
      if (text.includes(brand)) {
        const modelMatch = text.match(new RegExp(`${brand}([\\w\\s]+)`, 'i'));
        const model = modelMatch ? modelMatch[1].trim() : '未知车型';
        return { brand, model };
      }
    }

    return { brand: '其他', model: '未知车型' };
  }

  // 辅助方法：计算重要性
  private calculateImportance(title: string, content: string, viewCount: number = 0): number {
    let score = 1;

    // 关键词权重
    const keywords = {
      '新能源': 3, '电动车': 3, '智能汽车': 3, '自动驾驶': 4,
      '销量': 2, '上市': 2, '发布': 2, '全新': 2,
      '评测': 2, '试驾': 2, '对比': 2, '导购': 2,
      '投诉': 3, '问题': 2, '故障': 3, '召回': 4,
      '续航': 3, '充电': 3, '电池': 3, '安全': 4
    };

    const text = title + ' ' + content;
    for (const [keyword, weight] of Object.entries(keywords)) {
      if (text.includes(keyword)) {
        score = Math.max(score, weight);
      }
    }

    // 浏览量影响
    if (viewCount > 10000) score += 1;
    if (viewCount > 50000) score += 1;
    if (viewCount > 100000) score += 1;

    return Math.min(score, 5);
  }

  // 辅助方法：计算论坛重要性
  private calculateForumImportance(userReputation: number, replyCount: number, viewCount: number): number {
    let score = Math.min(userReputation, 3);
    
    if (replyCount > 50) score += 1;
    if (replyCount > 200) score += 1;
    if (viewCount > 10000) score += 1;
    
    return Math.min(score, 5);
  }

  // 辅助方法：情感分析
  private analyzeSentiment(title: string, content: string): 'positive' | 'negative' | 'neutral' {
    const text = title + ' ' + content;
    
    const positiveWords = ['好', '棒', '优秀', '满意', '推荐', '值得', '不错', '给力', '赞'];
    const negativeWords = ['差', '烂', '垃圾', '失望', '问题', '故障', '投诉', '后悔', '坑'];
    
    const positiveCount = positiveWords.filter(word => text.includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // 辅助方法：提取关键词
  private extractKeywords(text: string): string[] {
    const keywords = [
      '新能源', '电动车', '智能汽车', '自动驾驶', '续航', '充电', '电池',
      '安全', '性能', '空间', '舒适', '性价比', '外观', '内饰', '配置',
      '比亚迪', '特斯拉', '理想', '蔚来', '小鹏', '长城', '吉利', '长安'
    ];
    
    return keywords.filter(keyword => text.includes(keyword));
  }

  // 辅助方法：提取评分
  private extractRating(content: string): number {
    const ratingMatch = content.match(/(\d+(?:\.\d+)?)\\s*分/);
    if (ratingMatch) {
      return Math.round(parseFloat(ratingMatch[1]));
    }
    return 5; // 默认中等评分
  }

  // 辅助方法：提取优点
  private extractPros(content: string): string[] {
    const prosMatch = content.match(/优点[:：]([^。]+)/);
    if (prosMatch) {
      return prosMatch[1].split(/[,，]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
  }

  // 辅助方法：提取缺点
  private extractCons(content: string): string[] {
    const consMatch = content.match(/缺点[:：]([^。]+)/);
    if (consMatch) {
      return consMatch[1].split(/[,，]/).map(s => s.trim()).filter(s => s.length > 0);
    }
    return [];
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

    return specs;
  }

  // 辅助方法：提取用户等级
  private extractUserLevel($item: cheerio.Cheerio): string {
    const levelText = $item.find('.user-level, .member-level').text();
    return levelText || '普通用户';
  }

  // 辅助方法：计算用户信誉
  private calculateUserReputation(userLevel: string, activityCount: number): number {
    let score = 1;
    
    if (userLevel.includes('VIP')) score = 5;
    else if (userLevel.includes('高级')) score = 4;
    else if (userLevel.includes('中级')) score = 3;
    else if (userLevel.includes('初级')) score = 2;
    
    if (activityCount > 100) score += 1;
    if (activityCount > 500) score += 1;
    
    return Math.min(score, 5);
  }

  // 辅助方法：提取满意度
  private extractSatisfaction(content: string): number | undefined {
    const satisfactionMatch = content.match(/满意度[:：](\\d)/);
    if (satisfactionMatch) {
      return parseInt(satisfactionMatch[1]);
    }
    return undefined;
  }

  // 辅助方法：提取投诉类型
  private extractComplaintType(content: string): string | undefined {
    const complaintKeywords = {
      '电池': '电池问题', '续航': '续航问题', '充电': '充电问题',
      '质量': '质量问题', '服务': '服务问题', '软件': '软件问题'
    };
    
    for (const [keyword, type] of Object.entries(complaintKeywords)) {
      if (content.includes(keyword)) {
        return type;
      }
    }
    return undefined;
  }

  // 辅助方法：分类新闻数据类型
  private classifyNewsDataType(title: string, content: string): 'fact' | 'opinion' {
    if (title.includes('观点') || title.includes('分析') || title.includes('评论')) {
      return 'opinion';
    }
    return 'fact';
  }
}

// 使用示例
export async function testVerticalPlatformMonitor() {
  const monitor = new VerticalPlatformMonitor();
  
  try {
    const data = await monitor.monitorAllPlatforms();
    console.log('监测到的数据样本:');
    console.log(JSON.stringify(data.slice(0, 5), null, 2));
    
    // 统计各平台数据量
    const platformStats = data.reduce((stats, item) => {
      stats[item.platform] = (stats[item.platform] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    console.log('各平台数据分布:', platformStats);
    
    // 统计各类别数据量
    const categoryStats = data.reduce((stats, item) => {
      stats[item.category] = (stats[item.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    console.log('内容类别分布:', categoryStats);
    
    return data;
  } catch (error) {
    console.error('测试失败:', error);
    return [];
  }
}