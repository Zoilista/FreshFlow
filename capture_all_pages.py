import time
import io
import sys
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

urls = [
    ('/forecast', 'forecast_page.txt'),
    ('/surplus', 'surplus_page.txt'),
    ('/offers', 'offers_page.txt'),
    ('/impact', 'impact_page.txt'),
    ('/settings', 'settings_page.txt')
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000/login')
    page.fill('input[type="email"]', 'demo@freshflow.ai')
    page.fill('input[type="password"]', 'Demo1234!')
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard', timeout=10000)
    
    for path, filename in urls:
        page.goto(f'http://localhost:3000{path}')
        page.wait_for_load_state('networkidle')
        time.sleep(2)
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(page.locator('body').inner_text())
            
    browser.close()
