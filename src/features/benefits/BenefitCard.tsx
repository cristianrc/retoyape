import React from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { colors, typography } from '../../shared/theme';
import { Icon } from '../../shared/Icon';
import type { Benefit } from './domain';

const photos: Record<string, ImageSourcePropType> = {
  '1': require('../../assets/coffee.png'),
  '2': require('../../assets/restaurant.jpg'),
  '3': require('../../assets/cinema.jpg'),
};

export function BenefitCard({
  benefit,
  index,
  total,
  width,
  selected,
  onSelect,
}: {
  benefit: Benefit;
  index: number;
  total: number;
  width: number;
  selected: boolean;
  onSelect(): void;
}) {
  return (
    <View style={[styles.benefit, { width }, selected && styles.selected]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${benefit.title}, ${benefit.promotion}. ${benefit.address}`}
        accessibilityState={{ selected }}
        onPress={onSelect}
        style={styles.benefitBody}
      >
        <View style={styles.benefitTop}>
          <View style={styles.badges}>
            <View style={styles.categoryBadge}>
              <Text style={styles.category}>{benefit.category}</Text>
            </View>
            <View
              style={[
                styles.promotionBadge,
                { backgroundColor: benefit.color },
              ]}
            >
              <Icon
                name={benefit.category === 'ENTRETENIMIENTO' ? 'ticket' : 'tag'}
                color={colors.primaryDeep}
                size={17}
              />
              <Text style={styles.promotion}>{benefit.promotion}</Text>
            </View>
          </View>
          <View style={styles.photo}>
            <Image
              source={photos[benefit.id]}
              style={styles.photoImage}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              accessibilityLabel={`Imagen de ${benefit.title}`}
            />
          </View>
        </View>
        <Text style={styles.benefitTitle}>{benefit.title}</Text>
        <Text style={styles.description}>{benefit.description}</Text>
        <View style={styles.addressRow}>
          <Icon name="pin" size={18} />
          <Text style={styles.address}>{benefit.address}</Text>
        </View>
        <Text style={styles.position}>
          {index + 1} de {total} · Con tus tarjetas Yape
        </Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ver beneficio de ${benefit.title}`}
        onPress={() =>
          Alert.alert(
            benefit.title,
            `${benefit.promotion}\n\n${benefit.description}\n\n${benefit.address}\n\nPromoción ficticia para esta demostración; no canjeable.`,
          )
        }
        style={styles.benefitAction}
      >
        <Text style={styles.benefitActionText}>Ver beneficio</Text>
        <Icon name="arrow" color={colors.turquoiseText} size={21} />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  benefit: {
    borderRadius: 28,
    backgroundColor: colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 1,
  },
  selected: { borderColor: '#E8D6ED' },
  benefitBody: { gap: 13, flex: 1 },
  benefitTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    minHeight: 72,
  },
  badges: { flex: 1, alignItems: 'flex-start', gap: 9 },
  categoryBadge: {
    backgroundColor: '#EEEDF0',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 99,
  },
  category: {
    fontFamily: typography.family,
    fontSize: 8,
    letterSpacing: 0.3,
    color: '#4F434F',
    fontWeight: '800',
  },
  promotionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 99,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  promotion: {
    fontFamily: typography.family,
    color: colors.primaryDeep,
    fontSize: 11,
    fontWeight: '800',
    flexShrink: 1,
  },
  photoImage: { width: '100%', height: '100%' },
  photo: {
    width: 72,
    height: 72,
    overflow: 'hidden',
    borderRadius: 21,
    backgroundColor: colors.surfaceLow,
  },
  benefitTitle: {
    fontFamily: typography.family,
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  description: {
    fontFamily: typography.family,
    color: '#4F434F',
    fontSize: 13,
    lineHeight: 21,
  },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  address: {
    fontFamily: typography.family,
    color: '#4F434F',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  position: {
    fontFamily: typography.family,
    color: colors.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  benefitAction: {
    marginTop: 17,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.turquoise,
    minHeight: 50,
    borderRadius: 99,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  benefitActionText: {
    fontFamily: typography.family,
    color: colors.turquoiseText,
    fontSize: 15,
    fontWeight: '800',
  },
});
