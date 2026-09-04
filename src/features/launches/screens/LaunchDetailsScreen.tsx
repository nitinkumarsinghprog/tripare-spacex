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
import type { RootStackParamList } from "../../../navigation/RootNavigator";
import { getCachedLaunch } from "../../../database/launches.repository";

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
    dateStyle: "full",
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
      } catch (error) {
        console.error("Failed to load launch details:", error);

        if (mounted) {
          setLaunch(null);
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
          This launch is not available in the local cache.
        </Text>
      </View>
    );
  }

  const status = getStatus(launch);

  const webcastUrl = launch.links.webcast;
  const articleUrl = launch.links.article;
  const wikipediaUrl = launch.links.wikipedia;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{launch.name}</Text>

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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Launch Information</Text>

        <InfoRow label="Date" value={formatDate(launch.date_utc)} />

        <InfoRow
          label="Flight Number"
          value={String(launch.flight_number ?? "—")}
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

      {launch.cores.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Core Information</Text>

          {launch.cores.map((core, index) => (
            <View key={`${launch.id}-core-${index}`} style={styles.coreCard}>
              <Text style={styles.coreTitle}>Core {index + 1}</Text>

              <InfoRow label="Flight" value={String(core.flight ?? "—")} />

              <InfoRow label="Reused" value={core.reused ? "Yes" : "No"} />

              <InfoRow
                label="Landing Attempt"
                value={core.landing_attempt ? "Yes" : "No"}
              />

              <InfoRow
                label="Landing Success"
                value={
                  core.landing_success === null ||
                  core.landing_success === undefined
                    ? "Unknown"
                    : core.landing_success
                      ? "Yes"
                      : "No"
                }
              />
            </View>
          ))}
        </View>
      )}

      {(webcastUrl || articleUrl || wikipediaUrl) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Links</Text>

          {webcastUrl && <LinkButton label="Watch Webcast" url={webcastUrl} />}

          {articleUrl && <LinkButton label="Read Article" url={articleUrl} />}

          {wikipediaUrl && <LinkButton label="Wikipedia" url={wikipediaUrl} />}
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>

      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function LinkButton({ label, url }: { label: string; url: string }) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={() => {
        void Linking.openURL(url);
      }}
      style={({ pressed }) => [styles.linkButton, pressed && styles.pressed]}
    >
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
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

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
    color: "#111827",
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 12,
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
    marginBottom: 14,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 8,
  },

  label: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
  },

  value: {
    flex: 2,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "right",
  },

  details: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4b5563",
  },

  coreCard: {
    marginTop: 8,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f9fafb",
  },

  coreTitle: {
    marginBottom: 4,
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

  linkButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
  },

  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
  },

  pressed: {
    opacity: 0.7,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});
