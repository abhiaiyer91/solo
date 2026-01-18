import { Stagehand } from '@browserbasehq/stagehand'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function captureApp() {
  const stagehand = new Stagehand({
    env: 'LOCAL',
    headless: false,
    enableCaching: false,
  })

  await stagehand.init()

  const page = stagehand.context.pages()[0]

  await page.goto('http://localhost:5173')
  await page.waitForLoadState('networkidle')

  // Wait for animations
  await sleep(2000)

  await page.screenshot({
    path: 'screenshot.png',
    fullPage: true
  })

  console.log('Screenshot saved to screenshot.png')

  // Keep browser open so we can look together
  console.log('Browser open - press Ctrl+C when done viewing')
  await sleep(60000)

  await stagehand.close()
}

captureApp().catch(console.error)
