import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Button,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedBackground from "../components/background/AnimatedBackground";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";

export default function History() {
  const { user, token } = useAuth();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("recent");
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadScans = async (order = "recent") => {
        try {
          const res = await axios.get(
            `http://localhost:8080/scans/user/${user.id}?sort=${order}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setScans(res.data);
        } catch (err) {
          console.error("Failed to fetch scan history:", err);
        } finally {
          setLoading(false);
        }
      };

      loadScans(sortOrder);
    }, [user.id, token, sortOrder])
  );
  const navigation = useNavigation();

  const renderItem = ({ item }) => {
    let ingredientInfo = null;
    let recommendations = [];

    try {
      ingredientInfo = item.ingredientInfoJson
        ? JSON.parse(item.ingredientInfoJson)
        : null;
      recommendations = item.recommendationsJson
        ? JSON.parse(item.recommendationsJson)
        : [];
    } catch (err) {
      console.error("JSON parse error", err);
    }

    return (
      <View style={styles.card}>
        <Text style={styles.date}>
          {new Date(item.scannedAt).toLocaleString()}
        </Text>
        <Text style={styles.result}>{item.resultSummary}</Text>

        <View style={styles.imageWrapper}>
          <Image
            source={{ uri: `http:localhost:8080/uploads/${item.imagePath}` }}
            style={styles.image}
          />
        </View>

        <View style={styles.viewDetailsButtonWrapper}>
          <Button
            title="View Scan Details"
            onPress={() =>
              navigation.navigate("ScanDetails", {
                ingredientInfo,
                prediction: item.resultSummary,
                recommendations,
              })
            }
            color="#9E50C8"
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <Text style={styles.title}>Scan History</Text>
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          onPress={() => setDropdownOpen(!isDropdownOpen)}
          style={styles.dropdownButton}
        >
          <Text style={styles.dropdownButtonText}>
            {sortOrder === "recent" ? "Most Recent" : "Oldest First"} ▼
          </Text>
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              onPress={() => {
                setSortOrder("recent");
                setDropdownOpen(false);
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownItemText}>Most Recent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSortOrder("oldest");
                setDropdownOpen(false);
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownItemText}>Oldest First</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#9E50C8"
          style={{ marginTop: 30 }}
        />
      ) : scans.length === 0 ? (
        <Text style={styles.empty}>You have no scans yet.</Text>
      ) : (
        <FlatList
          data={scans}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6A2C91",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  date: { fontSize: 14, color: "#888", marginBottom: 8 },
  result: { fontSize: 16, color: "#333" },
  empty: {
    marginTop: 50,
    textAlign: "center",
    fontSize: 16,
    color: "#999",
  },

  image: {
    width: "100%",
    height: 180,
    resizeMode: "contain",
    backgroundColor: "#FFF",
  }, // white image bg for contrast
  viewDetailsButtonWrapper: {
    marginTop: 12,
    borderRadius: 8,
    overflow: "hidden",
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 10,
    marginBottom: 16,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dropdownButtonText: {
    color: "#6A2C91",
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#6A2C91",
  },
});
