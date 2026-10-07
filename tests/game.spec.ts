import { test, expect } from '@playwright/test';

test.describe('Pirate Battle Game', () => {
  // Prevent MSW or Vite HMR from hanging the context teardown
  test.afterEach(async ({ page }) => {
    await page.evaluate(() => window.stop());
    await page.close();
  });

  test('should load the main menu', async ({ page }) => {
    await page.goto('/');
  await expect(page).toHaveTitle(/pirate-battle-game/);

    await expect(page).toHaveTitle(/pirate-battle-game/);

    await expect(page.locator('text="SET SAIL. TAKE COMMAND."')).toBeVisible({ timeout: 10000 });

    await expect(page.locator('text="PLAY"')).toBeVisible();
    await expect(page.locator('text="OPTIONS"')).toBeVisible();
    await expect(page.locator('text="RANKING"')).toBeVisible();
    await expect(page.locator('text="MATCH HISTORY"')).toBeVisible();
  });

  test('should start the game when PLAY is clicked', async ({ page }) => {
    await page.goto('/');

    const playBtn = page.locator('text="PLAY"');
    await expect(playBtn).toBeVisible({ timeout: 10000 });

    await playBtn.click();

    await expect(page.locator('text="HP: 100"')).toBeVisible({ timeout: 5000 });

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();
  });

  test('should open options menu', async ({ page }) => {
    await page.goto('/');
    
    const optionsBtn = page.locator('text="OPTIONS"');
    await expect(optionsBtn).toBeVisible({ timeout: 10000 });
    await optionsBtn.click();

    await expect(page.locator('text="MAIN MENU"')).toBeVisible();
  });

  test('should open captains log (ranking)', async ({ page }) => {
    await page.goto('/');
    
    const rankingBtn = page.locator('text="RANKING"');
    await expect(rankingBtn).toBeVisible({ timeout: 10000 });
    await rankingBtn.click();

    await expect(page.locator('text="MAIN MENU"').first()).toBeVisible();
  });

  test('should pause and resume the game', async ({ page }) => {
    await page.goto('/');

    await page.getByText('PLAY').click();
    await expect(page.locator('text="HP: 100"')).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');

    await expect(page.getByText('RESUME')).toBeVisible({ timeout: 5000 });

    await page.getByText('RESUME').click();

    await expect(page.getByText('RESUME')).toBeHidden();
    await expect(page.locator('text="HP: 100"')).toBeVisible();
  });
});
