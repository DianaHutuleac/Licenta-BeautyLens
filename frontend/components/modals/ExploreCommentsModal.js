import { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../hooks/useAuth";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AnimatedBackground from "../background/AnimatedBackground";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",

    m: "1 min",
    mm: "%d min",
    h: "1 h",
    hh: "%d h",
    d: "1 d",
    dd: "%d d",
    M: "1 mon",
    MM: "%d mon",
    y: "1 y",
    yy: "%d y",
  },
});

export default function ExploreCommentsModal({
  visible,
  onClose,
  postId,
  onUpdateCommentCount,
}) {
  const { user, token } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8080/explore/comments/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(res.data);

      if (onUpdateCommentCount) {
        onUpdateCommentCount(postId, res.data.length);
      }
    } catch (e) {
      console.error("Failed to load comments", e);
    }
  };

  useEffect(() => {
    if (visible) fetchComments();
  }, [visible]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await axios.post(
        "http://localhost:8080/explore/comments/add",
        {
          userId: user.id,
          postId,
          content: newComment,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewComment("");
      fetchComments();
    } catch (e) {
      console.error("Failed to post comment", e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AnimatedBackground />
      <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
        <View style={styles.container}>
          <Text style={styles.title}>Comments</Text>

          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentRow}>
                <Image
                  source={{
                    uri: "http://localhost:8080" + item.profilePictureUrl,
                  }}
                  style={styles.avatar}
                />
                <View style={styles.commentContent}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <Text style={styles.name}>{item.userName}</Text>
                    <Text style={styles.timestamp}>
                      {dayjs(item.createdAt).fromNow()}
                    </Text>
                  </View>
                  <Text style={styles.comment}>{item.content}</Text>
                </View>
              </View>
            )}
          />

          <View style={styles.inputRow}>
            <TextInput
              placeholder="Write a comment..."
              value={newComment}
              onChangeText={setNewComment}
              style={styles.input}
            />
            <TouchableOpacity onPress={handleAddComment}>
              <Ionicons name="send" size={22} color="#9E50C8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={{ position: "absolute", top: 70, right: 16, zIndex: 10 }}
          >
            <Ionicons name="close" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 70 },
  title: { fontSize: 25, fontWeight: "700", marginBottom: 30 },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 25,
    gap: 10,
  },

  commentContent: {
    flexShrink: 1,
    flexGrow: 1,
  },

  comment: {
    fontSize: 14,
    color: "#333",
    flexWrap: "wrap",
  },

  avatar: { width: 36, height: 36, borderRadius: 18 },
  name: { fontWeight: "600", fontSize: 14 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingTop: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  close: { position: "absolute", top: 20, right: 20 },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 1,
  },
});
