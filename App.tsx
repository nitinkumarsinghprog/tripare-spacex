import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

import { queryClient } from "./src/services/query-client";
import { useAppInitialization } from "./src/hooks/useAppInitialization";
import { RootNavigator } from "./src/navigation/RootNavigator";

function AppContent() {
  useAppInitialization();

  return (
    <>
      <RootNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
