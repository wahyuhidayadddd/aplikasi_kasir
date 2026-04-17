import { Stack } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect } from "react";

export default function RootLayout() {
  useEffect(() => {
    async function checkUpdate() {
      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }
      } catch (e) {
        console.log("update error:", e);
      }
    }

    checkUpdate();
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}