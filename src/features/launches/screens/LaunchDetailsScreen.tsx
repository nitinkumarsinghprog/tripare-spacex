import React, { useEffect, useState } from "react";
import {
  Image,
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
import { useLaunchpad } from "../hooks";

type Props = NativeStackScreenProps<RootStackParamList, "LaunchDetails">;

type DetailsTab = "overview" | "launchpad" | "media";

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

  if (launch.success === false) {
    return {
      label: "Failed",
      style: "failure",
    };
  }

  return {
    label: "Unknown",
    style: "upcoming",
  };
}

export function LaunchDetailsScreen({ route }: Props) {
  const { launchId } = route.params;

  const [launch, setLaunch] = useState<Launch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DetailsTab>("overview");

  useEffect(() => {
    let mounted = true;

    async function loadLaunch() {
      try {
        setIsLoading(true);

        const cachedLaunch = await getCachedLaunch(launchId);

        if (mounted) {
          setLaunch(cachedLaunch);
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

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading launch...</Text>
      </View>
    );
  }

  if (!launch) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Launch unavailable</Text>

        <Text style={styles.errorText}>
          Launch information could not be loaded.
        </Text>
      </View>
    );
  }

  const status = getStatus(launch);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        <TabButton
          label="Overview"
          active={activeTab === "overview"}
          onPress={() => setActiveTab("overview")}
        />

        <TabButton
          label="Launchpad"
          active={activeTab === "launchpad"}
          onPress={() => setActiveTab("launchpad")}
        />

        <TabButton
          label="Media"
          active={activeTab === "media"}
          onPress={() => setActiveTab("media")}
        />
      </ScrollView>

      {activeTab === "overview" && (
        <OverviewTab launch={launch} status={status} />
      )}

      {activeTab === "launchpad" && (
        <LaunchpadTab launchpadId={launch.launchpad} />
      )}

      {activeTab === "media" && <MediaTab launch={launch} />}
    </View>
  );
}

function OverviewTab({
  launch,
  status,
}: {
  launch: Launch;
  status: ReturnType<typeof getStatus>;
}) {
  const formattedDate = new Date(launch.date_utc).toLocaleString();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{launch.name}</Text>

        <View
          style={[
            styles.statusBadge,
            status.style === "success" && styles.successBadge,
            status.style === "failure" && styles.failureBadge,
            status.style === "upcoming" && styles.upcomingBadge,
          ]}
        >
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mission Information</Text>

        <InfoRow
          label="Flight Number"
          value={
            launch.flight_number !== null && launch.flight_number !== undefined
              ? String(launch.flight_number)
              : "Unknown"
          }
        />

        <InfoRow label="Date" value={formattedDate} />

        <InfoRow label="Rocket" value={launch.rocket} />

        <InfoRow label="Launchpad" value={launch.launchpad ?? "Unknown"} />
      </View>

      {launch.details && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mission Details</Text>

          <Text style={styles.details}>{launch.details}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function LaunchpadTab({ launchpadId }: { launchpadId: string | null }) {
  const { data: launchpad, isLoading, isError } = useLaunchpad(launchpadId);

  if (!launchpadId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>No launchpad</Text>

        <Text style={styles.errorText}>
          This launch does not have a launchpad assigned.
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading launchpad...</Text>
      </View>
    );
  }

  if (isError || !launchpad) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Launchpad unavailable</Text>

        <Text style={styles.errorText}>
          Launchpad information could not be loaded.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{launchpad.name}</Text>

        <View style={styles.activeBadge}>
          <Text style={styles.activeBadgeText}>{launchpad.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Launchpad Information</Text>

        <InfoRow label="Full Name" value={launchpad.full_name} />

        <InfoRow
          label="Location"
          value={`${launchpad.locality}, ${launchpad.region}`}
        />

        <InfoRow label="Latitude" value={String(launchpad.latitude)} />

        <InfoRow label="Longitude" value={String(launchpad.longitude)} />

        <InfoRow
          label="Launch Attempts"
          value={String(launchpad.launch_attempts)}
        />

        <InfoRow
          label="Successful Launches"
          value={String(launchpad.launch_successes)}
        />
      </View>

      {launchpad.details && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Launchpad Details</Text>

          <Text style={styles.details}>{launchpad.details}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function MediaTab({ launch }: { launch: Launch }) {
  console.log("===== MEDIA DEBUG =====");
  console.log("LAUNCH ID:", launch.id);
  console.log("LAUNCH LINKS:", JSON.stringify(launch.links, null, 2));
  console.log("PATCH:", launch.links?.patch);
  console.log("WEBCAST:", launch.links?.webcast);
  console.log("ARTICLE:", launch.links?.article);
  console.log("WIKIPEDIA:", launch.links?.wikipedia);

  const patchUrl =
    launch.links?.patch?.large ?? launch.links?.patch?.small ?? null;

  const webcastUrl = launch.links?.webcast ?? null;
  const articleUrl = launch.links?.article ?? null;
  const wikipediaUrl = launch.links?.wikipedia ?? null;

  console.log("FINAL PATCH URL:", patchUrl);
  console.log("FINAL WEBCAST URL:", webcastUrl);

  const hasMedia =
    Boolean(patchUrl) ||
    Boolean(webcastUrl) ||
    Boolean(articleUrl) ||
    Boolean(wikipediaUrl);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Media</Text>

        {patchUrl && (
          <View style={styles.mediaCard}>
            <Text style={styles.mediaTitle}>Mission Patch</Text>

            <Image
              source={{
                uri: patchUrl,
              }}
              style={styles.patchImage}
              resizeMode="contain"
              onLoad={() => {
                console.log("PATCH IMAGE LOADED:", patchUrl);
              }}
              onError={(event) => {
                console.log("PATCH IMAGE ERROR:", event.nativeEvent.error);
              }}
            />
          </View>
        )}

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

        {!hasMedia && (
          <Text style={styles.emptyText}>
            No media is available for this launch.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

interface TabButtonProps {
  label: string;
  active: boolean;
  onPress: () => void;
}

function TabButton({ label, active, onPress }: TabButtonProps) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={[styles.tabButton, active && styles.activeTabButton]}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {label}
      </Text>
    </Pressable>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>

      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        pressed && styles.actionButtonPressed,
      ]}
    >
      <Text style={styles.actionButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  tabsContainer: {
    flexGrow: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  tabsContent: {
    paddingHorizontal: 16,
  },

  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },

  activeTabButton: {
    borderBottomColor: "#111827",
  },

  tabText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6b7280",
  },

  activeTabText: {
    color: "#111827",
    fontWeight: "700",
  },

  scroll: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 40,
  },

  header: {
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  statusBadge: {
    alignSelf: "flex-start",
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
    backgroundColor: "#fef3c7",
  },

  statusText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#111827",
    textTransform: "capitalize",
  },

  activeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },

  activeBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
    textTransform: "capitalize",
  },

  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  infoLabel: {
    flex: 1,
    fontSize: 14,
    color: "#6b7280",
  },

  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textAlign: "right",
  },

  details: {
    fontSize: 15,
    lineHeight: 23,
    color: "#374151",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#ffffff",
  },

  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },

  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  mediaCard: {
    alignItems: "center",
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  mediaTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },

  patchImage: {
    width: 220,
    height: 220,
  },

  mediaInfo: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },

  actionButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: "#111827",
  },

  actionButtonPressed: {
    opacity: 0.7,
  },

  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },

  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 20,
  },
});
