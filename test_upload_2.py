import time
import io
import sys
from playwright.sync_api import sync_playwright
import os

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000/login')
    page.fill('input[type="email"]', 'demo@freshflow.ai')
    page.fill('input[type="password"]', 'Demo1234!')
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard', timeout=10000)
    
    # Go to upload page
    page.goto('http://localhost:3000/upload')
    
    # Upload test.csv
    test_csv_path = os.path.join(os.getcwd(), 'test.csv')
    
    file_input = page.locator('input[type="file"]')
    file_input.set_input_files(test_csv_path)
    time.sleep(2)
    
    analyze_btn = page.locator('button:has-text("Analyze & Forecast")')
    analyze_btn.click()
    time.sleep(3)
    
    with open('upload_result.txt', 'w', encoding='utf-8') as f:
        f.write(page.locator('body').inner_text())
        
    browser.close()
