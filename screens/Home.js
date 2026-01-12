import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { typography } from "../styles/global";
import { initDatabase, saveMenuItems, getMenuItems } from "../database";
const MENU_URL =
  "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json";

const IMGS_URL =
  "https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/";

export default function Home({ navigation }) {
  const [avatar, setAvatar] = useState(null);
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const categories = [
    { id: "starters", name: "Starters" },
    { id: "mains", name: "Mains" },
    { id: "desserts", name: "Desserts" },
    { id: "drinks", name: "Drinks" },
  ];

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const savedData = await AsyncStorage.getItem("user_data");
        if (savedData) {
          const parsedData = JSON.parse(savedData);

          if (parsedData.avatar) {
            setAvatar(parsedData.avatar);
          }
        }
      } catch (error) {
        console.log(error);
      }
    };

    loadAvatar();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await initDatabase();
        const storedMenu = await getMenuItems();

        if (storedMenu.length > 0) {
          setMenu(storedMenu);
          setFilteredMenu(storedMenu);
        } else {
          const response = await fetch(MENU_URL);
          const data = await response.json();
          const menuItems = data.menu || [];
          await saveMenuItems(menuItems);
          setMenu(menuItems);
          setFilteredMenu(menuItems);
        }
      } catch (error) {
        console.error("Error loading menu data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleCategory = (category) => {
    let newCategories;
    if (activeCategories.includes(category)) {
      newCategories = activeCategories.filter((c) => c !== category);
    } else {
      newCategories = [...activeCategories, category];
    }
    setActiveCategories(newCategories);

    if (newCategories.length === 0) {
      setFilteredMenu(menu);
    } else {
      setFilteredMenu(
        menu.filter((item) => newCategories.includes(item.category))
      );
    }
  };
  const [imageError, setImageError] = useState({});
  const handleImageError = (itemName) => {
    setImageError((prev) => ({ ...prev, [itemName]: true }));
  };

  const renderMenuItem = ({ item }) => (
    <View style={styles.menuItem}>
      <View style={styles.menuItemContent}>
        <Text style={[typography.cardTitleText, styles.menuItemTitle]}>
          {item.name}
        </Text>
        <Text
          style={[typography.paragraphText, styles.menuItemDescription]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <Text style={[typography.leadText, styles.menuItemPrice]}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
      <Image
        source={
          imageError[item.name]
            ? ""
            : { uri: `${IMGS_URL}${item.image}?raw=true` }
        }
        style={styles.menuItemImage}
        resizeMode="cover"
        onError={() => handleImageError(item.name)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.spacer} />
          <Image
            source={require("../assets/Logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => navigation.navigate("Profile")}
          >
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.smallAvatarImage} />
            ) : (
              <Ionicons
                name="person-circle-outline"
                size={40}
                color="#495E57"
              />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.hero}>
          <Text style={[typography.displayText, styles.heroTitle]}>
            Little Lemon
          </Text>
          <Text style={[typography.subTitleText, styles.heroSubtitle]}>
            Chicago
          </Text>
          <View style={styles.heroTextContainer}>
            <Text style={[typography.leadText, styles.heroText]}>
              We are a family owned Mediterranean restaurant, focused on
              traditional recipes served with a modern twist.
            </Text>
            <View style={styles.heroImageContainer}>
              <Image
                source={require("../assets/Hero image.png")}
                style={styles.heroImage}
                resizeMode="contain"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color="#333333" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[typography.sectionTitleText, styles.sectionTitle]}>
            ORDER FOR DELIVERY!
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  activeCategories.includes(category.id) &&
                    styles.categoryButtonActive,
                ]}
                onPress={() => toggleCategory(category.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    activeCategories.includes(category.id) &&
                      styles.categoryButtonTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FlatList
            data={filteredMenu}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.name}
            scrollEnabled={false}
            contentContainerStyle={styles.menuList}
          />
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
  spacer: {},
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
  hero: {
    padding: 16,
    backgroundColor: "#495E57",
  },
  heroTitle: {
    color: "#F4CE14",
  },
  heroSubtitle: {
    color: "white",
    marginTop: -20,
  },
  heroTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
  },
  heroText: {
    color: "white",
    marginTop: 16,
    flexShrink: 1,
  },
  heroImageContainer: {
    width: "130",
    maxWidth: "40%",
    height: "130",
    marginTop: -64,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderRadius: 18,
  },
  heroImage: {
    width: "100%",
    resizeMode: "cover",
  },
  searchButton: {
    marginTop: 36,
    backgroundColor: "#D9D9D9",
    padding: 16,
    borderRadius: "45%",
    alignSelf: "flex-start",
    marginStart: 12,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    color: "#000",
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 8,
  },
  categoryButton: {
    backgroundColor: "#EDEFEE",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: "#495E57",
  },
  categoryButtonText: {
    color: "#333",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "#fff",
  },
  menuList: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  menuItemContent: {
    flex: 1,
    paddingRight: 16,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  menuItemDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    lineHeight: 20,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495E57",
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
});
