/**
 * Originally this component was for the google maps autocomplete input field
 * However, due to issues with Google Places API billing changes, this isn't working right now.
 * Leaving commented for now for reference, but I plan to move more towards the AI input or clicking on the map
 * which I think is a more intuitive user experience.
 * 
 * This component is for the input fields
 */


import type React from "react";
import { useEffect, useRef } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import type { GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { REACT_APP_GOOGLE_MAPS_API_KEY } from "@env";
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
  const ref = useRef<GooglePlacesAutocompleteRef>(null);

  // Update the text input when location changes
  useEffect(() => {
    if (location?.name && ref.current) {
      ref.current.setAddressText(location.name);
    }
  }, [location?.name]);
  return (
    <View style={styles.container}>
      {/* <ThemedText>{location?.name}</ThemedText> */}
      <ThemedText style={styles.label}>{label}</ThemedText>
      <GooglePlacesAutocomplete
        keyboardShouldPersistTaps="handled"
        listViewDisplayed="auto"
//         predefinedPlaces={[
//   {
//     description: "Hyde Park, London, UK",
//     geometry: { location: { lat: 51.5074, lng: -0.1657 } },
//     place_id: "ChIJdd4hrwug2EcRmSrV3Vo6llI",
//   } as any,
//   {
//     description: "Tower Bridge, London, UK",
//     geometry: { location: { lat: 51.5055, lng: -0.0754 } },
//     place_id: "ChIJ54K66WgDdkgRRWTUf8VKKFQ",
//   } as any,
//   {
//     description: "Regent's Park, London, UK",
//     geometry: { location: { lat: 51.5313, lng: -0.1573 } },
//     place_id: "ChIJdd3OT0ocdkgRnEqBdOFxDM0",
//   } as any,
//   {
//     description: "Greenwich Park, London, UK",
//     geometry: { location: { lat: 51.4769, lng: -0.0005 } },
//     place_id: "ChIJC7buBO2e2EcR-VmTgKxYNxo",
//   } as any,
//   {
//     description: "Buckingham Palace, London, UK",
//     geometry: { location: { lat: 51.5014, lng: -0.1419 } },
//     place_id: "ChIJtV5bzSAFdkgRpwLZFPWrJgo",
//   } as any,
//   {
//     description: "The Serpentine, Hyde Park, London, UK",
//     geometry: { location: { lat: 51.5048, lng: -0.1666 } },
//     place_id: "ChIJNRBlR_IEdkgRUYnbyWn1VGo",
//   } as any,
// ]}

      predefinedPlaces={[]}
        ref={ref}
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
          // For predefined places, geometry is in data, not details
          const lat =
            details?.geometry?.location?.lat ||
            (data as any)?.geometry?.location?.lat ||
            0;
          const lng =
            details?.geometry?.location?.lng ||
            (data as any)?.geometry?.location?.lng ||
            0;

          setLocation({
            name: data.description,
            placeId: (data as any).place_id || data.description,
            latitude: lat,
            longitude: lng,
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
