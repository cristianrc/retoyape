import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { Action } from '../../shared/ui';
import { colors, typography } from '../../shared/theme';
import { CardChip, Icon } from '../../shared/Icon';
import { displayExpiry, displayPan, type Card } from './domain';

export function ProductCard({
  card,
  busy,
  onView,
}: {
  card: Card;
  busy: boolean;
  onView(): void;
}) {
  const light = card.brand === 'MASTERCARD';
  return (
    <View style={styles.cardWrapper}>
      <View style={[styles.card, light && styles.lightCard]}>
        <Svg
          style={StyleSheet.absoluteFill}
          width="100%"
          height="100%"
          accessible={false}
        >
          <Defs>
            <LinearGradient
              id={`card-${card.cardId}`}
              x1="100%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <Stop offset="0" stopColor={light ? '#F5F0FC' : '#30113E'} />
              <Stop offset="0.7" stopColor={light ? '#EEE7F8' : '#120C23'} />
              <Stop offset="1" stopColor={light ? '#E7DDF5' : '#1C2B40'} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" fill={`url(#card-${card.cardId})`} />
        </Svg>
        <View style={styles.cardContent}>
          <View style={styles.row}>
            <View style={styles.cardBrand}>
              <Text style={[styles.cardLogo, light && styles.purple]}>
                yape
              </Text>
              {!light && (
                <View style={styles.pro}>
                  <Text style={styles.proText}>PRO</Text>
                </View>
              )}
            </View>
            {light ? (
              <View style={styles.mastercard} accessibilityLabel="Mastercard">
                <View style={styles.redCircle} />
                <View style={styles.orangeCircle} />
              </View>
            ) : (
              <Text style={styles.visa}>VISA</Text>
            )}
          </View>
          <View style={styles.chipRow}>
            <CardChip />
            <Icon
              name="contactless"
              color={light ? '#C3B8CC' : '#8A7E9F'}
              size={26}
            />
          </View>
          <Text
            accessibilityLabel={displayPan(card.maskedPan)}
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.pan, light && styles.ink]}
          >
            {`•••• •••• •••• ${displayPan(card.maskedPan).slice(-4)}`}
          </Text>
          <View style={styles.cardBottom}>
            <View style={styles.typeColumn}>
              <Text style={[styles.cardLabel, light && styles.muted]}>
                TIPO
              </Text>
              <Text style={[styles.alias, light && styles.ink]}>
                {card.alias}
              </Text>
            </View>
            <View style={styles.expiryColumn}>
              <Text style={[styles.cardLabel, light && styles.muted]}>
                VENCE
              </Text>
              <Text
                accessibilityLabel={`Vence ${displayExpiry(card.expiry)}`}
                style={[styles.expiry, light && styles.ink]}
              >
                {displayExpiry(card.expiry)}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <Action
        label={`Ver datos sensibles · ${card.brand}`}
        icon="eye"
        onPress={onView}
        disabled={busy}
        secondary
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardWrapper: { gap: 8, marginBottom: 2 },
  card: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: colors.dark,
  },
  lightCard: { backgroundColor: '#EEE7F8' },
  cardContent: {
    flex: 1,
    padding: 14,
    gap: 4,
    justifyContent: 'space-between',
  },
  cardBrand: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  cardLogo: {
    fontFamily: typography.family,
    color: 'white',
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -2,
  },
  purple: { color: colors.primaryDeep },
  ink: { color: colors.text },
  muted: { color: colors.muted },
  pro: {
    backgroundColor: '#254153',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  proText: {
    fontFamily: typography.family,
    fontSize: 12,
    fontWeight: '800',
    color: '#40E8D0',
  },
  visa: {
    fontFamily: typography.family,
    color: 'white',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    fontStyle: 'italic',
    letterSpacing: 1,
  },
  mastercard: { width: 52, height: 30 },
  redCircle: {
    position: 'absolute',
    left: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#EB001B',
  },
  orangeCircle: {
    position: 'absolute',
    left: 21,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F79E1B',
    opacity: 0.92,
  },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pan: {
    fontFamily: typography.family,
    color: '#E8E7F0',
    fontSize: 19,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 12,
  },
  typeColumn: { flex: 1 },
  expiryColumn: { alignItems: 'flex-end' },
  cardLabel: {
    fontFamily: typography.family,
    color: '#ADA4BA',
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  alias: {
    fontFamily: typography.family,
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  expiry: {
    fontFamily: typography.family,
    color: 'white',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
