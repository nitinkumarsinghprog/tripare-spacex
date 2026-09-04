import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import type { Launch } from "../../../api/schemas";
import { useLaunches } from "../hooks";
import { LaunchCard } from "../components/LaunchCard";
import { useFilterStore } from "../../../store/filter.store";
import { useAppStore } from "../../../store/app.store";
import { filterAndSortLaunches } from "../utils/launch-filters";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";

export function LaunchListScreen() {
  const { data, isFetching, refetch } = useLaunches();

  const search = useFilterStore((state) => state.search);
  const setSearch = useFilterStore((state) => state.setSearch);

  const debouncedSearch = useDebouncedValue(search, 300);

  const datePreset = useFilterStore((state) => state.datePreset);
  const statuses = useFilterStore((state) => state.statuses);
  const rocketIds = useFilterStore((state) => state.rocketIds);
  const launchpadIds = useFilterStore((state) => state.launchpadIds);
  const sort = useFilterStore((state) => state.sort);

  const isOffline = useAppStore((state) => state.isOffline);
  const lastSyncedAt = useAppStore((state) => state.lastSyncedAt);

  const launches = data?.launches ?? [];

  const filteredLaunches = filterAndSortLaunches(launches, {
    search: debouncedSearch,
    datePreset,
    statuses,
    rocketIds,
    launchpadIds,
    sort,
  });

  function handleLaunchPress(launch: Launch): void {
    console.info("Launch selected:", launch.id);
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline — showing cached data</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>SpaceX Launches</Text>

        <Text style={styles.count}>{filteredLaunches.length} launches</Text>
      </View>

      <TextInput
        accessibilityLabel="Search launches"
        accessibilityHint="Search SpaceX missions by name"
        placeholder="Search missions..."
        placeholderTextColor="#9ca3af"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
      />

      {lastSyncedAt && (
        <Text style={styles.syncText}>
          Last synced: {new Date(lastSyncedAt).toLocaleString()}
        </Text>
      )}

      <FlatList
        data={filteredLaunches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LaunchCard launch={item} onPress={handleLaunchPress} />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => {
              void refetch();
            }}
          />
        }
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No launches found</Text>

            <Text style={styles.emptyText}>
              Try changing your search or filters.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  offlineBanner: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fef3c7",
  },

  offlineText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400e",
    textAlign: "center",
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },

  count: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },

  searchInput: {
    height: 48,
    marginHorizontal: 16,
    marginBottom: 4,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    fontSize: 15,
    color: "#111827",
  },

  syncText: {
    marginHorizontal: 16,
    marginVertical: 8,
    fontSize: 12,
    color: "#6b7280",
  },

  listContent: {
    paddingTop: 4,
    paddingBottom: 24,
  },

  empty: {
    alignItems: "center",
    padding: 40,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#374151",
  },

  emptyText: {
    marginTop: 6,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
