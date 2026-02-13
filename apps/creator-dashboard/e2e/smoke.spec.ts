import { test, expect } from "@playwright/test";

// Wait for React hydration to complete before interacting with SPA links
async function waitForHydration(page: import("@playwright/test").Page) {
  // TanStack Router hydrates and attaches click handlers to <a> tags.
  // Wait for the router's client-side JS to be active by checking for
  // a script or by waiting for networkidle.
  await page.waitForLoadState("networkidle");
}

test.describe("Homepage", () => {
  test("loads and displays hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Premium Cooking Shows");
    await expect(page.getByRole("link", { name: /browse shows/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /view plans/i })).toBeVisible();
  });

  test("displays header with navigation", async ({ page }) => {
    await page.goto("/");
    // Desktop header has logo + nav links; mobile has duplicates in Sheet.
    // Use .first() to handle potential duplicates from mobile menu.
    await expect(page.getByRole("link", { name: "Apostle" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Shows" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Pricing" }).first()).toBeVisible();
  });

  test("shows login/register buttons when not authenticated", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "Login" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Register" }).first()).toBeVisible();
  });

  test('displays "How It Works" section', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("How It Works")).toBeVisible();
    await expect(page.getByText("Browse Shows", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Subscribe")).toBeVisible();
    await expect(page.getByText("Start Watching")).toBeVisible();
  });

  test('displays "Ready to Start Cooking?" CTA', async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Ready to Start Cooking?")).toBeVisible();
    await expect(page.getByRole("link", { name: "Get Started" })).toBeVisible();
  });
});

test.describe("Navigation", () => {
  test("navigates to Shows page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    // Target the desktop nav link specifically
    const showsLink = page.locator("header nav").getByRole("link", { name: "Shows" });
    await showsLink.click();
    await expect(page).toHaveURL(/\/shows/, { timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "All Shows" })).toBeVisible();
  });

  test("navigates to Pricing page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    const pricingLink = page.locator("header nav").getByRole("link", { name: "Pricing" });
    await pricingLink.click();
    await expect(page).toHaveURL(/\/pricing/, { timeout: 10_000 });
    await expect(page.getByText("Simple, Transparent Pricing")).toBeVisible();
  });

  test("navigates to Login page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    // Login button is in the header but outside the nav element
    const loginLink = page.locator("header").getByRole("link", { name: "Login" }).first();
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("navigates to Register page", async ({ page }) => {
    await page.goto("/");
    await waitForHydration(page);
    const registerLink = page.locator("header").getByRole("link", { name: "Register" }).first();
    await registerLink.click();
    await expect(page).toHaveURL(/\/register/, { timeout: 10_000 });
  });

  test("logo links back to homepage", async ({ page }) => {
    await page.goto("/pricing");
    await waitForHydration(page);
    await page.locator("header").getByRole("link", { name: "Apostle" }).first().click();
    await expect(page).toHaveURL("/", { timeout: 10_000 });
  });
});

test.describe("Pricing Page", () => {
  test("displays both pricing plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Simple, Transparent Pricing")).toBeVisible();
    await expect(page.getByText("$9.99")).toBeVisible();
    await expect(page.getByText("$89.99")).toBeVisible();
    await expect(page.getByText("Monthly").first()).toBeVisible();
    await expect(page.getByText("Annual").first()).toBeVisible();
  });

  test("shows Get Started buttons when not logged in", async ({ page }) => {
    await page.goto("/pricing");
    const getStartedButtons = page.getByRole("link", { name: "Get Started" });
    await expect(getStartedButtons.first()).toBeVisible();
    expect(await getStartedButtons.count()).toBe(2);
  });

  test("displays Best Value badge on annual plan", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Best Value")).toBeVisible();
  });

  test("lists plan features", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Unlimited access to all cooking shows").first()).toBeVisible();
    await expect(page.getByText("Cancel anytime").first()).toBeVisible();
    await expect(page.getByText("Ad-free streaming").first()).toBeVisible();
  });
});

test.describe("Shows Page", () => {
  test("loads the shows page", async ({ page }) => {
    await page.goto("/shows");
    await expect(page.getByRole("heading", { name: "All Shows" })).toBeVisible();
    await expect(
      page.getByText("Browse our complete library of cooking series.")
    ).toBeVisible();
  });

  test("shows empty state or series list", async ({ page }) => {
    await page.goto("/shows");
    // Either shows "No Shows Yet" empty state or a list of series cards
    const hasEmptyState = await page.getByText("No Shows Yet").isVisible().catch(() => false);
    const hasCards = await page.locator("[class*='card']").first().isVisible().catch(() => false);
    expect(hasEmptyState || hasCards).toBe(true);
  });
});

test.describe("Auth Pages", () => {
  test("login page renders form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading").or(page.getByText(/sign in|log in/i)).first()).toBeVisible();
  });

  test("register page renders form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading").or(page.getByText(/sign up|register|create/i)).first()).toBeVisible();
  });

  test("login page has link to register", async ({ page }) => {
    await page.goto("/login");
    // There are two links matching (header Register + form "Sign up"), use the form one
    const signUpLink = page.locator("main").getByRole("link", { name: /sign up/i });
    await expect(signUpLink).toBeVisible();
  });
});

test.describe("Footer", () => {
  test("footer is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });
});

test.describe("Responsive", () => {
  test("mobile menu toggle is visible on small screens", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByRole("button", { name: /toggle menu/i })).toBeVisible();
  });

  test("desktop nav links hidden on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    // The desktop nav is hidden on mobile (has class "hidden md:flex")
    const desktopNav = page.locator("header nav");
    await expect(desktopNav).toBeHidden();
  });
});

test.describe("Meta / SEO", () => {
  test("homepage has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Apostle/);
  });

  test("pricing page has correct title", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page).toHaveTitle(/Pricing.*Apostle/);
  });

  test("html has lang attribute", async ({ page }) => {
    await page.goto("/");
    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });
});
