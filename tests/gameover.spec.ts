import { test, expect } from '@playwright/test';

test.describe('Pirate Battle Game - Game Over Flow', () => {

  test.setTimeout(30000);

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => window.stop());
    await page.close();
  });

  test('should trigger game over after match duration and persist score', async ({ page }) => {
    await page.goto('/');

    await page.getByText('PLAY').click();

    await expect(page.locator('text="HP: 100"')).toBeVisible();

    await page.evaluate(() => {
      (window as any).gameEngine.timeRemaining = 0.1;
    });

    await expect(page.getByText('PLAY AGAIN')).toBeVisible({ timeout: 5000 });

    const mainMenuBtn = page.getByText('MAIN MENU');
    await expect(mainMenuBtn).toBeVisible();
    await mainMenuBtn.click();

    await page.getByText('MATCH HISTORY').click();
    await expect(page.getByText('MAIN MENU').first()).toBeVisible({ timeout: 5000 });

    await expect(page.getByText('TIME UP').first()).toBeVisible();
  });
});
