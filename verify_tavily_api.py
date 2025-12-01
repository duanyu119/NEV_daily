#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json
import time
from datetime import datetime

def verify_tavily_api(api_key):
    print(f"🔍 Starting Tavily API Verification at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("-" * 50)

    report = {
        "status": "Unknown",
        "key_valid": False,
        "query_test": "Failed",
        "rate_limit_check": "Unknown",
        "details": []
    }

    # 1. Check Service Status & Key Validity (Basic Query)
    print("1️⃣  Testing Basic Query & Key Validity...")
    url = "https://api.tavily.com/search"
    headers = {
        "Content-Type": "application/json"
    }
    payload = {
        "api_key": api_key,
        "query": "Tesla latest news",
        "search_depth": "basic",
        "max_results": 1
    }

    start_time = time.time()
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        latency = (time.time() - start_time) * 1000
        
        report["details"].append(f"Latency: {latency:.2f}ms")
        
        if response.status_code == 200:
            data = response.json()
            print("   ✅ API responded with 200 OK")
            report["status"] = "Operational"
            report["key_valid"] = True
            
            if "results" in data and len(data["results"]) > 0:
                print("   ✅ Query returned results")
                report["query_test"] = "Passed"
                report["details"].append(f"First result title: {data['results'][0].get('title', 'No Title')}")
            else:
                print("   ⚠️  Query returned no results (but 200 OK)")
                report["query_test"] = "Empty Results"
                
        elif response.status_code == 401:
            print("   ❌ 401 Unauthorized - Invalid API Key")
            report["status"] = "Operational" # Service is up, key is bad
            report["key_valid"] = False
            report["details"].append("Error: Invalid API Key")
            
        elif response.status_code == 429:
            print("   ❌ 429 Too Many Requests - Rate Limit Exceeded")
            report["status"] = "Operational"
            report["key_valid"] = True # Key is likely valid if we hit a limit
            report["rate_limit_check"] = "Exceeded"
            report["details"].append("Error: Rate Limit Exceeded")
            
        else:
            print(f"   ❌ Unexpected Status Code: {response.status_code}")
            report["status"] = "Issues Detected"
            report["details"].append(f"Status Code: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Connection Error: {str(e)}")
        report["status"] = "Unreachable"
        report["details"].append(f"Exception: {str(e)}")

    # 2. Rate Limit Check (Header Inspection if available, otherwise inferred)
    # Tavily doesn't always return rate limit headers in standard responses, 
    # but we can assume if the previous call worked, we are within limits.
    print("\n2️⃣  Checking Rate Limits...")
    if report["rate_limit_check"] == "Unknown" and report["key_valid"]:
        print("   ✅ No rate limit errors encountered during basic test.")
        report["rate_limit_check"] = "Normal"
    elif report["rate_limit_check"] == "Exceeded":
        print("   ❌ Rate limit currently exceeded.")

    # 3. Generate Report
    print("\n" + "=" * 50)
    print("📊 TAVILY API STATUS REPORT")
    print("=" * 50)
    print(f"Service Status:  {report['status']}")
    print(f"API Key Valid:   {'✅ Yes' if report['key_valid'] else '❌ No'}")
    print(f"Query Test:      {report['query_test']}")
    print(f"Rate Status:     {report['rate_limit_check']}")
    print("-" * 50)
    print("Details:")
    for detail in report["details"]:
        print(f" - {detail}")
    print("=" * 50)

if __name__ == "__main__":
    API_KEY = "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"
    verify_tavily_api(API_KEY)
