import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def test_login():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("Testing login page...")
        page.goto(f"{BASE_URL}/login")
        page.wait_for_load_state('networkidle')
        
        # fill wrong password
        page.fill('input[type="email"]', 'demo@freshflow.ai')
        page.fill('input[type="password"]', 'wrongpass')
        page.click('button[type="submit"]')
        time.sleep(2)
        
        # Check for error text
        content = page.content()
        if "Invalid login credentials" in content or "error" in content.lower():
            print("Wrong password error displayed.")
        else:
            print("❌ Wrong password error not found.")

        # login correct
        page.fill('input[type="password"]', 'Demo1234!')
        page.click('button[type="submit"]')
        page.wait_for_load_state('networkidle')
        time.sleep(3)
        
        print("Current URL after login:", page.url)
        
        if "/dashboard" in page.url:
            print("✅ Redirected to /dashboard")
        else:
            print("❌ Failed to redirect to /dashboard")
            
        print("Dashboard content extract:")
        print(page.locator("body").inner_text()[:500])
        
        browser.close()

if __name__ == '__main__':
    test_login()
