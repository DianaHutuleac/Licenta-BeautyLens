import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import AnimatedBackground from "../components/background/AnimatedBackground";
import { Ionicons } from "@expo/vector-icons";
import ExploreCommentsModal from "../components/modals/ExploreCommentsModal";

export default function Explore() {
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("recent");

  useEffect(() => {
    if (!token || !user?.id) return;
    const fetchExplorePosts = async (order = "recent") => {
      try {
        const res = await axios.get(
          `http://localhost:8080/explore/posts?sort=${order}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setPosts(res.data);

        const userLiked = new Set();
        res.data.forEach((post) => {
          if (post.likedBy?.includes(user.id)) {
            userLiked.add(post.id);
          }
        });
        setLikedPosts(userLiked);
      } catch (err) {
        console.error("Failed to load explore posts", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts(sortOrder);
  }, [token, user.id, sortOrder]);

  const [likedPosts, setLikedPosts] = useState(new Set());

  const likePost = async (postId) => {
    try {
      await axios.patch(
        `http://localhost:8080/explore/${postId}/like`,
        { userId: user.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(postId)) newSet.delete(postId);
        else newSet.add(postId);
        return newSet;
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likesCount: likedPosts.has(postId)
                  ? post.likesCount - 1
                  : post.likesCount + 1,
              }
            : post
        )
      );
    } catch (err) {
      console.error("Failed to like post", err);
    }
  };

  const renderItem = ({ item }) => {

    return (
      <View style={styles.card}>
        <View style={styles.header}>
          {item.profilePictureUrl ? (
            <Image
              source={{ uri: "http://localhost:8080" + item.profilePictureUrl }}
              style={styles.avatar}
            />
          ) : (
            <Ionicons
              name="person"
              size={28}
              color="#ccc"
              style={[
                { backgroundColor: "#eee", padding: 2, borderRadius: 18 },
              ]}
            />
          )}
          <View style={styles.info}>
            <Text style={styles.name}>
              {item.userName} • {item.skinType?.toUpperCase()}
            </Text>
            <Text style={styles.time}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
        </View>

        <Image
          source={{ uri: `http://localhost:8080/uploads/${item.imageUrl}` }}
          style={styles.image}
        />

        <Text style={styles.result}>{item.resultSummary}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.engagementRow}>
          <TouchableOpacity
            onPress={() => likePost(item.id)}
            style={styles.iconRow}
          >
            <Ionicons
              name={likedPosts.has(item.id) ? "heart" : "heart-outline"}
              size={20}
              color="#A974BF"
            />
            <Text style={styles.actionText}>{item.likesCount ?? 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconRow}
            onPress={() => {
              setSelectedPostId(item.id);
              setCommentsVisible(true);
            }}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#A974BF" />
            <Text style={styles.actionText}>{item.commentsCount ?? 0}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const updateCommentCount = (postId, newCount) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, commentsCount: newCount } : post
      )
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AnimatedBackground />
      <Text style={styles.title}>Explore Shared Results</Text>
      <View style={styles.dropdownWrapper}>
        <TouchableOpacity
          onPress={() => setDropdownOpen(!isDropdownOpen)}
          style={styles.dropdownButton}
        >
          <Text style={styles.dropdownButtonText}>
            {sortOrder === "recent" ? "Most Recent" : "Oldest First"} ▼
          </Text>
        </TouchableOpacity>

        {isDropdownOpen && (
          <View style={styles.dropdown}>
            <TouchableOpacity
              onPress={() => {
                setSortOrder("recent");
                setDropdownOpen(false);
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownItemText}>Most Recent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSortOrder("oldest");
                setDropdownOpen(false);
              }}
              style={styles.dropdownItem}
            >
              <Text style={styles.dropdownItemText}>Oldest First</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator
          color="#9E50C8"
          style={{ marginTop: 40 }}
          size="large"
        />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 60 }}
        />
      )}

      <ExploreCommentsModal
        visible={commentsVisible}
        postId={selectedPostId}
        onClose={() => setCommentsVisible(false)}
        onUpdateCommentCount={updateCommentCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6A2C91",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    fontSize: 15,
  },
  time: {
    fontSize: 12,
    color: "#888",
  },
  image: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 10,
  },
  result: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#444",
  },
  engagementRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 24, // spacing between heart and comment
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#6A2C91",
    fontWeight: "500",
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 10,
    marginBottom: 16,
  },
  dropdownButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  dropdownButtonText: {
    color: "#6A2C91",
    fontSize: 16,
  },
  dropdown: {
    position: "absolute",
    top: 48,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dropdownItem: {
    padding: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    color: "#6A2C91",
  },
});
