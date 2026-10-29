import assert from 'node:assert/strict';

// Optional browser tooling may be installed outside the application workspace.
const playwrightModule = process.env.PLAYWRIGHT_MODULE || 'playwright';
const loadedPlaywright = await import(playwrightModule);
const { chromium } = loadedPlaywright.default || loadedPlaywright;

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 1365, height: 900 } });
const errors = [];
const page = await context.newPage();
page.on('pageerror', error => errors.push(error.message));
const counts = {};
let failNews = true;
let failAdmin = false;
let failSave = false;
let savedNews;
let loginIdentity;
const settings = { id: 'settings1234567', email: 'test@example.com', zalo: 'https://zalo.me/0123456789', messenger: 'https://m.me/test-dealer' };
const cars = ['vf5', 'vf3'].map((slug) => ({ id: slug, slug, name: `VinFast ${slug.toUpperCase()}`, category: 'electric', active: true, price: '123.456.789', color: 'Trắng', image_url: '/favicon.svg', specs: [{ label: 'Thông số từ quản trị', value: 'Test' }] }));
const news = (id) => ({ id, title: `Bài viết ${id}`, published: true, content: '<p>Nội dung bài viết</p>', published_at: '2026-09-01', excerpt: 'Tin thử nghiệm' });
await context.route('**/hcgi/platform/**', async route => {
  const url = new URL(route.request().url());
  if (url.pathname.endsWith('/api/settings')) {
    return route.fulfill({ json: { smtp: { enabled: true, host: 'smtp.example.test', port: 587, username: 'sender@example.test', tls: false }, meta: { senderAddress: 'sender@example.test' } } });
  }
  const authMatch = url.pathname.match(/collections\/(_superusers|users)\/auth-with-password$/);
  if (authMatch) {
    loginIdentity = route.request().postDataJSON()?.identity;
    return route.fulfill({
      json: {
        token: `test.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.test`,
        record: { id: 'fake-admin', collectionName: authMatch[1], email: loginIdentity },
      },
    });
  }
  const match = url.pathname.match(/collections\/([^/]+)\/records(?:\/([^/]+))?/);
  if (!match) return route.fulfill({ status: 404, json: {} });
  const [, collection, id] = match;
  counts[collection] = (counts[collection] || 0) + 1;
  if (failAdmin && ['contacts', 'news', '_superusers', 'users', 'site_settings'].includes(collection)) return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
  if (route.request().method() === 'PATCH' && collection === 'news') {
    savedNews = route.request().postDataJSON();
    return route.fulfill({ status: failSave ? 400 : 200, json: failSave ? { message: 'Không lưu được bài thử nghiệm' } : news(id) });
  }
  if (collection === 'news' && id) {
    if (id === 'missing') return route.fulfill({ status: 404, json: {} });
    if (id === 'slow') await new Promise(resolve => setTimeout(resolve, 500));
    if (failNews && id === 'retry') return route.fulfill({ status: 503, json: { message: 'Unavailable' } });
    return route.fulfill({ json: news(id) });
  }
  let items = [];
  if (collection === 'vehicles') {
    assert.equal(url.searchParams.get('filter'), 'active = true');
    items = cars;
  }
  if (collection === 'site_settings') items = [settings];
  if (collection === 'news') items = [news('first')];
  if (collection === 'mail_settings') items = [{
    id: 'mailsettings123',
    senders_json: JSON.stringify([{ id: 's1', name: 'Người gửi thử', email: 'sender@example.test', role: 'SMTP', isDefault: true, active: true }]),
    recipients_json: JSON.stringify([{ id: 'r1', email: 'recipient@example.test', note: 'Người nhận thử', active: true }]),
  }];
  if (collection === 'sliders') items = [1, 2].map(i => ({ id: `${i}`, title: `Slide ${i}`, image_url: '/favicon.svg', link_url: `/slide-${i}`, active: true }));
  return route.fulfill({ json: { page: 1, perPage: 30, totalPages: 1, totalItems: items.length, items } });
});
await context.route(/https:\/\/(?!127\.0\.0\.1)/, route => route.abort());
const baseUrl = process.env.BROWSER_TEST_BASE_URL || 'http://127.0.0.1:4173';
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseUrl).hostname), 'Browser checks must target a local preview');
const go = (path) => page.goto(`${baseUrl}${path}`);
const spa = (path) => page.evaluate(path => { history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); }, path);

try {
  await go('/xe/vf5');
  await page.getByRole('heading', { name: 'VF5', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Đen', exact: true }).click();
  await page.getByPlaceholder('Nguyễn Văn A').fill('Khách hàng thử');
  assert.match(await page.locator('main').innerText(), /Màu sắc: Đen/);
  assert.equal(counts.vehicles, 1);
  assert.equal(counts.site_settings, 1);
  assert.ok(await page.locator('main a[href="mailto:test@example.com"]').count());
  console.log('PASS selected color survives typing; shared requests; configured contact links');

  await go('/xe/vf3');
  await page.getByRole('heading', { name: 'VF3', exact: true }).waitFor();
  assert.match(await page.locator('main').innerText(), /123\.456\.789/);
  assert.match(await page.locator('main').innerText(), /Thông số từ quản trị/);
  console.log('PASS VF3 uses current managed price and specifications');

  await page.getByRole('link', { name: 'Quay lại danh sách xe' }).first().click();
  await page.locator('#dong-xe').waitFor();
  await page.waitForFunction(() => window.scrollY > 100);
  await page.locator('#vf5').getByRole('button', { name: 'Nhận Ưu Đãi' }).click();
  assert.equal(await page.getByRole('dialog').locator('select').first().inputValue(), 'VinFast VF5');
  await page.keyboard.press('Escape');
  console.log('PASS hash navigation and preselected vehicle in consultation dialog');

  await go('/');
  await page.locator('#top a').first().waitFor();
  const hidden = await page.locator('#top a[aria-hidden="true"]').evaluateAll(nodes => nodes.every(node => getComputedStyle(node).pointerEvents === 'none' && node.tabIndex === -1));
  assert.equal(hidden, true);
  console.log('PASS hidden slides cannot intercept clicks or keyboard focus');

  await go('/tin-tuc/retry');
  await page.getByRole('alert').waitFor();
  assert.ok(page.url().endsWith('/tin-tuc/retry'));
  failNews = false;
  await page.getByRole('button', { name: 'Thử lại', exact: true }).click();
  await page.getByRole('heading', { name: 'Bài viết retry', exact: true }).waitFor();
  await spa('/tin-tuc/slow');
  await page.getByText('Đang tải...', { exact: true }).waitFor();
  await spa('/tin-tuc/fast');
  await page.getByRole('heading', { name: 'Bài viết fast', exact: true }).waitFor();
  await page.waitForTimeout(700);
  assert.equal(await page.locator('h1').innerText(), 'Bài viết fast');
  console.log('PASS news retry and stale response protection when switching articles');

  await go('/duong-dan-khong-ton-tai');
  await page.getByRole('heading', { name: 'Không tìm thấy trang' }).waitFor();
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex, follow');
  console.log('PASS unknown routes show a useful 404 page');

  await go('/admin/login');
  await page.getByLabel('Tên đăng nhập').fill('tamdev');
  await page.getByLabel('Mật khẩu').fill('mat-khau-thu-nghiem');
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
  await page.waitForURL('**/admin');
  assert.equal(loginIdentity, 'tamdev@vinfastbienhoa.com.vn');
  console.log('PASS short admin username is normalized to the configured email domain');

  await go('/admin/settings/mail');
  await page.getByText('recipient@example.test', { exact: true }).waitFor();
  console.log('PASS mail settings load recipients from the persisted server collection');

  await page.evaluate(() => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    localStorage.setItem('pocketbase_auth', JSON.stringify({ token: `test.${payload}.test`, record: { id: 'fake-admin', collectionName: '_superusers', email: 'admin@example.com' } }));
  });
  failAdmin = true;
  for (const [path, pattern] of [
    ['/admin', 'Không tải được thống kê'],
    ['/admin/customers', 'Không tải được danh sách khách hàng'],
    ['/admin/users', 'Không tải được danh sách người dùng'],
    ['/admin/news', 'Không tải được danh sách tin tức'],
    ['/admin/settings/site', 'Không tải được cấu hình website'],
  ]) {
    await go(path);
    await page.getByRole('alert').waitFor();
    assert.ok((await page.getByRole('alert').innerText()).includes(pattern));
  }
  failAdmin = false;
  console.log('PASS admin errors are handled on all five updated pages');

  await go('/admin/news');
  await page.getByRole('button', { name: 'Sửa', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Sửa', exact: true }).click();
  failSave = true;
  await page.getByRole('dialog').getByRole('button', { name: /Lưu/ }).click();
  await page.getByRole('dialog').getByRole('alert').waitFor();
  assert.equal(Object.hasOwn(savedNews, 'published_at'), false);
  console.log('PASS failed news save shows an error and editing preserves publication date');

  await page.setViewportSize({ width: 390, height: 844 });
  await go('/admin/settings/mail');
  await page.getByRole('heading', { name: 'Cấu hình gửi mail', exact: true }).waitFor();
  assert.ok(await page.getByRole('button', { name: 'Mở menu quản trị' }).isVisible());
  assert.ok(await page.getByRole('button', { name: 'Lưu tất cả cấu hình mail', exact: true }).isVisible());
  assert.ok(await page.locator('#admin-navigation').evaluate(node => node.getBoundingClientRect().right <= 0));
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('button', { name: 'Mở menu quản trị' }).click();
  await page.getByRole('link', { name: 'Cấu hình email', exact: true }).waitFor();
  assert.ok(await page.locator('#admin-navigation').evaluate(node => node.getBoundingClientRect().left === 0));
  assert.equal(await page.getByRole('button', { name: 'Đóng menu quản trị' }).count(), 2);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => document.querySelector('#admin-navigation').getBoundingClientRect().right <= 0);
  console.log('PASS mobile admin uses a drawer and mail settings fit the viewport');

  await go('/');
  await page.locator('#dong-xe').waitFor();
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  console.log('PASS mobile homepage fits viewport; no uncaught JavaScript errors');
} finally {
  await browser.close();
}
