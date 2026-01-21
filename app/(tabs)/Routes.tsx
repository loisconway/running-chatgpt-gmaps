"use client";
import {
  StyleSheet,
  FlatList,
  View,
  ActivityIndicator,
  SafeAreaView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import useSavedRoutes from "../hooks/useSavedRoutes";
import RouteCard from "../components/explore/RouteCard";
import EmptyState from "../components/explore/EmptyState";
import type { SavedRoute } from "../services/routeStorage";

export default function ExploreScreen() {
  const { savedRoutes, loading, refreshing, handleRefresh, handleDeleteRoute } =
    useSavedRoutes();
  const navigation = useNavigation();

  const handleViewRoute = (route: SavedRoute) => {
    // Navigate to the home tab and pass the route data
    navigation.navigate("index", {
      savedRoute: route,
    });
  };

  const confirmDeleteRoute = (routeId: string) => {
    Alert.alert("Delete Route", "Are you sure you want to delete this route?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDeleteRoute(routeId),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Saved Routes
          </ThemedText>
        </ThemedView>

        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4285F4" />
            <ThemedText style={styles.loadingText}>
              Loading saved routes...
            </ThemedText>
          </View>
        ) : (
          <FlatList
            data={savedRoutes}
            renderItem={({ item }) => (
              <RouteCard
                route={item}
                onView={handleViewRoute}
                onDelete={confirmDeleteRoute}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={<EmptyState />}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
  },
});
