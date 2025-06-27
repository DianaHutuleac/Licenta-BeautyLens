import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import Home from "../screens/Home";
import Profile from "../screens/Profile";
import History from "../screens/History";
import Explore from "../screens/Explore";
import { useAuth } from "../hooks/useAuth";
import { Image } from "react-native";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  const { user } = useAuth();

  const SPRING_URL = "http://localhost:8080";
  const profilePhoto = user?.profilePictureUrl
    ? user.profilePictureUrl.startsWith("http")
      ? user.profilePictureUrl
      : `${SPRING_URL}${user.profilePictureUrl}`
    : null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === "Profile" && profilePhoto) {
            return (
              <Image
                source={{ uri: profilePhoto }}
                style={{
                  width: focused ? 30 : 26,
                  height: focused ? 30 : 26,
                  borderRadius: 15,
                  borderWidth: focused ? 2 : 1,
                  borderColor: color,
                }}
              />
            );
          }

          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "History") iconName = "time";
          else if (route.name === "Explore") iconName = "compass";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#A974BF",
        tabBarInactiveTintColor: "#D8CDE8",
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          height: 70,
          borderRadius: 15,
          backgroundColor: "#FFFDF7",
          shadowColor: "purple",
          shadowOpacity: 0.25,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="History" component={History} />
      <Tab.Screen name="Explore" component={Explore} />

      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}
