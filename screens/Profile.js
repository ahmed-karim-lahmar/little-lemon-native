import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaskedTextInput } from "react-native-mask-text";
import * as ImagePicker from "expo-image-picker";

export default function Profile({ handleSignOut: handleSignOutParent }) {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [avatar, setAvatar] = useState(null);
  const [notifications, setNotifications] = useState({
    orderStatuses: true,
    passwordChanges: true,
    specialOffers: true,
    newsletter: true,
  });

  useEffect(() => {
    const requestMediaPermission = async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Permission to access media library is required"
        );
      }
    };
    requestMediaPermission();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedData = await AsyncStorage.getItem("user_data");
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          setUserData((prev) => ({
            ...prev,
            firstName: parsedData.firstName || "",
            lastName: parsedData.lastName || "",
            email: parsedData.email || "",
            phone: parsedData.phone || "",
          }));

          if (parsedData.avatar) {
            setAvatar(parsedData.avatar);
          }

          if (parsedData.notifications) {
            setNotifications(parsedData.notifications);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    loadUserData();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled) {
        setAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const removeImage = () => {
    setAvatar(null);
  };

  const getUserInitials = () => {
    const firstInitial = userData.firstName
      ? userData.firstName.charAt(0).toUpperCase()
      : "";
    const lastInitial = userData.lastName
      ? userData.lastName.charAt(0).toUpperCase()
      : "";
    return `${firstInitial}${lastInitial}`;
  };

  const handleInputChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const userDataToSave = { ...userData, avatar, notifications };
      await AsyncStorage.setItem("user_data", JSON.stringify(userDataToSave));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDiscardChanges = async () => {
    try {
      const savedData = await AsyncStorage.getItem("user_data");
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setUserData((prev) => ({
          ...prev,
          firstName: parsedData.firstName || "",
          lastName: parsedData.lastName || "",
          email: parsedData.email || "",
          phone: parsedData.phone || "",
        }));
        setAvatar(parsedData.avatar || null);
        setNotifications({
          orderStatuses: parsedData.notifications?.orderStatuses ?? true,
          passwordChanges: parsedData.notifications?.passwordChanges ?? true,
          specialOffers: parsedData.notifications?.specialOffers ?? true,
          newsletter: parsedData.notifications?.newsletter ?? true,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      handleSignOutParent();
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#495E57" />
          </TouchableOpacity>
          <Image
            source={require("../assets/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.smallAvatarImage} />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={40}
                color="#495E57"
              />
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal information</Text>

          <View style={styles.avatarSection}>
            <TouchableOpacity
              onPress={pickImage}
              style={styles.avatarTouchable}
            >
              {avatar ? (
                <Image source={{ uri: avatar }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitials}>{getUserInitials()}</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.avatarButtons}>
              <TouchableOpacity style={styles.avatarButton} onPress={pickImage}>
                <Text style={styles.avatarButtonText}>Change</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={removeImage}
                disabled={!avatar}
              >
                <Text
                  style={[
                    styles.avatarButtonText,
                    !avatar && styles.disabledButton,
                  ]}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>First name</Text>
            <TextInput
              style={styles.input}
              value={userData.firstName}
              onChangeText={(text) => handleInputChange("firstName", text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last name</Text>
            <TextInput
              style={styles.input}
              value={userData.lastName}
              onChangeText={(text) => handleInputChange("lastName", text)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={userData.email}
              onChangeText={(text) => handleInputChange("email", text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone number</Text>
            <View style={[styles.input, styles.phoneInputContainer]}>
              <Text style={styles.phonePrefix}>+1 </Text>
              <MaskedTextInput
                style={styles.phoneInput}
                value={userData.phone}
                onChangeText={(text) => {
                  handleInputChange("phone", text);
                }}
                mask="(999) 999-9999"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email notifications</Text>

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={notifications.orderStatuses}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, orderStatuses: value }))
              }
              tintColors={{ true: "#495E57", false: "#ccc" }}
            />
            <Text style={styles.checkboxLabel}>Order statuses</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={notifications.passwordChanges}
              onValueChange={(value) =>
                setNotifications((prev) => ({
                  ...prev,
                  passwordChanges: value,
                }))
              }
              tintColors={{ true: "#495E57", false: "#ccc" }}
            />
            <Text style={styles.checkboxLabel}>Password changes</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={notifications.specialOffers}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, specialOffers: value }))
              }
              tintColors={{ true: "#495E57", false: "#ccc" }}
            />
            <Text style={styles.checkboxLabel}>Special offers</Text>
          </View>

          <View style={styles.checkboxContainer}>
            <Checkbox
              value={notifications.newsletter}
              onValueChange={(value) =>
                setNotifications((prev) => ({ ...prev, newsletter: value }))
              }
              tintColors={{ true: "#495E57", false: "#ccc" }}
            />
            <Text style={styles.checkboxLabel}>Newsletter</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>

          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={[styles.bottomButton, styles.discardButton]}
              onPress={handleDiscardChanges}
            >
              <Text style={styles.discardButtonText}>Discard changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bottomButton, styles.saveButton]}
              onPress={handleSaveChanges}
            >
              <Text style={styles.saveButtonText}>Save changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    padding: 8,
  },
  logo: {
    width: 150,
    height: 50,
  },
  avatarContainer: {
    width: 40,
    alignItems: "center",
  },
  smallAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarTouchable: {
    borderRadius: 50,
    overflow: "hidden",
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#495E57",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarInitials: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "bold",
  },
  avatarButtons: {
    flexDirection: "row",
    marginLeft: 16,
  },
  avatarButton: {
    padding: 8,
    marginRight: 8,
  },
  avatarButtonText: {
    color: "#495E57",
    fontWeight: "500",
  },
  disabledButton: {
    color: "#ccc",
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  avatarSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#495E57",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarButtons: {
    flexDirection: "row",
  },
  avatarButton: {
    padding: 8,
    marginRight: 8,
  },
  avatarButtonText: {
    color: "#495E57",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 0,
    paddingLeft: 12,
  },
  phonePrefix: {
    fontSize: 16,
    color: "#000",
  },
  phoneInput: {
    flex: 1,
    height: "100%",
    padding: 12,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  actionButtons: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: "#F4CE14",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  bottomButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bottomButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  discardButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: "#495E57",
    marginLeft: 8,
  },
  discardButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
