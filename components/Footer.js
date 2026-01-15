import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { colors, spacing, typography, shadows, borderRadius } from '../constants/theme';
import { EMOJI } from '../constants/config';

export const Footer = ({ state, descriptors, navigation }) => {
  const [scaleAnim] = React.useState(new Animated.Value(1));
  const [otherScaleAnims] = React.useState({
    DogProfile: new Animated.Value(0),
    Map: new Animated.Value(0),
    WalkHistory: new Animated.Value(0),
    Analytics: new Animated.Value(0),
  });
  
  const routes = [
    { name: 'DogProfile', icon: EMOJI.dog, label: 'Profil' },
    { name: 'Map', icon: EMOJI.map, label: 'Map' },
    { name: 'Home', icon: EMOJI.home, label: 'Accueil', isCenter: true },
    { name: 'WalkHistory', icon: EMOJI.history, label: 'Historique' },
    { name: 'Analytics', icon: EMOJI.chart, label: 'Stats' },
  ];

  const homeIndex = routes.findIndex(r => r.name === 'Home');
  const isHomeSelected = state.index === homeIndex;
  const currentRoute = routes[state.index];

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isHomeSelected ? 1.15 : 1,
      useNativeDriver: true,
      speed: 10,
    }).start();
  }, [isHomeSelected]);

  React.useEffect(() => {
    routes.forEach((route) => {
      if (route.isCenter) return;
      const isCurrent = currentRoute?.name === route.name;
      Animated.spring(otherScaleAnims[route.name], {
        toValue: isCurrent ? 1 : 0,
        useNativeDriver: true,
        speed: 10,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        {routes.map((route) => {
          const isFocused = state.index === routes.findIndex(r => r.name === route.name);
          const color = isFocused ? colors.primary : colors.textTertiary;

          return (
            <TouchableOpacity
              key={route.name}
              onPress={() => navigation.navigate(route.name)}
              style={[
                styles.tabButton,
                route.isCenter && styles.centerButton,
              ]}
              activeOpacity={0.7}
            >
              {/* Cercle de background pour les écrans non-center */}
              {!route.isCenter && (
                <Animated.View style={[
                  styles.backgroundCircle,
                  { opacity: otherScaleAnims[route.name], transform: [{ scale: otherScaleAnims[route.name] }] },
                ]} />
              )}
              
              <Animated.View style={[
                styles.tabContent,
                route.isCenter && styles.centerTabContent,
                route.isCenter && { transform: [{ scale: scaleAnim }] },
              ]}>
                <Text style={[
                  styles.icon,
                  { fontSize: route.isCenter ? 28 : 18 },
                ]}>
                  {route.icon}
                </Text>
                {!route.isCenter && (
                  <Text style={[
                    styles.label,
                    { color },
                  ]}>
                    {route.label}
                  </Text>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    ...shadows.base,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 80,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  tabContent: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  backgroundCircle: {
    position: 'absolute',
    width: 64,
    height: 48,
    borderRadius: 22,
    backgroundColor: colors.gray200,
  },
  icon: {
    fontSize: 18,
  },
  label: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    color: colors.textTertiary,
  },
  centerButton: {
    marginTop: -spacing.md,
  },
  centerTabContent: {
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.large,
  },
});
