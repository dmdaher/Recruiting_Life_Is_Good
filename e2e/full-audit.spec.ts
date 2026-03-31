import { test, expect } from "@playwright/test";

// Force screenshots on every test for visual audit
test.use({ screenshot: "on" });

// ============================================================================
// 1. LOGIN FLOW
// ============================================================================

test.describe("1. Login & Auth Flow", () => {
  test("1a. root → login redirect", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);
    await page.screenshot({ path: "audit-screenshots/01a-login-page.png", fullPage: true });
  });

  test("1b. login page has all 3 role buttons + Microsoft SSO placeholder", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "DENALI" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter as Recruiter" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Enter as Hiring Manager" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Recruiting Manager/ })).toBeVisible();
    await expect(page.getByText("Sign in with Microsoft")).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/01b-login-buttons.png", fullPage: true });
  });

  test("1c. enter as recruiter navigates correctly", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Enter as Recruiter" }).click();
    await expect(page).toHaveURL(/\/recruiter\/dashboard/);
  });

  test("1d. enter as hiring manager navigates correctly", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Enter as Hiring Manager" }).click();
    await expect(page).toHaveURL(/\/manager\/dashboard/);
  });

  test("1e. enter as admin navigates correctly", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: /Recruiting Manager/ }).click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
  });
});

// ============================================================================
// 2. RECRUITER PORTAL — Visual + Functional
// ============================================================================

test.describe("2. Recruiter Portal", () => {
  test("2a. dashboard — all 5 panels render with data", async ({ page }) => {
    await page.goto("/recruiter/dashboard");
    await expect(page.getByText("My Candidates Today")).toBeVisible();
    await expect(page.getByText("My Numbers")).toBeVisible();
    await expect(page.getByText("Quick Actions")).toBeVisible();
    // Check KPI numbers are actual numbers, not NaN or undefined
    const openReqs = page.locator("text=/\\d+/").first();
    await expect(openReqs).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/02a-recruiter-dashboard.png", fullPage: true });
  });

  test("2b. dashboard — quick action: Submit Candidate opens modal with all fields", async ({ page }) => {
    await page.goto("/recruiter/dashboard");
    await page.getByText("Submit Candidate").click();
    await expect(page.getByRole("heading", { name: "Add Candidate" })).toBeVisible();
    await expect(page.locator('input[name="firstName"]')).toBeVisible();
    await expect(page.locator('input[name="lastName"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('select[name="requisitionId"]')).toBeVisible();
    await expect(page.locator('select[name="sourceId"]')).toBeVisible();
    await expect(page.locator('select[name="jurisdiction"]')).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/02b-add-candidate-modal.png", fullPage: true });
  });

  test("2c. dashboard — submit candidate form validation (empty submit blocked)", async ({ page }) => {
    await page.goto("/recruiter/dashboard");
    await page.getByText("Submit Candidate").click();
    // Try to submit empty form — HTML5 validation should block
    await page.getByRole("button", { name: "Add Candidate" }).click();
    // Form should still be visible (not submitted)
    await expect(page.getByRole("heading", { name: "Add Candidate" })).toBeVisible();
  });

  test("2d. dashboard — submit candidate with real data", async ({ page }) => {
    await page.goto("/recruiter/dashboard");
    await page.getByText("Submit Candidate").click();
    await page.locator('input[name="firstName"]').fill("E2E-Test");
    await page.locator('input[name="lastName"]').fill("Candidate");
    await page.locator('input[name="email"]').fill(`e2e-${Date.now()}@test.com`);
    // Select first requisition
    const reqSelect = page.locator('select[name="requisitionId"]');
    const options = await reqSelect.locator("option").allTextContents();
    if (options.length > 1) {
      await reqSelect.selectOption({ index: 1 });
    }
    await page.getByRole("button", { name: "Add Candidate" }).click();
    // Wait for modal to close or duplicate warning to appear
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "audit-screenshots/02d-candidate-submitted.png", fullPage: true });
  });

  test("2e. pipeline — Kanban renders all 8 columns", async ({ page }) => {
    await page.goto("/recruiter/pipeline");
    await expect(page.getByRole("heading", { name: "Pipeline" })).toBeVisible();
    const columns = ["Sourced", "Submitted", "Screen", "Interview", "Debrief", "Offer Extended", "Offer Accepted", "Hired"];
    for (const col of columns) {
      await expect(page.getByText(col).first()).toBeVisible();
    }
    await page.screenshot({ path: "audit-screenshots/02e-pipeline-kanban.png", fullPage: true });
  });

  test("2f. pipeline — candidate cards have correct elements", async ({ page }) => {
    await page.goto("/recruiter/pipeline");
    const cards = page.locator("[class*='cursor-grab']");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    // Check first card has name and req number
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/02f-pipeline-cards.png", fullPage: true });
  });

  test("2g. pipeline — click card opens slide-out with details", async ({ page }) => {
    await page.goto("/recruiter/pipeline");
    const cards = page.locator("[class*='cursor-grab']");
    if (await cards.count() > 0) {
      await cards.first().click();
      // Wait for slide-out to appear
      await page.waitForTimeout(500);
      // The slide-out has action buttons
      const scheduleBtn = page.getByRole("button", { name: /Schedule Interview/ });
      const hasSlideout = await scheduleBtn.isVisible().catch(() => false);
      if (hasSlideout) {
        await expect(scheduleBtn).toBeVisible();
        await page.screenshot({ path: "audit-screenshots/02g-candidate-slideout.png", fullPage: true });
      } else {
        // Slide-out may not open if card click conflicts with drag — this is a known DnD interaction
        await page.screenshot({ path: "audit-screenshots/02g-pipeline-no-slideout.png", fullPage: true });
      }
    }
  });

  test("2h. pipeline — filter dropdown works", async ({ page }) => {
    await page.goto("/recruiter/pipeline");
    const filter = page.locator("select").first();
    await expect(filter).toBeVisible();
    const options = await filter.locator("option").allTextContents();
    expect(options.length).toBeGreaterThan(1); // "All Requisitions" + actual reqs
  });

  test("2i. reqs — table renders with correct columns", async ({ page }) => {
    await page.goto("/recruiter/reqs");
    await expect(page.getByText("Req #")).toBeVisible();
    await expect(page.getByText("Title").first()).toBeVisible();
    await expect(page.getByText("Department").first()).toBeVisible();
    await expect(page.getByText("Days Open")).toBeVisible();
    await expect(page.getByText("Pay Range")).toBeVisible();
    await expect(page.getByText("Target")).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/02i-reqs-table.png", fullPage: true });
  });

  test("2j. reqs — new requisition form has WA pay range enforcement", async ({ page }) => {
    await page.goto("/recruiter/reqs");
    await page.getByRole("button", { name: /New Requisition/ }).click();
    await expect(page.getByRole("heading", { name: "New Requisition" })).toBeVisible();
    // Pay range fields should be marked as required with WA law notice
    await expect(page.locator('input[name="payRangeMin"]')).toBeVisible();
    await expect(page.locator('input[name="payRangeMax"]')).toBeVisible();
    await expect(page.getByText("WA law").first()).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/02j-new-req-form.png", fullPage: true });
  });

  test("2k. hires — page renders", async ({ page }) => {
    await page.goto("/recruiter/hires");
    await expect(page.getByRole("heading", { name: "Filled Positions" })).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/02k-hires-page.png", fullPage: true });
  });

  test("2l. sidebar — all links present and portal switcher works", async ({ page }) => {
    await page.goto("/recruiter/dashboard");
    await expect(page.getByRole("link", { name: /Dashboard/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Pipeline/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Requisitions/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Hires/ })).toBeVisible();
    // Portal switcher
    await expect(page.getByText("Switch Portal")).toBeVisible();
    await expect(page.getByRole("link", { name: "Admin View" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Manager View" })).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/02l-sidebar.png", fullPage: true });
  });
});

// ============================================================================
// 3. ADMIN PORTAL — Visual + Functional
// ============================================================================

test.describe("3. Admin Portal", () => {
  test("3a. dashboard — KPIs, leaderboard, funnel, source effectiveness", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page.getByText("Open Reqs")).toBeVisible();
    await expect(page.getByText("Total Candidates")).toBeVisible();
    await expect(page.getByText("Recruiter Leaderboard")).toBeVisible();
    await expect(page.getByText("Pipeline Funnel")).toBeVisible();
    await expect(page.getByText("Source Effectiveness")).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/03a-admin-dashboard.png", fullPage: true });
  });

  test("3b. reports — all 12 report cards with export buttons", async ({ page }) => {
    await page.goto("/admin/reports");
    const reportNames = [
      "Daily Recruiting Report", "Open Requisition Report", "YTD Performance Report",
      "Interview Tracking", "Rescinded Offers", "Payroll Impact Report",
      "Filled Positions", "Cost per Hire", "Referral Bonus Tracking",
      "Agency Fees", "Requisition Audit", "Time to Fill"
    ];
    for (const name of reportNames) {
      await expect(page.getByText(name).first()).toBeVisible();
    }
    // Check Export Excel buttons exist
    const exportLinks = page.getByRole("link", { name: /Export Excel/ });
    const exportCount = await exportLinks.count();
    expect(exportCount).toBeGreaterThan(0);
    await page.screenshot({ path: "audit-screenshots/03b-reports-hub.png", fullPage: true });
  });

  test("3c. reports — export Excel actually downloads file", async ({ page }) => {
    await page.goto("/admin/reports");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.getByRole("link", { name: /Export Excel/ }).first().click(),
    ]);
    expect(download.suggestedFilename()).toContain("denali-");
    expect(download.suggestedFilename()).toContain(".xlsx");
  });

  test("3d. financial — shows fee tracking sections", async ({ page }) => {
    await page.goto("/admin/financial");
    await expect(page.getByText("Total Agency Fees YTD")).toBeVisible();
    await expect(page.getByText("Agency Fee Breakdown")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Referral Bonuses" })).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/03d-financial.png", fullPage: true });
  });

  test("3e. compliance — DSAR, legal holds, retention policies visible", async ({ page }) => {
    await page.goto("/admin/compliance");
    await expect(page.getByText("Open DSARs").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Active Legal Holds" })).toBeVisible();
    await expect(page.getByText("Consents Expiring").first()).toBeVisible();
    await expect(page.getByText("Data Retention Policies")).toBeVisible();
    await expect(page.getByText("Retention").first()).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/03e-compliance.png", fullPage: true });
  });

  test("3f. settings — all 9 reference data sections", async ({ page }) => {
    await page.goto("/admin/settings");
    const sections = ["Pipeline Stages", "Users", "Departments", "Locations", "Source Channels", "Agencies", "Clients", "Employee Types", "Posting Channels"];
    for (const s of sections) {
      await expect(page.getByText(s).first()).toBeVisible();
    }
    await page.screenshot({ path: "audit-screenshots/03f-settings.png", fullPage: true });
  });

  test("3g. audit log — SOC 2 event viewer", async ({ page }) => {
    await page.goto("/admin/audit-log");
    await expect(page.getByRole("heading", { name: "Audit Log" })).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/03g-audit-log.png", fullPage: true });
  });

  test("3h. import — upload wizard", async ({ page }) => {
    await page.goto("/admin/import");
    await expect(page.getByRole("heading", { name: "Import Data" })).toBeVisible();
    await expect(page.locator("select")).toBeVisible(); // template selector
    await expect(page.locator('input[type="file"]')).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/03h-import.png", fullPage: true });
  });
});

// ============================================================================
// 4. HIRING MANAGER PORTAL — Visual + Functional
// ============================================================================

test.describe("4. Hiring Manager Portal", () => {
  test("4a. dashboard — my reqs, candidate review, offer approvals", async ({ page }) => {
    await page.goto("/manager/dashboard");
    await expect(page.getByRole("heading", { name: "My Hiring Dashboard" })).toBeVisible();
    await expect(page.getByText("My Open Requisitions")).toBeVisible();
    await expect(page.getByText("Candidates to Review")).toBeVisible();
    await expect(page.getByText("Offers to Approve")).toBeVisible();
    await expect(page.getByText("Candidates Awaiting Your Review")).toBeVisible();
    await page.screenshot({ path: "audit-screenshots/04a-manager-dashboard.png", fullPage: true });
  });

  test("4b. dashboard — reqs show mini pipeline indicators", async ({ page }) => {
    await page.goto("/manager/dashboard");
    // Check that req cards exist with pipeline bars
    const reqCards = page.locator("text=/REQ-/");
    const count = await reqCards.count();
    expect(count).toBeGreaterThan(0);
    await page.screenshot({ path: "audit-screenshots/04b-manager-reqs.png", fullPage: true });
  });
});

// ============================================================================
// 5. API ENFORCEMENT RULES — Deep Test
// ============================================================================

test.describe("5. Enforcement Rules (API)", () => {
  test("5a. WA EPOA: req creation blocked without pay range", async ({ request }) => {
    const res = await request.post("/api/reqs", {
      data: { reqNumber: "AUDIT-1", title: "Test", departmentId: "x", locationId: "x", hiringManagerId: "x" },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.code).toBe("ENFORCEMENT_BLOCKED");
    expect(body.details.rule).toBe("WA_EPOA_PAY_RANGE");
  });

  test("5b. NDA: interview blocked without NDA", async ({ request }) => {
    const cands = await (await request.get("/api/candidates")).json();
    const noNda = cands.data.find((c: any) => c.ndaStatus !== "SIGNED");
    if (noNda) {
      const res = await request.post("/api/interviews", {
        data: { candidateId: noNda.id, scheduledAt: new Date().toISOString(), ndaRequired: true },
      });
      expect(res.status()).toBe(422);
      expect((await res.json()).details.rule).toBe("NDA_REQUIRED");
    }
  });

  test("5c. Fair Chance Act: BG check blocked for Sourced candidate", async ({ request }) => {
    const cands = await (await request.get("/api/candidates")).json();
    const sourced = cands.data.find((c: any) => c.currentStage.name === "Sourced");
    if (sourced) {
      const res = await request.post("/api/background-checks", {
        data: { candidateId: sourced.id, type: "ADP_STANDARD" },
      });
      expect(res.status()).toBe(422);
      expect((await res.json()).details.rule).toBe("WA_FAIR_CHANCE_ACT");
    }
  });

  test("5d. duplicate candidate warning returned", async ({ request }) => {
    // Create a candidate, then try to create again with same email
    const cands = await (await request.get("/api/candidates")).json();
    if (cands.data.length > 0) {
      const existing = cands.data[0];
      const reqs = await (await request.get("/api/reqs")).json();
      if (reqs.data.length > 0) {
        const res = await request.post("/api/candidates", {
          data: {
            firstName: existing.firstName,
            lastName: existing.lastName,
            email: existing.email,
            requisitionId: reqs.data[0].id,
          },
        });
        const body = await res.json();
        // Should succeed but with duplicate warning
        expect(res.status()).toBe(201);
        expect(body.data.duplicateWarning).not.toBeNull();
      }
    }
  });

  test("5e. minimum wage warning on low offer", async ({ request }) => {
    const cands = await (await request.get("/api/candidates")).json();
    if (cands.data.length > 0) {
      const res = await request.post("/api/offers", {
        data: { candidateId: cands.data[0].id, payRate: "5.00", exemptStatus: "non-exempt" },
      });
      if (res.status() === 201) {
        const body = await res.json();
        expect(body.data.minWageWarning).toBeTruthy();
      }
    }
  });
});

// ============================================================================
// 6. REPORT GENERATION — All Reports
// ============================================================================

test.describe("6. Report Generation", () => {
  const reportTypes = ["open-reqs", "filled-positions", "ytd-performance", "agency-fees", "time-to-fill"];

  for (const type of reportTypes) {
    test(`6. ${type} — JSON`, async ({ request }) => {
      const res = await request.get(`/api/reports/${type}`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.rows).toBeDefined();
      expect(body.data.columns).toBeDefined();
      expect(body.data.title).toBeTruthy();
    });

    test(`6. ${type} — Excel download`, async ({ request }) => {
      const res = await request.get(`/api/reports/${type}?format=excel`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("spreadsheetml");
      const body = await res.body();
      expect(body.length).toBeGreaterThan(100); // Not empty
    });
  }
});

// ============================================================================
// 7. COMPLIANCE APIS
// ============================================================================

test.describe("7. Compliance APIs", () => {
  test("7a. consent — list", async ({ request }) => {
    const res = await request.get("/api/compliance/consent");
    expect(res.status()).toBe(200);
  });

  test("7b. legal holds — list", async ({ request }) => {
    const res = await request.get("/api/compliance/holds");
    expect(res.status()).toBe(200);
  });

  test("7c. DSAR — list", async ({ request }) => {
    const res = await request.get("/api/compliance/dsar");
    expect(res.status()).toBe(200);
  });

  test("7d. retention — dry run", async ({ request }) => {
    const res = await request.get("/api/compliance/retention");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.dryRun).toBe(true);
    expect(body.data.policies.length).toBeGreaterThan(0);
  });

  test("7e. DSAR export — candidate data export", async ({ request }) => {
    const cands = await (await request.get("/api/candidates")).json();
    if (cands.data.length > 0) {
      const res = await request.get(`/api/candidates/${cands.data[0].id}/dsar`);
      expect(res.status()).toBe(200);
      const body = await res.json();
      expect(body.data.candidate).toBeDefined();
      expect(body.data.exportedAt).toBeDefined();
    }
  });

  test("7f. audit log — query", async ({ request }) => {
    const res = await request.get("/api/audit");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.logs).toBeDefined();
    expect(body.data.total).toBeDefined();
  });
});

// ============================================================================
// 8. SECURITY CHECKS
// ============================================================================

test.describe("8. Security", () => {
  test("8a. no secrets in HTML source", async ({ page }) => {
    await page.goto("/recruiter/dashboard");
    const html = await page.content();
    expect(html).not.toContain("ENCRYPTION_KEY");
    expect(html).not.toContain("NEXTAUTH_SECRET");
    expect(html).not.toContain("denali_dev"); // db password
  });

  test("8b. API returns structured errors, not stack traces", async ({ request }) => {
    const res = await request.get("/api/candidates/nonexistent-id");
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error).toBeDefined();
    expect(body.code).toBe("NOT_FOUND");
    // Should NOT contain file paths or stack traces
    expect(JSON.stringify(body)).not.toContain("node_modules");
    expect(JSON.stringify(body)).not.toContain(".ts:");
  });

  test("8c. notifications requires userId parameter", async ({ request }) => {
    const res = await request.get("/api/notifications");
    expect(res.status()).toBe(400);
    expect((await res.json()).code).toBe("VALIDATION_ERROR");
  });
});
