#!/usr/bin/env python3
"""Test the discuss phase shows first speaker and rules toggle."""
from playwright.sync_api import sync_playwright

def test_discuss_phase():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        # Go to home page
        page.goto("http://localhost:3000")
        page.wait_for_load_state("networkidle")
        
        # Add 3 players
        for name in ["Alice", "Bob", "Charlie"]:
            page.fill('input[placeholder*="name" i]', name)
            page.click('button:has-text("Add")')
            page.wait_for_timeout(200)
        
        # Start game
        page.click('button:has-text("Start Game")')
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)
        
        # Click through reveal phase for all 3 players
        for i in range(3):
            # Click to reveal word
            page.click('button:has-text("Tap to Reveal")')
            page.wait_for_timeout(300)
            # Click next/done
            next_btn = page.locator('button:has-text("Next"), button:has-text("Done")')
            next_btn.click()
            page.wait_for_timeout(300)
        
        # Should now be in discuss phase
        page.wait_for_timeout(500)
        
        # Verify "First to speak" is shown
        first_speaker = page.locator('text="First to speak"')
        assert first_speaker.is_visible(), "First to speak section should be visible"
        
        # Verify a player name is shown as first speaker
        speaker_name = page.locator('.text-2xl.font-bold.text-white')
        name_text = speaker_name.text_content()
        assert name_text in ["Alice", "Bob", "Charlie"], f"First speaker should be a player, got: {name_text}"
        print(f"✓ First speaker: {name_text}")
        
        # Verify speaking order is shown
        speaking_order = page.locator('text="Speaking order"')
        assert speaking_order.is_visible(), "Speaking order section should be visible"
        print("✓ Speaking order visible")
        
        # Verify "How to play" rules link exists
        rules_btn = page.locator('button:has-text("How to play")')
        assert rules_btn.is_visible(), "How to play button should be visible"
        print("✓ How to play button visible")
        
        # Click rules and verify they appear
        rules_btn.click()
        page.wait_for_timeout(300)
        
        # Check for rule content
        rule_text = page.locator('text="one-word clues"')
        assert rule_text.is_visible(), "Rules should explain one-word clues"
        print("✓ Rules section expanded with content")
        
        # Verify hide rules works
        hide_btn = page.locator('button:has-text("Hide rules")')
        assert hide_btn.is_visible(), "Hide rules button should appear"
        hide_btn.click()
        page.wait_for_timeout(200)
        
        # Rules should be hidden now
        rule_text = page.locator('text="one-word clues"')
        assert not rule_text.is_visible(), "Rules should be hidden after clicking hide"
        print("✓ Rules toggle works")
        
        print("\n✅ All discuss phase tests passed!")
        browser.close()

if __name__ == "__main__":
    test_discuss_phase()

