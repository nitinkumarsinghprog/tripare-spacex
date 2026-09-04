import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Launch } from "../../../api/schemas";

interface LaunchCardProps {
  launch: Launch;
  onPress: (launch: Launch) => void;
}

function getStatus(launch: Launch): {
  label: string;
  type: "success" | "failure" | "upcoming";
} {
  if (launch.upcoming) {
    return {
      label: "Upcoming",
      type: "upcoming",
    };
  }

  if (launch.success === true) {
    return {
      label: "Success",
      type: "success",
    };
  }

  return {
    label: "Failure",
    type: "failure",
  };
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function LaunchCard({ launch, onPress }: LaunchCardProps) {
  const status = getStatus(launch);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${launch.name}`}
      onPress={() => onPress(launch)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text numberOfLines={2} style={styles.title}>
            {launch.name}
          </Text>

          <Text style={styles.date}>{formatDate(launch.date_utc)}</Text>
        </View>

        <View
          style={[
            styles.badge,
            status.type === "success" && styles.successBadge,
            status.type === "failure" && styles.failureBadge,
            status.type === "upcoming" && styles.upcomingBadge,
          ]}
        >
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.metadata}>
        <View>
          <Text style={styles.label}>Flight</Text>
          <Text style={styles.value}>{launch.flight_number ?? "—"}</Text>
        </View>

        <View>
          <Text style={styles.label}>Rocket</Text>
          <Text style={styles.value}>{launch.rocket}</Text>
        </View>

        <View>
          <Text style={styles.label}>Launchpad</Text>
          <Text numberOfLines={1} style={styles.value}>
            {launch.launchpad ?? "Unknown"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  pressed: {
    opacity: 0.7,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },

  titleContainer: {
    flex: 1,
    marginRight: 12,
  },

  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  date: {
    marginTop: 5,
    fontSize: 13,
    color: "#6b7280",
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
  },

  successBadge: {
    backgroundColor: "#dcfce7",
  },

  failureBadge: {
    backgroundColor: "#fee2e2",
  },

  upcomingBadge: {
    backgroundColor: "#dbeafe",
  },

  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  divider: {
    height: 1,
    marginVertical: 14,
    backgroundColor: "#f3f4f6",
  },

  metadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  label: {
    fontSize: 11,
    color: "#9ca3af",
    textTransform: "uppercase",
  },

  value: {
    marginTop: 3,
    maxWidth: 100,
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
});
