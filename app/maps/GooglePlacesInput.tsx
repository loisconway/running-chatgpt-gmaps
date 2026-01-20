import type React from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { REACT_APP_GOOGLE_MAPS_API_KEY } from "@/environmentVariables";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";

const apiKey = REACT_APP_GOOGLE_MAPS_API_KEY;

type LocationType = {
  name?: string;
  placeId?: string;
  latitude: number;
  longitude: number;
};

interface GooglePlacesProps {
  location: LocationType | null;
  setLocation: React.Dispatch<React.SetStateAction<LocationType | null>>;
  placeholder: string;
  label: string;
}

const GooglePlacesInput: React.FC<GooglePlacesProps> = ({
  location,
  setLocation,
  placeholder,
  label,
}) => {
  return (
    <View style={styles.container}>
      {/* <ThemedText>{location?.name}</ThemedText> */}
      <ThemedText style={styles.label}>{label}</ThemedText>
      <GooglePlacesAutocomplete
        keyboardShouldPersistTaps="handled"
        listViewDisplayed="auto"
        predefinedPlaces={[
  {
    description: "London",
    geometry: { location: { lat: 51.5074, lng: -0.1278 } },
  },
]}
        textInputProps={{ autoFocus: false }}
        placeholder={placeholder}
        fetchDetails={true}
        enablePoweredByContainer={false}
        styles={{
          container: styles.inputContainer,
          textInput: styles.textInput,
          listView: styles.listView,
          description: styles.description,
          row: styles.row,
          separator: styles.separator,
        }}
        onPress={(data, details = null) => {
       
  console.log("PLACE:", data.description);
  console.log("DETAILS:", details);

          console.log(data, details);
          setLocation({
            name: data.description,
            placeId: data.place_id,
            latitude: details?.geometry?.location?.lat || 0,
            longitude: details?.geometry?.location?.lng || 0,
          });
        }}
        query={{
          key: apiKey,
          language: "en",
        }}
        onFail={(error) => console.log("Google Places error:", error)}
      
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  marginBottom: 1,
  zIndex: 10,
},
inputContainer: {
  flex: 0,
  width: "100%",
  zIndex: 10,
},
listView: {
  position: "absolute",
  top: 45,
  zIndex: 20,
  elevation: 20,
backgroundColor: "red",
  borderRadius: 8,
},


  label: {
    marginBottom: 4,
    fontWeight: "600",
    fontSize: 13,
  },

  textInput: {
    height: 40,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#ddd",
  },

  description: {
    fontSize: 13,
  },
  row: {
    padding: 10,
    height: "auto",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
});

export default GooglePlacesInput;
