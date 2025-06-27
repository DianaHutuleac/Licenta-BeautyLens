import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import AnimatedBackground from "../components/background/AnimatedBackground";
import { useAuth } from "../hooks/useAuth";
import useAsync from "../hooks/useAsync";
import axios from "axios";
import { updateSkinType } from "../services/userService";
import PrimaryButton from "../components/buttons/PrimaryButton";
import ProfileCard from "../components/cards/ProfileCard";
import ActionRow from "../components/layout/ActionRow";
import DropDownPicker from "react-native-dropdown-picker";
import { Ionicons } from "@expo/vector-icons";

const FLASK_URL = "http://127.0.0.1:5001";
const SPRING_URL = "http://localhost:8080";

export default function Profile() {
  const { user, token, logout, updateUser } = useAuth();

  const [photo, setPhoto] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [showPhoto, setShowPhoto] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [skinType, setSkinType] = useState(user?.skinType || "");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(() => {
    if (!user?.profilePictureUrl) return null;
    return user.profilePictureUrl.startsWith("http")
      ? user.profilePictureUrl
      : `${SPRING_URL}${user.profilePictureUrl}`;
  });

  const skinTypeOptions = [
    { label: "Dry", value: "Dry" },
    { label: "Oily", value: "Oily" },
    { label: "Normal", value: "Normal" },
  ];

  const {
    run: classifySkin,
    loading: analyzing,
    error,
    reset: resetError,
  } = useAsync(async () => {
    const form = new FormData();
    form.append("file", {
      uri: photo,
      name: photo.split("/").pop(),
      type: "image/jpeg",
    });

    const { data } = await axios.post(`${FLASK_URL}/classify_skin`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!data?.skin_type) {
      throw new Error("Server response missing skin type");
    }

    const skinType = data.skin_type;
    setPrediction(skinType);

    await updateSkinType(user.id, skinType, token);
    updateUser({ ...user, skinType });
  });

  useEffect(() => {
    if (error) {
      Alert.alert("Analysis failed", error.message ?? "Please try again.");
      resetError();
    }
  }, [error, resetError]);

  const pickImage = async (source) => {
    const perm =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (perm.status !== "granted") {
      Alert.alert("Permission needed", "Please grant camera / gallery access.");
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: false })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: false });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
      setPrediction(null);
      setConfirmed(false);
      setEditMode(false);
      setShowPhoto(true);
    }
  };
  const handleChangeProfilePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop();

      const formData = new FormData();
      formData.append("file", {
        uri,
        name: filename,
        type: "image/jpeg",
      });

      try {
        const response = await axios.post(
          `${SPRING_URL}/user/${user.id}/upload-profile-picture`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const imageUrl = `${SPRING_URL}${response.data}`;
        setProfilePhoto(imageUrl);
        updateUser({ ...user, profilePictureUrl: imageUrl });
      } catch (error) {
        console.error("Upload failed:", error);
        Alert.alert("Upload Failed", "Could not upload profile picture.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <AnimatedBackground />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Image source={require("../assets/logo.png")} style={styles.logo} />
        <View style={styles.profilePhotoWrapper}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
          ) : (
            <View style={styles.fallbackProfile}>
              <Ionicons name="person" size={48} color="#aaa" />
            </View>
          )}

          <TouchableOpacity
            style={styles.plusButton}
            onPress={handleChangeProfilePhoto}
          >
            <Ionicons name="add-circle" size={30} color="#6a1b9a" />
          </TouchableOpacity>
        </View>

        <ProfileCard user={user} prediction={prediction} />

        <Text style={styles.ctaText}>
          {user?.skinType || prediction
            ? "Update your skin type by scanning again."
            : "Analyze your skin to complete your profile"}
        </Text>

        <ActionRow
          onCamera={() => pickImage("camera")}
          onGallery={() => pickImage("gallery")}
        />

        {photo && (
          <>
            <Image source={{ uri: photo }} style={styles.preview} />
            <PrimaryButton
              title="Start Analysis"
              onPress={classifySkin}
              loading={analyzing}
            />
          </>
        )}

        {prediction && !analyzing && (
          <Text style={styles.result}>Predicted Skin Type: {prediction}</Text>
        )}

        {prediction && !analyzing && !confirmed && !editMode && (
          <>
            <PrimaryButton
              title="Save Skin Type"
              onPress={() => {
                setConfirmed(true);
                setPhoto(null);
              }}
              style={{ marginTop: 10 }}
            />

            <PrimaryButton
              title="Edit Manually"
              onPress={() => setEditMode(true)}
              style={{ backgroundColor: "#aaa", marginTop: 8 }}
            />
          </>
        )}

        {editMode && (
          <View style={{ width: "80%", marginTop: 10, zIndex: 1000 }}>
            <DropDownPicker
              open={dropdownOpen}
              value={skinType}
              items={skinTypeOptions}
              setOpen={setDropdownOpen}
              setValue={(cb) => {
                const selected = cb(skinType);
                setSkinType(selected);
                setPrediction(selected);
                updateSkinType(user.id, selected, token);
                updateUser({ ...user, skinType: selected });
                setConfirmed(true);
                setPhoto(null);
                setEditMode(false);
                return selected;
              }}
              listMode="MODAL" // ✅ Prevents nested VirtualizedList warning
              placeholder="Select skin type..."
              dropDownDirection="BOTTOM" // ✅ Always open downward
              style={{
                backgroundColor: "#f0e6ff",
                borderColor: "#cba4ff",
                marginBottom: 10,
              }}
              dropDownContainerStyle={{
                backgroundColor: "#fafafa",
              }}
            />
          </View>
        )}

        <PrimaryButton
          title="Log out"
          icon="log-out-outline"
          onPress={logout}
          style={{ backgroundColor: "#d9534f", marginTop: 24 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scroll: { alignItems: "center", paddingBottom: 80 },

  logo: { width: 240, height: 200, resizeMode: "contain", marginBottom: 10 },

  subtitle: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
    color: "#9E50C8",
    marginBottom: 12,
  },

  preview: {
    width: 220,
    height: 220,
    borderRadius: 16,
    resizeMode: "cover",
    marginBottom: 12,
  },

  result: { marginTop: 16, fontSize: 18, color: "#2e2e2e" },
  profilePhotoWrapper: {
    position: "relative",
    width: 90,
    height: 90,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  profilePhoto: {
    width: 90,
    height: 90,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#fff",
    backgroundColor: "#eee",
    objectFit: "cover",
  },

  profilePhotoIcon: {
    marginBottom: 12,
  },
  plusButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 16,
  },
  fallbackProfile: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "600",
    textAlign: "center",
    color: "#5A2B8A",
    marginVertical: 12,
    maxWidth: "85%",
    lineHeight: 22,
    alignSelf: "center",
  },
});
