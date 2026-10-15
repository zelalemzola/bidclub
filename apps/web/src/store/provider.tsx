"use client";

import { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { createClient } from "@/lib/supabase/client";
import { api } from "./api";
import { makeStore, type AppStore } from "./index";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Drop cached profile/activity when the signed-in user changes
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        store.dispatch(api.util.resetApiState());
      }
    });
    return () => subscription.unsubscribe();
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
