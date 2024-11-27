import { expect, test } from '@playwright/test';


//Fix the below scripts to work consistently and do not use static waits. Add proper assertions to the tests
// Login 3 times sucessfully
test('Login multiple times sucessfully @c1', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge1.html']`).click();
  // Login multiple times
  for (let i = 1; i <= 3; i++) {
    await page.locator('#email').fill(`test${i}@example.com`);
    await page.locator('#password').fill(`password${i}`);
    await page.locator('#submitButton').click();
    await expect(page.locator(`#successMessage`)).toContainText('Successfully submitted!');
    await expect(page.locator(`#successMessage`)).toContainText(`Email: test${i}@example.com`);
    await expect(page.locator(`#successMessage`)).toContainText(`Password: password${i}`);
    await expect(page.locator('#successMessage')).toBeHidden();  // Assert that the login success page is hidden and the login form is shown before moving to next test iteration
  }
});

// Login and logout successfully with animated form and delayed loading
test('Login animated form and logout sucessfully @c2', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge2.html']`).click();
  await page.locator('#email').fill(`test1@example.com`);
  await page.locator('#password').fill(`password1`);
  const element = await page.$('#submitButton');
  await element?.waitForElementState("stable",{timeout:10000}); // Ensure the submit button is stable before interacting
  await page.locator('#submitButton').click();
  await expect(page.locator('#userEmail')).toContainText('Logged in as: test1@example.com'); // Assert that the login form is hidden and the user profile is shown
  //Overcome hydration of "My Account" button 
  await expect(async()=>{
    await page.locator('#menuButton').click();
    await expect(page.locator('#logoutOption')).toBeVisible();
  }
  ).toPass({timeout:10000}) 
  await page.locator('#logoutOption').click();
  await expect(page.locator('#loginForm')).toBeVisible(); // Verify login form is displayed again
});

// Fix the Forgot password test and add proper assertions
test('Forgot password @c3', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge3.html']`).click();
  await page.getByRole('button', { name: 'Forgot Password?' }).click();
  await expect(page.getByRole('button', { name: 'Reset Password' })).toBeEnabled(); // Assert that the login form is hidden and the reset password form is shown
  await page.locator('#email').fill('test@example.com');
  await page.getByRole('button', { name: 'Reset Password' }).click();
  await expect(page.locator('#mainContent')).toContainText('Success!'); // Changed to locator to maintain uniformity of locators to type css
  await expect(page.locator('#mainContent')).toContainText('Email: test@example.com'); // Assert that email is correct
  await expect(page.locator('#mainContent')).toContainText('Password reset link sent!');
});

//Fix the login test. Hint: There is a global variable that you can use to check if the app is in ready state
test('Login and logout @c4', async ({ page }) => {
  await page.goto('/');
  await page.locator(`//*[@href='/challenge4.html']`).click();
  // Wait for the application to indicate readiness
  await page.waitForFunction(() => (window as any).isAppReady === true, {
    timeout: 15000, 
  });
  const isAppReady = await page.evaluate(() => (window as any).isAppReady);
  expect(isAppReady).toBe(true);
  await page.locator('#email').waitFor({ state: 'visible' });  // Wait for login form to be visible
  await page.locator('#email').fill(`test@example.com`);
  await page.locator('#password').fill(`password`);
  await page.locator('#submitButton').click();
  await expect(page.locator('#userEmail')).toContainText('test@example.com');   // Verify that the email is displayed in the user profile
  await page.locator('#profileButton').click();
  await page.getByText('Logout').click();
  await expect(page.locator('#loginForm')).toBeVisible();  // Verify login form is displayed again
});
