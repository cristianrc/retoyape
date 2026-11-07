import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, typography } from './theme';
import { Icon, type IconName } from './Icon';

export function BrandBar({ onSignOut }: { onSignOut?: () => void }) {
  return (
    <View style={styles.brandBar}>
      <Text style={styles.logo} numberOfLines={1} adjustsFontSizeToFit>
        Reto Yape
      </Text>
      {onSignOut && (
        <View style={styles.headerRight}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            onPress={onSignOut}
            style={styles.avatarPill}
          >
            <View style={styles.avatar}>
              <Icon name="user" color="white" size={19} />
            </View>
            <Text style={styles.avatarText}>TÚ</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

export function Header({ title }: { title: string }) {
  return (
    <View style={styles.header}>
      <Text accessibilityRole="header" style={typography.title}>
        {title}
      </Text>
    </View>
  );
}

export function Action({
  label,
  onPress,
  disabled = false,
  secondary = false,
  icon,
}: {
  label: string;
  onPress(): void;
  disabled?: boolean;
  secondary?: boolean;
  icon?: IconName;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        (pressed || disabled) && styles.dim,
      ]}
    >
      {icon && (
        <Icon
          name={icon}
          color={secondary ? colors.primaryDeep : colors.turquoiseText}
          size={21}
        />
      )}
      <Text style={[styles.buttonText, secondary && styles.secondaryText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Feedback({
  loading = false,
  title,
  description,
  onRetry,
}: {
  loading?: boolean;
  title: string;
  description?: string;
  onRetry?(): void;
}) {
  return (
    <View style={styles.feedback} accessibilityLiveRegion="polite">
      {loading && <ActivityIndicator color={colors.primary} size="large" />}
      <Text style={styles.feedbackTitle}>{title}</Text>
      {description && <Text style={styles.subtitle}>{description}</Text>}
      {onRetry && <Action label="Volver a intentar" onPress={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  brandBar: {
    height: 64,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 18 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  logo: {
    fontFamily: typography.family,
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
    flexShrink: 1,
    marginRight: 12,
  },
  avatarPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#8B4298',
    padding: 6,
    paddingRight: 12,
    borderRadius: 30,
  },
  avatar: {
    width: 32,
    height: 32,
    backgroundColor: colors.primaryDeep,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  subtitle: {
    fontFamily: typography.family,
    fontSize: 14,
    lineHeight: 22,
    color: colors.muted,
  },
  button: {
    backgroundColor: colors.turquoise,
    minHeight: 50,
    borderRadius: 99,
    flexDirection: 'row',
    gap: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  buttonText: {
    fontFamily: typography.family,
    color: colors.turquoiseText,
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  secondary: { backgroundColor: colors.primarySoft },
  secondaryText: { color: colors.primaryDeep },
  dim: { opacity: 0.6 },
  feedback: { padding: 28, gap: 16, alignItems: 'center' },
  feedbackTitle: {
    fontFamily: typography.family,
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
});
