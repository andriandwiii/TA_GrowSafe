import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withSequence, 
  withTiming, 
  withDelay, 
  Easing 
} from 'react-native-reanimated';

interface CustomLoadingProps {
  message?: string;
  color?: string;
  fullScreen?: boolean;
}

const Dot = ({ delay, color }: { delay: number, color: string }) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 300, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 300, easing: Easing.in(Easing.ease) }),
          withTiming(0, { duration: 600 }) // Pause di bawah
        ),
        -1, // Infinite repeat
        false // Do not reverse
      )
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return <Animated.View style={[styles.dot, animatedStyle, { backgroundColor: color }]} />;
};

const CustomLoading: React.FC<CustomLoadingProps> = ({ 
  message = "Memuat data...", 
  color = "#16A34A",
  fullScreen = false 
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <View style={styles.dotsContainer}>
        <Dot delay={0} color={color} />
        <Dot delay={150} color={color} />
        <Dot delay={300} color={color} />
      </View>
      {message ? <Text style={[styles.messageText, { color }]}>{message}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    zIndex: 999,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 6,
  },
  messageText: {
    marginTop: 12,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  }
});

export default CustomLoading;
