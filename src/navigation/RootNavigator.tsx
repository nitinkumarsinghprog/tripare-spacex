import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LaunchListScreen } from "../features/launches/screens/LaunchListScreen";
import { LaunchDetailsScreen } from "../features/launches/screens/LaunchDetailsScreen";

export type RootStackParamList = {
  Launches: undefined;
  LaunchDetails: {
    launchId: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Launches"
          component={LaunchListScreen}
          options={{
            title: "SpaceX Launches",
          }}
        />

        <Stack.Screen
          name="LaunchDetails"
          component={LaunchDetailsScreen}
          options={{
            title: "Launch Details",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
