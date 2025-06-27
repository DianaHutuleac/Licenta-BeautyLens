import { useEffect, useRef } from "react";
import { StyleSheet, Animated, ImageBackground } from "react-native";

export default function AnimatedBackground() {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animate = () => {
      Animated.parallel([
        Animated.loop(
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.5,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ),
      ]).start();
    };
    animate();
  }, []);

  return (
    <>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <ImageBackground
          source={require("../../assets/background.jpg")}
          style={styles.background}
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
  },
});
