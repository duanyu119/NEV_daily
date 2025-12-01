// 行业领袖动态追踪系统
// 负责追踪头部车企CEO和重要人物的公开言论和动态

import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';

// 人物类型定义
interface IndustryLeader {
  id: string;
  name: string;
  company: string;
  position: string;
  importance: number; // 1-5，行业影响力
  socialMedia: {
    weibo?: string;
    linkedin?: string;
    wechat?: string;
  };
  monitoringKeywords: string[];
}

// 言论数据类型
interface LeaderStatement {
  id: string;
  leaderId: string;
  leaderName: string;
  company: string;
  content: string;
  originalText: string;
  source: string;
  sourceType: 'weibo' | 'linkedin' | 'interview' | 'speech' | 'article';
  publishDate: string;
  url: string;
  importance: number; // 1-5，言论重要性
  category: 'strategy' | 'technology' | 'market' | 'policy' | 'competition' | 'future';
  sentiment: 'positive' | 'negative' | 'neutral';
  strategicLevel: 'tactical' | 'strategic' | 'visionary'; // 战略层级
  dataType: 'fact' | 'opinion' | 'prediction';
  verificationStatus: 'pending' | 'verified' | 'disputed';
  relatedTopics: string[];
  keyPoints: string[];
}

// 重要人物数据库
const INDUSTRY_LEADERS: IndustryLeader[] = [
  {
    id: 'wang-chuanfu',
    name: '王传福',
    company: '比亚迪',
    position: '董事长',
    importance: 5,
    socialMedia: {
      weibo: '比亚迪王传福',
      linkedin: 'chuanfu-wang'
    },
    monitoringKeywords: ['比亚迪', '新能源', '电池', '电动车', '智能汽车', '技术', '创新']
  },
  {
    id: 'li-shufu',
    name: '李书福',
    company: '吉利',
    position: '董事长',
    importance: 5,
    socialMedia: {
      weibo: '李书福',
      linkedin: 'shufu-li'
    },
    monitoringKeywords: ['吉利', '沃尔沃', '新能源', '智能汽车', '全球化', '并购']
  },
  {
    id: 'wei-jianjun',
    name: '魏建军',
    company: '长城',
    position: '董事长',
    importance: 4,
    socialMedia: {
      weibo: '魏建军'
    },
    monitoringKeywords: ['长城', '哈弗', 'WEY', '坦克', 'SUV', '新能源', '智能化']
  },
  {
    id: 'li-xiang',
    name: '李想',
    company: '理想汽车',
    position: 'CEO',
    importance: 4,
    socialMedia: {
      weibo: '李想',
      linkedin: 'xiang-li-4b2b8b'
    },
    monitoringKeywords: ['理想', '增程式', 'SUV', '家庭用户', '智能汽车', '产品']
  },
  {
    id: 'li-bin',
    name: '李斌',
    company: '蔚来',
    position: 'CEO',
    importance: 4,
    socialMedia: {
      weibo: '李斌',
      linkedin: 'bin-li-8b5b2b'
    },
    monitoringKeywords: ['蔚来', '换电', '服务', '高端', '用户体验', '智能驾驶']
  },
  {
    id: 'he-xiaopeng',
    name: '何小鹏',
    company: '小鹏',
    position: 'CEO',
    importance: 4,
    socialMedia: {
      weibo: '何小鹏',
      linkedin: 'xiaopeng-he'
    },
    monitoringKeywords: ['小鹏', '智能驾驶', '自动驾驶', '软件', '技术', 'OTA']
  },
  {
    id: 'lei-jun',
    name: '雷军',
    company: '小米汽车',
    position: 'CEO',
    importance: 5,
    socialMedia: {
      weibo: '雷军',
      linkedin: 'jun-lei-8b5b2b'
    },
    monitoringKeywords: ['小米', '智能生态', '手机', '汽车', '科技', '用户', '性价比']
  },
  {
    id: 'xu-liuping',
    name: '徐留平',
    company: '一汽',
    position: '董事长',
    importance: 4,
    socialMedia: {
      linkedin: 'liuping-xu'
    },
    monitoringKeywords: ['一汽', '红旗', '解放', '自主品牌', '高端', '新能源']
  },
  {
    id: 'chen-hong',
    name: '陈虹',
    company: '上汽',
    position: '董事长',
    importance: 4,
    socialMedia: {
      linkedin: 'hong-chen-8b5b2b'
    },
    monitoringKeywords: ['上汽', '荣威', '名爵', '通用', '大众', '新能源', '智能网联']
  },
  {
    id: 'zhu-huarong',
    name: '朱华荣',
    company: '长安',
    position: '董事长',
    importance: 4,
    socialMedia: {
      weibo: '朱华荣'
    },
    monitoringKeywords: ['长安', '自主', '新能源', '智能化', '全球', '技术']
  }
];

// 主要新闻媒体和采访来源
const NEWS_SOURCES = [
  {
    name: '汽车商业评论',
    url: 'https://www.autobusiness.cn',
    interviewSection: '/interview/'
  },
  {
    name: '36氪汽车',
    url: 'https://36kr.com/automotive',
    interviewSection: '/p/'
  },
  {
    name: '车云网',
    url: 'https://www.cheyun.com',
    interviewSection: '/interview/'
  },
  {
    name: '盖世汽车',
    url: 'https://auto.gasgoo.com',
    interviewSection: '/news/interview/'
  }
];

// 行业领袖动态追踪器
export class IndustryLeaderTracker {
  private readonly leaders = INDUSTRY_LEADERS;
  private readonly newsSources = NEWS_SOURCES;

  // 主要追踪方法
  async trackAllLeaders(): Promise<LeaderStatement[]> {
    console.log(`[${new Date().toLocaleString()}] 开始追踪行业领袖动态...`);
    
    const allStatements: LeaderStatement[] = [];
    
    try {
      // 并行追踪所有领袖
      const leaderPromises = this.leaders.map(leader => 
        this.trackSingleLeader(leader)
      );
      
      const results = await Promise.allSettled(leaderPromises);
      
      results.forEach((result, index) => {
        const leader = this.leaders[index];
        if (result.status === 'fulfilled') {
          console.log(`[${leader.name}] 成功追踪 ${result.value.length} 条言论`);
          allStatements.push(...result.value);
        } else {
          console.error(`[${leader.name}] 追踪失败:`, result.reason);
        }
      });
      
      console.log(`[${new Date().toLocaleString()}] 行业领袖动态追踪完成，共获取 ${allStatements.length} 条言论`);
      return allStatements;
    } catch (error) {
      console.error('行业领袖动态追踪失败:', error);
      throw new Error(`Industry leader tracking failed: ${error.message}`);
    }
  }

  // 追踪单个领袖
  private async trackSingleLeader(leader: IndustryLeader): Promise<LeaderStatement[]> {
    const statements: LeaderStatement[] = [];
    
    try {
      // 追踪微博动态
      if (leader.socialMedia.weibo) {
        const weiboStatements = await this.trackWeibo(leader);
        statements.push(...weiboStatements);
      }
      
      // 追踪LinkedIn动态
      if (leader.socialMedia.linkedin) {
        const linkedinStatements = await this.trackLinkedIn(leader);
        statements.push(...linkedinStatements);
      }
      
      // 追踪采访和报道
      const interviewStatements = await this.trackInterviews(leader);
      statements.push(...interviewStatements);
      
      // 追踪公开演讲
      const speechStatements = await this.trackSpeeches(leader);
      statements.push(...speechStatements);
      
      return statements;
    } catch (error) {
      console.error(`[${leader.name}] 追踪失败:`, error);
      return [];
    }
  }

  // 追踪微博动态
  private async trackWeibo(leader: IndustryLeader): Promise<LeaderStatement[]> {
    const statements: LeaderStatement[] = [];
    
    try {
      // 模拟微博API调用（实际需要使用微博开放平台API）
      const weiboUrl = `https://weibo.com/search?keyword=${encodeURIComponent(leader.name)}`;
      
      // 这里使用网页爬虫方式，实际项目中应使用官方API
      const response = await axios.get(weiboUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // 解析微博内容
      $('.card-wrap').each((index, element) => {
        const $card = $(element);
        const content = $card.find('.txt').text().trim();
        const publishTime = $card.find('.time').text().trim();
        const likeCount = parseInt($card.find('.like').text() || '0');
        const repostCount = parseInt($card.find('.repost').text() || '0');
        const commentCount = parseInt($card.find('.comment').text() || '0');
        
        if (content && this.isRelevantContent(content, leader.monitoringKeywords)) {
          const statement: LeaderStatement = {
            id: createHash('md5').update(`weibo-${leader.id}-${content.slice(0, 50)}`).digest('hex'),
            leaderId: leader.id,
            leaderName: leader.name,
            company: leader.company,
            content: this.extractKeyPoints(content),
            originalText: content,
            source: '微博',
            sourceType: 'weibo',
            publishDate: this.standardizeDate(publishTime),
            url: weiboUrl,
            importance: this.calculateStatementImportance(content, likeCount, repostCount, commentCount),
            category: this.classifyStatementCategory(content),
            sentiment: this.analyzeSentiment(content),
            strategicLevel: this.assessStrategicLevel(content),
            dataType: this.classifyDataType(content),
            verificationStatus: 'pending',
            relatedTopics: this.extractRelatedTopics(content, leader.monitoringKeywords),
            keyPoints: this.extractKeyPoints(content)
          };
          
          statements.push(statement);
        }
      });
      
      return statements;
    } catch (error) {
      console.error(`[${leader.name}] 微博追踪失败:`, error);
      return [];
    }
  }

  // 追踪LinkedIn动态
  private async trackLinkedIn(leader: IndustryLeader): Promise<LeaderStatement[]> {
    const statements: LeaderStatement[] = [];
    
    try {
      // LinkedIn需要特殊处理，通常需要API密钥
      // 这里模拟从公开页面获取信息
      const linkedinUrl = `https://www.linkedin.com/in/${leader.socialMedia.linkedin}`;
      
      // 注意：LinkedIn有严格的反爬虫机制，实际项目中应使用官方API
      console.log(`[${leader.name}] LinkedIn追踪需要API支持`);
      
      return statements;
    } catch (error) {
      console.error(`[${leader.name}] LinkedIn追踪失败:`, error);
      return [];
    }
  }

  // 追踪采访报道
  private async trackInterviews(leader: IndustryLeader): Promise<LeaderStatement[]> {
    const statements: LeaderStatement[] = [];
    
    try {
      // 并行搜索各大媒体的采访报道
      const searchPromises = this.newsSources.map(source => 
        this.searchLeaderInterviews(leader, source)
      );
      
      const results = await Promise.allSettled(searchPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          statements.push(...result.value);
        }
      });
      
      return statements;
    } catch (error) {
      console.error(`[${leader.name}] 采访追踪失败:`, error);
      return [];
    }
  }

  // 搜索特定领袖的采访
  private async searchLeaderInterviews(leader: IndustryLeader, source: any): Promise<LeaderStatement[]> {
    const statements: LeaderStatement[] = [];
    
    try {
      const searchUrl = `${source.url}${source.interviewSection}?keyword=${encodeURIComponent(leader.name)}`;
      
      const response = await axios.get(searchUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // 解析采访文章
      $('.article-item, .news-item, .interview-item').each((index, element) => {
        const $item = $(element);
        const title = $item.find('.title, .article-title').text().trim();
        const summary = $item.find('.summary, .desc').text().trim();
        const publishDate = $item.find('.date, .time').text().trim();
        const articleUrl = $item.find('a').attr('href');
        
        if (title && this.isRelevantContent(title + ' ' + summary, leader.monitoringKeywords)) {
          const statement: LeaderStatement = {
            id: createHash('md5').update(`interview-${leader.id}-${title}`).digest('hex'),
            leaderId: leader.id,
            leaderName: leader.name,
            company: leader.company,
            content: summary,
            originalText: summary,
            source: source.name,
            sourceType: 'interview',
            publishDate: this.standardizeDate(publishDate),
            url: articleUrl ? (articleUrl.startsWith('http') ? articleUrl : `${source.url}${articleUrl}`) : searchUrl,
            importance: this.calculateStatementImportance(title + ' ' + summary),
            category: this.classifyStatementCategory(title + ' ' + summary),
            sentiment: this.analyzeSentiment(title + ' ' + summary),
            strategicLevel: this.assessStrategicLevel(title + ' ' + summary),
            dataType: this.classifyDataType(title + ' ' + summary),
            verificationStatus: 'pending',
            relatedTopics: this.extractRelatedTopics(title + ' ' + summary, leader.monitoringKeywords),
            keyPoints: this.extractKeyPoints(title + ' ' + summary)
          };
          
          statements.push(statement);
        }
      });
      
      return statements;
    } catch (error) {
      console.error(`[${leader.name}] ${source.name}采访搜索失败:`, error);
      return [];
    }
  }

  // 追踪公开演讲
  private async trackSpeeches(leader: IndustryLeader): Promise<LeaderStatement[]> {
    const statements: LeaderStatement[] = [];
    
    try {
      // 搜索公开演讲和会议发言
      const conferenceKeywords = ['论坛', '峰会', '大会', '年会', '发布会', '演讲'];
      const searchQuery = `${leader.name} ${conferenceKeywords.join(' OR ')}`;
      
      // 模拟搜索各大新闻网站的演讲报道
      const searchPromises = this.newsSources.map(source => 
        this.searchLeaderSpeeches(leader, source, searchQuery)
      );
      
      const results = await Promise.allSettled(searchPromises);
      
      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          statements.push(...result.value);
        }
      });
      
      return statements;
    } catch (error) {
      console.error(`[${leader.name}] 演讲追踪失败:`, error);
      return [];
    }
  }

  // 搜索特定领袖的演讲
  private async searchLeaderSpeeches(leader: IndustryLeader, source: any, searchQuery: string): Promise<LeaderStatement[]> {
    const statements: LeaderStatement[] = [];
    
    try {
      const searchUrl = `${source.url}/search?keyword=${encodeURIComponent(searchQuery)}`;
      
      const response = await axios.get(searchUrl, {
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      
      // 解析演讲报道
      $('.article-item, .news-item').each((index, element) => {
        const $item = $(element);
        const title = $item.find('.title, .article-title').text().trim();
        const summary = $item.find('.summary, .desc').text().trim();
        const publishDate = $item.find('.date, .time').text().trim();
        const articleUrl = $item.find('a').attr('href');
        
        // 检查是否为演讲相关报道
        const isSpeech = /论坛|峰会|大会|年会|发布会|演讲/.test(title);
        
        if (isSpeech && title && this.isRelevantContent(title + ' ' + summary, leader.monitoringKeywords)) {
          const statement: LeaderStatement = {
            id: createHash('md5').update(`speech-${leader.id}-${title}`).digest('hex'),
            leaderId: leader.id,
            leaderName: leader.name,
            company: leader.company,
            content: summary,
            originalText: summary,
            source: source.name,
            sourceType: 'speech',
            publishDate: this.standardizeDate(publishDate),
            url: articleUrl ? (articleUrl.startsWith('http') ? articleUrl : `${source.url}${articleUrl}`) : searchUrl,
            importance: this.calculateStatementImportance(title + ' ' + summary) + 1, // 演讲重要性+1
            category: this.classifyStatementCategory(title + ' ' + summary),
            sentiment: this.analyzeSentiment(title + ' ' + summary),
            strategicLevel: 'visionary', // 演讲通常具有前瞻性
            dataType: this.classifyDataType(title + ' ' + summary),
            verificationStatus: 'pending',
            relatedTopics: this.extractRelatedTopics(title + ' ' + summary, leader.monitoringKeywords),
            keyPoints: this.extractKeyPoints(title + ' ' + summary)
          };
          
          statements.push(statement);
        }
      });
      
      return statements;
    } catch (error) {
      console.error(`[${leader.name}] ${source.name}演讲搜索失败:`, error);
      return [];
    }
  }

  // 辅助方法：检查内容相关性
  private isRelevantContent(content: string, keywords: string[]): boolean {
    return keywords.some(keyword => content.includes(keyword));
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

  // 辅助方法：计算言论重要性
  private calculateStatementImportance(content: string, likeCount: number = 0, repostCount: number = 0, commentCount: number = 0): number {
    let score = 1;

    // 关键词权重
    const keywords = {
      '战略': 4, '规划': 4, '目标': 3, '计划': 3,
      '技术': 3, '创新': 3, '研发': 3, '投入': 3,
      '市场': 2, '竞争': 2, '领先': 3, '第一': 3,
      '未来': 3, '趋势': 3, '预测': 3, '展望': 3,
      '政策': 3, '法规': 3, '标准': 2, '监管': 2,
      '合作': 2, '投资': 3, '收购': 4, '并购': 4,
      '全球化': 4, '国际化': 4, '海外': 3, '出口': 3
    };

    for (const [keyword, weight] of Object.entries(keywords)) {
      if (content.includes(keyword)) {
        score = Math.max(score, weight);
      }
    }

    // 互动数据影响
    if (likeCount > 1000) score += 1;
    if (likeCount > 10000) score += 1;
    if (repostCount > 500) score += 1;
    if (commentCount > 200) score += 1;

    return Math.min(score, 5);
  }

  // 辅助方法：分类言论类别
  private classifyStatementCategory(content: string): LeaderStatement['category'] {
    const categories = {
      strategy: ['战略', '规划', '目标', '计划', '布局', '定位'],
      technology: ['技术', '创新', '研发', '专利', '智能化', '自动驾驶'],
      market: ['市场', '销量', '份额', '竞争', '用户', '客户'],
      policy: ['政策', '法规', '标准', '监管', '补贴', '购置税'],
      competition: ['竞争', '对手', '超越', '领先', '优势', '差异化'],
      future: ['未来', '趋势', '预测', '展望', '明年', '后年', '五年']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => content.includes(keyword))) {
        return category as LeaderStatement['category'];
      }
    }

    return 'strategy'; // 默认分类
  }

  // 辅助方法：分析情感倾向
  private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['好', '棒', '优秀', '领先', '成功', '增长', '突破', '创新', '满意', '乐观'];
    const negativeWords = ['差', '困难', '挑战', '问题', '担忧', '风险', '压力', '危机', '下滑', '亏损'];
    
    const positiveCount = positiveWords.filter(word => content.includes(word)).length;
    const negativeCount = negativeWords.filter(word => content.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // 辅助方法：评估战略层级
  private assessStrategicLevel(content: string): LeaderStatement['strategicLevel'] {
    if (content.includes('愿景') || content.includes('使命') || content.includes('五年') || content.includes('十年')) {
      return 'visionary';
    }
    
    if (content.includes('战略') || content.includes('规划') || content.includes('目标')) {
      return 'strategic';
    }
    
    return 'tactical';
  }

  // 辅助方法：分类数据类型
  private classifyDataType(content: string): 'fact' | 'opinion' | 'prediction' {
    if (content.includes('预测') || content.includes('预计') || content.includes('将') || content.includes('会')) {
      return 'prediction';
    }
    
    if (content.includes('认为') || content.includes('观点') || content.includes('看法') || content.includes('相信')) {
      return 'opinion';
    }
    
    return 'fact';
  }

  // 辅助方法：提取相关话题
  private extractRelatedTopics(content: string, keywords: string[]): string[] {
    return keywords.filter(keyword => content.includes(keyword));
  }

  // 辅助方法：提取关键要点
  private extractKeyPoints(content: string): string[] {
    // 简单的关键要点提取，实际项目中可以使用更复杂的NLP技术
    const sentences = content.split(/[。！？]/).filter(s => s.length > 10);
    return sentences.slice(0, 3).map(s => s.trim());
  }
}

// 使用示例
export async function testIndustryLeaderTracker() {
  const tracker = new IndustryLeaderTracker();
  
  try {
    const statements = await tracker.trackAllLeaders();
    console.log('追踪到的领袖言论样本:');
    console.log(JSON.stringify(statements.slice(0, 5), null, 2));
    
    // 统计各领袖言论数量
    const leaderStats = statements.reduce((stats, statement) => {
      const key = `${statement.leaderName} (${statement.company})`;
      stats[key] = (stats[key] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    console.log('各领袖言论统计:', leaderStats);
    
    // 统计各类别言论数量
    const categoryStats = statements.reduce((stats, statement) => {
      stats[statement.category] = (stats[statement.category] || 0) + 1;
      return stats;
    }, {} as Record<string, number>);
    
    console.log('言论类别分布:', categoryStats);
    
    return statements;
  } catch (error) {
    console.error('测试失败:', error);
    return [];
  }
}