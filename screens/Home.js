import {
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  FlatList,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { typography } from "../styles/global";
import {
  initDatabase,
  saveMenuItems,
  getMenuItems,
  searchMenuItems,
  getMenuItemsByCategory,
} from "../database";
const MENU_URL =
  "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json";

const IMGS_URL =
  "https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/";

export default function Home({ navigation }) {
  const [avatar, setAvatar] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const filterMenu = useCallback(async () => {
    try {
      let results;
      if (searchText) {
        results = await searchMenuItems(searchText, activeCategories);
      } else if (activeCategories.length > 0) {
        results = await getMenuItemsByCategory(activeCategories);
      } else {
        results = await getMenuItems();
      }
      setFilteredMenu(results);
    } catch (error) {
      console.error("Error filtering menu:", error);
    }
  }, [searchText, activeCategories]);

  const debouncedFilter = useCallback(
    debounce(() => {
      filterMenu();
    }, 500),
    [filterMenu]
  );

  useEffect(() => {
    debouncedFilter();
  }, [searchText, activeCategories, debouncedFilter]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await initDatabase();
        const storedMenu = await getMenuItems();

        if (storedMenu.length === 0) {
          const response = await fetch(MENU_URL);
          const data = await response.json();
          const menuItems = data.menu || [];
          await saveMenuItems(menuItems);
          setMenu(menuItems);
          setFilteredMenu(menuItems);
        } else {
          setMenu(storedMenu);
          setFilteredMenu(storedMenu);
        }
      } catch (error) {
        console.error("Error loading menu data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const toggleCategory = (categoryId) => {
    setActiveCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  const [imageError, setImageError] = useState({});
  const handleImageError = (itemName) => {
    setImageError((prev) => ({ ...prev, [itemName]: true }));
  };

  const CategoryItem = ({ item, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.categoryButton, isActive && styles.activeCategory]}
      onPress={onPress}
    >
      <Text
        style={[styles.categoryText, isActive && styles.activeCategoryText]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

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
          <View style={styles.searchContainer}>
            <Ionicons
              name="search"
              size={20}
              color="#333"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[typography.sectionTitleText, styles.sectionTitle]}>
            ORDER FOR DELIVERY!
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          >
            {categories.map((category) => (
              <CategoryItem
                key={category.id}
                item={category}
                isActive={activeCategories.includes(category.id)}
                onPress={() => toggleCategory(category.id)}
              />
            ))}
          </ScrollView>
          <FlatList
            data={filteredMenu}
            renderItem={renderMenuItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.menuList}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No items found</Text>
            }
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
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#D9D9D9",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: "center",
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
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
  activeCategory: {
    backgroundColor: "#495E57",
  },
  categoryText: {
    color: "#333",
  },
  activeCategoryText: {
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
  menuList: {
    padding: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});
