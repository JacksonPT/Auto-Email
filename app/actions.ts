"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  addVirtualWebmaster,
  assignVirtualWebmaster,
  createExtension,
  deleteVirtualWebmaster,
  saveAutomationSettings,
  updateGlobalTemplate,
  updateSchool,
  updateVirtualWebmaster,
} from "@/lib/repository";
import { processOccurrence } from "@/lib/simulation";

function value(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.replace(/^\[.*?\]\s*/, "");
    return message.length > 180 ? "The submitted values are invalid." : message;
  }
  return "The request could not be completed.";
}

function schoolLocation(
  schoolId: string,
  type: "notice" | "error",
  message: string,
): string {
  return `/schools?school=${encodeURIComponent(schoolId)}&${type}=${encodeURIComponent(message)}`;
}

export async function updateSchoolAction(formData: FormData) {
  const schoolId = value(formData, "schoolId");
  try {
    updateSchool({
      id: schoolId,
      name: value(formData, "name"),
      primaryContactName: value(formData, "primaryContactName"),
      primaryContactEmail: value(formData, "primaryContactEmail"),
      requestDetails: value(formData, "requestDetails"),
      csmName: value(formData, "csmName"),
      csmEmail: value(formData, "csmEmail"),
      lifecycleState: value(formData, "lifecycleState"),
      additionalRecipients: value(formData, "additionalRecipients")
        .split(/[\n,]/)
        .map((recipient) => recipient.trim())
        .filter(Boolean),
    });
  } catch (error) {
    redirect(schoolLocation(schoolId, "error", errorMessage(error)));
  }
  revalidatePath("/schools");
  redirect(schoolLocation(schoolId, "notice", "School details saved."));
}

export async function assignVwmAction(formData: FormData) {
  const schoolId = value(formData, "schoolId");
  try {
    assignVirtualWebmaster(schoolId, value(formData, "vwmId") || null);
  } catch (error) {
    redirect(schoolLocation(schoolId, "error", errorMessage(error)));
  }
  revalidatePath("/schools");
  redirect(
    schoolLocation(schoolId, "notice", "Virtual webmaster assignment saved."),
  );
}

export async function saveAutomationAction(formData: FormData) {
  const schoolId = value(formData, "schoolId");
  try {
    saveAutomationSettings(schoolId, {
      kickoffDate: value(formData, "kickoffDate"),
      closingDate: value(formData, "closingDate"),
      kickoffEnabled: formData.has("kickoffEnabled"),
      sixWeekEnabled: formData.has("sixWeekEnabled"),
      twoWeekEnabled: formData.has("twoWeekEnabled"),
      closingEnabled: formData.has("closingEnabled"),
      usedHoursEnabled: formData.has("usedHoursEnabled"),
    });
  } catch (error) {
    redirect(schoolLocation(schoolId, "error", errorMessage(error)));
  }
  revalidatePath("/schools");
  redirect(
    schoolLocation(
      schoolId,
      "notice",
      "Automation saved and future dates recalculated.",
    ),
  );
}

export async function extendProjectAction(formData: FormData) {
  const schoolId = value(formData, "schoolId");
  try {
    const { occurrenceId } = createExtension(
      schoolId,
      value(formData, "newClosingDate"),
    );
    const outcome = processOccurrence(occurrenceId);
    if (outcome.errors.length > 0) throw new Error(outcome.errors.join(" "));
  } catch (error) {
    redirect(schoolLocation(schoolId, "error", errorMessage(error)));
  }
  revalidatePath("/schools");
  redirect(
    schoolLocation(
      schoolId,
      "notice",
      "Project extended and extension email simulated.",
    ),
  );
}

export async function updateTemplateAction(formData: FormData) {
  const templateKey = value(formData, "templateKey");
  try {
    updateGlobalTemplate(
      templateKey,
      value(formData, "subject"),
      value(formData, "body"),
    );
  } catch (error) {
    redirect(
      `/emails?template=${encodeURIComponent(templateKey)}&error=${encodeURIComponent(errorMessage(error))}`,
    );
  }
  revalidatePath("/emails");
  redirect(
    `/emails?template=${encodeURIComponent(templateKey)}&notice=Global+template+saved.`,
  );
}

export async function addVwmAction(formData: FormData) {
  try {
    addVirtualWebmaster({
      name: value(formData, "name"),
      email: value(formData, "email"),
    });
  } catch (error) {
    redirect(`/vwms?error=${encodeURIComponent(errorMessage(error))}`);
  }
  revalidatePath("/vwms");
  redirect("/vwms?notice=Virtual+webmaster+added.");
}

export async function updateVwmAction(formData: FormData) {
  try {
    updateVirtualWebmaster({
      id: value(formData, "id"),
      name: value(formData, "name"),
      email: value(formData, "email"),
    });
  } catch (error) {
    redirect(`/vwms?error=${encodeURIComponent(errorMessage(error))}`);
  }
  revalidatePath("/vwms");
  revalidatePath("/schools");
  redirect("/vwms?notice=Virtual+webmaster+updated.");
}

export async function deleteVwmAction(formData: FormData) {
  try {
    deleteVirtualWebmaster(value(formData, "id"));
  } catch (error) {
    redirect(`/vwms?error=${encodeURIComponent(errorMessage(error))}`);
  }
  revalidatePath("/vwms");
  revalidatePath("/schools");
  redirect("/vwms?notice=Virtual+webmaster+removed.");
}
