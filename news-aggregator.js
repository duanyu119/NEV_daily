// 新闻采集与管理系统
class NewsAggregator {
    constructor() {
        this.newsSources = [
            {
                name: "OFweek新能源汽车网",
                url: "https://nev.ofweek.com",
                weight: 0.9,
                type: "industry"
            },
            {
                name: "21经济网", 
                url: "https://www.21jingji.com",
                weight: 0.85,
                type: "finance"
            },
            {
                name: "中国汽车流通协会",
                url: "https://www.cada.cn",
                weight: 0.95,
                type: "authority"
            },
            {
                name: "证券时报网",
                url: "https://stcn.com",
                weight: 0.8,
                type: "finance"
            },
            {
                name: "中国政府网",
                url: "https://www.gov.cn",
                weight: 1.0,
                type: "government"
            }
        ];
        
        this.freshnessThresholds = {
            veryFresh: 24,    // 24小时内
            fresh: 72,        // 3天内
            normal: 168,      // 7天内
            expired: 168      // 超过7天过期
        };
    }

    // 计算新闻新鲜度评分 (0-100)
    calculateFreshnessScore(publishDate) {
        const now = new Date();
        const publishTime = new Date(publishDate);
        const hoursDiff = (now - publishTime) / (1000 * 60 * 60);
        
        let score = 0;
        let freshnessLevel = '';
        
        if (hoursDiff <= this.freshnessThresholds.veryFresh) {
            score = 100 - (hoursDiff / 24) * 30; // 24小时内线性衰减
            freshnessLevel = 'very-fresh';
        } else if (hoursDiff <= this.freshnessThresholds.fresh) {
            score = 70 - ((hoursDiff - 24) / 48) * 20; // 3天内衰减到50
            freshnessLevel = 'fresh';
        } else if (hoursDiff <= this.freshnessThresholds.normal) {
            score = 50 - ((hoursDiff - 72) / 96) * 30; // 7天内衰减到20
            freshnessLevel = 'normal';
        } else {
            score = Math.max(0, 20 - ((hoursDiff - 168) / 168) * 20); // 超过7天逐渐到0
            freshnessLevel = 'expired';
        }
        
        return {
            score: Math.round(Math.max(0, score)),
            level: freshnessLevel,
            hoursAgo: Math.round(hoursDiff)
        };
    }

    // 评估新闻质量评分 (0-100)
    calculateQualityScore(newsItem) {
        let score = 0;
        
        // 来源权重 (0-40分)
        const source = this.newsSources.find(s => newsItem.source.includes(s.name));
        score += (source ? source.weight : 0.5) * 40;
        
        // 内容完整性 (0-30分)
        if (newsItem.title && newsItem.title.length > 10) score += 10;
        if (newsItem.content && newsItem.content.length > 50) score += 10;
        if (newsItem.url && newsItem.url.length > 0) score += 10;
        
        // 数据可信度 (0-20分)
        if (newsItem.data && Object.keys(newsItem.data).length > 0) score += 20;
        else if (newsItem.statistics) score += 15;
        
        // 时效性奖励 (0-10分)
        const freshness = this.calculateFreshnessScore(newsItem.publishDate);
        if (freshness.level === 'very-fresh') score += 10;
        else if (freshness.level === 'fresh') score += 5;
        
        return Math.round(score);
    }

    // 过滤7天内的新闻
    filterRecentNews(newsItems) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        return newsItems.filter(item => {
            const publishDate = new Date(item.publishDate);
            return publishDate >= sevenDaysAgo;
        });
    }

    // 排序算法 (新鲜度40% + 质量40% + 来源权重20%)
    sortNewsByImportance(newsItems) {
        return newsItems.map(item => {
            const freshness = this.calculateFreshnessScore(item.publishDate);
            const quality = this.calculateQualityScore(item);
            const source = this.newsSources.find(s => item.source.includes(s.name));
            const sourceWeight = source ? source.weight : 0.5;
            
            const importanceScore = 
                (freshness.score * 0.4) + 
                (quality * 0.4) + 
                (sourceWeight * 100 * 0.2);
            
            return {
                ...item,
                freshnessScore: freshness.score,
                qualityScore: quality,
                importanceScore: Math.round(importanceScore),
                freshnessLevel: freshness.level,
                hoursAgo: freshness.hoursAgo
            };
        }).sort((a, b) => b.importanceScore - a.importanceScore);
    }

    // 获取推荐新闻 (24小时内优先)
    getRecommendedNews(newsItems, limit = 10) {
        const recentNews = this.filterRecentNews(newsItems);
        const sortedNews = this.sortNewsByImportance(recentNews);
        
        // 优先展示24小时内的新闻
        const veryFreshNews = sortedNews.filter(item => item.freshnessLevel === 'very-fresh');
        const otherNews = sortedNews.filter(item => item.freshnessLevel !== 'very-fresh');
        
        return [...veryFreshNews, ...otherNews].slice(0, limit);
    }

    // 生成新闻摘要
    generateNewsSummary(newsItems) {
        const summary = {
            totalNews: newsItems.length,
            recentNews: this.filterRecentNews(newsItems).length,
            veryFreshNews: newsItems.filter(item => 
                this.calculateFreshnessScore(item.publishDate).level === 'very-fresh'
            ).length,
            averageQuality: Math.round(
                newsItems.reduce((sum, item) => sum + this.calculateQualityScore(item), 0) / newsItems.length
            ),
            topSources: this.getTopSources(newsItems),
            freshnessDistribution: this.getFreshnessDistribution(newsItems)
        };
        
        return summary;
    }

    // 获取顶级来源统计
    getTopSources(newsItems) {
        const sourceCount = {};
        newsItems.forEach(item => {
            const source = this.newsSources.find(s => item.source.includes(s.name));
            const sourceName = source ? source.name : '其他';
            sourceCount[sourceName] = (sourceCount[sourceName] || 0) + 1;
        });
        
        return Object.entries(sourceCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));
    }

    // 获取新鲜度分布
    getFreshnessDistribution(newsItems) {
        const distribution = {
            'very-fresh': 0,
            'fresh': 0,
            'normal': 0,
            'expired': 0
        };
        
        newsItems.forEach(item => {
            const freshness = this.calculateFreshnessScore(item.publishDate);
            distribution[freshness.level]++;
        });
        
        return distribution;
    }
}

// 版本管理系统
class VersionManager {
    constructor() {
        this.versions = new Map();
        this.currentVersion = null;
        this.storageKey = 'nev_daily_versions';
    }

    // 生成版本编号 (YYYYMMDD_Vx)
    generateVersionId() {
        const date = new Date();
        const dateStr = date.getFullYear().toString() + 
                       (date.getMonth() + 1).toString().padStart(2, '0') + 
                       date.getDate().toString().padStart(2, '0');
        
        const existingVersions = Array.from(this.versions.keys())
            .filter(v => v.startsWith(dateStr));
        
        const versionNum = existingVersions.length + 1;
        return `${dateStr}_V${versionNum}`;
    }

    // 保存新版本
    saveVersion(content, metadata = {}) {
        const versionId = this.generateVersionId();
        const version = {
            id: versionId,
            content: content,
            timestamp: new Date().toISOString(),
            metadata: {
                ...metadata,
                newsCount: metadata.newsCount || 0,
                sources: metadata.sources || [],
                freshnessScore: metadata.freshnessScore || 0
            }
        };
        
        this.versions.set(versionId, version);
        this.currentVersion = versionId;
        
        // 保存到本地存储
        this.persistVersions();
        
        return version;
    }

    // 获取指定版本
    getVersion(versionId) {
        return this.versions.get(versionId);
    }

    // 获取所有版本列表
    getVersionList() {
        return Array.from(this.versions.values())
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    // 获取最新版本
    getLatestVersion() {
        const versions = this.getVersionList();
        return versions[0] || null;
    }

    // 版本对比
    compareVersions(versionId1, versionId2) {
        const v1 = this.getVersion(versionId1);
        const v2 = this.getVersion(versionId2);
        
        if (!v1 || !v2) return null;
        
        return {
            added: this.findAddedContent(v1, v2),
            removed: this.findRemovedContent(v1, v2),
            modified: this.findModifiedContent(v1, v2),
            metadataChanges: this.compareMetadata(v1.metadata, v2.metadata)
        };
    }

    // 查找新增内容
    findAddedContent(oldVersion, newVersion) {
        // 简化实现，实际应该解析HTML结构
        const oldNews = this.extractNewsItems(oldVersion.content);
        const newNews = this.extractNewsItems(newVersion.content);
        
        return newNews.filter(newItem => 
            !oldNews.some(oldItem => oldItem.title === newItem.title)
        );
    }

    // 查找删除内容
    findRemovedContent(oldVersion, newVersion) {
        const oldNews = this.extractNewsItems(oldVersion.content);
        const newNews = this.extractNewsItems(newVersion.content);
        
        return oldNews.filter(oldItem => 
            !newNews.some(newItem => newItem.title === oldItem.title)
        );
    }

    // 查找修改内容
    findModifiedContent(oldVersion, newVersion) {
        const oldNews = this.extractNewsItems(oldVersion.content);
        const newNews = this.extractNewsItems(newVersion.content);
        
        return newNews.filter(newItem => {
            const oldItem = oldNews.find(oldItem => oldItem.title === newItem.title);
            return oldItem && (oldItem.content !== newItem.content || 
                             oldItem.source !== newItem.source);
        });
    }

    // 提取新闻条目
    extractNewsItems(content) {
        // 简化实现，实际应该解析HTML
        const newsItems = [];
        const regex = /<div class="news-item">[\s\S]*?<div class="news-title">(.*?)<\/div>[\s\S]*?<div class="news-content">(.*?)<\/div>[\s\S]*?<div class="news-source">[\s\S]*?<a href="(.*?)".*?>(.*?)<\/a>[\s\S]*?<\/div>/g;
        
        let match;
        while ((match = regex.exec(content)) !== null) {
            newsItems.push({
                title: match[1].trim(),
                content: match[2].trim(),
                url: match[3],
                source: match[4]
            });
        }
        
        return newsItems;
    }

    // 对比元数据
    compareMetadata(oldMeta, newMeta) {
        const changes = {};
        
        Object.keys(newMeta).forEach(key => {
            if (oldMeta[key] !== newMeta[key]) {
                changes[key] = {
                    old: oldMeta[key],
                    new: newMeta[key]
                };
            }
        });
        
        return changes;
    }

    // 持久化存储
    persistVersions() {
        const versionsData = {
            versions: Array.from(this.versions.entries()),
            currentVersion: this.currentVersion,
            lastUpdate: new Date().toISOString()
        };
        
        localStorage.setItem(this.storageKey, JSON.stringify(versionsData));
    }

    // 从存储加载
    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.versions = new Map(data.versions);
                this.currentVersion = data.currentVersion;
                return true;
            } catch (e) {
                console.error('Failed to load versions from storage:', e);
                return false;
            }
        }
        return false;
    }

    // 清理旧版本 (保留最近30个)
    cleanupOldVersions(maxVersions = 30) {
        const versionList = this.getVersionList();
        if (versionList.length > maxVersions) {
            const versionsToRemove = versionList.slice(maxVersions);
            versionsToRemove.forEach(version => {
                this.versions.delete(version.id);
            });
            this.persistVersions();
        }
    }
}

// 导出实例
const newsAggregator = new NewsAggregator();
const versionManager = new VersionManager();

// 初始化版本管理器
versionManager.loadFromStorage();

// 示例新闻数据
const sampleNews = [
    {
        title: "小鹏汽车AI天玑XOS 5.2.0全球推送",
        content: "小鹏推出国内首个量产的端到端智驾大模型，AI加持下销量快速回暖。2024年上半年月均交付不足1万辆，下半年快速增加至2万辆。",
        source: "OFweek新能源汽车网",
        url: "https://nev.ofweek.com/2025-01/ART-71000-8420-30655796.html",
        publishDate: "2024-01-01T10:00:00Z",
        data: { model: "XOS 5.2.0", type: "AI" }
    },
    {
        title: "比亚迪\"天神之眼\"高阶智驾系统下放",
        content: "比亚迪宣布10万元以下车型多数将搭载\"天神之眼\"高阶智驾系统，包括海鸥、海豹05DM-i和第二代秦PLUS DM-i，售价维持不变，推动智驾普及。",
        source: "证券时报网",
        url: "https://stcn.com/article/detail/1530628.html",
        publishDate: "2024-11-28T14:30:00Z",
        statistics: { priceRange: "10万以下", models: 3 }
    }
];

// 使用示例
console.log("新闻新鲜度评分:", newsAggregator.calculateFreshnessScore("2024-11-28T14:30:00Z"));
console.log("推荐新闻:", newsAggregator.getRecommendedNews(sampleNews, 5));
console.log("新闻摘要:", newsAggregator.generateNewsSummary(sampleNews));