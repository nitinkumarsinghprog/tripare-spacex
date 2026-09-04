import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { Launch } from "../../../api/schemas";
import { useLaunches } from "../hooks";
import { LaunchCard } from "../components/LaunchCard";
import { LaunchFilters } from "../components/LaunchFilters";
import { useFilterStore } from "../../../store/filter.store";
import { useAppStore } from "../../../store/app.store";
import { filterAndSortLaunches } from "../utils/launch-filters";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../../navigation/RootNavigator";

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
  const syncError = useAppStore((state) => state.syncError);

  const launches = data?.launches ?? [];

  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const availableRocketIds = Array.from(
    new Set(launches.map((launch) => launch.rocket)),
  );

  const availableLaunchpadIds = Array.from(
    new Set(
      launches
        .map((launch) => launch.launchpad)
        .filter((id): id is string => id !== null),
    ),
  );

  const filteredLaunches = filterAndSortLaunches(launches, {
    search: debouncedSearch,
    datePreset,
    statuses,
    rocketIds,
    launchpadIds,
    sort,
  });

  function handleLaunchPress(launch: Launch): void {
    navigation.navigate("LaunchDetails", {
      launchId: launch.id,
    });
  }

  function handleBookmarksPress(): void {
    navigation.navigate("Bookmarks");
  }

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Offline — showing cached data</Text>
        </View>
      )}
      {syncError && !isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Sync failed — showing cached data</Text>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerText}>
            <Text style={styles.title}>SpaceX Launches</Text>

            <Text style={styles.count}>
              {filteredLaunches.length} of {launches.length} launches
            </Text>
          </View>

          <TouchableOpacity
            style={styles.bookmarksButton}
            onPress={handleBookmarksPress}
            accessibilityRole="button"
            accessibilityLabel="Open bookmarks"
            activeOpacity={0.7}
          >
            <Text style={styles.bookmarksIcon}>🔖</Text>
            <Text style={styles.bookmarksText}>Bookmarks</Text>
          </TouchableOpacity>
        </View>
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

      <LaunchFilters
        rocketIds={availableRocketIds}
        launchpadIds={availableLaunchpadIds}
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

  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerText: {
    flex: 1,
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

  bookmarksButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    marginLeft: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  bookmarksIcon: {
    fontSize: 18,
    marginRight: 6,
  },

  bookmarksText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
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
