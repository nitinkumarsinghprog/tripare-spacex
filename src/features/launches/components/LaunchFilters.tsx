import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  useFilterStore,
  type DatePreset,
  type LaunchStatus,
  type SortOption,
} from "../../../store/filter.store";

interface LaunchFiltersProps {
  rocketIds: string[];
  launchpadIds: string[];
}

const STATUS_OPTIONS: {
  value: LaunchStatus;
  label: string;
}[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "success", label: "Success" },
  { value: "failure", label: "Failure" },
];

const DATE_OPTIONS: {
  value: DatePreset;
  label: string;
}[] = [
  { value: "30d", label: "30 Days" },
  { value: "1y", label: "1 Year" },
  { value: "all", label: "All Time" },
];

const SORT_OPTIONS: {
  value: SortOption;
  label: string;
}[] = [
  { value: "date-newest", label: "Newest" },
  { value: "date-oldest", label: "Oldest" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
];

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selectedChip,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.selectedChipText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function LaunchFilters({ rocketIds, launchpadIds }: LaunchFiltersProps) {
  const datePreset = useFilterStore((state) => state.datePreset);
  const statuses = useFilterStore((state) => state.statuses);
  const selectedRocketIds = useFilterStore((state) => state.rocketIds);
  const selectedLaunchpadIds = useFilterStore((state) => state.launchpadIds);
  const sort = useFilterStore((state) => state.sort);

  const setDatePreset = useFilterStore((state) => state.setDatePreset);
  const toggleStatus = useFilterStore((state) => state.toggleStatus);
  const toggleRocket = useFilterStore((state) => state.toggleRocket);
  const toggleLaunchpad = useFilterStore((state) => state.toggleLaunchpad);
  const setSort = useFilterStore((state) => state.setSort);
  const reset = useFilterStore((state) => state.reset);

  const hasFilters =
    datePreset !== "all" ||
    statuses.length > 0 ||
    selectedRocketIds.length > 0 ||
    selectedLaunchpadIds.length > 0 ||
    sort !== "date-newest";

  return (
    <View style={styles.container}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterTitle}>Filters & Sort</Text>

        {hasFilters && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reset all filters"
            onPress={reset}
          >
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        )}
      </View>

      <Text style={styles.sectionTitle}>Status</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {STATUS_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={statuses.includes(option.value)}
            onPress={() => toggleStatus(option.value)}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Date</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {DATE_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={datePreset === option.value}
            onPress={() => setDatePreset(option.value)}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Rocket</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {rocketIds.map((rocketId) => (
          <FilterChip
            key={rocketId}
            label={rocketId}
            selected={selectedRocketIds.includes(rocketId)}
            onPress={() => toggleRocket(rocketId)}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Launchpad</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {launchpadIds.map((launchpadId) => (
          <FilterChip
            key={launchpadId}
            label={launchpadId}
            selected={selectedLaunchpadIds.includes(launchpadId)}
            onPress={() => toggleLaunchpad(launchpadId)}
          />
        ))}
      </ScrollView>

      <Text style={styles.sectionTitle}>Sort</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {SORT_OPTIONS.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            selected={sort === option.value}
            onPress={() => setSort(option.value)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 8,
  },

  filterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  filterTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },

  resetText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#2563eb",
  },

  sectionTitle: {
    marginTop: 10,
    marginBottom: 6,
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
  },

  chips: {
    paddingHorizontal: 16,
    gap: 8,
  },

  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
  },

  selectedChip: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },

  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },

  selectedChipText: {
    color: "#ffffff",
  },

  pressed: {
    opacity: 0.7,
  },
});
