import { supabaseAdmin } from "@/lib/supabaseAdmin";

type NotificationInput = {
  userId: string;
  title: string;
  message: string;
};

type AdminAlertInput = {
  severity?: "urgent" | "attention" | "info";
  title: string;
  message: string;
  source?: string;
  actionUrl?: string | null;
  metadata?: Record<string, unknown>;
};

export async function notifyMember({
  userId,
  title,
  message,
}: NotificationInput) {
  if (!userId) {
    throw new Error("notifyMember requires a userId.");
  }

  if (!title.trim() || !message.trim()) {
    throw new Error(
      "notifyMember requires both title and message."
    );
  }

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .insert({
      user_id: userId,
      title: title.trim(),
      message: message.trim(),
      is_read: false,
    })
    .select("id, user_id, title, message, is_read, created_at")
    .single();

  if (error) {
    console.error("HnC member notification failed:", error);
    throw new Error("Could not create member notification.");
  }

  return data;
}

export async function createAdminAlert({
  severity = "info",
  title,
  message,
  source = "system",
  actionUrl = null,
  metadata = {},
}: AdminAlertInput) {
  if (!title.trim() || !message.trim()) {
    throw new Error(
      "createAdminAlert requires both title and message."
    );
  }

  const { data, error } = await supabaseAdmin
    .from("hnc_alerts")
    .insert({
      severity,
      title: title.trim(),
      message: message.trim(),
      source: source.trim() || "system",
      action_url: actionUrl,
      metadata,
    })
    .select(
      "id, severity, title, message, source, action_url, is_read, is_resolved, metadata, created_at, read_at, resolved_at"
    )
    .single();

  if (error) {
    console.error("HnC admin alert failed:", error);
    throw new Error("Could not create HnC admin alert.");
  }

  return data;
}