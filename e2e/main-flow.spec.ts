import { test, expect } from '@playwright/test';

test('полный сценарий: регистрация → создание поездки → просмотр', async ({ page }) => {
  test.setTimeout(90000);

  // 1. Переходим на страницу регистрации
  await page.goto('http://localhost:5173/register');
  await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible({ timeout: 10000 });

  // 2. Заполняем форму
  await page.fill('input[name="name"]', 'E2E User');
  
  const uniqueEmail = `e2e.${Date.now()}@test.com`;
  await page.fill('input[type="email"]', uniqueEmail);
  
  await page.fill('input[type="password"]', '123456');

  const driverButton = page.getByText('Водитель').first();
  await driverButton.click();

  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

  // 3. Проверка успеха
  await page.waitForURL(/^(?!.*register).*/, { timeout: 10000 });
  
  const createButton = page.getByRole('button', { name: /создать/i });
  const pageTitle = page.getByRole('heading', { level: 1 });
  
  await Promise.race([
    createButton.waitFor({ state: 'visible', timeout: 5000 }),
    pageTitle.waitFor({ state: 'visible', timeout: 5000 })
  ]);

  // 4. Создание поездки
  await createButton.click();

  const fromInput = page.getByLabel(/откуда/i);
  const toInput = page.getByLabel(/куда/i);
  
  if (await fromInput.isVisible()) {
    await fromInput.fill('Москва');
    await toInput.fill('Казань');
  } else {
    await page.fill('input[name="from"], input[placeholder*="Откуда"], input[type="text"] >> nth=0', 'Москва');
    await page.fill('input[name="to"], input[placeholder*="Куда"], input[type="text"] >> nth=1', 'Казань');
  }

  // Места
  const seatsInput = page.getByLabel(/мест/i);
  if (await seatsInput.isVisible()) {
    await seatsInput.fill('3');
  } else {
    await page.fill('input[name="seats"], input[type="number"]', '3');
  }

  // Дата (опционально)
  const dateInput = page.locator('input[type="datetime-local"]');
  if (await dateInput.isVisible()) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    await dateInput.fill(futureDate.toISOString().slice(0, 16));
  }

  // Сохраняем
  await page.getByRole('button', { name: /создать/i }).click();

  // 5. Проверка результата
  await expect(page.getByText('Москва')).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('Казань')).toBeVisible();
});

test('авторизация и доступ к защищённым маршрутам', async ({ page }) => {
  test.setTimeout(90000);

  // 1. Сначала регистрируемся, так как пользователя e2e@test.com может не быть в чистой БД
  await page.goto('http://localhost:5173/register');
  await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible();

  const testEmail = `login.${Date.now()}@test.com`;
  await page.fill('input[name="name"]', 'Login Test');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', '123456');
  
  // Выбираем пассажира (по умолчанию или кликом)
  await page.getByText('Пассажир').first().click();
  
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();
  
  // Ждем успешного входа на главную
  await page.waitForURL(/^(?!.*register).*/, { timeout: 10000 });
  await expect(page.getByRole('button', { name: /создать/i })).toBeVisible({ timeout: 5000 });

  // 2. Выходим из системы (если есть кнопка выхода)
  const logoutBtn = page.getByText(/выйти|logout/i).first();
  if (await logoutBtn.isVisible()) {
    await logoutBtn.click();
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  } else {
    await page.goto('http://localhost:5173/login');
  }

  // 3. Логинимся с созданным пользователем
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', '123456');
  await page.getByRole('button', { name: 'Войти' }).click();

  // 4. Проверяем, что вошли (ушли с логина)
  await expect(page).not.toHaveURL(/.*login/, { timeout: 5000 });

  // 5. Проверка доступа к профилю
  await page.goto('http://localhost:5173/profile');
  // Ждем заголовок профиля или имя пользователя
  await expect(page.getByRole('heading', { name: /профиль/i })).toBeVisible({ timeout: 5000 });
  // Или проверяем, что текст "Login Test" (имя) виден
  await expect(page.getByText('Login Test')).toBeVisible({ timeout: 5000 });
});