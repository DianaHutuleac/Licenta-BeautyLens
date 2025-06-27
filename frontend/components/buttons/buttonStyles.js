import { StyleSheet } from "react-native";

export default StyleSheet.create({
  primary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#B580F2",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 28,
  },
  primaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  circle: {
    width: 62,
    height: 62,
    borderRadius: 50,
    backgroundColor: "#f1dcff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  welcomeButton: {
    borderRadius: 100,
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#A974FF",
  },

  welcomeText: {
    color: "#A974FF",
    fontSize: 16,
    fontWeight: "700",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
});
