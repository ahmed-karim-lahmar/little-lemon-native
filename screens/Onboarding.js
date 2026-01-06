import { useState } from "react";
import {
  Image,
  StyleSheet,
  TextInput,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Onboarding = ({ navigation }) => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");

  const [errors, setErrors] = useState({
    firstName: "",
    email: "",
  });
  const validateFirstName = (name) => {
    if (!name.trim()) {
      return "First name is required";
    }
    if (!/^[a-zA-Z\s-]+$/.test(name)) {
      return "Name should only contain letters and spaces";
    }
    return "";
  };
  const validateEmail = (email) => {
    if (!email) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };
  const handleSubmit = () => {
    const nameError = validateFirstName(firstName);
    const emailError = validateEmail(email);

    setErrors({
      firstName: nameError,
      email: emailError,
    });
    if (!nameError && !emailError) {
      navigation.navigate("Profile");
    }
  };
  const isFormValid = () => {
    return !validateFirstName(firstName) && !validateEmail(email);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image style={styles.image} source={require("../assets/Logo.png")} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Let us get to know you</Text>
        <View style={styles.form}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
          <Text style={styles.label}>Email</Text>
          <TextInput
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
        </View>
      </View>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, !isFormValid() && styles.button.disabled]}
          onPress={handleSubmit}
          disabled={!isFormValid()}
        >
          <Text
            style={[
              styles.buttonText,
              !isFormValid() && styles.buttonText.disabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#CBD2D9",
  },
  header: {
    display: "flex",
    padding: "10",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DEE3E9",
  },
  image: {
    height: "60",
    width: "100%",
    objectFit: "scale-down",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 48,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "semibold",
    color: "#495E57",
  },
  form: {
    marginTop: "auto",
    display: "flex",
    gap: "14",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  label: {
    fontWeight: "medium",
    fontSize: 18,
    color: "#495E57",
  },
  input: {
    width: "100%",
    height: 44,
    borderWidth: 1,
    borderColor: "#495E57",
    borderRadius: 8,
    padding: 8,
  },
  footer: {
    backgroundColor: "#fff",
    paddingHorizontal: 32,
    paddingVertical: 36,
    width: "100%",
    display: "flex",
    alignItems: "flex-end",
  },
  button: {
    backgroundColor: "#DEE3E9",
    paddingVertical: 6,
    paddingBottom: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: "fit-content",
    disabled: {
      backgroundColor: "#E0E0E0",
    },
  },
  buttonText: {
    color: "#495E57",
    fontSize: 18,
    fontWeight: "bold",
    disabled: {
      color: "#919191ff",
    },
  },
});

export default Onboarding;
