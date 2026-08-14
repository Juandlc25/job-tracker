import { test, expect, type Locator, type Page } from "@playwright/test";

export class JobsPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto("/jobs");
    await expect(this.page.getByTestId("jobs-table")).toBeVisible();
  }

  async createJob(title: string): Promise<void> {
    await this.page.getByTestId("open-create-job").click();
    const modal = this.page.getByTestId("create-job-modal");
    await expect(modal).toBeVisible();
    await modal.getByTestId("create-job-title-input").fill(title);
    await modal
      .getByTestId("create-job-description")
      .fill("Full tear-off after hail. Architectural shingles.");
    await modal.getByTestId("create-job-street").fill("1400 Commerce St");
    await modal.getByTestId("create-job-city").fill("Dallas");
    await modal.getByTestId("create-job-zip").fill("75201");
    await modal.getByTestId("create-job-scheduled-date").fill("2026-12-01T09:00");
    await modal.getByTestId("create-job-submit").click();
    await expect(modal).toBeHidden();
  }

  rowByTitle(title: string): Locator {
    return this.page.locator("[data-job-title]", { hasText: title });
  }

  async filterByStatus(status: "draft" | "scheduled" | "inProgress" | "completed" | "cancelled"): Promise<void> {
    await this.page.getByTestId(`filter-status-${status}`).click();
  }

  async completeJobNamed(title: string): Promise<void> {
    const row = this.rowByTitle(title);
    await row.getByRole("button", { name: "Complete" }).click();
    const modal = this.page.getByTestId("complete-job-modal");
    await expect(modal).toBeVisible();
    await modal.getByTestId("complete-job-submit").click();
    await expect(modal).toBeHidden();
  }
}

test.describe("Jobs office workflow", () => {
  test("creates, filters, and completes a job", async ({ page }, testInfo) => {
    try {
      const jobs = new JobsPage(page);
      await jobs.goto();

      const title = `E2E hail repair ${Date.now()}`;
      await jobs.createJob(title);
      await expect(jobs.rowByTitle(title)).toBeVisible();

      await jobs.filterByStatus("scheduled");
      await expect(jobs.rowByTitle(title)).toBeVisible();

      await jobs.completeJobNamed(title);
      await expect(jobs.rowByTitle(title).getByText("Completed")).toBeVisible();
    } catch (error) {
      await page.screenshot({
        path: testInfo.outputPath("failure.png"),
        fullPage: true,
      });
      throw error;
    }
  });
});
