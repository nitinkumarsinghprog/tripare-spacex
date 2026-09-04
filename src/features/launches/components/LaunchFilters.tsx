import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  useFilterStore,
  type LaunchStatus,
  type SortOption,
} from "../../../store/filter.store";

interface LaunchFiltersProps {
  rocketIds: string[];
  launchpadIds: string[];
}

const STATUS_OPTIONS: {
  label: string;
  value: LaunchStatus;
}[] = [
  { label: "Upcoming", value: "upcoming" },
  { label: "Success", value: "success" },
  { label: "Failure", value: "failure" },
];

const DATE_OPTIONS = [
  { label: "30 Days", value: "30d" as const },
  { label: "1 Year", value: "1y" as const },
  { label: "All Time", value: "all" as const },
];

const SORT_OPTIONS: {
  label: string;
  value: SortOption;
}[] = [
  { label: "Newest", value: "date-newest" },
  { label: "Oldest", value: "date-oldest" },
  { label: "Name A-Z", value: "name-asc" },
  { label: "Name Z-A", value: "name-desc" },
];

function shortId(id: string): string {
  if (id.length <= 14) {
    return id;
  }

  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

export function LaunchFilters({ rocketIds, launchpadIds }: LaunchFiltersProps) {
  const [expanded, setExpanded] = useState(false);

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

  const hasActiveFilters =
    statuses.length > 0 ||
    selectedRocketIds.length > 0 ||
    selectedLaunchpadIds.length > 0 ||
    datePreset !== "all" ||
    sort !== "date-newest";

  return (
    <View style={styles.container}>
      {/* COLLAPSIBLE HEADER */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse filters" : "Expand filters"}
        onPress={() => setExpanded((value) => !value)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Filters & Sort</Text>

          {hasActiveFilters && <View style={styles.activeDot} />}
        </View>

        <Text style={styles.arrow}>{expanded ? "▲" : "▼"}</Text>
      </Pressable>

      {/* FILTER CONTENT */}
      {expanded && (
        <View style={styles.content}>
          {hasActiveFilters && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Reset filters"
              onPress={reset}
              style={({ pressed }) => [
                styles.resetButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.resetText}>Reset all</Text>
            </Pressable>
          )}

          {/* STATUS */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Status</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalContent}
            >
              {STATUS_OPTIONS.map((option) => {
                const selected = statuses.includes(option.value);

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => toggleStatus(option.value)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.selectedChip,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.selectedChipText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* DATE */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Date</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalContent}
            >
              {DATE_OPTIONS.map((option) => {
                const selected = datePreset === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setDatePreset(option.value)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.selectedChip,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.selectedChipText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ROCKET */}
          {rocketIds.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rocket</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalContent}
              >
                {rocketIds.map((id) => {
                  const selected = selectedRocketIds.includes(id);

                  return (
                    <Pressable
                      key={id}
                      onPress={() => toggleRocket(id)}
                      style={({ pressed }) => [
                        styles.chip,
                        selected && styles.selectedChip,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.chipText,
                          selected && styles.selectedChipText,
                        ]}
                      >
                        {shortId(id)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* LAUNCHPAD */}
          {launchpadIds.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Launchpad</Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalContent}
              >
                {launchpadIds.map((id) => {
                  const selected = selectedLaunchpadIds.includes(id);

                  return (
                    <Pressable
                      key={id}
                      onPress={() => toggleLaunchpad(id)}
                      style={({ pressed }) => [
                        styles.chip,
                        selected && styles.selectedChip,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.chipText,
                          selected && styles.selectedChipText,
                        ]}
                      >
                        {shortId(id)}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* SORT */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalContent}
            >
              {SORT_OPTIONS.map((option) => {
                const selected = sort === option.value;

                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setSort(option.value)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.selectedChip,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.selectedChipText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },

  header: {
    minHeight: 54,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  activeDot: {
    width: 8,
    height: 8,
    marginLeft: 8,
    borderRadius: 4,
    backgroundColor: "#111827",
  },

  arrow: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b7280",
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },

  resetButton: {
    alignSelf: "flex-end",
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },

  resetText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },

  section: {
    marginTop: 14,
  },

  sectionTitle: {
    marginBottom: 7,
    fontSize: 11,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  horizontalContent: {
    gap: 8,
  },

  chip: {
    minHeight: 38,
    paddingHorizontal: 14,
    justifyContent: "center",
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
    maxWidth: 150,
    fontSize: 13,
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
