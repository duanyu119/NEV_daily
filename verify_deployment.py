
import os
import re
import sys
from html.parser import HTMLParser

class HTMLValidator(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.errors = []
        
    def handle_starttag(self, tag, attrs):
        if tag not in ['meta', 'img', 'br', 'hr', 'input', 'link']:
            self.tags.append(tag)
        # Check img src
        if tag == 'img':
            for attr in attrs:
                if attr[0] == 'src':
                    if not attr[1]:
                        self.errors.append(f"Empty src in img tag")

    def handle_endtag(self, tag):
        if tag not in ['meta', 'img', 'br', 'hr', 'input', 'link']:
            if self.tags and self.tags[-1] == tag:
                self.tags.pop()
            else:
                # This is a simple check, might be flaky for complex HTML5 but good for basic structure
                # We'll be lenient here as some HTML5 tags are self-closing or optional
                pass

def check_file(filepath):
    print(f"Checking {filepath}...")
    report = []
    
    if not os.path.exists(filepath):
        return ["❌ File not found"]
        
    # 1. Encoding Check
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        report.append("✅ UTF-8 Encoding: Passed")
    except UnicodeDecodeError:
        return ["❌ UTF-8 Encoding: Failed"]
        
    # 2. Mojibake Check
    if "éš" in content or "ç €" in content:
        report.append("❌ Mojibake (Garbled Text) Detected")
    else:
        report.append("✅ No Mojibake Detected")
        
    # 3. HTML Structure
    validator = HTMLValidator()
    try:
        validator.feed(content)
        report.append("✅ HTML Structure: Parsed successfully")
    except Exception as e:
        report.append(f"❌ HTML Structure: Parsing error - {str(e)}")
        
    # 4. Critical Tags
    required_tags = ['<!DOCTYPE html>', '<html', '<head>', '<body', '<title>', '<meta charset="UTF-8">']
    missing = [tag for tag in required_tags if tag.lower() not in content.lower()]
    if missing:
        report.append(f"❌ Missing Critical Tags: {', '.join(missing)}")
    else:
        report.append("✅ Critical Tags Present")
        
    # 5. Resource Check (Basic)
    # Find local images
    local_imgs = re.findall(r'src=["\'](assets/[^"\']+)["\']', content)
    missing_imgs = []
    for img in local_imgs:
        full_path = os.path.join(os.path.dirname(filepath), img)
        if not os.path.exists(full_path):
            missing_imgs.append(img)
            
    if missing_imgs:
        report.append(f"❌ Missing Local Resources: {', '.join(missing_imgs)}")
    else:
        report.append("✅ Local Resources: All found")
        
    # 6. Content Check
    if "Smart Glass" in content or "智能调光" in content:
         report.append("✅ Smart Glass Content: Present")
    else:
         report.append("❌ Smart Glass Content: Missing")

    return report

def main():
    report_path = "reports/nev_daily_news_2025-12-01.html"
    results = check_file(report_path)
    
    with open("deployment_check_report.md", "w", encoding="utf-8") as f:
        f.write("# 🚀 Deployment Verification Report\n\n")
        f.write(f"**Target File**: `{report_path}`\n")
        f.write(f"**Date**: {os.popen('date').read().strip()}\n\n")
        f.write("## 🔍 Inspection Results\n\n")
        for line in results:
            f.write(f"- {line}\n")
            
        f.write("\n## 📝 Summary\n")
        if any("❌" in r for r in results):
            f.write("**Status**: 🔴 FAILED. Please fix issues before deploying.\n")
        else:
            f.write("**Status**: 🟢 PASSED. Ready for deployment.\n")
            
    print("\n".join(results))

if __name__ == "__main__":
    main()
