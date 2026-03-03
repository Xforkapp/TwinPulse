"use client";

import { useState, useEffect } from "react";
import { useAppStore } from "@/store";
import type { StoreApi, UseBoundStore } from "zustand";

/**
 * A hydration-safe hook for Zustand stores with `persist` middleware.
 * Returns the default/initial value during SSR and hydration,
 * then the actual persisted value after mount.
 */
export function useHydrated() {
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        // Wait for zustand persist rehydration
        const unsub = useAppStore.persist.onFinishHydration(() => {
            setHydrated(true);
        });

        // If already rehydrated
        if (useAppStore.persist.hasHydrated()) {
            setHydrated(true);
        }

        return () => {
            unsub();
        };
    }, []);

    return hydrated;
}
