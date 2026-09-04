import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { LaunchListScreen } from "../features/launches/screens/LaunchListScreen";

export type RootStackParamList = {
  Launches: undefined;
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
