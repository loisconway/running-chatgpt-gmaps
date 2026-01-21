"use client";

import type React from "react";
import { useState } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { X } from "lucide-react-native";
import { ThemedText } from "@/components/ThemedText";
import type { LocationType } from "../../hooks/useLocation";

interface SaveRouteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (routeName: string) => void;
  origin: LocationType | null;
  destination: LocationType | null;
}

const SaveRouteModal: React.FC<SaveRouteModalProps> = ({
  visible,
  onClose,
  onSave,
  origin,
  destination,
}) => {
  const [routeName, setRouteName] = useState<string>("");

  const handleSave = () => {
    onSave(routeName);
    setRouteName("");
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Save Route</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.modalLabel}>Route Name</ThemedText>
          <TextInput
            style={styles.modalInput}
            value={routeName}
            onChangeText={setRouteName}
            placeholder={
              origin && destination
                ? `${origin.name} to ${destination.name}`
                : "My Route"
            }
            placeholderTextColor="#999"
          />

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancelButton]}
              onPress={onClose}
            >
              <ThemedText style={styles.modalCancelButtonText}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalSaveButton]}
              onPress={handleSave}
            >
              <ThemedText style={styles.modalSaveButtonText}>Save</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  modalLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: "#666",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: "#000",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: "center",
  },
  modalCancelButton: {
    backgroundColor: "#ef4444",
    marginRight: 8,
  },
  modalSaveButton: {
    backgroundColor: "#4CAF50",
  },
  modalCancelButtonText: {
    fontWeight: "600",
    color: "#fff",
  },
  modalSaveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default SaveRouteModal;
