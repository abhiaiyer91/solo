import { ReactNode } from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface SystemWindowProps {
  children: ReactNode;
  variant?: 'default' | 'warning' | 'success' | 'error';
  style?: ViewStyle;
}

const borderColors = {
  default: 'rgba(96, 165, 250, 0.5)', // system-blue/50
  warning: 'rgba(251, 191, 36, 0.5)', // system-gold/50
  success: 'rgba(74, 222, 128, 0.5)', // system-green/50
  error: 'rgba(239, 68, 68, 0.5)',    // system-red/50
};

const glowColors = {
  default: 'rgba(96, 165, 250, 0.1)',
  warning: 'rgba(251, 191, 36, 0.1)',
  success: 'rgba(74, 222, 128, 0.1)',
  error: 'rgba(239, 68, 68, 0.1)',
};

/**
 * SystemWindow - Core UI component for Solo Leveling aesthetic
 * 
 * A panel component with the characteristic blue glow and dark background
 * that matches the System interface from Solo Leveling.
 */
export function SystemWindow({
  children,
  variant = 'default',
  style,
}: SystemWindowProps) {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.container,
        {
          borderColor: borderColors[variant],
          shadowColor: glowColors[variant],
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 15, 20, 0.8)', // system-panel/80
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    // Shadow for glow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
});

/**
 * SystemHeader - Section header component
 */
interface SystemHeaderProps {
  label?: string;
  children: ReactNode;
}

export function SystemHeader({ label = 'SYSTEM', children }: SystemHeaderProps) {
  return (
    <View>
      <View style={headerStyles.labelContainer}>
        <View style={headerStyles.dot} />
        <View style={headerStyles.labelText}>
          {/* Would use Text here but keeping it flexible */}
        </View>
      </View>
      {children}
    </View>
  );
}

const headerStyles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginRight: 8,
  },
  labelText: {
    // For the "SYSTEM" label
  },
});
