import { APIProvider } from '@vis.gl/react-google-maps';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import {MapForUI} from '../maps/getMap';
import { REACT_APP_GOOGLE_MAPS_API_KEY } from '@/environmentVariables';


interface Coordinates {
  latitude: number;
  longitude: number;
}

const HomeScreen: React.FC = () => {
  const [inputText, setInputText] = useState<string>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);

  const apiKey = REACT_APP_GOOGLE_MAPS_API_KEY

  // Function to fetch route coordinates using the input text
  const fetchRouteCoordinates = async (): Promise<void> => {
    try {
      const response = await getCoordinatesFromText(inputText);
      const coords: Coordinates = {latitude: 0,longitude: 1}
      if (response) {
        setCoordinates(coords);
      }
    } catch (error) {
      console.error("Error fetching route coordinates:", error);
    }
  };

  // Mock function to get coordinates from text (replace with API call)
  const getCoordinatesFromText = async (text: string): Promise<Coordinates> => {
    // Replace this mock response with the actual API call to get coordinates
    return {
      latitude: 37.7749, // Example coordinate (e.g., San Francisco)
      longitude: -122.4194,
    };
  };

  // Define the initial region for the map if coordinates are available
  const initialRegion: Region = coordinates
    ? {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }
    : {
        latitude: 37.7749, // Default to San Francisco as a placeholder
        longitude: -122.4194,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

  return (
    <APIProvider apiKey={apiKey!} onLoad={() => console.log('Maps API has loaded.')}>
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter route or location"
        value={inputText}
        onChangeText={setInputText}
      />
      <Button title="Submit" onPress={fetchRouteCoordinates} />
      <View style={styles.mapContainer}>
        {coordinates ? (

          <MapForUI/>
          // <MapView style={styles.map} region={initialRegion}>
          //   <Marker coordinate={coordinates} title="Selected Location" />
          // </MapView>
        ) : (
          <View style={styles.placeholder}>
            <Text>Enter a route above to see it on the map</Text>
          </View>
        )}
      </View>
    </View>
    </APIProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  mapContainer: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
