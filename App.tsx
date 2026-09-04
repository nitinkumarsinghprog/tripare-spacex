import { QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";

import { queryClient } from "./src/services/query-client";
import { useAppInitialization } from "./src/hooks/useAppInitialization";
import { useAppStore } from "./src/store/app.store";

function AppContent() {
  useAppInitialization();

  const isSyncing = useAppStore((state) => state.isSyncing);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tripare</Text>

      <Text style={styles.subtitle}>SpaceX Mission Control</Text>

      <Text style={styles.status}>
        {isSyncing ? "Synchronizing SpaceX launches..." : "Ready"}
      </Text>

      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 18,
  },

  status: {
    marginTop: 24,
    fontSize: 14,
  },
});
