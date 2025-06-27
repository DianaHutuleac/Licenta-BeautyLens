// screens/ScanDetails.js
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ScanDetails({ route }) {
  const navigation = useNavigation();
  const { ingredientInfo, prediction, recommendations } = route.params;
  const insets = useSafeAreaInsets();

  console.log("Received recommendations:", recommendations);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🧪 Full Ingredient Breakdown:</Text>

        <Text style={styles.section}>🧴 {prediction}</Text>

        {ingredientInfo.summary && (
          <Text style={styles.section}>{ingredientInfo.summary}</Text>
        )}

        {ingredientInfo.ingredients?.map((ing, idx) => {
          const safetyText = ing.safety?.toLowerCase() || "";
          const descriptionText = ing.description?.toLowerCase() || "";

          let backgroundColor = "#F9F9F9";
          if (
            safetyText.includes("irritation") ||
            safetyText.includes("risk") ||
            safetyText.includes("caution")
          ) {
            backgroundColor = "#ffe6e6";
          } else if (
            safetyText.includes("safe") ||
            safetyText.includes("beneficial")
          ) {
            backgroundColor = "#e7f7e7";
          } else if (
            descriptionText.includes("misspelling") ||
            descriptionText.includes("confusion")
          ) {
            backgroundColor = "#fff8d4";
          }

          return (
            <View
              key={idx}
              style={[styles.ingredientCard, { backgroundColor }]}
            >
              <Text style={styles.ingredientName}>• {ing.name}</Text>
              <Text style={styles.ingredientDesc}>{ing.description}</Text>
              <Text style={styles.ingredientSafety}>Safety: {ing.safety}</Text>
            </View>
          );
        })}

        {recommendations?.length > 0 && (
          <>
            <Text style={styles.subHeader}>🧴 You Might Also Like:</Text>
            {recommendations.map((product, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => Linking.openURL(product.product_url)}
                style={styles.recommendCard}
              >
                <Text style={styles.productName}>{product.product_name}</Text>
                <Text style={styles.productType}>
                  Type: {product.product_type}
                </Text>
                <Text style={styles.productPrice}>Price: {product.price}</Text>
                <Text style={styles.linkText}>Tap to view product 🔗</Text>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 80,
  },
  closeButton: {
    position: "absolute",
    right: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#222",
    marginBottom: 16,
  },
  section: {
    fontSize: 16,
    color: "#333",
    marginBottom: 14,
    lineHeight: 22,
  },
  ingredientCard: {
    marginBottom: 14,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2D9F3",
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
    color: "#5C3A91",
  },
  ingredientDesc: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  ingredientSafety: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
  },
  recommendCard: {
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f4ebfa",
    marginTop: 10,
  },
  productName: {
    fontWeight: "600",
    fontSize: 16,
    color: "#5c3b9c",
  },
  productType: {
    fontSize: 14,
    color: "#444",
  },
  productPrice: {
    fontSize: 14,
    color: "#666",
  },
  linkText: {
    fontSize: 13,
    marginTop: 6,
    color: "#7d4bb1",
    textDecorationLine: "underline",
  },
  headerBar: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 100,
    backgroundColor: "#fff",
    padding: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
