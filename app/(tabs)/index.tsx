/**
 * Home screen component displaying the map and route
 */

import type React from "react"
import { StyleSheet } from "react-native"
import { useLocalSearchParams } from "expo-router"
import MapRoute from "../maps/MapRoute"
import { ThemedView } from "@/components/ThemedView"
import type { SavedRoute } from "../services/routeStorage"

const HomeScreen: React.FC = () => {
  const params = useLocalSearchParams()
  const savedRoute = params.savedRoute 
    ? (JSON.parse(params.savedRoute as string) as SavedRoute)
    : undefined

  return (
    <ThemedView style={styles.container}>
      <MapRoute savedRoute={savedRoute} />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default HomeScreen

