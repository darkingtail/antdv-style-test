import { test, expect } from '@playwright/test'

test.describe('antdv-style demo page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  // ==================== Page Structure ====================

  test('page loads with title and description', async ({ page }) => {
    await expect(page.locator('h1').first()).toBeVisible()
    await expect(page.locator('text=全量功能验证').first()).toBeVisible()
  })

  test('all 13 demo sections are rendered', async ({ page }) => {
    const sections = page.locator('h2')
    await expect(sections).toHaveCount(13) // Wait for Vue to mount all 12 demos and best practice.
  })

  // ==================== Demo 1: createStyles ====================

  test('demo 1: createStyles renders styled cards', async ({ page }) => {
    await expect(page.locator('text=createStyles — CSS 模板字符串').first()).toBeVisible()
    await expect(page.locator('text=createStyles — CSS 对象').first()).toBeVisible()
    await expect(page.locator('text=cx 合并多个样式类').first()).toBeVisible()
  })

  test('demo 1: cards have Emotion-generated class names', async ({ page }) => {
    const card = page.locator('text=createStyles — CSS 模板字符串').first()
    const parent = card.locator('..')
    const className = await parent.getAttribute('class')
    expect(className).toContain('acss-')
  })

  // ==================== Demo 2: Props ====================

  test('demo 2: inactive button toggles to active', async ({ page }) => {
    const btn = page.locator('button:has-text("Inactive")')
    await expect(btn).toBeVisible()
    await btn.click()
    await expect(page.locator('button:has-text("Active")')).toBeVisible()
  })

  test('demo 2: size button cycles through sizes', async ({ page }) => {
    const sizeBtn = page.locator('button:has-text("Size: medium")')
    await expect(sizeBtn).toBeVisible()
    await sizeBtn.click()
    await expect(page.locator('button:has-text("Size: large")')).toBeVisible()
    await page.locator('button:has-text("Size: large")').click()
    await expect(page.locator('button:has-text("Size: small")')).toBeVisible()
  })

  // ==================== Demo 3: Theme Switch ====================

  test('demo 3: light/dark/auto buttons exist', async ({ page }) => {
    await expect(page.locator('button:has-text("light")').first()).toBeVisible()
    await expect(page.locator('button:has-text("dark")').first()).toBeVisible()
    await expect(page.locator('button:has-text("auto")').first()).toBeVisible()
  })

  test('demo 3: clicking dark changes appearance text', async ({ page }) => {
    const darkBtn = page.locator('button:has-text("dark")').first()
    await darkBtn.click()
    await expect(page.locator('text=dark mode').first()).toBeVisible()
  })

  // ==================== Demo 4: Custom Token ====================

  test('demo 4: custom token values are displayed', async ({ page }) => {
    await expect(page.locator('text=Custom Token Demo').first()).toBeVisible()
    await expect(page.locator('text=brandColor').first()).toBeVisible()
    await expect(page.locator('text=#7c3aed').first()).toBeVisible()
  })

  // ==================== Demo 5: Global Style ====================

  test('demo 5: switch toggle exists', async ({ page }) => {
    await expect(page.locator('.ant-switch').first()).toBeVisible()
  })

  // ==================== Demo 6: Stylish ====================

  test('demo 6: stylish cards are rendered', async ({ page }) => {
    await expect(page.locator('text=默认卡片预设样式').first()).toBeVisible()
    await expect(page.locator('text=主题渐变卡片').first()).toBeVisible()
  })

  // ==================== Demo 7: Static Styles + cssVar ====================

  test('demo 7: static style boxes rendered', async ({ page }) => {
    await expect(page.locator('text=静态样式 Box 1').first()).toBeVisible()
    await expect(page.locator('text=零运行时开销').first()).toBeVisible()
  })

  test('demo 7: cssVar proxy examples shown', async ({ page }) => {
    await expect(page.locator('text=var(--ant-color-primary)').first()).toBeVisible()
    await expect(page.locator('text=var(--ant-border-radius)').first()).toBeVisible()
  })

  // ==================== Demo 8: useResponsive ====================

  test('demo 8: breakpoint labels visible', async ({ page }) => {
    await expect(page.locator('text=断点检测').first()).toBeVisible()
    // At least some breakpoint indicators should be visible
    const indicators = page.locator('code')
    const count = await indicators.count()
    expect(count).toBeGreaterThan(0)
  })

  // ==================== Demo 9: Multi-instance ====================

  test('demo 9: two isolated instances rendered', async ({ page }) => {
    await expect(page.locator('text=Instance A (app-a)').first()).toBeVisible()
    await expect(page.locator('text=Instance B (app-b)').first()).toBeVisible()
  })

  test('demo 9: instances have different styles', async ({ page }) => {
    const boxA = page.locator('text=Instance A (app-a)').first()
    const boxB = page.locator('text=Instance B (app-b)').first()
    const classA = await boxA.getAttribute('class')
    const classB = await boxB.getAttribute('class')
    // Different instances should have different class names (different cache keys)
    expect(classA).not.toBe(classB)
  })

  // ==================== Demo 10: useAntdTheme Composables ====================

  test('demo 10: all composable sections visible', async ({ page }) => {
    await expect(page.locator('text=useTheme()').first()).toBeVisible()
    await expect(page.locator('text=useAntdToken()').first()).toBeVisible()
    await expect(page.locator('text=useAntdTheme()').first()).toBeVisible()
    await expect(page.locator('text=useThemeMode()').first()).toBeVisible()
    await expect(page.locator('text=useAntdStylish()').first()).toBeVisible()
  })

  test('demo 10: useTheme shows token values', async ({ page }) => {
    // colorPrimary should come from antdv-next's ConfigProvider
    await expect(page.locator('text=colorPrimary:').first()).toBeVisible()
    await expect(page.locator('text=appearance:').first()).toBeVisible()
    await expect(page.locator('text=prefixCls:').first()).toBeVisible()
  })

  test('demo 10: useThemeMode has setter functions', async ({ page }) => {
    await expect(page.locator('text=setAppearance: function').first()).toBeVisible()
    await expect(page.locator('text=setThemeMode: function').first()).toBeVisible()
  })

  test('demo 10: useAntdToken excludes customToken', async ({ page }) => {
    await expect(page.locator('text=undefined (not in base)').first()).toBeVisible()
  })

  // ==================== Demo 11: px2remTransformer ====================

  test('demo 11: px to rem conversion shown', async ({ page }) => {
    await expect(page.locator('text=Input (px)').first()).toBeVisible()
    await expect(page.locator('text=Output (rem)').first()).toBeVisible()
  })

  // ==================== Demo 12: tokenToCSSVar ====================

  test('demo 12: CSS variable output displayed', async ({ page }) => {
    await expect(page.locator('text=CSS 变量生成').first()).toBeVisible()
    await expect(page.locator('text=--ant-color-primary').first()).toBeVisible()
  })

  test('demo 12: kebab-case conversion correct', async ({ page }) => {
    await expect(page.locator('text=font-size-lg').first()).toBeVisible()
  })

  // ==================== Best Practice: Nest Elements ====================

  test('best practice: nest elements demo rendered', async ({ page }) => {
    await expect(page.locator('text=父子联动').first()).toBeVisible()
    await expect(page.locator('text=hover 试试').first()).toBeVisible()
  })

  test('best practice: hover changes child color', async ({ page }) => {
    const child = page.getByTestId('nested-child')
    await expect(child).toHaveCSS('background-color', 'rgb(255, 77, 79)')
    await page.getByTestId('nested-parent').hover()
    await expect(child).toHaveCSS('background-color', 'rgb(22, 119, 255)')
  })
})
