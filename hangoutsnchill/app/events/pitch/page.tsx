"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@supabase/supabase-js";

type EventItem = {
  id: string;
  title: string;
  slug: string;
  event_date: string;
  venue_name: string | null;
  venue_address: string | null;
  city: string | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const MAX_PHOTOS = 3;
const MAX_VIDEOS = 3;

const EMOJI_GROUPS = [
  {
    label: "Reactions",
    emojis: ["😍", "🥰", "😂", "🤣", "😭", "😱", "😎", "🤩"],
  },
  {
    label: "Party",
    emojis: ["🎉", "🥳", "🔥", "💃🏾", "🕺🏾", "🎶", "🎵", "🍾"],
  },
  {
    label: "Love",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💕"],
  },
  {
    label: "Vibes",
    emojis: ["✨", "💯", "🙌🏾", "👏🏾", "🙏🏾", "🌟", "💥", "📸"],
  },
];

export default function PitchYourVibePage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventId, setEventId] = useState("");
  const [name, setName] = useState("");
  const [socialHandle, setSocialHandle] = useState("");
  const [caption, setCaption] = useState("");

  const [photos, setPhotos] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [permission, setPermission] = useState(false);

  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const captionRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    async function loadEvents() {
      setLoadingEvents(true);

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, slug, event_date, venue_name, venue_address, city"
        )
        .in("status", ["published", "sold_out"])
        .order("event_date", { ascending: true });

      if (error) {
        console.error("Events loading error:", error);
        setErrorMessage("We could not load the available events.");
      } else {
        setEvents(data || []);

        if (data && data.length === 1) {
          setEventId(data[0].id);
        }
      }

      setLoadingEvents(false);
    }

    loadEvents();
  }, []);

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === eventId),
    [events, eventId]
  );

  function insertEmoji(emoji: string) {
    const textarea = captionRef.current;

    if (!textarea) {
      setCaption((current) => current + emoji);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const newCaption =
      caption.slice(0, start) +
      emoji +
      caption.slice(end);

    setCaption(newCaption);

    setShowEmojiPicker(false);

    requestAnimationFrame(() => {
      textarea.focus();

      const newCursorPosition = start + emoji.length;

      textarea.setSelectionRange(
        newCursorPosition,
        newCursorPosition
      );
    });
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);

    setErrorMessage("");

    if (selected.length > MAX_PHOTOS) {
      setErrorMessage(
        `You can submit a maximum of ${MAX_PHOTOS} photos.`
      );
      setPhotos(selected.slice(0, MAX_PHOTOS));
      return;
    }

    setPhotos(selected);
  }

  function handleVideoChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files || []);

    setErrorMessage("");

    if (selected.length > MAX_VIDEOS) {
      setErrorMessage(
        `You can submit a maximum of ${MAX_VIDEOS} videos.`
      );
      setVideos(selected.slice(0, MAX_VIDEOS));
      return;
    }

    setVideos(selected);
  }

  function removePhoto(index: number) {
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  function removeVideo(index: number) {
    setVideos((current) => current.filter((_, i) => i !== index));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSubmitting(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!eventId) {
      setErrorMessage("Please select an event.");
      setSubmitting(false);
      return;
    }

    if (!name.trim()) {
      setErrorMessage("Please enter your name.");
      setSubmitting(false);
      return;
    }

    if (photos.length === 0 && videos.length === 0) {
      setErrorMessage("Please upload at least one photo or video.");
      setSubmitting(false);
      return;
    }

    if (!permission) {
      setErrorMessage(
        "Please confirm permission for HnC to review and use your submission."
      );
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append("event_id", eventId);
      formData.append("name", name.trim());
      formData.append("social_handle", socialHandle.trim());
      formData.append("caption", caption);
      formData.append("permission", permission ? "yes" : "no");

      photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      videos.forEach((video) => {
        formData.append("videos", video);
      });

      const response = await fetch("/api/events/pitch", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "We could not create your submission."
        );
      }

      setSuccessMessage(
        result.message ||
          "Your Pitch Your Vibe submission has been received."
      );

      setName("");
      setSocialHandle("");
      setCaption("");
      setPhotos([]);
      setVideos([]);
      setPermission(false);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Pitch submission error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your media."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-400">
            HangoutsNChill Events
          </p>

          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Pitch Your Vibe 🎉
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-gray-300 sm:text-lg">
            Were you there? 📸 Capture the moment, tell us what happened,
            and share your vibe with the HnC community.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl sm:p-8"
        >
          <section>
            <label
              htmlFor="event"
              className="mb-2 block text-sm font-bold text-white"
            >
              Select Event
            </label>

            <select
              id="event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              disabled={loadingEvents || submitting}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-base text-white outline-none transition focus:border-yellow-400"
            >
              <option value="" className="bg-black">
                {loadingEvents
                  ? "Loading events..."
                  : "Choose the event"}
              </option>

              {events.map((event) => (
                <option
                  key={event.id}
                  value={event.id}
                  className="bg-black"
                >
                  {event.title}
                </option>
              ))}
            </select>

            {selectedEvent && (
              <div className="mt-3 rounded-2xl bg-white/5 p-4 text-sm text-gray-300">
                <p className="font-semibold text-white">
                  {selectedEvent.title}
                </p>

                <p className="mt-1">
                  {new Date(selectedEvent.event_date).toLocaleString(
                    "en-NG",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </p>

                {selectedEvent.venue_name && (
                  <p className="mt-1">
                    {selectedEvent.venue_name}
                    {selectedEvent.city
                      ? `, ${selectedEvent.city}`
                      : ""}
                  </p>
                )}
              </div>
            )}
          </section>

          <section>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-bold text-white"
            >
              Your Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="What should we call you?"
              disabled={submitting}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-base text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
            />
          </section>

          <section>
            <label
              htmlFor="social"
              className="mb-2 block text-sm font-bold text-white"
            >
              Social Handle{" "}
              <span className="font-normal text-gray-500">
                (optional)
              </span>
            </label>

            <input
              id="social"
              type="text"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value)}
              placeholder="@yourhandle"
              disabled={submitting}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-base text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
            />
          </section>

          <section>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label
                htmlFor="caption"
                className="block text-sm font-bold text-white"
              >
                Tell Us About The Moment 💬
              </label>

              <button
                type="button"
                onClick={() => setShowEmojiPicker((current) => !current)}
                disabled={submitting}
                aria-label="Open emoji picker"
                aria-expanded={showEmojiPicker}
                className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xl transition hover:bg-white/20 active:scale-95"
              >
                😊
              </button>
            </div>

            <textarea
              ref={captionRef}
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="What happened? How did you feel? Tell us the story... 🔥🎉😍💃🏾🕺🏾"
              rows={5}
              disabled={submitting}
              className="w-full resize-y rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-base leading-7 text-white outline-none placeholder:text-gray-500 focus:border-yellow-400"
            />

            {showEmojiPicker && (
              <div className="mt-3 rounded-2xl border border-white/10 bg-zinc-950 p-4 shadow-xl">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Tap an emoji to add it
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(false)}
                    className="rounded-lg px-2 py-1 text-sm text-gray-400 hover:bg-white/10 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  {EMOJI_GROUPS.map((group) => (
                    <div key={group.label}>
                      <p className="mb-2 text-xs font-semibold text-gray-500">
                        {group.label}
                      </p>

                      <div className="grid grid-cols-8 gap-2">
                        {group.emojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            aria-label={`Add ${emoji}`}
                            className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-white/5 text-2xl transition hover:bg-white/15 active:scale-90"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-2 text-xs text-gray-500">
              Tap 😊 to choose emojis and add them to your story.
            </p>
          </section>

          <section>
            <label
              htmlFor="photos"
              className="mb-2 block text-sm font-bold text-white"
            >
              Photos 📸{" "}
              <span className="font-normal text-gray-500">
                (up to 3)
              </span>
            </label>

            <input
              id="photos"
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              disabled={submitting}
              className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300 file:mr-4 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-3 file:font-bold file:text-black"
            />

            {photos.length > 0 && (
              <div className="mt-4 space-y-2">
                {photos.map((photo, index) => (
                  <div
                    key={`${photo.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3"
                  >
                    <span className="truncate text-sm text-gray-300">
                      📸 {photo.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-white/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <label
              htmlFor="videos"
              className="mb-2 block text-sm font-bold text-white"
            >
              Videos 🎥{" "}
              <span className="font-normal text-gray-500">
                (up to 3)
              </span>
            </label>

            <input
              id="videos"
              type="file"
              accept="video/*"
              multiple
              onChange={handleVideoChange}
              disabled={submitting}
              className="block w-full cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300 file:mr-4 file:rounded-xl file:border-0 file:bg-yellow-400 file:px-4 file:py-3 file:font-bold file:text-black"
            />

            {videos.length > 0 && (
              <div className="mt-4 space-y-2">
                {videos.map((video, index) => (
                  <div
                    key={`${video.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/5 p-3"
                  >
                    <span className="truncate text-sm text-gray-300">
                      🎥 {video.name}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeVideo(index)}
                      className="shrink-0 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-white/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={permission}
                onChange={(e) => setPermission(e.target.checked)}
                disabled={submitting}
                className="mt-1 h-5 w-5 shrink-0 accent-yellow-400"
              />

              <span className="text-sm leading-6 text-gray-300">
                I give HnC permission to review my submission and,
                if approved, display it in the event gallery and use
                it for HnC promotional content and social media.
              </span>
            </label>
          </section>

          {errorMessage && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm leading-6 text-red-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm leading-6 text-green-300">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-yellow-400 px-6 py-4 text-base font-black text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Submitting Your Vibe..."
              : "Pitch My Vibe 🚀"}
          </button>

          <p className="text-center text-xs leading-5 text-gray-500">
            Your submission will be reviewed by HnC before it appears
            publicly.
          </p>
        </form>
      </div>
    </main>
  );
}