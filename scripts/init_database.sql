-- 新能源汽车情报系统数据库初始化脚本
-- 创建时间: 2025年11月28日

CREATE DATABASE IF NOT EXISTS nev_intelligence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nev_intelligence;

-- 数据分类表
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 数据源表
CREATE TABLE data_sources (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- cpca, platform, social_media, etc.
    url VARCHAR(500),
    reliability_score INT DEFAULT 5, -- 1-10
    is_active BOOLEAN DEFAULT TRUE,
    last_collection TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 品牌信息表
CREATE TABLE brands (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    company_name VARCHAR(200),
    logo_url VARCHAR(500),
    website VARCHAR(500),
    established_year INT,
    headquarters VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 车型信息表
CREATE TABLE models (
    id INT PRIMARY KEY AUTO_INCREMENT,
    brand_id INT,
    name VARCHAR(200) NOT NULL,
    model_code VARCHAR(100),
    segment VARCHAR(50), -- sedan, suv, mpv, etc.
    price_range VARCHAR(100),
    launch_date DATE,
    specifications JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id)
);

-- 原始数据表
CREATE TABLE raw_data (
    id VARCHAR(100) PRIMARY KEY,
    source_id INT,
    category_id INT,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    publish_date DATETIME,
    author VARCHAR(200),
    url VARCHAR(1000),
    data_type VARCHAR(50), -- fact, opinion, prediction
    importance_score INT DEFAULT 1, -- 1-5
    sentiment VARCHAR(20) DEFAULT 'neutral', -- positive, negative, neutral
    verification_status VARCHAR(20) DEFAULT 'pending', -- pending, verified, disputed
    data_quality_score INT DEFAULT 0, -- 0-100
    relevance_score INT DEFAULT 0, -- 0-100
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (source_id) REFERENCES data_sources(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_publish_date (publish_date),
    INDEX idx_importance (importance_score),
    INDEX idx_sentiment (sentiment),
    INDEX idx_verification (verification_status)
);

-- 销量数据表
CREATE TABLE sales_data (
    id VARCHAR(100) PRIMARY KEY,
    raw_data_id VARCHAR(100),
    brand_id INT,
    model_id INT,
    sales_volume INT NOT NULL,
    sales_period VARCHAR(50), -- monthly, quarterly, yearly
    period_start DATE,
    period_end DATE,
    market_share DECIMAL(5,2),
    growth_rate DECIMAL(5,2),
    price_range VARCHAR(100),
    segment VARCHAR(50),
    region VARCHAR(100) DEFAULT '全国',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (raw_data_id) REFERENCES raw_data(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    FOREIGN KEY (model_id) REFERENCES models(id),
    INDEX idx_sales_period (sales_period, period_start),
    INDEX idx_brand_sales (brand_id, sales_volume),
    INDEX idx_segment (segment)
);

-- 投诉数据表
CREATE TABLE complaint_data (
    id VARCHAR(100) PRIMARY KEY,
    raw_data_id VARCHAR(100),
    brand_id INT,
    model_id INT,
    complaint_type VARCHAR(100),
    complaint_description TEXT,
    severity_level INT DEFAULT 1, -- 1-5
    frequency INT DEFAULT 1,
    affected_units INT,
    complaint_date DATE,
    resolution_status VARCHAR(50) DEFAULT 'open',
    resolution_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (raw_data_id) REFERENCES raw_data(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    FOREIGN KEY (model_id) REFERENCES models(id),
    INDEX idx_complaint_date (complaint_date),
    INDEX idx_severity (severity_level),
    INDEX idx_resolution (resolution_status)
);

-- 新车型数据表
CREATE TABLE new_model_data (
    id VARCHAR(100) PRIMARY KEY,
    raw_data_id VARCHAR(100),
    brand_id INT,
    model_name VARCHAR(200) NOT NULL,
    launch_date DATE,
    expected_launch_date DATE,
    price_range VARCHAR(100),
    target_market VARCHAR(200),
    key_features JSON,
    specifications JSON,
    segment VARCHAR(50),
    competitor_analysis TEXT,
    market_expectation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (raw_data_id) REFERENCES raw_data(id),
    FOREIGN KEY (brand_id) REFERENCES brands(id),
    INDEX idx_launch_date (launch_date),
    INDEX idx_expected_launch (expected_launch_date)
);

-- 政策数据表
CREATE TABLE policy_data (
    id VARCHAR(100) PRIMARY KEY,
    raw_data_id VARCHAR(100),
    policy_title VARCHAR(500) NOT NULL,
    policy_type VARCHAR(100), -- subsidy, regulation, incentive, etc.
    effective_date DATE,
    expiry_date DATE,
    scope VARCHAR(200), -- national, regional, local
    summary TEXT,
    full_text TEXT,
    industry_impact TEXT,
    affected_segments JSON,
    compliance_requirements JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (raw_data_id) REFERENCES raw_data(id),
    INDEX idx_effective_date (effective_date),
    INDEX idx_policy_type (policy_type)
);

-- 行业领袖数据表
CREATE TABLE industry_leaders (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    company VARCHAR(200) NOT NULL,
    position VARCHAR(200),
    importance_level INT DEFAULT 3, -- 1-5
    photo_url VARCHAR(500),
    bio TEXT,
    social_media JSON,
    monitoring_keywords JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 领袖言论数据表
CREATE TABLE leader_statements (
    id VARCHAR(100) PRIMARY KEY,
    leader_id VARCHAR(100),
    raw_data_id VARCHAR(100),
    statement_content TEXT NOT NULL,
    original_text TEXT,
    source VARCHAR(200),
    source_type VARCHAR(50), -- weibo, interview, speech, article
    publish_date DATETIME,
    url VARCHAR(1000),
    importance_score INT DEFAULT 1,
    category VARCHAR(50), -- strategy, technology, market, policy
    sentiment VARCHAR(20) DEFAULT 'neutral',
    strategic_level VARCHAR(20) DEFAULT 'tactical', -- tactical, strategic, visionary
    data_type VARCHAR(20) DEFAULT 'opinion', -- fact, opinion, prediction
    related_topics JSON,
    key_points JSON,
    media_reactions JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leader_id) REFERENCES industry_leaders(id),
    FOREIGN KEY (raw_data_id) REFERENCES raw_data(id),
    INDEX idx_leader (leader_id),
    INDEX idx_publish_date (publish_date),
    INDEX idx_importance (importance_score)
);

-- 日报报告表
CREATE TABLE daily_reports (
    id INT PRIMARY KEY AUTO_INCREMENT,
    report_date DATE NOT NULL UNIQUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    total_data_items INT DEFAULT 0,
    data_sources JSON,
    categories JSON,
    brands JSON,
    summary TEXT,
    full_report JSON,
    html_content LONGTEXT,
    markdown_content LONGTEXT,
    quality_score INT DEFAULT 0, -- 0-100
    generation_time INT, -- milliseconds
    generated_by VARCHAR(100),
    review_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    reviewer VARCHAR(100),
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_report_date (report_date),
    INDEX idx_quality (quality_score),
    INDEX idx_review_status (review_status)
);

-- 风险预警表
CREATE TABLE risk_alerts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    alert_type VARCHAR(100) NOT NULL, -- market, technology, policy, operational
    severity VARCHAR(20) NOT NULL, -- low, medium, high, critical
    title VARCHAR(500) NOT NULL,
    description TEXT,
    affected_brands JSON,
    affected_segments JSON,
    risk_factors JSON,
    mitigation_strategies JSON,
    deadline DATE,
    status VARCHAR(50) DEFAULT 'active', -- active, resolved, expired
    created_by VARCHAR(100),
    resolved_at TIMESTAMP,
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alert_type (alert_type),
    INDEX idx_severity (severity),
    INDEX idx_status (status),
    INDEX idx_deadline (deadline)
);

-- 系统配置表
CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 采集任务日志表
CREATE TABLE collection_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_name VARCHAR(200) NOT NULL,
    data_source VARCHAR(200),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    duration INT, -- seconds
    status VARCHAR(50), -- success, failed, partial
    items_collected INT DEFAULT 0,
    errors JSON,
    warnings JSON,
    log_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_task_name (task_name),
    INDEX idx_status (status),
    INDEX idx_start_time (start_time)
);

-- 插入基础数据
INSERT INTO categories (name, description) VALUES
('sales', '销量数据'),
('new_model', '新车型发布'),
('complaint', '用户投诉'),
('policy', '政策法规'),
('review', '专业评测'),
('forum', '用户论坛'),
('news', '行业新闻'),
('leader_statement', '领袖言论');

INSERT INTO data_sources (name, type, url, reliability_score) VALUES
('乘联会', 'cpca', 'http://www.cpca.org.cn', 9),
('汽车之家', 'platform', 'https://www.autohome.com.cn', 8),
('懂车帝', 'platform', 'https://www.dongchedi.com', 8),
('易车网', 'platform', 'https://www.yiche.com', 7),
('太平洋汽车', 'platform', 'https://www.pcauto.com.cn', 7),
('新浪微博', 'social_media', 'https://weibo.com', 6),
('领英', 'social_media', 'https://linkedin.com', 7);

INSERT INTO brands (name, company_name, website, established_year, headquarters) VALUES
('比亚迪', '比亚迪股份有限公司', 'https://www.byd.com', 1995, '深圳'),
('特斯拉', '特斯拉公司', 'https://www.tesla.com', 2003, '美国加州'),
('理想', '理想汽车', 'https://www.lixiang.com', 2015, '北京'),
('蔚来', '蔚来汽车', 'https://www.nio.com', 2014, '上海'),
('小鹏', '小鹏汽车', 'https://www.xiaopeng.com', 2014, '广州'),
('长城', '长城汽车股份有限公司', 'https://www.gwm.com.cn', 1984, '保定'),
('吉利', '吉利汽车控股有限公司', 'https://www.geely.com', 1986, '杭州'),
('长安', '重庆长安汽车股份有限公司', 'https://www.changan.com.cn', 1862, '重庆');

INSERT INTO industry_leaders (id, name, company, position, importance_level) VALUES
('wang-chuanfu', '王传福', '比亚迪', '董事长', 5),
('li-shufu', '李书福', '吉利', '董事长', 5),
('wei-jianjun', '魏建军', '长城', '董事长', 4),
('li-xiang', '李想', '理想汽车', 'CEO', 4),
('li-bin', '李斌', '蔚来', 'CEO', 4),
('he-xiaopeng', '何小鹏', '小鹏', 'CEO', 4),
('lei-jun', '雷军', '小米汽车', 'CEO', 5);

INSERT INTO system_config (config_key, config_value, description) VALUES
('collection_start_time', '06:00', '数据采集开始时间'),
('collection_deadline', '18:00', '报告生成截止时间'),
('min_data_quality', '70', '最低数据质量要求'),
('min_relevance_score', '60', '最低相关性评分'),
('max_retry_attempts', '3', '最大重试次数'),
('request_timeout', '30000', '请求超时时间（毫秒）'),
('output_formats', 'html,json,markdown', '输出格式'),
('save_to_database', 'true', '是否保存到数据库'),
('save_to_file', 'true', '是否保存到文件');

-- 创建视图
CREATE VIEW daily_summary AS
SELECT 
    DATE(r.publish_date) as report_date,
    COUNT(*) as total_items,
    COUNT(DISTINCT r.source_id) as sources_count,
    COUNT(DISTINCT r.brand) as brands_count,
    AVG(r.importance_score) as avg_importance,
    COUNT(CASE WHEN r.sentiment = 'positive' THEN 1 END) as positive_count,
    COUNT(CASE WHEN r.sentiment = 'negative' THEN 1 END) as negative_count,
    COUNT(CASE WHEN r.sentiment = 'neutral' THEN 1 END) as neutral_count
FROM raw_data r
WHERE r.publish_date >= CURDATE() - INTERVAL 30 DAY
GROUP BY DATE(r.publish_date)
ORDER BY report_date DESC;

-- 创建索引优化
CREATE INDEX idx_composite_search ON raw_data(publish_date, source_id, category_id, importance_score);
CREATE INDEX idx_brand_date ON raw_data(brand, publish_date);
CREATE INDEX idx_sentiment_date ON raw_data(sentiment, publish_date);

-- 存储过程：数据质量检查
DELIMITER //
CREATE PROCEDURE CheckDataQuality()
BEGIN
    SELECT 
        COUNT(*) as total_records,
        COUNT(CASE WHEN data_quality_score >= 70 THEN 1 END) as high_quality_records,
        COUNT(CASE WHEN data_quality_score < 50 THEN 1 END) as low_quality_records,
        AVG(data_quality_score) as average_quality,
        COUNT(CASE WHEN verification_status = 'pending' THEN 1 END) as pending_verification,
        COUNT(CASE WHEN verification_status = 'disputed' THEN 1 END) as disputed_records
    FROM raw_data
    WHERE DATE(created_at) = CURDATE();
END //
DELIMITER ;

-- 事件：自动清理过期数据
CREATE EVENT IF NOT EXISTS cleanup_old_data
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
    DELETE FROM raw_data WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- 权限设置
CREATE USER IF NOT EXISTS 'nev_user'@'localhost' IDENTIFIED BY 'secure_password_here';
GRANT SELECT, INSERT, UPDATE, DELETE ON nev_intelligence.* TO 'nev_user'@'localhost';
GRANT EXECUTE ON nev_intelligence.* TO 'nev_user'@'localhost';

FLUSH PRIVILEGES;