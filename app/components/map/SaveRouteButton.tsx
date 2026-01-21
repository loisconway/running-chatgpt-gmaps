import type React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Save } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";

interface SaveRouteButtonProps {
  onPress: () => void;
  fullScreen?: boolean;
}

const SaveRouteButton: React.FC<SaveRouteButtonProps> = ({
  onPress,
  fullScreen = false,
}) => {
  if (fullScreen) {
    return (
      <TouchableOpacity style={styles.fullScreenSaveButton} onPress={onPress}>
        <Save color="#fff" size={20} style={styles.buttonIcon} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.saveButton} onPress={onPress}>
      <Save size={16} color="#fff" style={styles.buttonIcon} />
      <ThemedText style={styles.saveButtonText}>Save Route</ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    marginBottom:6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 8,
  },
  fullScreenSaveButton: {
    position: "absolute",
    bottom: 30,
    left: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  fullScreenButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
});

export default SaveRouteButton;
