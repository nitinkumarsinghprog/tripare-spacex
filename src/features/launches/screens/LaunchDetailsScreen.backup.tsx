import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { RootStackParamList } from "../../../navigation/RootNavigator";
import { getCachedLaunch } from "../../../database/launches.repository";
import type { Launch } from "../../../api/schemas";
import { useEffect, useState } from "react";

type Props = NativeStackScreenProps<RootStackParamList, "LaunchDetails">;

function getStatus(launch: Launch): {
  label: string;
  style: "success" | "failure" | "upcoming";
} {
  if (launch.upcoming) {
    return {
      label: "Upcoming",
      style: "upcoming",
    };
  }

  if (launch.success === true) {
    return {
      label: "Success",
      style: "success",
    };
  }

  return {
    label: "Failure",
    style: "failure",
  };
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

export function LaunchDetailsScreen({ route }: Props) {
  const { launchId } = route.params;

  const [launch, setLaunch] = useState<Launch | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadLaunch(): Promise<void> {
      try {
        const cachedLaunch = await getCachedLaunch(launchId);

        if (mounted) {
          setLaunch(cachedLaunch);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadLaunch();

    return () => {
      mounted = false;
    };
  }, [launchId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading launch...</Text>
      </View>
    );
  }

  if (!launch) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Launch not found</Text>

        <Text style={styles.errorText}>
          This launch is not available in the local cache.
        </Text>
      </View>
    );
  }

  const status = getStatus(launch);

  const webcastUrl = launch.links.webcast;
  const articleUrl = launch.links.article;
  const wikipediaUrl = launch.links.wikipedia;

  const core = launch.cores?.[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.title}>{launch.name}</Text>

        <View
          style={[
            styles.badge,
            status.style === "success" && styles.successBadge,
            status.style === "failure" && styles.failureBadge,
            status.style === "upcoming" && styles.upcomingBadge,
          ]}
        >
          <Text style={styles.badgeText}>{status.label}</Text>
        </View>

        <Text style={styles.date}>{formatDate(launch.date_utc)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mission Information</Text>

        <InfoRow
          label="Flight Number"
          value={
            launch.flight_number !== null ? String(launch.flight_number) : "—"
          }
        />

        <InfoRow label="Rocket" value={launch.rocket} />

        <InfoRow label="Launchpad" value={launch.launchpad ?? "Unknown"} />
      </View>

      {launch.details && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission Details</Text>

          <Text style={styles.details}>{launch.details}</Text>
        </View>
      )}

      {core && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Information</Text>

          <InfoRow
            label="Core Flight"
            value={core.flight !== null ? String(core.flight) : "—"}
          />

          <InfoRow label="Reused" value={core.reused ? "Yes" : "No"} />

          <InfoRow
            label="Landing Attempt"
            value={core.landing_attempt ? "Yes" : "No"}
          />

          {core.landing_attempt && (
            <InfoRow
              label="Landing Success"
              value={
                core.landing_success === null
                  ? "Unknown"
                  : core.landing_success
                    ? "Yes"
                    : "No"
              }
            />
          )}

          {core.landing_type && (
            <InfoRow label="Landing Type" value={core.landing_type} />
          )}

          {core.landpad && <InfoRow label="Landing Pad" value={core.landpad} />}
        </View>
      )}

      {(webcastUrl || articleUrl || wikipediaUrl) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>

          {webcastUrl && (
            <ActionButton
              label="Watch Webcast"
              onPress={() => {
                void Linking.openURL(webcastUrl);
              }}
            />
          )}

          {articleUrl && (
            <ActionButton
              label="Read Article"
              onPress={() => {
                void Linking.openURL(articleUrl);
              }}
            />
          )}

          {wikipediaUrl && (
            <ActionButton
              label="Open Wikipedia"
              onPress={() => {
                void Linking.openURL(wikipediaUrl);
              }}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>

      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

interface ActionButtonProps {
  label: string;
  onPress: () => void;
}

function ActionButton({ label, onPress }: ActionButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.actionPressed,
      ]}
    >
      <Text style={styles.actionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },

  loadingText: {
    fontSize: 15,
    color: "#6b7280",
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
  },

  hero: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  title: {
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "800",
    color: "#111827",
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    fontWeight: "700",
    color: "#111827",
  },

  date: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  section: {
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  sectionTitle: {
    marginBottom: 14,
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },

  infoRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
  },

  value: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  details: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
  },

  actionButton: {
    marginTop: 8,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#111827",
  },

  actionPressed: {
    opacity: 0.7,
  },

  actionText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
