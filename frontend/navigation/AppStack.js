// navigation/AppStack.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AppTabs from "./AppTabs";
import ScanDetails from "../screens/ScanDetails";
import ShareToExplore from "../screens/ShareToExplore";

const Stack = createNativeStackNavigator();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen name="ScanDetails" component={ScanDetails} />
      <Stack.Screen name="ShareToExplore" component={ShareToExplore} />
    </Stack.Navigator>
  );
}
