import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;

export default function OverallPieChartCard({ counts }) {
  const chartData = [
    {
      name: "Safe",
      count: counts.safe,
      color: "#76c893",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Harmful",
      count: counts.harmful,
      color: "#f28482",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Neutral",
      count: counts.neutral,
      color: "#f5cb5c",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
    {
      name: "Unknown",
      count: counts.unknown,
      color: "#9fa8da",
      legendFontColor: "#333",
      legendFontSize: 14,
    },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.title}>🔍 Overall Products Stats</Text>
      <PieChart
        data={chartData}
        width={screenWidth * 0.85}
        height={180}
        chartConfig={{
          color: () => "#000",
        }}
        accessor={"count"}
        backgroundColor={"transparent"}
        paddingLeft={"15"}
        center={[10, 0]}
        absolute
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    padding: 16,
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
    width: "90%",
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#6a1b9a",
  },
});
