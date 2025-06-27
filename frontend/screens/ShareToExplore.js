import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import PrimaryButton from "../components/buttons/PrimaryButton";

export default function ShareToExplore({ route, navigation }) {
  const { photo, prediction, ingredientInfo, recommendations } = route.params;
  const { user, token } = useAuth();

  console.log("Received recommendations:", recommendations);

  const [mode, setMode] = useState("positive");

  const [productName, setProductName] = useState("");

  const harmfulIngredients = ingredientInfo?.ingredients
    ?.filter((ing) => ing.safety?.toLowerCase().includes("harmful"))
    .map((ing) => ing.name)
    .join(", ");

  const recommendedList =
    Array.isArray(recommendations) && recommendations.length > 0
      ? recommendations.map((r) => r.name).filter(Boolean)
      : [];

  const recommended = recommendedList.join(", ");

  const [description, setDescription] = useState("");

  useEffect(() => {
    const name = productName || "this product";

    const topRecommendations = Array.isArray(recommendations)
      ? recommendations
          .slice(0, 2)
          .map((r) => r.product_name)
          .filter(Boolean)
          .join(", ")
      : "";

    const message =
      mode === "concern"
        ? `I scanned ${name} and it seems that ${
            harmfulIngredients || "some ingredients"
          } might not be ideal for ${user.skinType?.toLowerCase()} skin.` +
          (topRecommendations
            ? ` The app suggested: ${topRecommendations}.`
            : "") +
          ` Has anyone tried these?`
        : mode === "positive"
        ? `I’ve been using ${name} and it really helped my ${user.skinType?.toLowerCase()} skin. I recommend it!`
        : `Sharing my scan of ${name} — feel free to share your thoughts or experiences with it.`;

    setDescription(message);
  }, [mode, productName, recommendations]);

  const handleSubmit = async () => {
    try {
      await axios.post(
        "http://localhost:8080/explore/post",
        {
          userId: user.id,
          description,
          imageUrl: photo,
          resultSummary: prediction,
          ingredientInfoJson: JSON.stringify(ingredientInfo),
          recommendationsJson: JSON.stringify(recommendations),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert("Post shared!", "Your scan has been posted to Explore.");
      navigation.navigate("Tabs", { screen: "Explore" });
    } catch (err) {
      console.error("Failed to share scan", err);
      Alert.alert("Failed", "Could not share the post.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Share Your Scan</Text>
        <Image
          source={{ uri: `http://localhost:8080/uploads/${photo}` }}
          style={styles.image}
        />

        <TextInput
          placeholder="Enter product name (optional)"
          placeholderTextColor="#aaa"
          value={productName}
          onChangeText={setProductName}
          style={styles.productInput}
        />
        <View style={styles.segmentRow}>
          {[
            { key: "concern", label: "🤔 Concern" },
            { key: "positive", label: "😊 Recommend" },
            { key: "other", label: "📝 Other" },
          ].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.segmentButton,
                mode === key && styles.segmentSelected,
              ]}
              onPress={() => setMode(key)}
            >
              <Text
                style={[
                  styles.segmentText,
                  mode === key && styles.segmentTextSelected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <PrimaryButton
          title="Create Post"
          onPress={handleSubmit}
          style={styles.createButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6A2C91",
    marginBottom: 16,
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    resizeMode: "contain",
    marginBottom: 16,
  },
  productInput: {
    backgroundColor: "#f0ebf9",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 16,
    color: "#333",
  },
  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#f0ebf9",
    borderRadius: 20,
    padding: 4,
    marginBottom: 16,
    justifyContent: "center",
    gap: 6,
  },
  segmentButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#f0ebf9",
  },
  segmentSelected: {
    backgroundColor: "#A974BF",
  },
  segmentText: {
    fontSize: 14,
    color: "#6A2C91",
    fontWeight: "500",
  },
  segmentTextSelected: {
    color: "#fff",
  },
  input: {
    backgroundColor: "#f9f3ff",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
    minHeight: 120,
  },
  createButton: {
    alignSelf: "center",
    marginTop: 12,
    paddingHorizontal: 30,
  },
});
