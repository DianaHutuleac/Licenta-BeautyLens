import { forwardRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Modalize } from "react-native-modalize";

const ScanDetailsModal = forwardRef(({ ingredientInfo, prediction }, ref) => {
  return (
    <Modalize ref={ref} modalHeight={600} handleStyle={styles.handle}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>🧾 Full Scan Details</Text>
          <TouchableOpacity onPress={() => ref.current?.close()}>
            <Text style={styles.close}>✕</Text>
          </TouchableOpacity>
        </View>

        {prediction && <Text style={styles.section}>🧴 {prediction}</Text>}

        {ingredientInfo?.summary && (
          <Text style={styles.section}>{ingredientInfo.summary}</Text>
        )}
      </ScrollView>
    </Modalize>
  );
});

const styles = StyleSheet.create({
  handle: {
    backgroundColor: "#ccc",
    width: 60,
    height: 5,
    alignSelf: "center",
    borderRadius: 4,
    marginTop: 8,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: { fontSize: 20, fontWeight: "700" },
  close: { fontSize: 20, color: "#333" },
  section: { fontSize: 16, marginVertical: 8 },
});

export default ScanDetailsModal;
