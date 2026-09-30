import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MAX_PHOTOS = 3;
const MAX_VIDEOS = 3;

const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const PHOTO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];

const VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-m4v",
];

function cleanText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

function extensionFromFile(file: File) {
  const originalName = file.name || "";

  const nameExtension = originalName.includes(".")
    ? originalName.split(".").pop()?.toLowerCase()
    : "";

  if (nameExtension) {
    return nameExtension.replace(/[^a-z0-9]/g, "");
  }

  const typeMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/webm": "webm",
    "video/x-m4v": "m4v",
  };

  return typeMap[file.type] || "bin";
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error: "HnC server configuration is incomplete.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const formData = await request.formData();

    const eventId = cleanText(formData.get("event_id"));
    const name = cleanText(formData.get("name"));
    const socialHandle = cleanText(formData.get("social_handle"));
    const caption = cleanText(formData.get("caption"));
    const permission = cleanText(formData.get("permission"));

    const photoFiles = formData
      .getAll("photos")
      .filter(
        (value): value is File =>
          value instanceof File && value.size > 0
      );

    const videoFiles = formData
      .getAll("videos")
      .filter(
        (value): value is File =>
          value instanceof File && value.size > 0
      );

    if (!eventId) {
      return NextResponse.json(
        {
          success: false,
          error: "Please select an event.",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter your name.",
        },
        { status: 400 }
      );
    }

    if (permission !== "yes") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please confirm permission for HnC to review and use your submission.",
        },
        { status: 400 }
      );
    }

    if (photoFiles.length > MAX_PHOTOS) {
      return NextResponse.json(
        {
          success: false,
          error: `You can submit a maximum of ${MAX_PHOTOS} photos.`,
        },
        { status: 400 }
      );
    }

    if (videoFiles.length > MAX_VIDEOS) {
      return NextResponse.json(
        {
          success: false,
          error: `You can submit a maximum of ${MAX_VIDEOS} videos.`,
        },
        { status: 400 }
      );
    }

    if (photoFiles.length === 0 && videoFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload at least one photo or video.",
        },
        { status: 400 }
      );
    }

    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, status")
      .eq("id", eventId)
      .in("status", ["published", "sold_out"])
      .maybeSingle();

    if (eventError) {
      console.error("Event lookup error:", eventError);

      return NextResponse.json(
        {
          success: false,
          error: "Unable to verify the selected event.",
        },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        {
          success: false,
          error: "The selected event could not be found.",
        },
        { status: 404 }
      );
    }

    for (const file of photoFiles) {
      if (!PHOTO_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `"${file.name}" is not a supported photo format.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_PHOTO_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `"${file.name}" is larger than 10 MB.`,
          },
          { status: 400 }
        );
      }
    }

    for (const file of videoFiles) {
      if (!VIDEO_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: `"${file.name}" is not a supported video format.`,
          },
          { status: 400 }
        );
      }

      if (file.size > MAX_VIDEO_SIZE) {
        return NextResponse.json(
          {
            success: false,
            error: `"${file.name}" is larger than 50 MB.`,
          },
          { status: 400 }
        );
      }
    }

    const { data: submission, error: submissionError } =
      await supabase
        .from("event_requests")
        .insert({
          event_id: event.id,
          event_name: event.title,
          event_type: "pitch_your_vibe",
          event_date: null,
          venue: null,
          location: null,
          description: caption || null,
          campaign_budget: null,
          currency: "NGN",
          planner_name: name,
          planner_phone: socialHandle || "pitch-your-vibe",
          planner_whatsapp: null,
          planner_email: null,
          preferred_contact_method: "website",
          additional_notes:
            "Pitch Your Vibe submission. Social handle: " +
            (socialHandle || "Not provided") +
            ". Consent granted for HnC review and promotional use.",
          status: "new",
        })
        .select("id")
        .single();

    if (submissionError || !submission) {
      console.error(
        "Submission creation error:",
        submissionError
      );

      return NextResponse.json(
        {
          success: false,
          error: "We could not create your submission.",
        },
        { status: 500 }
      );
    }

    const requestId = submission.id;

    const uploadedMedia: Array<{
      media_type: string;
      media_url: string;
      original_filename: string;
    }> = [];

    try {
      const allFiles = [
        ...photoFiles.map((file) => ({
          file,
          mediaType: "image",
        })),
        ...videoFiles.map((file) => ({
          file,
          mediaType: "video",
        })),
      ];

      for (const item of allFiles) {
        const extension = extensionFromFile(item.file);

        const safeOriginalName = item.file.name
          .replace(/[^a-zA-Z0-9._-]/g, "_")
          .slice(0, 100);

        const filePath = [
          "pitch-your-vibe",
          eventId,
          requestId,
          `${crypto.randomUUID()}.${extension}`,
        ].join("/");

        const arrayBuffer = await item.file.arrayBuffer();

        const { error: uploadError } = await supabase.storage
          .from("event-media")
          .upload(filePath, arrayBuffer, {
            contentType: item.file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Upload failed for ${safeOriginalName}: ${uploadError.message}`
          );
        }

        const { data: publicUrlData } = supabase.storage
          .from("event-media")
          .getPublicUrl(filePath);

        const mediaUrl = publicUrlData.publicUrl;

        const { error: mediaRecordError } = await supabase
          .from("event_request_media")
          .insert({
            request_id: requestId,
            media_type: item.mediaType,
            media_url: mediaUrl,
            original_filename: item.file.name,
          });

        if (mediaRecordError) {
          throw new Error(
            `Media record failed for ${safeOriginalName}: ${mediaRecordError.message}`
          );
        }

        uploadedMedia.push({
          media_type: item.mediaType,
          media_url: mediaUrl,
          original_filename: item.file.name,
        });
      }
    } catch (mediaError) {
      console.error("Media processing error:", mediaError);

      await supabase
        .from("event_requests")
        .delete()
        .eq("id", requestId);

      return NextResponse.json(
        {
          success: false,
          error:
            mediaError instanceof Error
              ? mediaError.message
              : "One or more files could not be uploaded.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Your Pitch Your Vibe submission has been received and is waiting for HnC review.",
        submission_id: requestId,
        event_id: eventId,
        media_count: uploadedMedia.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Pitch Your Vibe API error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Something went wrong while submitting your media.",
      },
      { status: 500 }
    );
  }
}