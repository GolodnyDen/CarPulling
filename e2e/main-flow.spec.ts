import { test, expect } from '@playwright/test';

test('полный сценарий: регистрация → создание поездки → просмотр', async ({ page }) => {
  test.setTimeout(90000);

  // 1. Переходим на страницу регистрации
  await page.goto('http://localhost:5173/register');
  
  // Ждем заголовка, чтобы убедиться, что страница загрузилась
  await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible({ timeout: 10000 });

  // 2. Заполняем форму регистрации
  await page.fill('input[name="name"]', 'E2E Тест');
  
  const uniqueEmail = `e2e.${Date.now()}@test.com`;
  await page.fill('input[type="email"]', uniqueEmail);
  
  await page.fill('input[type="password"]', '123456');

  // Выбираем роль "Водитель" кликом по кнопке (так как это не select)
  await page.getByRole('radio', { name: 'Водитель' }).click();

  // Нажимаем кнопку регистрации
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click();

  // 3. Проверяем успешную регистрацию (ждем появления кнопки создания поездки)
  await expect(page.getByRole('button', { name: 'Создать поездку' })).toBeVisible({ timeout: 10000 });

  // 4. Создаем поездку
  await page.getByRole('button', { name: 'Создать поездку' }).click();
  
  // Заполняем форму поездки
  await page.fill('input[name="from"]', 'Москва');
  await page.fill('input[name="to"]', 'Казань');
  await page.fill('input[name="seats"]', '3');
  
  // Устанавливаем дату (завтрашний день)
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const dateStr = futureDate.toISOString().slice(0, 16);
  
  // Пытаемся заполнить дату, если поле существует
  const dateInput = page.locator('input[type="datetime-local"]');
  if (await dateInput.isVisible()) {
    await dateInput.fill(dateStr);
  }

  await page.getByRole('button', { name: 'Создать' }).click();

  // 5. Проверяем, что поездка появилась в списке
  await expect(page.getByText('Москва')).toBeVisible({ timeout: 5000 });
  await expect(page.getByText('Казань')).toBeVisible();
});

test('авторизация и доступ к защищённым маршрутам', async ({ page }) => {
  test.setTimeout(60000);

  // 1. Переходим на страницу входа
  await page.goto('http://localhost:5173/login');
  await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible();

  // 2. Логинимся
  // Примечание: этот тест пройдет, если пользователь e2e@test.com уже создан в БД
  await page.fill('input[type="email"]', 'e2e@test.com');
  await page.fill('input[type="password"]', '123456');
  
  await page.getByRole('button', { name: 'Войти' }).click();

  // 3. Проверяем вход (уходим со страницы логина)
  await expect(page).not.toHaveURL(/.*login/, { timeout: 5000 });
  
  // Переход в профиль
  await page.goto('http://localhost:5173/profile');
  await expect(page.getByRole('heading', { name: 'Профиль' })).toBeVisible({ timeout: 5000 });
});