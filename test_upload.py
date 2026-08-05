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
    page.wait_for_load_state('networkidle')
    
    with open('upload_page.txt', 'w', encoding='utf-8') as f:
        f.write(page.locator('body').inner_text())
        
    print("Upload page loaded")
    
    # Upload test.csv
    test_csv_path = os.path.join(os.getcwd(), 'test.csv')
    
    file_input = page.locator('input[type="file"]')
    if file_input.count() > 0:
        file_input.set_input_files(test_csv_path)
        print("File uploaded")
    else:
        print("❌ File input not found")
        
    time.sleep(2)
    
    # Check for "Analyze & Forecast" button
    analyze_btn = page.locator('button:has-text("Analyze & Forecast")')
    if analyze_btn.count() > 0:
        print("Analyze & Forecast button found")
        analyze_btn.click()
        time.sleep(3)
        print("URL after clicking Analyze:", page.url)
    else:
        print("❌ Analyze & Forecast button missing")
        with open('upload_state.txt', 'w', encoding='utf-8') as f:
            f.write(page.locator('body').inner_text())
            
    browser.close()
