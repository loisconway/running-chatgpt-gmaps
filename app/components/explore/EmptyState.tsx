/**
 * Component to display an empty state when there are no saved routes
 */

import type React from "react";
import { StyleSheet } from "react-native";
import { Map } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const EmptyState: React.FC = () => {
  return (
    <ThemedView style={styles.emptyContainer}>
      <Map size={60} color="#ccc" />
      <ThemedText style={styles.emptyTitle}>No Saved Routes</ThemedText>
      <ThemedText style={styles.emptyText}>
        Your saved routes will appear here. Go to the Home tab to create
        and save routes.
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    color: "#666",
  },
});

export default EmptyState;
