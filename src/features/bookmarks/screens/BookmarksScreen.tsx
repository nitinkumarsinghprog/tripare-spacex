import { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import {
  getBookmarks,
  type Bookmark,
} from "../../../database/bookmarks.repository";
import { getCachedLaunch } from "../../../database/launches.repository";
import type { Launch } from "../../../api/schemas";
import type { RootStackParamList } from "../../../navigation/RootNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type BookmarkItem = {
  bookmark: Bookmark;
  launch: Launch;
};

export function BookmarksScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);

      const bookmarks = await getBookmarks();

      const results = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const launch = await getCachedLaunch(bookmark.launchId);

          if (!launch) {
            return null;
          }

          return {
            bookmark,
            launch,
          };
        }),
      );

      setItems(
        results.filter(
          (item): item is BookmarkItem => item !== null,
        ),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBookmarks();
    }, [loadBookmarks]),
  );

  function handleLaunchPress(launchId: string) {
    navigation.navigate("LaunchDetails", {
      launchId,
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookmarks</Text>
        <Text style={styles.count}>
          {items.length} saved {items.length === 1 ? "launch" : "launches"}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.bookmark.launchId}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => {
              void loadBookmarks();
            }}
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleLaunchPress(item.launch.id)}
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.launch.name}`}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name} numberOfLines={2}>
                {item.launch.name}
              </Text>
              <Text style={styles.bookmark}>🔖</Text>
            </View>

            <Text style={styles.date}>
              {new Date(item.launch.date_utc).toLocaleString()}
            </Text>

            {item.bookmark.note ? (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Note</Text>
                <Text style={styles.note} numberOfLines={3}>
                  {item.bookmark.note}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        )}
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔖</Text>
              <Text style={styles.emptyTitle}>No bookmarks yet</Text>
              <Text style={styles.emptyText}>
                Bookmark a launch from its details screen and it will appear
                here.
              </Text>
            </View>
          ) : null
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyList: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  bookmark: {
    marginLeft: 10,
    fontSize: 20,
  },
  date: {
    marginTop: 8,
    fontSize: 13,
    color: "#6b7280",
  },
  noteContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    textTransform: "uppercase",
  },
  note: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#374151",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#6b7280",
    textAlign: "center",
  },
});
