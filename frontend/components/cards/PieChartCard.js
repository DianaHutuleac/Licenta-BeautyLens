import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function PieChartCard({ safetyCounts }) {
  const chartData = [
    {
      name: "Safe",
      count: safetyCounts.safe || 0,
      color: "#4CAF50",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Harmful",
      count: safetyCounts.harmful || 0,
      color: "#F44336",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Neutral",
      count: safetyCounts.neutral || 0,
      color: "#FFC107",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Unknown",
      count: safetyCounts.unknown || 0,
      color: "#9E9E9E",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ].filter((item) => item.count > 0);

  if (chartData.length === 0) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🧪 Ingredient Safety Breakdown</Text>
      <PieChart
        data={chartData}
        width={screenWidth * 0.8}
        height={220}
        chartConfig={{
          color: () => `#000`,
        }}
        accessor={"count"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#6a1b9a",
  },
});
