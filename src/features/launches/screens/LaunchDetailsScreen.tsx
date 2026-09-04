import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import type { Launch } from "../../../api/schemas";
import { getCachedLaunch } from "../../../database/launches.repository";
import type { RootStackParamList } from "../../../navigation/RootNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "LaunchDetails">;

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
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function LaunchDetailsScreen({ route }: Props) {
  const launchId = route.params?.launchId;

  const [launch, setLaunch] = useState<Launch | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadLaunch(): Promise<void> {
      if (!launchId) {
        setIsLoading(false);
        return;
      }

      try {
        const cachedLaunch = await getCachedLaunch(launchId);

        if (mounted) {
          setLaunch(cachedLaunch);
        }
      } catch (error) {
        console.error("Failed to load launch:", error);

        if (mounted) {
          setLaunch(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLaunch();

    return () => {
      mounted = false;
    };
  }, [launchId]);

  if (!launchId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Launch not found</Text>

        <Text style={styles.errorText}>No launch ID was provided.</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>Loading launch details...</Text>
      </View>
    );
  }

  if (!launch) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Launch not found</Text>

        <Text style={styles.errorText}>
          This launch is not available in the local database.
        </Text>
      </View>
    );
  }

  const status = getStatus(launch);

  const webcastUrl = launch.links.webcast;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{launch.name}</Text>

      <View
        style={[
          styles.statusBadge,
          status.type === "success" && styles.successBadge,
          status.type === "failure" && styles.failureBadge,
          status.type === "upcoming" && styles.upcomingBadge,
        ]}
      >
        <Text style={styles.statusText}>{status.label}</Text>
      </View>

      <Text style={styles.date}>{formatDate(launch.date_utc)}</Text>

      {launch.details && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission Details</Text>

          <Text style={styles.details}>{launch.details}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mission Information</Text>

        <InfoRow
          label="Flight Number"
          value={launch.flight_number?.toString() ?? "—"}
        />

        <InfoRow label="Rocket" value={launch.rocket} />

        <InfoRow label="Launchpad" value={launch.launchpad ?? "Unknown"} />
      </View>

      {launch.cores.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Information</Text>

          {launch.cores.map((core, index) => (
            <View key={`${launch.id}-core-${index}`} style={styles.coreCard}>
              <Text style={styles.coreTitle}>Core {index + 1}</Text>

              <InfoRow label="Flight" value={core.flight?.toString() ?? "—"} />

              <InfoRow
                label="Reused"
                value={
                  core.reused === null ? "Unknown" : core.reused ? "Yes" : "No"
                }
              />

              <InfoRow
                label="Landing Attempt"
                value={core.landing_attempt ? "Yes" : "No"}
              />

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

              <InfoRow
                label="Landing Type"
                value={core.landing_type ?? "Unknown"}
              />

              <InfoRow label="Landpad" value={core.landpad ?? "Unknown"} />
            </View>
          ))}
        </View>
      )}

      {webcastUrl && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Watch launch webcast"
          style={({ pressed }) => [
            styles.webcastButton,
            pressed && styles.pressed,
          ]}
          onPress={() => {
            void Linking.openURL(webcastUrl);
          }}
        >
          <Text style={styles.webcastText}>Watch Webcast</Text>
        </Pressable>
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
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fafc",
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#111827",
  },

  date: {
    marginTop: 10,
    fontSize: 14,
    color: "#6b7280",
  },

  statusBadge: {
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
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

  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
  },

  section: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  sectionTitle: {
    marginBottom: 12,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  details: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },

  infoLabel: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
  },

  infoValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },

  coreCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },

  coreTitle: {
    marginBottom: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
  },

  webcastButton: {
    marginTop: 24,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#111827",
  },

  webcastText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },

  pressed: {
    opacity: 0.7,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: "center",
    color: "#6b7280",
  },
});
