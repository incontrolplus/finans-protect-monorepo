import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('https://dashboard.openbalancer.com/dashboard', { waitUntil: 'networkidle' });
  console.log('Navigated to https://dashboard.openbalancer.com');
  
  // Click on "Eligibility Check" in sidebar
  const navItem = await page.getByRole('button', { name: /Eligibility Check/i }).first();
  if (navItem) {
    console.log('Clicking "Eligibility Check" nav item...');
    await navItem.click();
    await page.waitForTimeout(1000);
  } else {
    console.log('Nav item not found via getByRole, trying text match...');
    await page.click('text=Eligibility Check');
    await page.waitForTimeout(1000);
  }
  
  // Test 1: Real Person (Красимир Димитров Николов)
  const firstInput = await page.$('#first-name-input');
  if (firstInput) {
    console.log('Filling form with: Красимир Димитров Николов');
    await firstInput.fill('Красимир');
    await page.fill('#middle-name-input', 'Димитров');
    await page.fill('#last-name-input', 'Николов');
    await page.click('#btn-submit-eligibility');
    
    console.log('Waiting for live API results from CompanyBook...');
    await page.waitForTimeout(4000);
    
    await page.screenshot({ 
      path: '/Users/diokarabaz/.gemini/antigravity-cli/brain/9f09e415-94fc-48ac-af1c-9cb2f2729639/krasimir_nikolov_real_verified.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot saved: krasimir_nikolov_real_verified.png');
  }

  // Test 2: Non-existent person (no fake data should be rendered)
  if (firstInput) {
    console.log('\nTesting non-existent person: Тестов Потребител Несъществуващ');
    await firstInput.fill('Тестов');
    await page.fill('#middle-name-input', 'Потребител');
    await page.fill('#last-name-input', 'Несъществуващ');
    await page.click('#btn-submit-eligibility');
    
    console.log('Waiting for live API results...');
    await page.waitForTimeout(3000);
    
    await page.screenshot({ 
      path: '/Users/diokarabaz/.gemini/antigravity-cli/brain/9f09e415-94fc-48ac-af1c-9cb2f2729639/non_existent_person_verified.png', 
      fullPage: true 
    });
    console.log('✅ Screenshot saved: non_existent_person_verified.png');
  }

  await browser.close();
}

main().catch(console.error);
