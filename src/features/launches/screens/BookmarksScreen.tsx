import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";

import {
  getBookmarks,
  removeBookmark,
  type Bookmark,
} from "../../../database/bookmarks.repository";

import { getCachedLaunch } from "../../../database/launches.repository";
import type { Launch } from "../../../api/schemas";

interface BookmarkItem {
  bookmark: Bookmark;
  launch: Launch | null;
}

export function BookmarksScreen() {
  const [items, setItems] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookmarks = useCallback(async () => {
    try {
      setLoading(true);

      const bookmarks = await getBookmarks();

      const result = await Promise.all(
        bookmarks.map(async (bookmark) => {
          const launch = await getCachedLaunch(bookmark.launchId);

          return {
            bookmark,
            launch,
          };
        }),
      );

      setItems(result);
    } catch (error) {
      console.error("Failed to load bookmarks:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadBookmarks();
    }, [loadBookmarks]),
  );

  async function handleRemove(launchId: string): Promise<void> {
    try {
      await removeBookmark(launchId);

      setItems((current) =>
        current.filter((item) => item.bookmark.launchId !== launchId),
      );
    } catch (error) {
      console.error("Failed to remove bookmark:", error);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading bookmarks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Launches</Text>

        <Text style={styles.count}>
          {items.length} {items.length === 1 ? "bookmark" : "bookmarks"}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.bookmark.launchId}
        contentContainerStyle={
          items.length === 0 ? styles.emptyList : styles.listContent
        }
        renderItem={({ item }) => {
          const launchName = item.launch?.name ?? "Unknown launch";

          return (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.launchName}>{launchName}</Text>

                {item.bookmark.note && (
                  <Text style={styles.note}>{item.bookmark.note}</Text>
                )}

                <Text style={styles.savedAt}>
                  Saved {new Date(item.bookmark.createdAt).toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  void handleRemove(item.bookmark.launchId);
                }}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${launchName} from bookmarks`}
                activeOpacity={0.7}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔖</Text>

            <Text style={styles.emptyTitle}>No bookmarks yet</Text>

            <Text style={styles.emptyText}>
              Open a launch and tap the bookmark button to save it here.
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

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
  },

  loadingText: {
    fontSize: 15,
    color: "#6b7280",
  },

  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },

  count: {
    marginTop: 4,
    fontSize: 14,
    color: "#6b7280",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  emptyList: {
    flexGrow: 1,
    padding: 24,
  },

  card: {
    marginBottom: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
  },

  cardContent: {
    flex: 1,
    paddingRight: 12,
  },

  launchName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  note: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },

  savedAt: {
    marginTop: 8,
    fontSize: 12,
    color: "#9ca3af",
  },

  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
  },

  removeText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#374151",
  },

  emptyText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    color: "#6b7280",
  },
});
