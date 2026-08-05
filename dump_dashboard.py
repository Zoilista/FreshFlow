import time
import io
import sys
from playwright.sync_api import sync_playwright

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000/login')
    page.fill('input[type="email"]', 'demo@freshflow.ai')
    page.fill('input[type="password"]', 'Demo1234!')
    page.click('button[type="submit"]')
    page.wait_for_url('**/dashboard', timeout=10000)
    
    with open('dashboard_content.txt', 'w', encoding='utf-8') as f:
        f.write(page.locator('body').inner_text())
    browser.close()
