/**
 * Modal component for setting running pace in minutes per kilometer
 */

import type React from "react";
import { useState, useEffect } from "react";
import {
  Modal,
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface PaceModalProps {
  visible: boolean;
  onClose: () => void;
  pace: number;
  setPace: (pace: number) => void;
}

const PaceModal: React.FC<PaceModalProps> = ({
  visible,
  onClose,
  pace,
  setPace,
}) => {
  const [minutes, setMinutes] = useState<string>(Math.floor(pace).toString());
  const [seconds, setSeconds] = useState<string>(
    Math.round((pace % 1) * 60)
      .toString()
      .padStart(2, "0")
  );

  // Reset to saved pace when modal opens or pace changes
  useEffect(() => {
    if (visible) {
      setMinutes(Math.floor(pace).toString());
      setSeconds(
        Math.round((pace % 1) * 60)
          .toString()
          .padStart(2, "0")
      );
    }
  }, [visible, pace]);

  const handleSave = () => {
    const min = parseInt(minutes) || 0;
    const sec = parseInt(seconds) || 0;
    const totalMinutes = min + sec / 60;
    if (totalMinutes <= 0) {
      // Invalid pace, do not save
      return;
    }
    setPace(totalMinutes);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.paceModalContent}>
          <ThemedText style={styles.paceModalTitle}>
            Set Pace (min/km)
          </ThemedText>

          <View style={styles.paceInputContainer}>
            <TextInput
              style={styles.paceInput}
              value={minutes}
              onChangeText={(text) => {
                const num = text.replace(/[^0-9]/g, "");
                if (num === "" || (parseInt(num) >= 0 && parseInt(num) < 60)) {
                  setMinutes(num);
                }
              }}
              keyboardType="numeric"
              placeholder="6"
              maxLength={2}
            />
            <ThemedText style={styles.paceColon}>:</ThemedText>
            <TextInput
              style={styles.paceInput}
              value={seconds}
              onChangeText={(text) => {
                const num = text.replace(/[^0-9]/g, "");
                if (num === "" || (parseInt(num) >= 0 && parseInt(num) < 60)) {
                  setSeconds(num);
                }
              }}
              onBlur={() => {
                // Pad with zero when user leaves the field
                if (seconds.length === 1) {
                  setSeconds(seconds.padStart(2, "0"));
                }
              }}
              keyboardType="numeric"
              placeholder="00"
              maxLength={2}
            />
          </View>

          <View style={styles.paceModalButtons}>
            <TouchableOpacity
              style={[styles.paceModalButton, styles.paceModalCancelButton]}
              onPress={onClose}
            >
              <ThemedText style={styles.paceModalButtonText}>
                Cancel
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.paceModalButton, styles.paceModalSaveButton]}
              onPress={handleSave}
            >
              <ThemedText style={styles.paceModalButtonText}>Save</ThemedText>
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
  paceModalContent: {
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
  paceModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    color: "#000",
  },
  paceInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  paceInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    textAlign: "center",
    color: "#000",
    width: 70,
  },
  paceColon: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000",
  },
  paceModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  paceModalButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  paceModalCancelButton: {
    backgroundColor: "#FF6B6B",
  },
  paceModalSaveButton: {
    backgroundColor: "#4285F4",
  },
  paceModalButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});

export default PaceModal;
