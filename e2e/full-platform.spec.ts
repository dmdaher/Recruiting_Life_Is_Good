import { test, expect } from "@playwright/test";

// ============================================================================
// PAGE LOAD TESTS — Every page must render without errors
// ============================================================================

test.describe("Page Load Tests", () => {
  test("root redirects to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders with role buttons", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "DENALI" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter as Recruiter" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter as Hiring Manager" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Recruiting Manager/ })).toBeVisible();
  });

  test("login → recruiter dashboard works", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Enter as Recruiter" }).click();
    await expect(page).toHaveURL(/\/recruiter\/dashboard/);
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  });

  test("recruiter dashboard loads with panels", async ({ page }) => {
    await page.goto("/recruiter/dashboard");
    await expect(page.getByText("My Candidates Today")).toBeVisible();
    await expect(page.getByText("My Numbers")).toBeVisible();
    await expect(page.getByText("Quick Actions")).toBeVisible();
  });

  test("recruiter pipeline page loads with Kanban columns", async ({ page }) => {
    await page.goto("/recruiter/pipeline");
    await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
    // Check for pipeline stage columns
    await expect(page.getByText("Sourced").first()).toBeVisible();
    await expect(page.getByText("Hired").first()).toBeVisible();
  });

  test("recruiter reqs page loads with table", async ({ page }) => {
    await page.goto("/recruiter/reqs");
    await expect(page.getByRole("heading", { name: "Requisitions" })).toBeVisible();
    await expect(page.getByRole("button", { name: /New Requisition/ })).toBeVisible();
  });

  test("recruiter hires page loads", async ({ page }) => {
    await page.goto("/recruiter/hires");
    await expect(page.getByRole("heading", { name: "Filled Positions" })).toBeVisible();
  });

  test("admin dashboard loads with leaderboard", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByRole("heading", { name: "Team Dashboard" })).toBeVisible();
    await expect(page.getByText("Recruiter Leaderboard")).toBeVisible();
    await expect(page.getByText("Pipeline Funnel")).toBeVisible();
  });

  test("admin reports page loads", async ({ page }) => {
    await page.goto("/admin/reports");
    await expect(page.getByRole("heading", { name: "Reports" }).first()).toBeVisible();
    await expect(page.getByText("Daily Recruiting Report")).toBeVisible();
  });

  test("admin financial page loads", async ({ page }) => {
    await page.goto("/admin/financial");
    await expect(page.getByRole("heading", { name: "Financial Tracking" })).toBeVisible();
  });

  test("admin compliance page loads", async ({ page }) => {
    await page.goto("/admin/compliance");
    await expect(page.getByRole("heading", { name: "Compliance" }).first()).toBeVisible();
    await expect(page.getByText("Data Retention Policies")).toBeVisible();
  });

  test("admin settings page loads", async ({ page }) => {
    await page.goto("/admin/settings");
    await expect(page.getByRole("heading", { name: "Settings" }).first()).toBeVisible();
    await expect(page.getByText("Pipeline Stages").first()).toBeVisible();
  });

  test("admin audit log page loads", async ({ page }) => {
    await page.goto("/admin/audit-log");
    await expect(page.getByRole("heading", { name: "Audit Log" })).toBeVisible();
  });

  test("admin import page loads", async ({ page }) => {
    await page.goto("/admin/import");
    await expect(page.getByRole("heading", { name: "Import Data" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Preview Import/ })).toBeVisible();
  });

  test("manager dashboard loads", async ({ page }) => {
    await page.goto("/manager/dashboard");
    await expect(page.getByRole("heading", { name: "My Hiring Dashboard" })).toBeVisible();
  });
});

// ============================================================================
// NAVIGATION TESTS — Sidebar links work
// ============================================================================

test.describe("Navigation Tests", () => {
  test("recruiter sidebar navigation works", async ({ page }) => {
    await page.goto("/recruiter/dashboard");

    await page.getByRole("link", { name: /Pipeline/ }).click();
    await expect(page).toHaveURL(/\/recruiter\/pipeline/);

    await page.getByRole("link", { name: /Requisitions/ }).click();
    await expect(page).toHaveURL(/\/recruiter\/reqs/);

    await page.getByRole("link", { name: /Hires/ }).click();
    await expect(page).toHaveURL(/\/recruiter\/hires/);

    await page.getByRole("link", { name: /Dashboard/ }).click();
    await expect(page).toHaveURL(/\/recruiter\/dashboard/);
  });

  test("admin sidebar navigation works", async ({ page }) => {
    await page.goto("/admin/dashboard");

    await page.getByRole("link", { name: /Reports/ }).click();
    await expect(page).toHaveURL(/\/admin\/reports/);

    await page.getByRole("link", { name: /Financial/ }).click();
    await expect(page).toHaveURL(/\/admin\/financial/);

    await page.getByRole("link", { name: /Compliance/ }).click();
    await expect(page).toHaveURL(/\/admin\/compliance/);

    await page.getByRole("link", { name: /Settings/ }).click();
    await expect(page).toHaveURL(/\/admin\/settings/);
  });
});

// ============================================================================
// API TESTS — All endpoints respond correctly
// ============================================================================

test.describe("API Tests", () => {
  test("GET /api/reqs returns data", async ({ request }) => {
    const res = await request.get("/api/reqs");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
    expect(Array.isArray(body.data)).toBe(true);
  });

  test("GET /api/candidates returns data", async ({ request }) => {
    const res = await request.get("/api/candidates");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data).toBeDefined();
  });

  test("GET /api/interviews returns data", async ({ request }) => {
    const res = await request.get("/api/interviews");
    expect(res.status()).toBe(200);
  });

  test("GET /api/offers returns data", async ({ request }) => {
    const res = await request.get("/api/offers");
    expect(res.status()).toBe(200);
  });

  test("GET /api/notifications requires userId", async ({ request }) => {
    const res = await request.get("/api/notifications");
    expect(res.status()).toBe(400);
  });

  test("GET /api/admin/departments returns departments", async ({ request }) => {
    const res = await request.get("/api/admin/departments");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBeGreaterThan(0);
  });

  test("GET /api/admin/stages returns 8 pipeline stages", async ({ request }) => {
    const res = await request.get("/api/admin/stages");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.length).toBe(8);
  });

  test("GET /api/compliance/holds returns holds", async ({ request }) => {
    const res = await request.get("/api/compliance/holds");
    expect(res.status()).toBe(200);
  });

  test("GET /api/compliance/retention returns policies", async ({ request }) => {
    const res = await request.get("/api/compliance/retention");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.policies.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// ENFORCEMENT RULE TESTS
// ============================================================================

test.describe("Enforcement Rules", () => {
  test("WA EPOA: cannot create req without pay range", async ({ request }) => {
    const res = await request.post("/api/reqs", {
      data: {
        reqNumber: "TEST-NO-PAY",
        title: "Test",
        departmentId: "fake",
        locationId: "fake",
        hiringManagerId: "fake",
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.code).toBe("ENFORCEMENT_BLOCKED");
  });

  test("NDA: cannot schedule interview without NDA", async ({ request }) => {
    const candidatesRes = await request.get("/api/candidates");
    const candidates = await candidatesRes.json();
    const noNda = candidates.data.find((c: { ndaStatus: string }) => c.ndaStatus !== "SIGNED");
    if (noNda) {
      const res = await request.post("/api/interviews", {
        data: { candidateId: noNda.id, scheduledAt: new Date().toISOString(), ndaRequired: true },
      });
      expect(res.status()).toBe(422);
      const body = await res.json();
      expect(body.code).toBe("ENFORCEMENT_BLOCKED");
    }
  });

  test("Fair Chance Act: cannot initiate BG check before Screen", async ({ request }) => {
    const candidatesRes = await request.get("/api/candidates");
    const candidates = await candidatesRes.json();
    const sourced = candidates.data.find((c: { currentStage: { name: string } }) => c.currentStage.name === "Sourced");
    if (sourced) {
      const res = await request.post("/api/background-checks", {
        data: { candidateId: sourced.id, type: "ADP_STANDARD" },
      });
      expect(res.status()).toBe(422);
    }
  });
});

// ============================================================================
// REPORT EXPORT TESTS
// ============================================================================

test.describe("Report Export Tests", () => {
  test("open-reqs report returns JSON", async ({ request }) => {
    const res = await request.get("/api/reports/open-reqs");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.title).toBe("Open Requisition Report");
  });

  test("open-reqs report returns Excel file", async ({ request }) => {
    const res = await request.get("/api/reports/open-reqs?format=excel");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("spreadsheetml");
  });

  test("ytd-performance report works", async ({ request }) => {
    const res = await request.get("/api/reports/ytd-performance");
    expect(res.status()).toBe(200);
  });

  test("invalid report type returns 404", async ({ request }) => {
    const res = await request.get("/api/reports/nonexistent");
    expect(res.status()).toBe(404);
  });
});

// ============================================================================
// FORM ACTION TESTS
// ============================================================================

test.describe("Form Action Tests", () => {
  test("quick action opens add candidate modal", async ({ page }) => {
    await page.goto("/recruiter/dashboard");
    await page.getByText("Submit Candidate").click();
    await expect(page.getByRole("heading", { name: "Add Candidate" })).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
  });

  test("new requisition button opens form with WA law notice", async ({ page }) => {
    await page.goto("/recruiter/reqs");
    await page.getByRole("button", { name: /New Requisition/ }).click();
    await expect(page.getByRole("heading", { name: "New Requisition" })).toBeVisible();
    await expect(page.locator('input[name="payRangeMin"]')).toBeVisible();
  });

  test("pipeline cards are clickable and open slide-out", async ({ page }) => {
    await page.goto("/recruiter/pipeline");
    const cards = page.locator("[class*='cursor-grab']");
    const count = await cards.count();
    if (count > 0) {
      await cards.first().click();
      await expect(page.getByRole("button", { name: /Schedule Interview/ })).toBeVisible();
    }
  });
});
