import type React from "react"
import { StyleSheet } from "react-native"
import { useRoute } from "@react-navigation/native"
import MapRoute from "../maps/MapRoute"
import { ThemedView } from "@/components/ThemedView"
import type { SavedRoute } from "../services/routeStorage"

const HomeScreen: React.FC = () => {
  const route = useRoute()
  const savedRoute = route.params?.savedRoute as SavedRoute | undefined

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

