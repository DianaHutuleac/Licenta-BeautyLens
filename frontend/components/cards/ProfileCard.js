import { View, Text } from "react-native";
import styles from "./cardStyles";

const toTitle = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

export default function ProfileCard({ user, prediction }) {
  const Row = ({ label, value }) => (
    <Text style={styles.row}>
      <Text style={styles.rowLabel}>{label}: </Text>
      <Text style={styles.rowValue}>{value}</Text>
    </Text>
  );

  return (
    <View style={styles.card}>
      <Row label="Name" value={`${user?.firstName} ${user.lastName}`} />
      <Row label="Email" value={user?.email} />
      <Row label="Gender" value={toTitle(user?.gender)} />
      <Row label="Age" value={user?.age} />
      {(user?.skinType || prediction) && (
        <Row label="Skin Type" value={toTitle(prediction || user?.skinType)} />
      )}
    </View>
  );
}
