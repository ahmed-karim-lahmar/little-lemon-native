import { StatusBar } from "expo-status-bar";
import { Image, StyleSheet, Text, View } from "react-native";
import Onboarding from "./screens/Onboarding";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Profile from "./screens/Profile";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MarkaziText_400Regular,
  MarkaziText_500Medium,
} from "@expo-google-fonts/markazi-text";
import {
  Karla_400Regular,
  Karla_500Medium,
  Karla_600SemiBold,
  Karla_700Bold,
  Karla_800ExtraBold,
} from "@expo-google-fonts/karla";
import { useFonts } from "expo-font";

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    MarkaziText_400Regular,
    MarkaziText_500Medium,
    Karla_400Regular,
    Karla_500Medium,
    Karla_600SemiBold,
    Karla_700Bold,
    Karla_800ExtraBold,
  });
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const userData = await AsyncStorage.getItem("user_data");
        if (userData) {
          setIsSignedIn(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  const handleSignIn = async ({ firstName, email }) => {
    try {
      await AsyncStorage.setItem(
        "user_data",
        JSON.stringify({ firstName, email })
      );
      setIsSignedIn(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem("user_data");
      setIsSignedIn(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Image
          resizeMode="contain"
          style={styles.image}
          source={require("./assets/Logo.png")}
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          screenOptions={{
            // headerShown: false,
            contentStyle: styles.container,
          }}
        >
          {isSignedIn ? (
            <Stack.Screen name="Profile">
              {(props) => <Profile {...props} handleSignOut={handleSignOut} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Onboarding">
              {(props) => <Onboarding {...props} handleSignIn={handleSignIn} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
