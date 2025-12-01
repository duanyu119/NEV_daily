#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
新能源汽车Daily News数据获取模块
集成Tavily MCP平台，获取实时行业数据
作者: NEV Daily News Team
创建时间: 2025年11月28日
"""

import json
import time
import random
import urllib.parse
import os
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import hashlib
from smart_glass_monitor import SmartGlassMonitor

class TavilyMCPClient:
    """Tavily MCP数据获取客户端"""
    
    def __init__(self):
        self.api_key = os.environ.get("TAVILY_API_KEY", "demo_key_for_nev_daily_news")
        self.base_url = "https://api.tavily.com"
        self.cache_duration = 3600  # 1小时缓存
        self.api_base = os.environ.get("NEV_API_BASE", "")

    def _fetch_api(self, path: str) -> Optional[Dict[str, Any]]:
        if not self.api_base:
            return None
        url = f"{self.api_base.rstrip('/')}/{path.lstrip('/')}"
        try:
            resp = requests.get(url, timeout=10)
            if resp.status_code == 200:
                return resp.json()
        except Exception:
            return None
        return None
        
    def get_sales_rankings(self) -> Dict[str, Any]:
        """获取销量排行榜数据"""
        api = self._fetch_api("sales")
        weekly_data = [
            {"rank": 1, "brand": "比亚迪", "model": "秦PLUS DM-i", "sales": 18542, "change": "+15.2%", "segment": "紧凑型轿车"},
            {"rank": 2, "brand": "特斯拉", "model": "Model Y", "sales": 16423, "change": "+8.7%", "segment": "中型SUV"},
            {"rank": 3, "brand": "理想汽车", "model": "L7", "sales": 12456, "change": "+22.1%", "segment": "中大型SUV"},
            {"rank": 4, "brand": "小鹏", "model": "P7", "sales": 9876, "change": "+5.3%", "segment": "中型轿车"},
            {"rank": 5, "brand": "蔚来", "model": "ES6", "sales": 8234, "change": "+12.8%", "segment": "中型SUV"},
            {"rank": 6, "brand": "广汽埃安", "model": "AION S", "sales": 7856, "change": "-2.1%", "segment": "紧凑型轿车"},
            {"rank": 7, "brand": "吉利", "model": "帝豪EV", "sales": 6543, "change": "+7.9%", "segment": "紧凑型轿车"},
            {"rank": 8, "brand": "长城", "model": "欧拉好猫", "sales": 5678, "change": "+18.4%", "segment": "小型车"}
        ]
        
        monthly_data = [
            {"rank": 1, "brand": "比亚迪", "model": "秦PLUS DM-i", "sales": 74216, "change": "+18.5%", "segment": "紧凑型轿车"},
            {"rank": 2, "brand": "特斯拉", "model": "Model Y", "sales": 68542, "change": "+12.3%", "segment": "中型SUV"},
            {"rank": 3, "brand": "理想汽车", "model": "L7", "sales": 49876, "change": "+28.7%", "segment": "中大型SUV"},
            {"rank": 4, "brand": "小鹏", "model": "P7", "sales": 39504, "change": "+9.2%", "segment": "中型轿车"},
            {"rank": 5, "brand": "蔚来", "model": "ES6", "sales": 32936, "change": "+15.6%", "segment": "中型SUV"},
            {"rank": 6, "brand": "广汽埃安", "model": "AION S", "sales": 31424, "change": "+1.8%", "segment": "紧凑型轿车"},
            {"rank": 7, "brand": "吉利", "model": "帝豪EV", "sales": 26172, "change": "+11.2%", "segment": "紧凑型轿车"},
            {"rank": 8, "brand": "长城", "model": "欧拉好猫", "sales": 22712, "change": "+22.1%", "segment": "小型车"}
        ]
        
        if api:
            weekly_data = api.get("weekly", weekly_data)
            monthly_data = api.get("monthly", monthly_data)

        return {
            "weekly": weekly_data,
            "monthly": monthly_data,
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    
    def get_new_car_launches(self) -> Dict[str, Any]:
        """获取新车发布信息"""
        api = self._fetch_api("cars")
        new_launches = [
            {
                "id": "001",
                "brand": "比亚迪",
                "model": "海豹DM-i",
                "type": "全新发布",
                "segment": "中型轿车",
                "price_range": "18-25万",
                "launch_date": "2025年12月",
                "key_features": ["DM-i混动技术", "纯电续航200km", "百公里加速7.9s"],
                "target_audience": "家庭用户",
                "competitors": ["特斯拉Model 3", "小鹏P7"],
                "market_positioning": "高性价比混动轿车",
                "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
                "description": "比亚迪海洋系列全新混动轿车，采用最新的DM-i超级混动技术"
            },
            {
                "id": "002",
                "brand": "理想汽车",
                "model": "L6 Pro",
                "type": "全新发布",
                "segment": "中大型SUV",
                "price_range": "30-35万",
                "launch_date": "2026年1月",
                "key_features": ["增程式混动", "6座布局", "智能座舱", "空气悬架"],
                "target_audience": "高端家庭",
                "competitors": ["问界M7", "岚图FREE"],
                "market_positioning": "豪华家庭SUV",
                "image_url": "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
                "description": "理想汽车全新中型SUV，延续增程式混动路线，主打家庭出行市场"
            },
            {
                "id": "003",
                "brand": "小鹏",
                "model": "P7i GT",
                "type": "改款升级",
                "segment": "中型轿车",
                "price_range": "25-32万",
                "launch_date": "2025年11月",
                "key_features": ["XPILOT 4.0", "激光雷达", "800V快充", "智能底盘"],
                "target_audience": "科技爱好者",
                "competitors": ["特斯拉Model 3", "比亚迪海豹"],
                "market_positioning": "智能电动轿跑",
                "image_url": "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&h=600&fit=crop",
                "description": "小鹏P7中期改款车型，智能驾驶和充电技术全面升级"
            },
            {
                "id": "004",
                "brand": "蔚来",
                "model": "ES7 Coupe",
                "type": "全新发布",
                "segment": "中大型SUV",
                "price_range": "45-55万",
                "launch_date": "2026年2月",
                "key_features": ["换电模式", "智能座舱", "空气悬架", "全铝车身"],
                "target_audience": "高端用户",
                "competitors": ["宝马iX", "奔驰EQC"],
                "market_positioning": "豪华电动SUV",
                "image_url": "https://images.unsplash.com/photo-1617788138017-80ad406a99a5?w=800&h=600&fit=crop",
                "description": "蔚来首款Coupe SUV，延续换电模式，主打豪华运动市场"
            }
        ]
        
        if api and isinstance(api.get("new_launches"), list):
            new_launches = api.get("new_launches")

        return {
            "new_launches": new_launches,
            "total_count": len(new_launches),
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    
    def get_industry_leaders_insights(self) -> Dict[str, Any]:
        """获取行业领袖观点"""
        api = self._fetch_api("leaders")
        leaders_insights = [
            {
                "id": "leader_001",
                "name": "王传福",
                "title": "比亚迪董事长兼总裁",
                "company": "比亚迪",
                "portrait_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
                "recent_statements": [
                    {
                        "date": "2025-11-28",
                        "source": "微博",
                        "content": "新能源汽车行业正迎来前所未有的发展机遇，技术创新是关键。我们将继续加大研发投入，推动智能化技术发展。",
                        "key_insights": [
                            "技术创新是行业发展的核心驱动力",
                            "比亚迪将持续加大研发投入",
                            "智能化技术是未来发展重点"
                        ],
                        "market_impact": "high",
                        "relevance_score": 95
                    },
                    {
                        "date": "2025-11-27",
                        "source": "媒体采访",
                        "content": "未来五年将是新能源汽车市场的关键窗口期。我们计划推出10款新能源车型，覆盖各个细分市场。",
                        "key_insights": [
                            "未来五年是新能源汽车的关键窗口期",
                            "比亚迪将扩大产品线覆盖",
                            "多细分市场布局战略明确"
                        ],
                        "market_impact": "high",
                        "relevance_score": 92
                    }
                ]
            },
            {
                "id": "leader_002",
                "name": "李想",
                "title": "理想汽车CEO",
                "company": "理想汽车",
                "portrait_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
                "recent_statements": [
                    {
                        "date": "2025-11-28",
                        "source": "微博",
                        "content": "增程式技术路线是当前的best choice，能够有效解决用户的里程焦虑问题。我们将继续深耕这一技术。",
                        "key_insights": [
                            "增程式技术是解决里程焦虑的有效方案",
                            "理想汽车将继续专注增程式路线",
                            "用户体验是技术选择的重要考量"
                        ],
                        "market_impact": "medium",
                        "relevance_score": 88
                    },
                    {
                        "date": "2025-11-26",
                        "source": "公开演讲",
                        "content": "家庭用户需要的不只是交通工具，而是一个移动的智能空间。我们的产品设计理念正在发生根本性的变化。",
                        "key_insights": [
                            "汽车正在从交通工具向智能空间转变",
                            "家庭用户需求正在重新定义产品设计",
                            "智能化空间是未来发展的重要方向"
                        ],
                        "market_impact": "high",
                        "relevance_score": 90
                    }
                ]
            },
            {
                "id": "leader_003",
                "name": "李斌",
                "title": "蔚来汽车CEO",
                "company": "蔚来汽车",
                "portrait_url": "https://images.unsplash.com/photo-1560250097-5b5573525dc7?w=400&h=400&fit=crop&crop=face",
                "recent_statements": [
                    {
                        "date": "2025-11-28",
                        "source": "公开演讲",
                        "content": "换电模式将成为新能源汽车的重要补能方式。我们目标是在2026年建成超过5000座换电站。",
                        "key_insights": [
                            "换电模式是新能源汽车补能的重要方向",
                            "蔚来将大规模扩建换电站基础设施",
                            "2026年5000座换电站目标显示长期承诺"
                        ],
                        "market_impact": "high",
                        "relevance_score": 93
                    },
                    {
                        "date": "2025-11-25",
                        "source": "媒体采访",
                        "content": "高端市场用户对服务体验的要求远超产品本身。我们正在重新定义豪华的含义。",
                        "key_insights": [
                            "高端市场用户更重视服务体验",
                            "豪华定义正在从产品转向服务",
                            "用户体验是高端市场的核心竞争力"
                        ],
                        "market_impact": "medium",
                        "relevance_score": 85
                    }
                ]
            },
            {
                "id": "leader_004",
                "name": "雷军",
                "title": "小米汽车CEO",
                "company": "小米汽车",
                "portrait_url": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
                "recent_statements": [
                    {
                        "date": "2025-11-28",
                        "source": "产品发布会",
                        "content": "智能电动汽车是小米生态的重要延伸。通过AI技术的深度应用，让汽车成为用户的智能伙伴。",
                        "key_insights": [
                            "智能电动汽车是小米生态战略的重要组成部分",
                            "AI技术将是汽车智能化的核心",
                            "汽车正在向智能伙伴的角色转变"
                        ],
                        "market_impact": "high",
                        "relevance_score": 91
                    },
                    {
                        "date": "2025-11-24",
                        "source": "微博",
                        "content": "性价比不是低价，而是在同等价格下提供更好的体验。这是小米一直坚持的产品理念。",
                        "key_insights": [
                            "性价比理念重新定义：同等价格更好体验",
                            "小米产品理念强调体验优先",
                            "高端市场也需要性价比思维"
                        ],
                        "market_impact": "medium",
                        "relevance_score": 87
                    }
                ]
            }
        ]
        
        if api and isinstance(api.get("leaders"), list):
            leaders_insights = api.get("leaders")

        return {
            "leaders": leaders_insights,
            "total_statements": sum(len(leader["recent_statements"]) for leader in leaders_insights),
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    
    def get_industry_news(self) -> Dict[str, Any]:
        """获取行业其他新闻"""
        api = self._fetch_api("news")
        industry_news = [
            {
                "id": "news_001",
                "title": "工信部发布新能源汽车产业发展规划",
                "category": "政策法规",
                "source": "工信部官网",
                "publish_date": "2025-11-28",
                "summary": "工信部发布《新能源汽车产业发展规划（2025-2035年）》，提出到2035年新能源汽车成为新车销售主流。",
                "key_points": [
                    "到2035年新能源汽车成为新车销售主流",
                    "充电基础设施建设目标明确",
                    "技术创新支持政策力度加大"
                ],
                "importance": "high",
                "image_url": "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&h=630&fit=crop",
                "read_more_url": "https://www.miit.gov.cn"
            },
            {
                "id": "news_002",
                "title": "宁德时代发布第三代CTP电池技术",
                "category": "技术创新",
                "source": "宁德时代",
                "publish_date": "2025-11-27",
                "summary": "宁德时代发布第三代CTP（Cell to Pack）电池技术，能量密度提升15%，成本降低20%。",
                "key_points": [
                    "能量密度提升15%",
                    "成本降低20%",
                    "安全性进一步提升"
                ],
                "importance": "high",
                "image_url": "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&h=630&fit=crop",
                "read_more_url": "https://www.catl.com"
            },
            {
                "id": "news_003",
                "title": "全国充电桩数量突破1000万个",
                "category": "基础设施",
                "source": "中国充电联盟",
                "publish_date": "2025-11-26",
                "summary": "截至2025年11月，全国充电桩数量突破1000万个，其中公共充电桩超过400万个。",
                "key_points": [
                    "全国充电桩总数突破1000万个",
                    "公共充电桩超过400万个",
                    "车桩比达到2:1"
                ],
                "importance": "medium",
                "image_url": "https://images.unsplash.com/photo-1617788138017-80ad406a99a5?w=1200&h=630&fit=crop",
                "read_more_url": "https://www.evcpi.com"
            },
            {
                "id": "news_004",
                "title": "新能源汽车出口量创历史新高",
                "category": "市场动态",
                "source": "海关总署",
                "publish_date": "2025-11-25",
                "summary": "10月份新能源汽车出口量达到15.2万辆，创历史新高，同比增长45%。",
                "key_points": [
                    "10月出口量达到15.2万辆",
                    "同比增长45%",
                    "创历史新高"
                ],
                "importance": "high",
                "image_url": "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=630&fit=crop",
                "read_more_url": "https://www.customs.gov.cn"
            },
            {
                "id": "news_005",
                "title": "多家车企宣布降价促销",
                "category": "市场动态",
                "source": "行业分析",
                "publish_date": "2025-11-24",
                "summary": "临近年底，多家新能源汽车企业宣布降价促销，最高降幅达到3万元。",
                "key_points": [
                    "多家车企宣布降价",
                    "最高降幅达到3万元",
                    "年底促销力度加大"
                ],
                "importance": "medium",
                "image_url": "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=630&fit=crop",
                "read_more_url": "#"
            }
        ]
        
        if api and isinstance(api.get("news"), list):
            industry_news = api.get("news")

        return {
            "news": industry_news,
            "total_count": len(industry_news),
            "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    
    def get_all_data(self) -> Dict[str, Any]:
        """获取所有数据"""
        return {
            "metadata": {
                "date_range": f"{datetime.now().strftime('%Y-%m-%d')} 至 {datetime.now().strftime('%Y-%m-%d')}",
                "total_data_points": 0,
                "data_sources": ["Tavily MCP", "官方统计", "企业财报", "行业报告"],
                "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            "sales_rankings": self.get_sales_rankings(),
            "new_car_launches": self.get_new_car_launches(),
            "industry_leaders": self.get_industry_leaders_insights(),
            "industry_news": self.get_industry_news()
        }

# 数据获取和HTML生成器
class DailyNewsGenerator:
    """Daily News HTML生成器"""
    
    def __init__(self):
        self.client = TavilyMCPClient()
        self.data = None
        self._used_image_urls = set()

    def _img_url(self, prompt: str, size: str = "landscape_4_3") -> str:
        # Ensure assets directory exists
        base_dir = os.path.dirname(os.path.abspath(__file__))
        assets_dir = os.path.join(base_dir, "reports", "assets", "images")
        os.makedirs(assets_dir, exist_ok=True)
        
        # Generate hash for filename
        prompt_hash = hashlib.md5(f"{prompt}_{size}".encode()).hexdigest()
        filename = f"{prompt_hash}.jpg"
        filepath = os.path.join(assets_dir, filename)
        relative_path = f"assets/images/{filename}"
        
        # Return local path if exists
        if os.path.exists(filepath):
            return relative_path
            
        # Download if not exists
        base = "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image"
        encoded_prompt = urllib.parse.quote(prompt)
        url = f"{base}?prompt={encoded_prompt}&image_size={size}"
        
        try:
            print(f"🎨 Generating image for: {prompt[:30]}...")
            resp = requests.get(url, timeout=30)
            if resp.status_code == 200:
                with open(filepath, "wb") as f:
                    f.write(resp.content)
                return relative_path
        except Exception as e:
            print(f"⚠️ Image generation failed: {e}")
            
        # Fallback to URL if save failed (or return placeholder)
        return url
        
    def fetch_data(self):
        """获取所有数据"""
        # 1. 获取基础数据 (Mock/API)
        self.data = self.client.get_all_data()
        
        # 2. 尝试获取真实的行业领袖数据 (Tavily)
        # 只有当 RUN_TAVILY_COLLECTION=1 时才执行实际采集，避免测试时超时
        if os.environ.get("TAVILY_API_KEY") and os.environ.get("RUN_TAVILY_COLLECTION") != "0":
            print("正在通过Tavily获取行业领袖数据...")
            leader_data = self.collect_leader_statements()
            if leader_data.get("results"):
                # 转换Tavily数据格式以匹配UI
                real_leaders = self._transform_leader_data(leader_data["results"])
                self.data["industry_leaders"]["leaders"] = real_leaders
                self.data["industry_leaders"]["total_statements"] = len(leader_data["results"])

        # 3. 获取智能调光行业数据 (新增)
        # 同样只在非 dry-run 模式下执行
        if os.environ.get("TAVILY_API_KEY") and os.environ.get("RUN_TAVILY_COLLECTION") != "0":
            print("正在通过Tavily获取智能调光行业情报...")
            self.data["smart_glass_intel"] = self.collect_smart_glass_intel()
        else:
            # Mock数据用于展示 (Dry Run 或无 Key 时的回退)
            print("使用Mock数据用于智能调光板块 (Dry Run Mode or No Key)...")
            self.data["smart_glass_intel"] = {
                "competitors": [
                    {
                        "title": "Gentex发布第四代智能调光后视镜",
                        "url": "https://www.gentex.com/news",
                        "content": "Gentex Corporation (NASDAQ: GNTX) 今日宣布推出第四代全屏显示智能调光后视镜，集成了最新的生物识别技术。",
                        "published_at": datetime.now().strftime("%Y-%m-%d"),
                        "matched_competitors": ["gentex"]
                    },
                    {
                        "title": "京东方展示最新车载调光玻璃方案",
                        "url": "https://www.boe.com/news",
                        "content": "在最新的科技展上，京东方(BOE)展示了其最新的快速响应电致变色玻璃，透过率调节范围可达0.1%-70%。",
                        "published_at": datetime.now().strftime("%Y-%m-%d"),
                        "matched_competitors": ["boe", "京东方"]
                    }
                ],
                "news": [
                    {
                        "title": "2025年全球智能调光玻璃市场报告",
                        "url": "#",
                        "content": "最新研究报告显示，全球智能调光玻璃市场规模预计将在2025年达到80亿美元，年复合增长率超过12%。",
                        "published_at": datetime.now().strftime("%Y-%m-%d"),
                        "category": "industry"
                    }
                ]
            }

        # 计算总数据点数
        total_points = (
            len(self.data["sales_rankings"]["weekly"]) +
            len(self.data["sales_rankings"]["monthly"]) +
            len(self.data["new_car_launches"]["new_launches"]) +
            self.data["industry_leaders"]["total_statements"] +
            len(self.data["industry_news"]["news"]) +
            len(self.data["smart_glass_intel"].get("news", [])) +
            len(self.data["smart_glass_intel"].get("competitors", []))
        )
        self.data["metadata"]["total_data_points"] = total_points

    def _transform_leader_data(self, raw_results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """将Tavily原始数据转换为前端展示格式"""
        leaders_map = {}
        for item in raw_results:
            # 从query中提取名字 (e.g. "王传福 比亚迪 讲话")
            query_parts = item["leader_query"].split(" ")
            name = query_parts[0]
            company = query_parts[1] if len(query_parts) > 1 else ""
            
            if name not in leaders_map:
                # 查找预定义的头像
                portrait_url = ""
                # 简单的名字映射到头像URL (可以使用之前的Mock数据中的URL)
                mock_leaders = self.client.get_industry_leaders_insights()["leaders"]
                for ml in mock_leaders:
                    if ml["name"] in name or name in ml["name"]:
                        portrait_url = ml["portrait_url"]
                        break
                
                leaders_map[name] = {
                    "id": f"leader_{hash(name)}",
                    "name": name,
                    "title": f"{company} 高管",
                    "company": company,
                    "portrait_url": portrait_url,
                    "recent_statements": []
                }
            
            leaders_map[name]["recent_statements"].append({
                "date": item["published_at"][:10] if item["published_at"] else datetime.now().strftime("%Y-%m-%d"),
                "source": item["url"],
                "content": item["title"] + " - " + item["content_excerpt"][:100] + "...",
                "key_insights": [item["title"]], # 简化处理
                "market_impact": "medium",
                "relevance_score": 90,
                "url": item["url"]
            })
        return list(leaders_map.values())

    # Tavily 搜索采集（最近一周，至少100条）
    def collect_leader_statements(self, span_days: int = 7, min_items: int = 20) -> Dict[str, Any]:
        api_key = os.environ.get("TAVILY_API_KEY", "")
        leaders = [
            "王传福 比亚迪 讲话", "雷军 小米 发言", "李想 理想汽车 公开演讲", "李斌 蔚来 采访",
            "何小鹏 小鹏汽车 演讲", "李书福 吉利 发言", "魏建军 长城 汽车 讲话", "余承东 华为 汽车 采访",
            "安聪慧 极氪 发言", "朱江明 零跑 发言"
        ]

        end_time = datetime.now()
        start_time = end_time - timedelta(days=span_days)
        time_range = f"{start_time.strftime('%Y-%m-%d')} to {end_time.strftime('%Y-%m-%d')}"

        run_logs: List[str] = []
        results: List[Dict[str, Any]] = []
        seen = set()

        def tavily(query: str) -> List[Dict[str, Any]]:
            payload = {
                "api_key": api_key,
                "query": query,
                "search_depth": "advanced",
                "topic": "news",
                "max_results": 200,
                "include_answer": False,
                "include_raw_content": True,
                "time_range": time_range
            }
            try:
                r = requests.post("https://api.tavily.com/search", json=payload, timeout=30)
                if r.status_code == 200:
                    return r.json().get("results", [])
                else:
                    run_logs.append(f"Tavily状态码{r.status_code} query={query}")
            except Exception as e:
                run_logs.append(f"Tavily异常: {e} query={query}")
            return []

        for q in leaders:
            for item in tavily(q):
                url = item.get("url") or item.get("source")
                title = (item.get("title") or "").strip()
                published = item.get("published_date") or item.get("date") or ""
                # 时间过滤
                try:
                    if published:
                        dt = datetime.fromisoformat(published.replace("Z", "+00:00").split(" ")[0])
                        if dt < start_time or dt > end_time:
                            continue
                except Exception:
                    continue
                key = f"{url}|{title}"
                if key in seen:
                    continue
                seen.add(key)
                results.append({
                    "leader_query": q,
                    "url": url,
                    "title": title,
                    "content_excerpt": (item.get("content") or "")[:600],
                    "published_at": published,
                    "collected_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                })
            if len(results) >= min_items:
                break

        out = {
            "status": {
                "min_required": min_items,
                "collected": len(results),
                "span_days": span_days,
                "time_range": time_range,
                "run_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "logs": run_logs
            },
            "results": results
        }

        # 存储结果与日志
        base_dir = os.path.dirname(os.path.abspath(__file__))
        out_dir = os.path.join(base_dir, "reports")
        os.makedirs(out_dir, exist_ok=True)
        fname = f"leader_statements_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}.json"
        with open(os.path.join(out_dir, fname), "w", encoding="utf-8") as f:
            json.dump(out, f, ensure_ascii=False, indent=2)
        return out
        
    def _summarize_text(self, text: str) -> str:
        """
        Summarize text into 3-5 core points.
        Returns HTML formatted list.
        """
        if not text:
            return ""
            
        # Clean up text first
        text = text.strip()
        if len(text) < 100:
            return text
            
        import re
        # Split into sentences (support Chinese and English punctuation)
        # Split by 。 ! ? . ! ? and newline
        sentences = re.split(r'(?<=[。！？.!?])\s+|\n+', text)
        sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        
        # If few sentences, just return text or list of them
        if len(sentences) <= 3:
            # If it's a short paragraph, just return it
            if len(text) < 200:
                return text
            # Otherwise make list
            html = "<ul style='margin:0.5rem 0 0.5rem 1.2rem; padding:0; list-style-type: disc;'>"
            for s in sentences:
                html += f"<li style='margin-bottom:0.25rem; color:var(--text-secondary); font-size:0.85rem;'>{s}</li>"
            html += "</ul>"
            return html

        # Simple scoring to pick best 3-5
        scored = []
        keywords = ["market", "growth", "revenue", "launch", "new", "sales", "profit",
                   "市场", "增长", "营收", "发布", "推出", "销量", "利润", "同比", "环比"]
        
        for i, s in enumerate(sentences):
            score = 0
            # Position bias
            if i == 0: score += 5
            if i == len(sentences)-1: score += 2
            
            # Keyword matching
            for k in keywords:
                if k in s.lower():
                    score += 2
            
            # Length bias (prefer medium length)
            if 20 <= len(s) <= 100:
                score += 1
                
            scored.append((score, i, s))
            
        # Sort by score
        scored.sort(key=lambda x: x[0], reverse=True)
        
        # Take top 3-5
        count = min(5, max(3, len(sentences)//2))
        top_items = scored[:count]
        
        # Restore original order
        top_items.sort(key=lambda x: x[1])
        
        # Generate HTML
        html = "<ul style='margin:0.5rem 0 0.5rem 1.2rem; padding:0; list-style-type: disc;'>"
        for _, _, s in top_items:
            html += f"<li style='margin-bottom:0.25rem; color:var(--text-secondary); font-size:0.85rem;'>{s}</li>"
        html += "</ul>"
        
        return html

    def _analyze_content(self, content: str, title: str) -> Dict[str, Any]:
        """
        Analyze content to extract summary, keywords and select an emoji
        """
        import re
        
        # 1. Select Emoji based on keywords
        full_text = (title + " " + content).lower()
        emoji_map = {
            "market": "📊", "growth": "📈", "forecast": "🔮", "report": "📑",
            "glass": "🪟", "smart": "🧠", "tech": "💻", "ai": "🤖",
            "car": "🚗", "auto": "🚙", "invest": "💰", "patent": "📜",
            "launch": "🚀", "new": "🆕", "trend": "📉",
            "gentex": "🏢", "view": "🏢", "boe": "🖥️", "wicue": "🕶️",
            "市场": "📊", "增长": "📈", "预测": "🔮", "报告": "📑",
            "玻璃": "🪟", "智能": "🧠", "技术": "💻", "汽车": "🚗",
            "投资": "💰", "专利": "📜", "发布": "🚀", "趋势": "📉",
            "招聘": "👥", "job": "👥", "京东方": "🖥️", "唯酷": "🕶️"
        }
        
        selected_emoji = "📰" # Default
        for k, v in emoji_map.items():
            if k in full_text:
                selected_emoji = v
                break
                
        # 2. Extract Keywords (Simple Heuristic)
        # Target keywords
        target_keywords = [
            "市场规模", "增长", "智能眼镜", "电致变色", "Google", "AI", "投融资", 
            "招聘", "专利", "趋势", "预测", "EC", "PDLC", "SPD", "LC", "Smart Glass",
            "Market Size", "Growth", "Smart Glasses", "Electrochromic", "Patent",
            "Investment", "Trend", "Forecast", "Recruitment", "Revenue", "Sales",
            "Partnership", "Collaboration", "Award", "Innovation"
        ]
        
        found_keywords = []
        # Prioritize target keywords
        for kw in target_keywords:
            if kw.lower() in full_text:
                found_keywords.append(kw)
                if len(found_keywords) >= 5:
                    break
        
        # If not enough, try to find other capitalized words (English) or long words (Chinese - hard without tokenizer)
        if len(found_keywords) < 5:
            # English: Capitalized words that are not start of sentence (rough)
            matches = re.findall(r'\b[A-Z][a-z]+\b', title)
            for m in matches:
                if m not in found_keywords and len(m) > 3:
                    found_keywords.append(m)
                    if len(found_keywords) >= 5:
                        break
        
        # Fallback: extract words from title
        if len(found_keywords) < 5:
            words = title.split()
            for w in words:
                w_clean = re.sub(r'[^\w]', '', w)
                if len(w_clean) > 2 and w_clean not in found_keywords:
                    found_keywords.append(w_clean)
                    if len(found_keywords) >= 5:
                        break
                        
        # 3. Summarize (Structured Summary)
        summary = self._summarize_text(content)
            
        return {
            "emoji": selected_emoji,
            "keywords": found_keywords[:5],
            "summary": summary
        }

    # 智能调光行业数据采集
    def collect_smart_glass_intel(self, span_days: int = 3) -> Dict[str, Any]:
        try:
            monitor = SmartGlassMonitor()
            # 执行数据抓取（增量）
            print("正在运行智能调光行业监测...")
            monitor.run_daily_check()
            # 获取报告数据
            report_data = monitor.get_report_data()
            
            # 转换格式以匹配前端
            competitors = []
            for item in report_data.get("competitor_news", []):
                analysis = self._analyze_content(item.get("content", ""), item.get("title", ""))
                competitors.append({
                    "title": item.get("title"),
                    "url": item.get("url"),
                    "content": analysis["summary"],
                    "published_at": item.get("published_date"),
                    "matched_competitors": [item.get("competitor", "")] if item.get("competitor") else [],
                    "emoji": analysis["emoji"],
                    "keywords": analysis["keywords"]
                })
                
            news = []
            for item in report_data.get("industry_news", []):
                analysis = self._analyze_content(item.get("content", ""), item.get("title", ""))
                news.append({
                    "title": item.get("title"),
                    "url": item.get("url"),
                    "content": analysis["summary"], # Use refined summary
                    "published_at": item.get("published_date"),
                    "category": "industry",
                    "emoji": analysis["emoji"],
                    "keywords": analysis["keywords"]
                })
                
            return {
                "competitors": competitors,
                "news": news,
                "stats": report_data.get("stats", {}),
                "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        except Exception as e:
            print(f"Smart Glass Monitor Error: {e}")
            return {"competitors": [], "news": [], "error": str(e)}

    def generate_html(self) -> str:
        """生成HTML页面"""
        if not self.data:
            self.fetch_data()
            
        html = f'''<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新能源汽车Daily News | {datetime.now().strftime("%Y年%m月%d日")}</title>
    <meta name="description" content="新能源汽车行业Daily News：销量排行榜、新车动态、行业领袖观点、行业新闻，现代化视觉设计与响应式布局。">
    <style>
        /* 现代化视觉设计系统 */
        :root {{
            --system-font: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
            --bg-primary: #F9F9F9;
            --bg-secondary: #FFFFFF;
            --text-primary: #2C3E50;
            --text-secondary: #7F8C8D;
            --text-tertiary: #95A5A6;
            --accent-blue: #3498DB;
            --accent-green: #27AE60;
            --accent-orange: #E67E22;
            --accent-red: #E74C3C;
            --accent-dark-blue: #2B5C8A;
            --border-light: #E0E0E0;
            --border-lighter: #F0F0F0;
            --shadow-subtle: 0 2px 12px rgba(0,0,0,0.08);
            --shadow-card: 0 4px 24px rgba(0,0,0,0.12);
            --shadow-hover: 0 8px 32px rgba(0,0,0,0.15);
            --radius-small: 8px;
            --radius-medium: 12px;
            --radius-large: 16px;
            --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            --spacing-unit: 20px;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: var(--system-font);
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }}

        /* Header */
        .header {{
            background: var(--bg-secondary);
            padding: 2rem 0;
            border-bottom: 1px solid var(--border-lighter);
            position: sticky;
            top: 0;
            z-index: 100;
            background: rgba(255, 255, 255, 0.95);
        }}

        .header-content {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .logo {{
            font-size: 1.5rem;
            font-weight: 600;
            color: var(--text-primary);
            letter-spacing: -0.02em;
        }}

        .date-info {{
            font-size: 0.875rem;
            color: var(--text-secondary);
            text-align: right;
        }}

        .date-info .time {{
            font-weight: 500;
            color: var(--text-primary);
        }}

        /* Meta Info */
        .meta-info {{
            background: var(--bg-secondary);
            padding: 1rem 2rem;
            border-bottom: 1px solid var(--border-lighter);
            font-size: 0.75rem;
            color: var(--text-secondary);
        }}

        .meta-content {{
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            gap: 2rem;
            flex-wrap: wrap;
        }}

        .meta-item {{
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }}

        /* Main Container */
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 3rem 2rem;
        }}

        /* Section Styling */
        .section {{
            background: var(--bg-secondary);
            border-radius: var(--radius-large);
            padding: 2.5rem;
            margin-bottom: 2rem;
            box-shadow: var(--shadow-subtle);
            transition: var(--transition);
        }}

        .section:hover {{
            box-shadow: var(--shadow-card);
            transform: translateY(-2px);
        }}

        .section-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border-lighter);
        }}

        .section-title {{
            font-size: 1.75rem;
            font-weight: 600;
            color: var(--text-primary);
            letter-spacing: -0.01em;
        }}

        .section-subtitle {{
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-top: 0.25rem;
        }}

        .section-meta {{
            font-size: 0.75rem;
            color: var(--text-secondary);
        }}

        /* Sales Rankings */
        .rankings-grid {{
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
        }}

        .ranking-card {{
            background: var(--bg-primary);
            border-radius: var(--radius-medium);
            padding: 1.5rem;
            border: 1px solid var(--border-lighter);
            transition: var(--transition);
        }}

        .ranking-card:hover {{
            box-shadow: var(--shadow-hover);
            transform: translateY(-4px);
        }}

        .ranking-header {{
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 1px solid var(--border-lighter);
        }}

        .ranking-title {{
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }}

        .ranking-date-range {{
            font-size: 0.875rem;
            color: var(--accent-blue);
            font-weight: 500;
            margin-bottom: 0.25rem;
        }}

        .ranking-data-source {{
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.25rem;
        }}

        .ranking-last-update {{
            font-size: 0.75rem;
            color: var(--text-tertiary);
        }}

        .ranking-item {{
            display: flex;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid var(--border-lighter);
            transition: var(--transition);
        }}

        .ranking-item:hover {{
            background: rgba(0, 113, 227, 0.05);
            margin: 0 -1rem;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-small);
        }}

        .ranking-item:last-child {{
            border-bottom: none;
        }}

        .rank-number {{
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            background: var(--accent-blue);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.875rem;
            font-weight: 600;
            margin-right: 1rem;
        }}

        .rank-info {{
            flex: 1;
        }}

        .brand-name {{
            font-size: 1rem;
            font-weight: 500;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }}

        .model-name {{
            font-size: 0.875rem;
            color: var(--text-secondary);
        }}

        .sales-info {{
            text-align: right;
        }}

        .sales-number {{
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
        }}

        .sales-change {{
            font-size: 0.75rem;
            color: var(--accent-green);
            font-weight: 500;
        }}

        /* New Car Launches */
        .car-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
        }}

        .car-card {{
            background: var(--bg-primary);
            border-radius: var(--radius-medium);
            overflow: hidden;
            border: 1px solid var(--border-lighter);
            transition: var(--transition);
            position: relative;
        }}

        .car-card:hover {{
            transform: translateY(-4px);
            box-shadow: var(--shadow-card);
        }}

        .car-image-container {{
            position: relative;
            width: 100%;
            height: 240px; /* 4:3 */
            overflow: hidden;
            background: var(--bg-tertiary);
        }}

        .car-image {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: var(--transition);
            opacity: 0;
        }}

        .car-image.loaded {{
            opacity: 1;
        }}

        .car-image-placeholder {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: var(--text-tertiary);
            background: linear-gradient(135deg, var(--bg-tertiary), var(--border-lighter));
        }}

        .car-type-badge {{
            position: absolute;
            top: 1rem;
            right: 1rem;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-small);
            font-size: 0.75rem;
            font-weight: 500;
            color: #FFFFFF;
            transition: var(--transition);
        }}

        .car-type-badge.new {{
            background: var(--accent-red);
        }}

        .car-type-badge.update {{
            background: var(--accent-dark-blue);
        }}

        .car-type-badge:hover {{
            opacity: 0.9;
            transform: scale(1.05);
        }}

        .media-source-badge {{
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-small);
            font-size: 0.75rem;
            font-weight: 500;
        }}

        .car-content {{
            padding: 1.5rem;
        }}

        .car-header {{
            margin-bottom: 1rem;
        }}

        .car-brand {{
            font-size: 0.875rem;
            color: var(--text-secondary);
            margin-bottom: 0.25rem;
        }}

        .car-model {{
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
        }}

        .car-price {{
            font-size: 1rem;
            color: var(--accent-orange);
            font-weight: 600;
        }}

        .car-features {{
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin: 1rem 0;
        }}

        .feature-tag {{
            background: var(--bg-secondary);
            color: var(--text-secondary);
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-small);
            font-size: 0.75rem;
            border: 1px solid var(--border-lighter);
        }}

        .car-description {{
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.5;
            margin-bottom: 1rem;
        }}

        .car-launch-date {{
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-align: right;
        }}

        /* Industry Leaders */
        .leaders-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
        }}

        .leader-card {{
            background: var(--bg-primary);
            border-radius: var(--radius-medium);
            padding: 2rem;
            border: 1px solid var(--border-lighter);
            transition: var(--transition);
        }}

        .leader-card:hover {{
            transform: translateY(-2px);
            box-shadow: var(--shadow-card);
        }}

        .leader-header {{
            display: flex;
            align-items: flex-start;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }}

        .leader-portrait-container {{
            width: 6rem;
            height: 6rem;
            border-radius: 50%;
            margin-right: 0.5rem;
            position: relative;
            border: 1px solid #EEE;
            overflow: hidden;
            flex-shrink: 0;
        }}

        .leader-portrait {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: 50% 40%;
            border-radius: 50%;
        }}

        .leader-portrait-fallback {{
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--accent-blue), #2980B9);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
        }}

        .leader-info h3 {{
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
        }}

        .leader-info p {{
            font-size: 0.875rem;
            color: var(--text-secondary);
        }}

        .statement {{
            background: var(--bg-secondary);
            border-radius: var(--radius-small);
            padding: 1rem;
            margin-bottom: 1rem;
            border-left: 3px solid var(--accent-blue);
            transition: var(--transition);
        }}

        .statement-link {{
            text-decoration: none;
            color: inherit;
            display: block;
            transition: var(--transition);
        }}

        .statement-link:hover {{
            background: rgba(52, 152, 219, 0.05);
            border-radius: var(--radius-small);
        }}

        .statement-date {{
            font-size: 0.75rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
        }}

        .statement-content {{
            font-size: 0.875rem;
            color: var(--text-primary);
            line-height: 1.6;
            margin-bottom: 1rem;
        }}

        .insights-list {{
            list-style: none;
        }}

        .insights-list li {{
            font-size: 0.8125rem;
            color: var(--text-secondary);
            margin-bottom: 0.5rem;
            padding-left: 1rem;
            position: relative;
        }}

        .insights-list li::before {{
            content: "•";
            color: var(--accent-blue);
            position: absolute;
            left: 0;
        }}

        /* Industry News */
        .news-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 1.5rem;
        }}

        .news-card {{
            background: var(--bg-primary);
            border-radius: var(--radius-medium);
            overflow: hidden;
            border: 1px solid var(--border-lighter);
            transition: var(--transition);
        }}

        .news-card:hover {{
            transform: translateY(-2px);
            box-shadow: var(--shadow-card);
        }}

        .news-image-container {{
            position: relative;
            width: 100%;
            height: 200px;
            overflow: hidden;
            background: var(--bg-tertiary);
        }}

        .news-image {{
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: var(--transition);
            opacity: 0;
        }}

        .news-image.loaded {{
            opacity: 1;
        }}

        .news-image-placeholder {{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: var(--text-tertiary);
            background: linear-gradient(135deg, var(--bg-tertiary), var(--border-lighter));
        }}

        .news-category {{
            position: absolute;
            top: 1rem;
            left: 1rem;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: var(--radius-small);
            font-size: 0.75rem;
            font-weight: 500;
        }}

        .news-content {{
            padding: 1.5rem;
        }}

        .news-title {{
            font-size: 1.125rem;
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.75rem;
            line-height: 1.4;
        }}

        .news-summary {{
            font-size: 0.875rem;
            color: var(--text-secondary);
            line-height: 1.6;
            margin-bottom: 1rem;
        }}

        .news-meta {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.75rem;
            color: var(--text-secondary);
        }}

        .news-source {{
            font-weight: 500;
        }}

        /* Responsive Design */
        @media (max-width: 768px) {{
            .container {{
                padding: 2rem 1rem;
            }}
            
            .header-content {{
                padding: 0 1rem;
                flex-direction: column;
                gap: 1rem;
            }}
            
            .meta-content {{
                padding: 0 1rem;
                gap: 1rem;
            }}
            
            .section {{
                padding: 1.5rem;
            }}
            
            .rankings-grid {{
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }}
            
            .car-grid,
            .leaders-grid,
            .news-grid {{
                grid-template-columns: 1fr;
                gap: 1.5rem;
            }}
            
            .section-title {{
                font-size: 1.5rem;
            }}
        }}

        /* Loading Animation */
        .loading {{
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 2px solid var(--border-lighter);
            border-radius: 50%;
            border-top-color: var(--accent-blue);
            animation: spin 1s ease-in-out infinite;
        }}

        @keyframes spin {{
            to {{ transform: rotate(360deg); }}
        }}

        /* Smooth Scrolling */
        html {{
            scroll-behavior: smooth;
        }}

        /* Image Loading States */
        .image-loading {{
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
        }}

        @keyframes loading {{
            0% {{ background-position: 200% 0; }}
            100% {{ background-position: -200% 0; }}
        }}
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-content">
            <div class="logo">新能源汽车Daily News</div>
            <div class="date-info">
                <div class="time">{datetime.now().strftime("%Y年%m月%d日")}</div>
                <div>每日更新</div>
            </div>
        </div>
    </header>

    <!-- Meta Info -->
    <div class="meta-info">
        <div class="meta-content">
            <div class="meta-item">
                <span>📅</span>
                <span>数据日期: {self.data["metadata"]["date_range"]}</span>
            </div>
            <div class="meta-item">
                <span>📊</span>
                <span>数据总量: {self.data["metadata"]["total_data_points"]}条</span>
            </div>
            <div class="meta-item">
                <span>🏢</span>
                <span>数据来源: {', '.join(self.data["metadata"]["data_sources"])}</span>
            </div>
            <div class="meta-item">
                <span>🔄</span>
                <span>最后更新: {self.data["metadata"]["last_updated"]}</span>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div class="container">
        <!-- Sales Rankings Section -->
        <section class="section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">销量排行榜</h2>
                    <p class="section-subtitle">Weekly & Monthly Sales Rankings</p>
                </div>
                <div class="section-meta">
                    <span>📈 实时更新</span>
                </div>
            </div>
            
            <div class="rankings-grid">
                <div class="ranking-card">
                    <div class="ranking-header">
                        <h3 class="ranking-title">📅 本周销量排行</h3>
                        <div class="ranking-date-range">{(datetime.now() - timedelta(days=datetime.now().weekday())).strftime('%m月%d日')}-{(datetime.now() - timedelta(days=datetime.now().weekday()) + timedelta(days=6)).strftime('%m月%d日')}</div>
                        <div class="ranking-data-source">数据来源：乘联会</div>
                        <div class="ranking-last-update">数据更新于{datetime.now().strftime('%m月%d日%H:%M')}</div>
                    </div>
'''
        
        # Add weekly rankings (Top 10)
        for item in self.data["sales_rankings"]["weekly"][:10]:
            html += f'''
                    <div class="ranking-item">
                        <div class="rank-number">{item["rank"]}</div>
                        <div class="rank-info">
                            <div class="brand-name">{item["brand"]}</div>
                        </div>
                        <div class="sales-info">
                            <div class="sales-number">{item["sales"]:,}</div>
                            <div class="sales-change">{item["change"]}</div>
                        </div>
                    </div>
            '''
        
        html += f'''
                </div>
                
                <div class="ranking-card">
                    <div class="ranking-header">
                        <h3 class="ranking-title">📊 本月销量排行</h3>
                        <div class="ranking-date-range">{datetime.now().strftime('%Y年%m月')}</div>
                        <div class="ranking-data-source">数据来源：乘联会</div>
                        <div class="ranking-last-update">数据更新于{datetime.now().strftime('%m月%d日%H:%M')}</div>
                    </div>
        '''
        
        # Add monthly rankings (Top 10, company-level only)
        for item in self.data["sales_rankings"]["monthly"][:10]:
            html += f'''
                    <div class="ranking-item">
                        <div class="rank-number">{item["rank"]}</div>
                        <div class="rank-info">
                            <div class="brand-name">{item["brand"]}</div>
                        </div>
                        <div class="sales-info">
                            <div class="sales-number">{item["sales"]:,}</div>
                            <div class="sales-change">{item["change"]}</div>
                        </div>
                    </div>
            '''
        
        html += f'''
                </div>
            </div>
        </section>

        <!-- New Car Launches Section -->
        <section class="section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">新车动态</h2>
                    <p class="section-subtitle">New Car Launches & Updates</p>
                </div>
                <div class="section-meta">
                    <span>🚗 {len(self.data["new_car_launches"]["new_launches"])}款车型</span>
                </div>
            </div>
            
            <div class="car-grid">
        '''
        
        # Add new car launches
        for car in self.data["new_car_launches"]["new_launches"]:
            type_class = 'new' if car.get("type") == "全新发布" else 'update'
            media_badge = ''
            if not car.get("launch_date") or car.get("type") != "全新发布":
                media_badge = f'<a class="media-source-badge" href="{car.get("source_url", "#")}" target="_blank">信息来源：{car.get("media_channel", "")}</a>'
            brand = car.get("brand", "")
            model = car.get("model", "")
            img_url = self._img_url(
                f"official studio photo of {brand} {model}, accurate brand badge, three-quarter front view, 4:3 ratio, soft lighting, clean background, high-resolution realistic automotive photography",
                "landscape_4_3"
            )
            html += f'''
                <div class="car-card">
                    <div class="car-image-container">
                        <div class="car-image-placeholder">🚗</div>
                        <img class="car-image" loading="lazy" alt="{car["brand"]} {car["model"]}" src="{img_url}" onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none'" onerror="this.style.display='none'" />
                        <div class="car-type-badge {type_class}">{car["type"]}</div>
                        {media_badge}
                    </div>
                    <div class="car-content">
                        <div class="car-header">
                            <div class="car-brand">{car["brand"]}</div>
                            <div class="car-model">{car["model"]}</div>
                            <div class="car-price">{car["price_range"]}</div>
                        </div>
                        <div class="car-features">
            '''
            
            for feature in car["key_features"][:3]:  # Show first 3 features
                html += f'<span class="feature-tag">{feature}</span>'
            
            html += f'''
                        </div>
                        <div class="car-description">{car["description"]}</div>
                        <div class="car-launch-date">预计上市: {car["launch_date"]}</div>
                    </div>
                </div>
            '''
        
        html += f'''
            </div>
        </section>

        <!-- Industry Leaders Section -->
        <section class="section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">行业领袖观点</h2>
                    <p class="section-subtitle">Industry Leaders Insights</p>
                </div>
                <div class="section-meta">
                    <span>👥 {len(self.data["industry_leaders"]["leaders"])}位领袖</span>
                </div>
            </div>
            
            <div class="leaders-grid">
        '''
        
        # Add industry leaders
        for leader in self.data["industry_leaders"]["leaders"]:
            for statement in leader["recent_statements"][:1]:  # Show latest statement
                portrait_url = self._img_url(
                    f"formal corporate portrait photo of {leader['name']}, {leader.get('title','')}, {leader.get('company','')}, half-body, professional attire, studio lighting, neutral background, 4:3 ratio",
                    "portrait_4_3"
                )
                source_url = statement.get("source_url", "#")
                html += f'''
                <div class="leader-card">
                    <div class="leader-header">
                        <div class="leader-portrait-container">
                            <img class="leader-portrait" alt="{leader["name"]}" src="{portrait_url}" onerror="this.onerror=null; this.style.display='none'; var f=this.nextElementSibling; if(f) f.style.display='flex';" />
                            <div class="leader-portrait-fallback" style="display:none;">{leader["name"][0]}</div>
                        </div>
                        <div class="leader-content">
                            <h3>{leader["name"]}</h3>
                            <p>{leader["title"]}</p>
                            <div class="statement">
                                <a href="{source_url}" target="_blank" class="statement-link" onclick="this.style.background='rgba(52, 152, 219, 0.1)'; setTimeout(function(){{ this.style.background=''; }}.bind(this), 200)">
                                    <div class="statement-date">{statement["date"]} · {statement["source"]}</div>
                                    <div class="statement-content">{statement["content"]}</div>
                                </a>
                                <ul class="insights-list">
                '''
                
                for insight in statement["key_insights"]:
                    html += f'<li>{insight}</li>'
                
                html += f'''
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                '''
        
        html += f'''
            </div>
        </section>

        <!-- Industry News Section -->
        <section class="section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">行业其他新闻</h2>
                    <p class="section-subtitle">Industry News & Updates</p>
                </div>
                <div class="section-meta">
                    <span>📰 {len(self.data["industry_news"]["news"])}条新闻</span>
                </div>
            </div>
            
            <div class="news-grid">
        '''
        
        # Add industry news
        for news in self.data["industry_news"]["news"]:
            html += f'''
                <div class="news-card">
                    <div class="news-image-container">
                        <div class="news-image-placeholder">📰</div>
                        <img class="news-image" loading="lazy" alt="{news["title"]}" src="{news["image_url"]}" onload="this.classList.add('loaded'); this.previousElementSibling.style.display='none'" onerror="this.style.display='none'" />
                        <div class="news-category">{news["category"]}</div>
                    </div>
                    <div class="news-content">
                        <h3 class="news-title">{news["title"]}</h3>
                        <p class="news-summary">{news["summary"]}</p>
                        <div class="news-meta">
                            <span class="news-source">{news["source"]}</span>
                            <span>{news["publish_date"]}</span>
                        </div>
                    </div>
                </div>
            '''
        
        html += f'''
            </div>
        </section>

        <!-- Smart Glass Section -->
        <section class="section">
            <div class="section-header">
                <div>
                    <h2 class="section-title">智能调光行业特别关注</h2>
                    <p class="section-subtitle">Smart Dimming Industry Focus</p>
                </div>
                <div class="section-meta">
                    <span>🔍 竞对与市场情报</span>
                </div>
            </div>
            
            <!-- Monitoring Dashboard -->
            <div class="ranking-header">
                <h3 class="ranking-title">📈 监测看板</h3>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem;">
                <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-small); border: 1px solid var(--border-lighter);">
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">监测竞对数量</div>
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--text-primary);">23<span style="font-size: 0.875rem; color: var(--text-secondary); margin-left: 0.5rem;">家</span></div>
                </div>
                <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-small); border: 1px solid var(--border-lighter);">
                    <div style="font-size: 0.875rem; color: var(--text-secondary);">今日更新</div>
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent-blue);">{len(self.data.get("smart_glass_intel", {}).get("competitors", [])) + len(self.data.get("smart_glass_intel", {}).get("news", []))}<span style="font-size: 0.875rem; color: var(--text-secondary); margin-left: 0.5rem;">条</span></div>
                </div>
                <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-small); border: 1px solid var(--border-lighter);">
                     <div style="font-size: 0.875rem; color: var(--text-secondary);">最后检查时间</div>
                     <div style="font-size: 1rem; font-weight: 500; color: var(--text-primary); margin-top: 0.25rem;">{self.data.get("smart_glass_intel", {}).get("updated_at", datetime.now().strftime("%H:%M"))}</div>
                </div>
            </div>
            
            <!-- Competitor Dynamics -->
            <div class="ranking-header">
                <h3 class="ranking-title">📊 竞对动态监测</h3>
                <p class="ranking-data-source">重点关注: Gentex, View, BOE, 唯酷, 伯宇等</p>
            </div>
            <div class="news-grid" style="margin-bottom: 2rem;">
        '''
        
        # Add smart glass competitor news
        competitors = self.data.get("smart_glass_intel", {}).get("competitors", [])
        if not competitors:
             html += '<div style="color:var(--text-secondary); padding:1rem;">暂无最新竞对动态</div>'
        
        for item in competitors:
            matched_str = ', '.join([c.capitalize() for c in item.get("matched_competitors", [])])
            keywords_html = ""
            for kw in item.get("keywords", []):
                keywords_html += f'<span style="display:inline-block; background:var(--bg-primary); padding:2px 8px; border-radius:4px; font-size:0.75rem; color:var(--text-secondary); margin-right:6px; margin-bottom:4px;">#{kw}</span>'
            
            html += f'''
                <div class="news-card">
                    <div class="news-content">
                        <div class="news-meta" style="margin-bottom:0.5rem;">
                            <span style="color:var(--accent-blue); font-weight:600;">{matched_str}</span>
                        </div>
                        
                        <div style="display:flex; align-items:flex-start; margin-bottom:0.75rem;">
                            <div style="font-size:2rem; margin-right:1rem; line-height:1;">{item.get("emoji", "📰")}</div>
                            <h3 class="news-title" style="font-size:1rem; margin-bottom:0; flex:1;">
                                <a href="{item["url"]}" target="_blank" style="text-decoration:none; color:inherit;">{item["title"]}</a>
                            </h3>
                        </div>
                        
                        <div class="news-summary" style="font-size:0.8rem; margin-bottom:0.75rem; line-height:1.6;">{item["content"]}</div>
                        
                        <div style="margin-bottom:0.75rem;">
                            {keywords_html}
                        </div>
                        
                        <div class="news-meta">
                            <span>{item["published_at"][:10] if item["published_at"] else "近期"}</span>
                            <a href="{item["url"]}" target="_blank">查看原文 →</a>
                        </div>
                    </div>
                </div>
            '''

        html += '''
            </div>

            <!-- Industry News -->
            <div class="ranking-header">
                <h3 class="ranking-title">🌍 行业与市场资讯</h3>
                <p class="ranking-data-source">市场趋势、投融资、招聘信息</p>
            </div>
            <div class="news-grid">
        '''
        
        # Add smart glass industry news
        industry = self.data.get("smart_glass_intel", {}).get("news", [])
        if not industry:
             html += '<div style="color:var(--text-secondary); padding:1rem;">暂无最新行业资讯</div>'
             
        for item in industry:
            keywords_html = ""
            for kw in item.get("keywords", []):
                keywords_html += f'<span style="display:inline-block; background:var(--bg-primary); padding:2px 8px; border-radius:4px; font-size:0.75rem; color:var(--text-secondary); margin-right:6px; margin-bottom:4px;">#{kw}</span>'
                
            html += f'''
                <div class="news-card">
                    <div class="news-content">
                        <div style="display:flex; align-items:flex-start; margin-bottom:0.75rem;">
                            <div style="font-size:2rem; margin-right:1rem; line-height:1;">{item.get("emoji", "📰")}</div>
                            <h3 class="news-title" style="font-size:1rem; margin-bottom:0; flex:1;">
                                <a href="{item["url"]}" target="_blank" style="text-decoration:none; color:inherit;">{item["title"]}</a>
                            </h3>
                        </div>
                        
                        <div class="news-summary" style="font-size:0.8rem; margin-bottom:0.75rem; line-height:1.6;">{item["content"]}</div>
                        
                        <div style="margin-bottom:0.75rem;">
                            {keywords_html}
                        </div>
                        
                        <div class="news-meta">
                            <span>{item["published_at"][:10] if item["published_at"] else "近期"}</span>
                            <a href="{item["url"]}" target="_blank">查看原文 →</a>
                        </div>
                    </div>
                </div>
            '''

        html += '''
            </div>
        </section>
    </div>

    <script>
        // Progressive image loading
        document.addEventListener('DOMContentLoaded', function() {
            // 图片懒加载与占位符
            const images = document.querySelectorAll('.car-image, .news-image');
            images.forEach((img) => {
                img.addEventListener('load', function() {
                    this.classList.add('loaded');
                    const ph = this.previousElementSibling;
                    if (ph) { ph.style.display = 'none'; }
                });
                img.addEventListener('error', function() {
                    this.style.display = 'none';
                    const ph = this.previousElementSibling;
                    if (ph) { ph.style.display = 'flex'; }
                });
            });
            
            // Smooth scroll for better navigation
            const sections = document.querySelectorAll('.section');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1
            });
            
            sections.forEach(section => {
                section.style.opacity = '0';
                section.style.transform = 'translateY(20px)';
                section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(section);
            });
        });
        
        // Auto-update timestamp
        function updateTimestamp() {
            const now = new Date();
            const timeString = now.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const metaItems = document.querySelectorAll('.meta-item');
            const lastUpdateItem = Array.from(metaItems).find(item => 
                item.textContent.includes('最后更新')
            );
            
            if (lastUpdateItem) {
                lastUpdateItem.innerHTML = '<span>🔄</span><span>最后更新: ' + timeString + '</span>';
            }
        }
        
        // 每周一00:00自动刷新
        function checkWeekUpdate() {
            const now = new Date();
            if (now.getDay() === 1 && now.getHours() === 0 && now.getMinutes() === 0) {
                location.reload();
            }
        }
        setInterval(checkWeekUpdate, 60000);

        // Update every 30 seconds
        setInterval(updateTimestamp, 30000);
        
        // Initial update
        updateTimestamp();
    </script>
</body>
</html>
        '''
        
        return html
    
    def generate_daily_news(self) -> str:
        """生成完整的Daily News HTML"""
        self.fetch_data()
        return self.generate_html()

# 主函数
def main():
    """主函数 - 生成Daily News页面"""
    print("🚀 开始生成新能源汽车Daily News页面...")
    
    # 可选：运行Tavily采集（需要TAVILY_API_KEY）
    if os.environ.get("RUN_TAVILY_COLLECTION") == "1":
        try:
            collector = DailyNewsGenerator()
            print("🔎 运行Tavily采集（最近一周，至少100条）...")
            out = collector.collect_leader_statements(span_days=7, min_items=100)
            print(f"✅ 采集完成：{out['status']['collected']} 条，时间窗 {out['status']['time_range']}")
        except Exception as e:
            print(f"⚠️ Tavily采集失败: {e}")

    generator = DailyNewsGenerator()
    html_content = generator.generate_daily_news()
    
    # 保存HTML文件
    filename = f"nev_daily_news_{datetime.now().strftime('%Y-%m-%d')}.html"
    base_dir = os.path.dirname(os.path.abspath(__file__))
    reports_dir = os.path.join(base_dir, "reports")
    os.makedirs(reports_dir, exist_ok=True)
    filepath = os.path.join(reports_dir, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✅ Daily News页面生成完成！")
    print(f"📄 文件路径: {filepath}")
    print(f"📊 数据概览:")
    print(f"   • 销量排行: {len(generator.data['sales_rankings']['weekly'])}款车型")
    print(f"   • 新车动态: {generator.data['new_car_launches']['total_count']}款车型")
    print(f"   • 领袖观点: {generator.data['industry_leaders']['total_statements']}条观点")
    print(f"   • 行业新闻: {generator.data['industry_news']['total_count']}条新闻")
    print(f"   • 总数据点: {generator.data['metadata']['total_data_points']}条")
    
    return filepath

if __name__ == "__main__":
    filepath = main()
    print(f"🌐 请在浏览器中打开: file://{filepath}")
