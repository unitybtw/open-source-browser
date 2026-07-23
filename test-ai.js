const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
  
  console.log('Page loaded, waiting 2 seconds...');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log('Clicking Sparkles / AI button...');
  // The sparkles button is in the TopBar. We can find it by its lucide-sparkles class or text.
  // Actually, it has a title="AI Asistan". Let's click by title or by class.
  const aiButton = await page.$('button[title="AI Asistan"], .lucide-sparkles');
  if (aiButton) {
    // try to get the parent button if it's the svg
    await page.evaluate(() => {
      const btn = document.querySelector('.lucide-sparkles').closest('button');
      if (btn) btn.click();
    });
  } else {
    // fallback, just query selector
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const aiBtn = btns.find(b => b.innerHTML.includes('lucide-sparkles'));
      if (aiBtn) aiBtn.click();
    });
  }
  
  console.log('Clicked, waiting 5 seconds for WebLLM to initialize...');
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();
