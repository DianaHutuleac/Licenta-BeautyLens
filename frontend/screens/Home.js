import { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AnimatedBackground from "../components/background/AnimatedBackground";
import PrimaryButton from "../components/buttons/PrimaryButton";
import ActionRow from "../components/layout/ActionRow";
import ProfileStatus from "../components/badges/ProfileStatus";
import useAsync from "../hooks/useAsync";
import useImagePicker from "../hooks/useImagePicker";
import { useAuth } from "../hooks/useAuth";
import { uploadScan } from "../services/scanService";
import { Ionicons } from "@expo/vector-icons";
import OverallPieChartCard from "../components/cards/OverallPieChartCard";

const FLASK_URL = "http://127.0.0.1:5001";

export default function Home() {
  const morningMessages = [
    "Let’s take care of your skin today 🌿",
    "Start your day with a fresh glow ✨",
    "A fresh morning, a fresh face ☀️",
    "Today is a great day for great skin 💧",
  ];

  const afternoonMessages = [
    "Glowing through the day, one step at a time 🌤️",
    "Midday check-in: your skin’s doing great 💜",
    "Your skin deserves a little love today 💖",
    "Keep glowing, you’re halfway there 🔆",
  ];

  const eveningMessages = [
    "Wind down with skin in mind 🌙",
    "End the day with gentle care 🛁",
    "Relax, reset, and hydrate 💧",
    "Skincare before sleep is self-care 😴",
  ];

  const navigation = useNavigation();
  const { user, token } = useAuth();
  const [savedImageUrl, setSavedImageUrl] = useState(null);

  const getRandomMessage = () => {
    const hour = new Date().getHours();
    const messages =
      hour < 12
        ? morningMessages
        : hour < 18
        ? afternoonMessages
        : eveningMessages;
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  };

  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";

  const greetingText = `Good ${timeOfDay}, ${user?.firstName ?? "there"}!`;

  const greetingIcon =
    timeOfDay === "morning"
      ? "cloud"
      : timeOfDay === "afternoon"
      ? "sunny"
      : "moon";

  const [subMessage, setSubMessage] = useState("");
  useEffect(() => {
    setSubMessage(getRandomMessage());
  }, []);

  const greetingIconColor =
    timeOfDay === "morning"
      ? "#6EC6FF"
      : timeOfDay === "afternoon"
      ? "#ffcc00"
      : "#400080";

  <Ionicons
    name={greetingIcon}
    size={30}
    color={greetingIconColor}
    style={styles.greetingIcon}
  />;

  const { photo, pick } = useImagePicker();

  const [prediction, setPrediction] = useState(null);
  const [ingredientInfo, setIngredients] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const fetchProductStats = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/scans/user/${user.id}/product-summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setProductSummary(res.data);
    } catch (e) {
      console.error("Failed to fetch product summary:", e);
    }
  };

  useEffect(() => {
    setPrediction(null);
    setIngredients(null);
  }, [photo]);

  const {
    run: analyzeProduct,
    loading: analyzing,
    error,
    reset: resetError,
  } = useAsync(async () => {
    setPrediction(null);
    setIngredients(null);
    setRecommendations([]);
    setProgress(0);
    setShowProgress(true);

    let progressRef = 0;
    const interval = setInterval(() => {
      progressRef += 5;
      if (progressRef >= 95) {
        clearInterval(interval);
      }
      setProgress(progressRef);
    }, 300);

    const form = new FormData();
    form.append("label_file", {
      uri: photo,
      name: photo.split("/").pop(),
      type: "image/jpeg",
    });
    form.append("skin_type", user?.skinType ?? "");

    let data;
    try {
      const response = await axios.post(`${FLASK_URL}/analyze_product`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      data = response.data;
    } catch (err) {
      clearInterval(interval);
      setShowProgress(false);
      setProgress(0);
      if (err.response?.data?.details) {
        throw new Error(err.response.data.details.join("\n"));
      }
      throw err;
    }

    clearInterval(interval);
    setProgress(100);
    setTimeout(() => setShowProgress(false), 500);

    setPrediction(data.analysis_summary);
    setIngredients(data.ingredient_info);
    setRecommendations(data.recommendations);

    const scanData = await uploadScan(
      user.id,
      photo,
      data.analysis_summary,
      token,
      data.ingredient_info,
      data.recommendations,
      data.product_safety?.toUpperCase()
    );

    setSavedImageUrl(`${scanData.imagePath}`);

    if (user?.id) {
      await fetchProductStats();
    }
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Analysis failed", error.message ?? "Try again.");
      resetError();
    }
  }, [error, resetError]);

  const [overallCounts, setOverallCounts] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/scans/user/${user.id}/product-summary`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOverallCounts(res.data);
      } catch (e) {
        console.error("Failed to fetch safety summary:", e);
      }
    };

    if (user?.id) {
      fetchStats();
    }
  }, [user]);
  const [productSummary, setProductSummary] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchProductStats();
    }
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AnimatedBackground />

      <ScrollView contentContainerStyle={[styles.scroll]}>
        <View style={styles.greetingWrapper}>
          <View style={styles.greetingRow}>
            <Ionicons
              name={greetingIcon}
              size={28} // Slightly bigger
              color={greetingIconColor}
              style={styles.greetingIcon}
            />
            <Text style={styles.greeting}>{greetingText}</Text>
          </View>

          <Text style={styles.subMessage}>{subMessage}</Text>
        </View>

        <ProfileStatus
          skinType={user?.skinType}
          onPress={() => navigation.navigate("Profile")}
        />

        <LinearGradient
          colors={["#e8d5f0", "#f3e8ff", "#fff0f8"]}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.title}>Ingredient Analysis</Text>
          <Text style={styles.subtitle}>
            Take or upload a product‑label photo to see if its ingredients suit
            your skin.
          </Text>

          {photo && (
            <Image source={{ uri: `${photo}` }} style={styles.preview} />
          )}

          <ActionRow
            onCamera={() => pick("camera")}
            onGallery={() => pick("gallery")}
          />

          {showProgress && (
            <View style={{ marginTop: 16, alignItems: "center" }}>
              <Text style={{ fontSize: 16, color: "#888" }}>
                Analyzing... {progress}%
              </Text>
            </View>
          )}

          {photo && (
            <PrimaryButton
              title="Analyze Product"
              onPress={analyzeProduct}
              loading={analyzing}
              style={{ marginTop: 12 }}
            />
          )}

          {prediction && <Text style={styles.result}>🧴 {prediction}</Text>}

          {ingredientInfo?.summary && (
            <Text style={styles.result}>{ingredientInfo.summary}</Text>
          )}

          {photo && prediction && ingredientInfo && (
            <>
              <PrimaryButton
                title="View Scan Details"
                onPress={() =>
                  navigation.navigate("ScanDetails", {
                    ingredientInfo,
                    prediction,
                    recommendations,
                  })
                }
                style={{ marginTop: 12 }}
              />
              <PrimaryButton
                title="Share Results"
                onPress={() =>
                  navigation.navigate("ShareToExplore", {
                    photo: savedImageUrl,
                    prediction,
                    ingredientInfo,
                    recommendations,
                  })
                }
                style={{ marginTop: 12 }}
              />
            </>
          )}
        </LinearGradient>
        {overallCounts && <OverallPieChartCard counts={overallCounts} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { alignItems: "center", paddingBottom: 80 },

  card: {
    width: "90%",
    alignItems: "center",
    padding: 24,
    borderRadius: 24,
    marginTop: 20,
  },
  title: { fontSize: 26, fontWeight: "700", color: "#9E50C8", marginBottom: 8 },
  subtitle: {
    textAlign: "center",
    fontSize: 15,
    color: "#4A4A4A",
    marginBottom: 16,
  },

  preview: {
    width: 220,
    height: 130,
    borderRadius: 12,
    resizeMode: "contain",
    marginBottom: 12,
  },

  result: { marginTop: 16, fontSize: 16, color: "#2e2e2e" },
  resultHeader: { fontSize: 18, fontWeight: "700", marginBottom: 4 },
  ingredientLine: { fontSize: 14, marginBottom: 2 },
  greetingWrapper: {
    width: "90%",
    alignItems: "flex-start",
    marginTop: 20,
    marginBottom: 10,
  },

  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  greeting: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6a1b9a",
  },

  subMessage: {
    fontSize: 16,
    color: "#4a4a4a",
    lineHeight: 20,
    marginTop: 15,
    marginLeft: 10,
  },
  greetingIcon: {
    textShadowColor: "#00000066",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
