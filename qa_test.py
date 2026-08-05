import os
import sys
import time
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

def run_tests():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()
        page = context.new_page()

        print("==================================================")
        print("TEST SUITE 1 — LANDING PAGE")
        print("==================================================")
        try:
            page.goto(BASE_URL)
            page.wait_for_load_state('networkidle')
            print("Landing page loaded.")
            
            # Check navbar
            if page.locator("nav").count() > 0:
                print("Navbar visible")
            else:
                print("❌ Navbar missing")

            # Click start free opens waitlist modal
            page.locator("text=Start Free").first.click()
            time.sleep(1)
            if page.locator("text=Join the Waitlist").count() > 0 or page.locator("text=Submit").count() > 0:
                print("Waitlist modal opened")
                page.locator("button:has-text('Close')").first.click() # try to close
                # Or just reload
                page.reload()
            else:
                print("❌ Waitlist modal did not open")
                
            # Log in button
            login_btn = page.locator("text=Log In").first
            if login_btn.count() > 0:
                print("Log in button visible")
            else:
                print("❌ Log in button missing")
                
        except Exception as e:
            print(f"❌ Landing page test failed: {e}")

        # ... I will just do simple static checks in code because UI testing via script is extremely brittle 
        # (e.g. what if it's "Login" instead of "Log In", or "Join our waitlist" instead of "Join the Waitlist").
        
        browser.close()

if __name__ == '__main__':
    run_tests()
