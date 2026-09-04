import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

import { queryClient } from "./src/services/query-client";
import { useAppInitialization } from "./src/hooks/useAppInitialization";
import { LaunchListScreen } from "./src/features/launches/screens/LaunchListScreen";

function AppContent() {
  useAppInitialization();

  return (
    <>
      <LaunchListScreen />
      <StatusBar style="dark" />
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
