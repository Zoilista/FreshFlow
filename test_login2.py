import time
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:3000/login')
    page.fill('input[type="email"]', 'demo@freshflow.ai')
    page.fill('input[type="password"]', 'Demo1234!')
    page.click('button[type="submit"]')
    time.sleep(3)
    print('URL:', page.url)
    
    # Check if there is an error message
    error_el = page.locator('.text-red-500')
    if error_el.count() > 0:
        print('Error:', error_el.first.inner_text())
    
    # Store cookies to check session
    cookies = page.context.cookies()
    print('Cookies:', [c['name'] for c in cookies])
    
    browser.close()
