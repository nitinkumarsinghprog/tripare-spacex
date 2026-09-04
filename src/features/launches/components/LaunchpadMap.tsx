import { useEffect, useState } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import type { Launchpad } from "../../../api/launchpad.schemas";

type Coordinate = { latitude: number; longitude: number };

function distanceKm(from: Coordinate, to: Coordinate): number {
  const radians = (value: number) => (value * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = radians(to.latitude - from.latitude);
  const dLng = radians(to.longitude - from.longitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(from.latitude)) * Math.cos(radians(to.latitude)) * Math.sin(dLng / 2) ** 2;
  return earthKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function LaunchpadMap({ launchpad }: { launchpad: Launchpad }) {
  const [userLocation, setUserLocation] = useState<Coordinate | null>(null);
  const pad = { latitude: launchpad.latitude, longitude: launchpad.longitude };
  useEffect(() => {
    void (async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") return;
      const location = await Location.getLastKnownPositionAsync({ maxAge: 300000 });
      if (location) setUserLocation(location.coords);
    })();
  }, []);
  const distance = userLocation ? distanceKm(userLocation, pad).toFixed(1) : null;
  return <View style={styles.container}>
    <MapView style={styles.map} initialRegion={{ ...pad, latitudeDelta: 8, longitudeDelta: 8 }} showsUserLocation={Boolean(userLocation)}>
      <Marker coordinate={pad} title={launchpad.name} description={`${launchpad.locality}, ${launchpad.region}`} />
    </MapView>
    <Text style={styles.text}>{distance ? `${distance} km from your location` : "Location permission denied or unavailable — launchpad remains visible."}</Text>
    <Pressable style={styles.button} onPress={() => void Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${pad.latitude},${pad.longitude}`)}><Text style={styles.buttonText}>Get Directions</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({ container:{marginTop:16}, map:{height:240,borderRadius:12}, text:{marginTop:10,color:"#4b5563"}, button:{alignSelf:"flex-start",marginTop:10,paddingHorizontal:14,paddingVertical:10,borderRadius:8,backgroundColor:"#111827"}, buttonText:{color:"white",fontWeight:"700"} });
