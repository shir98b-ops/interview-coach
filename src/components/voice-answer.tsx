"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { inputStyles } from "@/components/ui";
import {
  appendTranscript,
  speechErrorMessage,
  speechLanguages,
  type SpeechLanguage,
} from "@/lib/voice/transcript";

/*
 * The browser's built-in speech recognition (free, no extra service). It is
 * not in TypeScript's DOM types yet, so these describe the parts we use.
 */
interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionConstructor = new () => Recognition;

function recognitionClass(): RecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Phones handle continuous listening badly: Android repeats earlier words
 * in every new result, and iPhones stop early. There we listen one phrase
 * at a time and start again after each one.
 */
function isPhone(): boolean {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

const silenceHelp =
  "עוד לא שמענו כלום. כדאי לבדוק שהמיקרופון מאושר לאתר. באייפון צריך גם להפעיל הכתבה: הגדרות, כללי, מקלדת, הפעלת הכתבה. אפשר גם להקליד.";

const noSubscription = () => () => {};

/** Support never changes on a page, and the server always says "not yet". */
function useSpeechSupport(): "unknown" | "yes" | "no" {
  return useSyncExternalStore(
    noSubscription,
    () => (recognitionClass() ? "yes" : "no"),
    () => "unknown",
  );
}

/**
 * An answer box that can be filled by speaking. The user presses the
 * microphone, talks, and the words appear in the box, where they can fix
 * them before sending. Browsers without speech recognition get the plain box.
 */
export function VoiceAnswerField({
  id,
  name,
  maxLength,
  rows,
  placeholder,
  className = "",
  language: initialLanguage,
  disabled = false,
}: {
  id: string;
  name: string;
  maxLength: number;
  rows: number;
  placeholder: string;
  className?: string;
  language: SpeechLanguage;
  disabled?: boolean;
}) {
  const support = useSpeechSupport();
  const [value, setValue] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const [error, setError] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  // True while the user wants to keep talking. Browsers end a session after
  // a pause, so we quietly start a new one until the user presses stop.
  const wanted = useRef(false);
  // Words heard but not yet confirmed. Some phones never confirm them, so
  // they are kept when a session ends instead of being lost.
  const unconfirmed = useRef("");
  // Whether anything was heard since the user pressed the microphone.
  const heard = useRef(false);
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearSilenceTimer() {
    if (silenceTimer.current) clearTimeout(silenceTimer.current);
    silenceTimer.current = null;
  }

  function stop() {
    wanted.current = false;
    clearSilenceTimer();
    recognition.current?.stop();
  }

  function start() {
    const Recognition = recognitionClass();
    if (!Recognition) return;
    setError(null);

    const r = new Recognition();
    r.lang = speechLanguages[language].code;
    r.continuous = !isPhone();
    r.interimResults = true;
    r.onresult = (event) => {
      heard.current = true;
      setError(null);
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        if (result.isFinal) {
          setValue((current) => appendTranscript(current, text, maxLength));
        } else {
          pending += text;
        }
      }
      unconfirmed.current = pending;
      setInterim(pending);
    };
    r.onerror = (event) => {
      const message = speechErrorMessage(event.error);
      if (message) {
        // Some browsers (such as in-app browsers on iPhone) never send the
        // end event after an error, so stop showing "listening" right away.
        wanted.current = false;
        clearSilenceTimer();
        setError(message);
        setInterim("");
        setListening(false);
        recognition.current = null;
        try {
          r.abort();
        } catch {
          // Already stopped.
        }
      }
    };
    r.onend = () => {
      const leftover = unconfirmed.current;
      unconfirmed.current = "";
      if (leftover) {
        setValue((current) => appendTranscript(current, leftover, maxLength));
      }
      setInterim("");
      if (wanted.current) {
        try {
          r.start();
          return;
        } catch {
          wanted.current = false;
        }
      }
      clearSilenceTimer();
      recognition.current = null;
      setListening(false);
    };

    recognition.current = r;
    wanted.current = true;
    heard.current = false;
    unconfirmed.current = "";
    try {
      r.start();
      setListening(true);
      clearSilenceTimer();
      silenceTimer.current = setTimeout(() => {
        if (!heard.current && wanted.current) setError(silenceHelp);
      }, 8000);
    } catch {
      wanted.current = false;
      recognition.current = null;
      setError(speechErrorMessage("unknown"));
    }
  }

  // Stop listening when the answer is being sent or the page changes. This
  // touches only refs, so it is safe to call from the effects below.
  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  });
  useEffect(() => {
    if (disabled) stopRef.current();
  }, [disabled]);
  useEffect(() => () => stopRef.current(), []);

  return (
    <div className="flex flex-col gap-3">
      {support === "yes" && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={listening ? stop : start}
            disabled={disabled}
            aria-pressed={listening}
            className={`inline-flex min-h-12 items-center gap-2 rounded-2xl px-5 py-2 text-lg font-extrabold transition active:translate-y-0.5 disabled:opacity-60 ${
              listening
                ? "bg-orange text-ink shadow-[0_4px_0_var(--color-orange-ink)]"
                : "text-ink ring-line hover:bg-violet-soft bg-white ring-2"
            }`}
          >
            {listening ? (
              <span className="relative flex size-3" aria-hidden>
                <span className="bg-danger absolute inline-flex size-full animate-ping rounded-full opacity-75" />
                <span className="bg-danger relative inline-flex size-3 rounded-full" />
              </span>
            ) : (
              <MicIcon />
            )}
            {listening ? "מקשיב... ללחוץ לעצירה" : "לענות בדיבור"}
          </button>
          {!listening && (
            <div
              role="group"
              aria-label="שפת הדיבור"
              className="flex gap-1 text-sm"
            >
              {(Object.keys(speechLanguages) as SpeechLanguage[]).map(
                (code) => (
                  <button
                    key={code}
                    type="button"
                    lang={code}
                    onClick={() => setLanguage(code)}
                    aria-pressed={language === code}
                    className={`rounded-full px-3 py-1 font-medium ${
                      language === code
                        ? "bg-violet-soft text-violet"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {speechLanguages[code].label}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      )}
      <textarea
        dir="auto"
        id={id}
        name={name}
        required
        rows={rows}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={`${inputStyles} ${className}`}
      />
      {listening && (
        <p dir="auto" aria-live="polite" className="text-muted min-h-6">
          {interim || "אפשר להתחיל לדבר. הטקסט יופיע בתיבה."}
        </p>
      )}
      {error && (
        <p role="alert" className="text-danger font-medium">
          {error}
        </p>
      )}
      {support === "yes" && !listening && !error && (
        <p className="text-muted text-sm">
          אפשר לדבר, להקליד, או גם וגם. כדאי לעבור על הטקסט ולתקן לפני השליחה.
        </p>
      )}
      {support === "no" && (
        <p className="text-muted text-sm">
          הדפדפן הזה לא תומך בתשובה בדיבור, אז אפשר להקליד. כדי לדבר, כדאי לפתוח
          את האתר בכרום או בספארי, ולא מתוך אפליקציה כמו וואטסאפ.
        </p>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
