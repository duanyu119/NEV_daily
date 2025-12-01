#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import time
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import requests

class SmartGlassMonitor:
    """
    智能调光行业监测系统
    Smart Glass Industry Monitoring System
    """
    
    def __init__(self, config_path: str = "smart_glass_config.json", db_path: str = "smart_glass_db.json"):
        # Resolve absolute paths relative to this script file
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.config_path = os.path.join(base_dir, config_path)
        self.db_path = os.path.join(base_dir, db_path)
        
        self.config = self._load_config()
        self.db = self._load_db()
        self.api_key = os.environ.get("TAVILY_API_KEY", "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")
        self.base_url = "https://api.tavily.com/search"

    def _load_config(self) -> Dict[str, Any]:
        if os.path.exists(self.config_path):
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}

    def _load_db(self) -> Dict[str, Any]:
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"items": [], "last_update": ""}

    def _save_db(self):
        self.db["last_update"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.db_path, 'w', encoding='utf-8') as f:
            json.dump(self.db, f, ensure_ascii=False, indent=2)

    def _tavily_search(self, query: str, domains: List[str] = None, days: int = 30) -> List[Dict[str, Any]]:
        """Execute search via Tavily API"""
        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced",
            "include_answer": False,
            "max_results": 10,
            "days": days
        }
        if domains:
            payload["include_domains"] = domains

        try:
            response = requests.post(self.base_url, json=payload, timeout=30)
            if response.status_code == 200:
                return response.json().get("results", [])
        except Exception as e:
            print(f"Error searching for '{query}': {e}")
        return []

    def _clean_content(self, content: str) -> str:
        """Clean and fix encoding of content"""
        if not content:
            return ""
            
        # Fix Encoding (Mojibake repair)
        # Try to fix common UTF-8 decoded as Latin-1 issue
        try:
            # Check for characteristic sequences of mojibake (e.g., "é" followed by other latin-1 chars)
            if "é" in content or "å" in content or "ä" in content:
                # Tentatively try to encode to latin-1 and decode to utf-8
                fixed = content.encode('latin-1').decode('utf-8')
                # If successful and looks valid, use it
                content = fixed
        except Exception:
            # If it fails (not valid latin-1 or not valid utf-8 after), keep original
            pass
        
        # Remove common noise
        import re
        noise_patterns = [
            r"Download.*PDF", r"Read more", r"Click here", r"Subscribe", 
            r"Sign up", r"Login", r"Register", r"\* 分割.*", r"下载免费样品.*",
            r"An Infographic Representation.*"
        ]
        
        cleaned = content
        for p in noise_patterns:
            cleaned = re.sub(p, "", cleaned, flags=re.IGNORECASE)
            
        # Remove extra whitespace
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        
        # Do NOT truncate here - we need full context for summarization later
        # if len(cleaned) > 150: ...
                
        return cleaned

    def run_daily_check(self):
        """Run the daily monitoring task"""
        print(f"🚀 Starting Smart Glass Daily Monitor at {datetime.now()}")
        
        new_items_count = 0
        
        # Extended keyword list for broader coverage (Target: 100+ items)
        # Using multiple variations to bypass pagination limits
        search_queries = []
        
        # 1. Competitor Specific Queries
        for competitor in self.config.get("competitors", []):
            name = competitor["name"]
            search_queries.append({
                "q": f"{name} 智能调光 新闻", "cat": "Competitor", "comp": name, "tag": competitor["category"]
            })
            search_queries.append({
                "q": f"{name} smart glass news", "cat": "Competitor", "comp": name, "tag": competitor["category"]
            })

        # 2. Industry Wide Queries
        industry_keywords = [
            "智能调光玻璃", "电致变色", "PDLC", "SPD玻璃", "光致变色", 
            "Smart Glass Market", "Electrochromic Glass", "Switchable Glass"
        ]
        
        for kw in industry_keywords:
            search_queries.append({
                "q": f"{kw} 行业新闻 2025", "cat": "Industry", "tag": kw
            })
            search_queries.append({
                "q": f"{kw} market trends 2025", "cat": "Industry", "tag": kw
            })

        print(f"   Prepared {len(search_queries)} search queries to ensure volume...")
        
        for query_obj in search_queries:
            print(f"   Searching: {query_obj['q']}...")
            # Get max results possible per query
            results = self._tavily_search(query_obj['q'], days=30)
            
            for item in results:
                item["content"] = self._clean_content(item.get("content", ""))
                # Use specific category/competitor from query object
                if self._add_to_db(
                    item, 
                    category=query_obj["cat"], 
                    competitor=query_obj.get("comp"), 
                    tags=[query_obj.get("tag")]
                ):
                    new_items_count += 1
                    
        self._save_db()
        print(f"✅ Monitor finished. {new_items_count} new items added.")
        return new_items_count

    def _add_to_db(self, item: Dict[str, Any], category: str, competitor: str = None, tags: List[str] = None) -> bool:
        """Add item to DB if not exists (deduplication by URL)"""
        url = item.get("url")
        if not url:
            return False
            
        # Check if exists
        for existing in self.db["items"]:
            if existing["url"] == url:
                return False
                
        # Add new item
        new_entry = {
            "url": url,
            "title": item.get("title"),
            "content": item.get("content"),
            "published_date": item.get("published_date", datetime.now().strftime("%Y-%m-%d")),
            "fetched_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "category": category,
            "competitor": competitor,
            "tags": tags or [],
            "score": item.get("score", 0)
        }
        self.db["items"].append(new_entry)
        return True

    def get_report_data(self) -> Dict[str, Any]:
        """Get data formatted for the report generation"""
        # Sort by date (newest first)
        sorted_items = sorted(self.db["items"], key=lambda x: x["fetched_at"], reverse=True)
        
        # Filter for recent items (e.g., last 3 days)
        recent_items = sorted_items[:20] # Just take top 20 for now
        
        competitor_news = [x for x in recent_items if x["category"] == "Competitor"]
        industry_news = [x for x in recent_items if x["category"] == "Industry"]
        
        return {
            "competitor_news": competitor_news,
            "industry_news": industry_news,
            "stats": {
                "total_tracked": len(self.db["items"]),
                "last_update": self.db.get("last_update")
            }
        }

if __name__ == "__main__":
    monitor = SmartGlassMonitor()
    monitor.run_daily_check()
