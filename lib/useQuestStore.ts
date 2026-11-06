"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { Data, emptyRoadmap, isQuestData } from "./quest";

type Cache = { data: Data; revision: number | null; baseline: string };
const cacheKey = (id: string | undefined) => `quest-v2-${id || "guest"}`;
const normalize = (data: Data): Data => ({
  ...data,
  activity: data.activity || [],
  roadmap: data.roadmap || emptyRoadmap(),
});
export function useQuestStore(initial: Data) {
  const [data, setData] = useState<Data>(initial);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);
  const [status, setStatus] = useState("Loading your workspace…");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [retry, setRetry] = useState(0);
  const [tick, setTick] = useState(0);
  const revision = useRef<number | null>(null);
  const baseline = useRef("");
  const liveData = useRef(data);
  const generation = useRef(0);
  const writing = useRef(false);
  liveData.current = data;
  const uid = user?.id;

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user || null);
        setAuthReady(true);
      }
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (active) {
        if (error) setError(error.message);
        setUser(data.session?.user || null);
        setAuthReady(true);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!authReady) return;
    const current = ++generation.current;
    setReady(false);
    setCloudReady(false);
    setConflict(false);
    setError("");
    revision.current = null;
    baseline.current = "";
    let cached: Cache | undefined;
    try {
      const saved = localStorage.getItem(cacheKey(uid));
      const legacy =
        !uid && !saved ? localStorage.getItem("rakib-quest-v1") : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!isQuestData(parsed.data)) throw Error("Invalid local draft");
        cached = { ...parsed, data: normalize(parsed.data) };
        // Schema defaults must not turn an old, already-saved record into a dirty draft.
        if (cached!.baseline) {
          const previous = JSON.parse(cached!.baseline);
          if (isQuestData(previous))
            cached!.baseline = JSON.stringify(normalize(previous));
        }
      } else if (legacy) {
        const parsed = JSON.parse(legacy);
        if (isQuestData(parsed))
          cached = { data: normalize(parsed), revision: null, baseline: "" };
      }
    } catch {
      setError("The local draft could not be read. Keep your exported backup.");
    }
    const local = cached?.data || initial;
    revision.current = cached?.revision ?? null;
    baseline.current = cached?.baseline || "";
    setData(local);
    liveData.current = local;
    if (!uid || !supabase) {
      setStatus("Saved on this device");
      setReady(true);
      return;
    }
    setStatus("Connecting to Supabase…");
    const client = supabase;
    void (async () => {
      try {
        const { data: row, error } = await client
          .from("quest_state")
          .select("payload, revision")
          .eq("user_id", uid)
          .maybeSingle();
        if (current !== generation.current) return;
        if (error) throw error;
        const dirty =
          !!cached && JSON.stringify(cached.data) !== cached.baseline;
        if (row) {
          if (!isQuestData(row.payload))
            throw Error(
              "The cloud record has an unsupported format. Export your local backup before recovery.",
            );
          if (dirty && cached!.revision !== row.revision) {
            setConflict(true);
            setStatus("Changes need review");
            setError(
              "A newer cloud version exists. Your local draft is safe. Export it before loading the cloud version.",
            );
          } else if (dirty) {
            revision.current = row.revision;
            setStatus("Changes need synchronization");
          } else {
            const cloud = normalize(row.payload);
            revision.current = row.revision;
            baseline.current = JSON.stringify(cloud);
            liveData.current = cloud;
            setData(cloud);
            setStatus("Saved to Supabase");
          }
        } else if (cached?.revision != null) {
          setConflict(true);
          setStatus("Changes need review");
          setError(
            "The previous cloud record is missing. Export your local draft before continuing.",
          );
        } else {
          revision.current = null;
          baseline.current = "";
          setStatus("Changes need synchronization");
        }
        setCloudReady(true);
      } catch (cause) {
        if (current !== generation.current) return;
        setStatus(
          navigator.onLine
            ? "Cloud unavailable · local draft"
            : "Offline · local draft",
        );
        setError(
          cause instanceof Error
            ? cause.message
            : (cause as { message?: string })?.message ||
                "Cannot connect to Supabase. Check your project and run the SQL migration.",
        );
      } finally {
        if (current === generation.current) setReady(true);
      }
    })();
    return () => {
      generation.current++;
    };
    // Reloads deliberately preserve the latest device draft and fetch the cloud revision again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, uid, retry]);

  const persist = useCallback(
    (value: Data) => {
      try {
        localStorage.setItem(
          cacheKey(uid),
          JSON.stringify({
            data: value,
            revision: revision.current,
            baseline: baseline.current,
          }),
        );
        return true;
      } catch {
        setError(
          "Browser storage is full or unavailable. Export a backup before closing this tab.",
        );
        return false;
      }
    },
    [uid],
  );

  useEffect(() => {
    if (!ready) return;
    const localSaved = persist(data);
    if (!uid) {
      setStatus(localSaved ? "Saved on this device" : "Local save failed");
      return;
    }
    if (!supabase || !cloudReady || conflict) return;
    const snapshot = JSON.stringify(data);
    if (snapshot === baseline.current) return;
    if (!navigator.onLine) {
      setStatus("Offline · local draft");
      return;
    }
    setStatus("Saving to Supabase…");
    const current = generation.current;
    const client = supabase;
    const timer = setTimeout(() => {
      if (writing.current) return;
      writing.current = true;
      void (async () => {
        try {
          const version = revision.current;
          const result =
            version === null
              ? await client
                  .from("quest_state")
                  .insert({ user_id: uid, payload: data, revision: 1 })
                  .select("revision")
                  .single()
              : await client
                  .from("quest_state")
                  .update({ payload: data, revision: version + 1 })
                  .eq("user_id", uid)
                  .eq("revision", version)
                  .select("revision")
                  .maybeSingle();
          if (current !== generation.current) return;
          if (result.error) {
            if (result.error.code === "23505") {
              setConflict(true);
              setStatus("Changes need review");
              throw Error(
                "Another tab or device created a cloud record. Export this draft, then load the cloud version.",
              );
            }
            throw result.error;
          }
          if (!result.data) {
            setConflict(true);
            setStatus("Changes need review");
            throw Error(
              "Another tab or device updated your data. Export this draft, then load the cloud version.",
            );
          }
          revision.current = result.data.revision;
          baseline.current = snapshot;
          persist(liveData.current);
          setError("");
          setStatus(
            JSON.stringify(liveData.current) === snapshot
              ? "Saved to Supabase"
              : "Saving to Supabase…",
          );
          setTick((n) => n + 1);
        } catch (cause) {
          if (current !== generation.current) return;
          setError(
            cause instanceof Error
              ? cause.message
              : (cause as { message?: string })?.message ||
                  "Cloud save failed. Your local draft is preserved. Retry when ready.",
          );
          setStatus("Unsynced local draft");
          setCloudReady(false);
        } finally {
          writing.current = false;
          if (current !== generation.current) setTick((n) => n + 1);
        }
      })();
    }, 800);
    return () => clearTimeout(timer);
  }, [data, ready, uid, cloudReady, conflict, persist, tick]);

  useEffect(() => {
    const online = () => setRetry((n) => n + 1);
    const offline = () => {
      if (uid) setStatus("Offline · local draft");
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (uid && JSON.stringify(liveData.current) !== baseline.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("online", online);
    window.addEventListener("offline", offline);
    window.addEventListener("beforeunload", unload);
    return () => {
      window.removeEventListener("online", online);
      window.removeEventListener("offline", offline);
      window.removeEventListener("beforeunload", unload);
    };
  }, [uid]);
  const reloadCloud = () => {
    if (!uid) return;
    localStorage.removeItem(cacheKey(uid));
    setRetry((n) => n + 1);
  };
  return {
    data,
    setData,
    ready,
    user,
    status,
    error,
    conflict,
    retrySync: () => setRetry((n) => n + 1),
    reloadCloud,
  };
}
