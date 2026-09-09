import { expect, test } from "@playwright/test";

test("provides responsive school, email, and VWM workspaces", async ({
  page,
  request,
}) => {
  await page.goto("/schools");

  await expect(
    page.getByRole("heading", { name: "Every project, on its own clock." }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "School projects" }).getByRole("link"),
  ).toHaveCount(4);
  await expect(page.getByText("Submit a school project")).toHaveCount(0);
  await expect(page.getByText("Google Form")).toHaveCount(0);
  await expect(page.getByText("Read-only prototype data")).toBeVisible();

  await page.goto("/schools?school=school-pinecrest");
  await expect(page.getByText("Hours unavailable")).toBeVisible();
  await page.goto("/schools?school=school-northstar");

  const options = page.locator('.automation-list input[type="checkbox"]');
  await expect(options).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) {
    await expect(options.nth(index)).toBeChecked();
  }
  await expect(page.locator('input[name="kickoffDate"]')).toHaveCount(1);
  await expect(page.locator('input[name="closingDate"]')).toHaveCount(1);
  await expect(page.locator('input[name="sixWeekDate"]')).toHaveCount(0);
  await expect(page.locator('input[name="twoWeekDate"]')).toHaveCount(0);

  const assignmentPrecedesDates = await page
    .locator('select[name="vwmId"]')
    .evaluate((assignment) => {
      const kickoff = document.querySelector('input[name="kickoffDate"]');
      return kickoff
        ? Boolean(
            assignment.compareDocumentPosition(kickoff) &
            Node.DOCUMENT_POSITION_FOLLOWING,
          )
        : false;
    });
  expect(assignmentPrecedesDates).toBe(true);

  const response = await request.post("/api/simulate");
  expect([200, 207]).toContain(response.status());
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Sent emails" }),
  ).toBeVisible();
  await expect(
    page.getByText("Simulated sent", { exact: true }).first(),
  ).toBeVisible();

  await page.goto("/emails");
  await expect(
    page.getByRole("heading", { name: "Edit once. Use everywhere." }),
  ).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Email templates" }).getByRole("link"),
  ).toHaveCount(9);
  await expect(
    page.getByText("Changes apply to future simulations for all schools."),
  ).toBeVisible();
  await expect(page.locator(".variable-list code").first()).toBeVisible();

  await page.goto("/vwms");
  await expect(
    page.getByRole("heading", { name: "The people behind each project." }),
  ).toBeVisible();
  await expect(page.locator(".vwm-card")).toHaveCount(3);
  await expect(page.locator('.add-vwm-panel input[name="name"]')).toBeVisible();
});

test("extends a school and records the simulated extension email", async ({
  page,
}) => {
  await page.goto("/schools?school=school-ridgeview");
  const closing = await page.locator('input[name="closingDate"]').inputValue();
  const extended = new Date(`${closing}T12:00:00.000Z`);
  extended.setUTCDate(extended.getUTCDate() + 30);

  await page
    .locator('input[name="newClosingDate"]')
    .fill(extended.toISOString().slice(0, 10));
  await page.getByRole("button", { name: "Extend project" }).click();

  await expect(
    page.getByText("Project extended and extension email simulated."),
  ).toBeVisible();
  await expect(
    page.getByText("Project extension", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.locator('input[name="closingDate"]')).toHaveValue(
    extended.toISOString().slice(0, 10),
  );
});

test("runs derived reminders, closing, and zero-hours history end to end", async ({
  page,
  request,
}) => {
  const today = new Date().toISOString().slice(0, 10);
  await page.goto("/schools?school=school-northstar");
  await page.locator('input[name="kickoffDate"]').fill(today);
  await page.locator('input[name="closingDate"]').fill(today);
  for (const checkbox of await page
    .locator('.automation-list input[type="checkbox"]')
    .all()) {
    await checkbox.check();
  }
  await page.getByRole("button", { name: "Submit automation" }).click();
  await expect(
    page.getByText("Automation saved and future dates recalculated."),
  ).toBeVisible();

  const response = await request.post("/api/simulate");
  expect([200, 207]).toContain(response.status());
  await page.reload();
  await expect(
    page.getByText("Six-week reminder", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Two-week reminder", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Project closing", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Project closing follow-up", { exact: true }).first(),
  ).toBeVisible();

  await page.goto("/schools?school=school-harbor");
  await expect(
    page.getByText("Hours used", { exact: true }).first(),
  ).toBeVisible();
  await expect(
    page.getByText("Hours used follow-up", { exact: true }).first(),
  ).toBeVisible();
});
