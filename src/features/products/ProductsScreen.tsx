import { AppHeader } from '../../app/AppHeader';
import React, { useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCatalog } from '../../app/catalog';
import { Feedback, Header } from '../../shared/ui';
import { colors, typography } from '../../shared/theme';
import { Icon } from '../../shared/Icon';
import { formatBalance } from './domain';
import { ProductCard } from './ProductCard';
import { useSecureCard } from './useSecureCard';

export function ProductsScreen() {
  const catalog = useCatalog();
  const secure = useSecureCard();
  const [balanceHidden, setBalanceHidden] = useState(false);
  const scroll = useRef<ScrollViewInstance>(null);
  const cardsTop = useRef(0);
  const bodyTop = useRef(0);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <AppHeader />
      <ScrollView
        ref={scroll}
        style={styles.screen}
        contentContainerStyle={styles.scroll}
      >
        <Header title="Mis productos" />
        {catalog.status === 'loading' && (
          <Feedback loading title="Buscando tus productos…" />
        )}
        {catalog.status === 'error' && (
          <Feedback
            title="No pudimos cargar tus productos"
            description="Inténtalo nuevamente en un momento."
            onRetry={catalog.reload}
          />
        )}
        {catalog.status === 'ready' && (
          <View
            style={styles.body}
            onLayout={event => {
              bodyTop.current = event.nativeEvent.layout.y;
            }}
          >
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Tus cuentas</Text>
              <Text style={styles.count}>
                {catalog.data.accounts.length}{' '}
                {catalog.data.accounts.length === 1
                  ? 'disponible'
                  : 'disponibles'}
              </Text>
            </View>
            {catalog.data.accounts.map(account => (
              <View key={account.id} style={styles.account}>
                <View style={styles.accountTop}>
                  <View style={styles.pig}>
                    <Icon name="pig" size={25} />
                  </View>
                  <View style={styles.accountIdentity}>
                    <Text style={styles.accountName}>{account.alias}</Text>
                    <Text style={styles.accountDetail}>
                      Billetera Principal
                    </Text>
                  </View>
                  <Text style={styles.accountNumber}>
                    {account.maskedNumber}
                  </Text>
                </View>
                <Text style={styles.balanceLabel}>SALDO DISPONIBLE</Text>
                <View style={styles.balanceRow}>
                  <Text style={styles.balance}>
                    {balanceHidden
                      ? 'S/ ••••••'
                      : formatBalance(account.balance)}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      balanceHidden ? 'Mostrar saldo' : 'Ocultar saldo'
                    }
                    accessibilityState={{ expanded: !balanceHidden }}
                    onPress={() => setBalanceHidden(value => !value)}
                    style={styles.eyeButton}
                  >
                    <Icon
                      name={balanceHidden ? 'eyeOff' : 'eye'}
                      color={colors.muted}
                      size={23}
                    />
                  </Pressable>
                </View>
                {!!catalog.data.cards.length && (
                  <View style={styles.accountFooter}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() =>
                        scroll.current?.scrollTo({
                          y: bodyTop.current + cardsTop.current,
                          animated: true,
                        })
                      }
                      style={styles.accountAction}
                    >
                      <Text style={styles.accountActionText}>
                        Ver mis tarjetas
                      </Text>
                      <Icon
                        name="arrow"
                        size={21}
                        color={colors.turquoiseText}
                      />
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
            {!catalog.data.accounts.length && (
              <Feedback title="Aún no tienes cuentas" />
            )}
            <View
              onLayout={event => {
                cardsTop.current = event.nativeEvent.layout.y;
              }}
              style={[styles.sectionHeading, styles.cardsHeading]}
            >
              <Text style={styles.sectionTitle}>Tus tarjetas</Text>
              <Text style={styles.count}>
                {catalog.data.cards.length} activas
              </Text>
            </View>
            {catalog.data.cards.map(card => (
              <ProductCard
                key={card.cardId}
                card={card}
                busy={secure.busy}
                onView={() => secure.open(card.cardId)}
              />
            ))}
            {!catalog.data.cards.length && (
              <Feedback title="Aún no tienes tarjetas" />
            )}
            <View style={styles.securityNote} accessibilityLiveRegion="polite">
              <Icon name="shield" size={23} />
              <Text style={styles.securityText}>{secure.message}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: 28 },
  body: { paddingHorizontal: 20, gap: 12 },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardsHeading: { marginTop: 8 },
  sectionTitle: {
    fontFamily: typography.family,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  count: { fontFamily: typography.family, fontSize: 13, color: '#4F434F' },
  account: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 20,
    elevation: 1,
    shadowColor: colors.primary,
    shadowOpacity: 0.04,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  accountTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  accountIdentity: { flex: 1, minWidth: 135 },
  pig: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: {
    fontFamily: typography.family,
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  accountNumber: {
    fontFamily: typography.family,
    fontSize: 12,
    color: '#4F434F',
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.surfaceLow,
  },
  accountDetail: {
    fontFamily: typography.family,
    fontSize: 12,
    color: colors.muted,
    marginTop: 3,
  },
  balanceLabel: {
    fontFamily: typography.family,
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    marginTop: 18,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'wrap',
  },
  balance: {
    fontFamily: typography.family,
    fontSize: 34,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: -0.9,
    fontVariant: ['tabular-nums'],
  },
  eyeButton: {
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F0EDF3',
    marginTop: 12,
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  accountAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 99,
    backgroundColor: colors.turquoise,
  },
  accountActionText: {
    fontFamily: typography.family,
    color: colors.turquoiseText,
    fontSize: 13,
    fontWeight: '700',
  },
  securityNote: {
    flexDirection: 'row',
    gap: 12,
    padding: 18,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  securityText: {
    fontFamily: typography.family,
    flex: 1,
    fontSize: 12,
    lineHeight: 20,
    color: colors.muted,
  },
});
