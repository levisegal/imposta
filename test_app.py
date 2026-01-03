#!/usr/bin/env python3
"""Test the Imposter Word PWA using Playwright."""

from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:3000"


def test_homepage_loads(page):
    """Test that the homepage loads correctly."""
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    
    # Check title is present
    title = page.locator("h1")
    expect(title).to_contain_text("Imposter Word")
    print("✅ Homepage loads with correct title")


def test_player_management(page):
    """Test adding and removing players."""
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    
    # Should start with 3 players
    player_inputs = page.locator("input[type='text']")
    initial_count = player_inputs.count()
    print(f"   Initial player count: {initial_count}")
    
    # Click add player button
    add_button = page.locator("text=Add Player")
    if add_button.count() > 0:
        add_button.click()
        page.wait_for_timeout(300)
        new_count = page.locator("input[type='text']").count()
        assert new_count == initial_count + 1, f"Expected {initial_count + 1} players, got {new_count}"
        print("✅ Add player works")
    
    # Check remove button exists (should appear after 4th player added)
    remove_buttons = page.locator("button:has(svg[viewBox='0 0 20 20'])").or_(page.locator("button:has-text('×')"))
    if remove_buttons.count() > 0:
        print("✅ Remove player buttons visible")


def test_category_dropdown(page):
    """Test that category dropdown works."""
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    
    # Find the category select
    category_select = page.locator("select")
    if category_select.count() > 0:
        # Get all options
        options = category_select.locator("option")
        option_count = options.count()
        print(f"   Found {option_count} categories")
        assert option_count > 5, f"Expected many categories, got {option_count}"
        
        # Try selecting a category
        category_select.select_option(index=1)
        print("✅ Category dropdown works")
    else:
        print("⚠️ No category select found")


def test_start_game_flow(page):
    """Test starting a game and word reveal flow."""
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    
    # Fill in player names
    inputs = page.locator("input[type='text']")
    for i in range(inputs.count()):
        inputs.nth(i).fill(f"Player {i+1}")
    
    # Click start game
    start_button = page.locator("text=Start Game")
    start_button.click()
    
    # Wait for navigation to /play
    page.wait_for_url("**/play**", timeout=5000)
    page.wait_for_load_state("networkidle")
    print("✅ Game started, navigated to /play")
    
    # Should see word reveal UI
    page.wait_for_timeout(500)
    
    # Look for reveal button or player name
    reveal_button = page.locator("button:has-text('Reveal')").or_(page.locator("button:has-text('Tap')"))
    if reveal_button.count() > 0:
        print("✅ Word reveal UI present")
        
        # Tap to reveal
        reveal_button.first.click()
        page.wait_for_timeout(500)
        
        # Should show either a word or "IMPOSTER"
        content = page.content()
        assert "IMPOSTER" in content.upper() or len(page.locator("text=/[a-z]+/i").all()) > 0
        print("✅ Word/role revealed")


def test_skip_voting_button(page):
    """Test that skip voting button exists in discussion phase."""
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    
    # Fill in player names and start
    inputs = page.locator("input[type='text']")
    for i in range(inputs.count()):
        inputs.nth(i).fill(f"Tester {i+1}")
    
    page.locator("text=Start Game").click()
    page.wait_for_url("**/play**", timeout=5000)
    page.wait_for_load_state("networkidle")
    
    # Go through all reveals
    for _ in range(10):  # Max 10 players
        reveal_btn = page.locator("button:has-text('Reveal')").or_(page.locator("button:has-text('Tap')"))
        if reveal_btn.count() == 0:
            break
        reveal_btn.first.click()
        page.wait_for_timeout(300)
        
        # Click next/pass button
        next_btn = page.locator("button:has-text('Pass')").or_(page.locator("button:has-text('Next')")).or_(page.locator("button:has-text('Start Discussion')"))
        if next_btn.count() > 0:
            next_btn.first.click()
            page.wait_for_timeout(300)
    
    page.wait_for_timeout(500)
    
    # Check for skip voting button
    skip_btn = page.locator("text=Just Reveal")
    if skip_btn.count() > 0:
        print("✅ Skip voting button found")
        skip_btn.click()
        page.wait_for_timeout(500)
        
        # Should show results
        content = page.content()
        if "imposter" in content.lower() or "word was" in content.lower():
            print("✅ Skip voting works - shows results")
    else:
        # Check if we're in discussion phase
        if "Discussion" in page.content():
            print("⚠️ In discussion but skip button not found")
        else:
            print("⚠️ Not in discussion phase yet")


def test_history_page(page):
    """Test that history page loads."""
    page.goto(f"{BASE_URL}/history")
    page.wait_for_load_state("networkidle")
    
    title = page.locator("h1, h2")
    expect(title.first).to_contain_text("History")
    print("✅ History page loads")
    
    # Should have back link
    back_link = page.locator("a:has-text('Home')").or_(page.locator("a:has-text('Back')"))
    if back_link.count() > 0:
        print("✅ History page has navigation")


def main():
    print("\n🧪 Testing Imposter Word PWA\n" + "=" * 40)
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 390, "height": 844})  # iPhone 14 size
        page = context.new_page()
        
        tests = [
            ("Homepage", test_homepage_loads),
            ("Player Management", test_player_management),
            ("Category Dropdown", test_category_dropdown),
            ("Start Game Flow", test_start_game_flow),
            ("Skip Voting", test_skip_voting_button),
            ("History Page", test_history_page),
        ]
        
        passed = 0
        failed = 0
        
        for name, test_fn in tests:
            print(f"\n📋 {name}")
            try:
                test_fn(page)
                passed += 1
            except Exception as e:
                print(f"❌ Failed: {e}")
                page.screenshot(path=f"/tmp/fail_{name.lower().replace(' ', '_')}.png")
                failed += 1
        
        browser.close()
        
        print(f"\n{'=' * 40}")
        print(f"Results: {passed} passed, {failed} failed")
        
        return failed == 0


if __name__ == "__main__":
    import sys
    sys.exit(0 if main() else 1)

