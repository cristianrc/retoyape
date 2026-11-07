import { AppHeader } from '../../app/AppHeader';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { CustomMap } from '@io/native';
import { BenefitCard } from './BenefitCard';
import { useCatalog } from '../../app/catalog';
import { Feedback, Header } from '../../shared/ui';
import { colors, typography } from '../../shared/theme';
import { Icon, type IconName } from '../../shared/Icon';
import {
  eligibleBenefits,
  filterBenefits,
  resolveSelection,
  toMarkers,
  type Benefit,
} from './domain';

const categories: { id: string; label: string; icon: IconName }[] = [
  { id: 'TODOS', label: 'Todos', icon: 'tag' },
  { id: 'RESTAURANTES', label: 'Restaurantes', icon: 'food' },
  { id: 'CAFETERÍAS', label: 'Cafeterías', icon: 'coffee' },
  { id: 'ENTRETENIMIENTO', label: 'Entretenimiento', icon: 'ticket' },
];

export function BenefitsScreen() {
  const catalog = useCatalog();
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const viewportWidth = width - insets.left - insets.right;
  const itemWidth = Math.min(380, Math.max(240, viewportWidth - 40));
  const stride = viewportWidth;
  const list = useRef<FlatList<Benefit>>(null);
  const [selectedId, setSelectedId] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('TODOS');
  const [showCategories, setShowCategories] = useState(true);
  const [ready, setReady] = useState(false);
  const [slowMap, setSlowMap] = useState(false);
  const [mapError, setMapError] = useState('');
  const [mapVersion, setMapVersion] = useState(0);
  const [cameraResetKey, setCameraResetKey] = useState(0);
  const eligible = useMemo(
    () =>
      catalog.status === 'ready'
        ? eligibleBenefits(catalog.data.benefits, catalog.data.cards)
        : [],
    [catalog],
  );
  const benefits = useMemo(
    () => filterBenefits(eligible, query, category),
    [eligible, query, category],
  );
  const markers = useMemo(() => toMarkers(benefits), [benefits]);
  const selection = resolveSelection(benefits, selectedId);
  const selectedIndex = benefits.findIndex(item => item.id === selection);

  useEffect(() => {
    const timer = setTimeout(() => setSlowMap(true), 12000);
    return () => clearTimeout(timer);
  }, [mapVersion]);
  useEffect(() => {
    if (selectedIndex >= 0)
      list.current?.scrollToOffset({
        offset: selectedIndex * stride,
        animated: true,
      });
  }, [stride, selectedIndex]);
  const selectMarker = useCallback(
    (id: string) => {
      if (benefits.some(item => item.id === id)) setSelectedId(id);
    },
    [benefits],
  );
  const onScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(event.nativeEvent.contentOffset.x / stride);
      if (benefits[index]) setSelectedId(benefits[index].id);
    },
    [benefits, stride],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safe}>
      <AppHeader />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Header title="Beneficios" />
        {catalog.status === 'loading' && (
          <Feedback loading title="Buscando beneficios…" />
        )}
        {catalog.status === 'error' && (
          <Feedback
            title="No pudimos cargar los beneficios"
            onRetry={catalog.reload}
          />
        )}
        {catalog.status === 'ready' && !eligible.length && (
          <Feedback
            title="Pronto tendrás nuevos beneficios"
            description="Aquí aparecerán los disponibles para tus tarjetas."
          />
        )}
        {!!eligible.length && (
          <>
            <View style={styles.search}>
              <Icon name="search" color={colors.muted} size={21} />
              <TextInput
                accessibilityLabel="Buscar beneficios"
                placeholder="Buscar comercios, cafés o marcas…"
                placeholderTextColor={colors.muted}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
                returnKeyType="search"
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  showCategories ? 'Ocultar categorías' : 'Mostrar categorías'
                }
                accessibilityState={{ expanded: showCategories }}
                onPress={() => setShowCategories(value => !value)}
                style={styles.filterButton}
              >
                <Icon name="sliders" size={22} />
              </Pressable>
            </View>
            {showCategories && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categories}
                keyboardShouldPersistTaps="handled"
              >
                {categories.map(item => (
                  <Pressable
                    key={item.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Filtrar: ${item.label}`}
                    accessibilityState={{ selected: category === item.id }}
                    onPress={() => setCategory(item.id)}
                    style={[
                      styles.categoryChip,
                      category === item.id && styles.categorySelected,
                    ]}
                  >
                    <Icon
                      name={item.icon}
                      size={17}
                      color={category === item.id ? 'white' : colors.muted}
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        category === item.id && styles.categoryLabelSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {category === item.id && (
                      <View style={styles.selectedDot} />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
            {!benefits.length ? (
              <Feedback
                title="No encontramos beneficios"
                description="Prueba otro comercio o categoría."
                onRetry={() => {
                  setQuery('');
                  setCategory('TODOS');
                }}
              />
            ) : (
              <>
                <View style={styles.mapHeading}>
                  <Text style={styles.sectionTitle}>Cerca de ti</Text>
                  <Text style={styles.resultCount}>
                    {benefits.length}{' '}
                    {benefits.length === 1
                      ? 'beneficio para ti'
                      : 'beneficios para ti'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.map,
                    { height: Math.max(210, Math.min(250, height * 0.26)) },
                  ]}
                >
                  <CustomMap
                    testID="benefits-map"
                    key={mapVersion}
                    style={StyleSheet.absoluteFill}
                    markers={markers}
                    selectedMarkerId={selection}
                    cameraResetKey={cameraResetKey}
                    onMarkerPress={event =>
                      selectMarker(event.nativeEvent.markerId)
                    }
                    onMapReady={() => setReady(true)}
                    onMapError={() => {
                      setMapError(
                        'Mapa no disponible. Puedes explorar los beneficios abajo.',
                      );
                      setSlowMap(true);
                    }}
                    accessibilityLabel="Mapa de beneficios. También puedes elegirlos en las tarjetas inferiores."
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Centrar mapa en todos los beneficios"
                    onPress={() => setCameraResetKey(value => value + 1)}
                    style={styles.centerButton}
                  >
                    <Icon name="target" size={18} />
                    <Text style={styles.centerText}>Ver zona</Text>
                  </Pressable>
                  {!ready && (
                    <View style={styles.mapLoading} pointerEvents="box-none">
                      <Text style={styles.mapLoadingText}>
                        {mapError ||
                          (slowMap
                            ? 'El mapa tarda en responder'
                            : 'Preparando el mapa…')}
                      </Text>
                      {slowMap && (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() => {
                            setReady(false);
                            setSlowMap(false);
                            setMapError('');
                            setMapVersion(value => value + 1);
                          }}
                        >
                          <Text style={styles.retry}>Reintentar</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
                <Text style={styles.hint}>
                  Elige un lugar en el mapa o desliza las tarjetas
                </Text>
                <FlatList
                  testID="benefits-carousel"
                  data={benefits}
                  keyExtractor={item => item.id}
                  horizontal
                  ref={list}
                  contentContainerStyle={[
                    styles.carouselContent,
                    {
                      paddingHorizontal: (viewportWidth - itemWidth) / 2,
                      gap: viewportWidth - itemWidth,
                    },
                  ]}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={stride}
                  decelerationRate="fast"
                  onMomentumScrollEnd={onScrollEnd}
                  getItemLayout={(_, index) => ({
                    length: stride,
                    offset: stride * index,
                    index,
                  })}
                  renderItem={({ item, index }) => (
                    <BenefitCard
                      benefit={item}
                      index={index}
                      total={benefits.length}
                      width={itemWidth}
                      selected={item.id === selection}
                      onSelect={() => selectMarker(item.id)}
                    />
                  )}
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 24 },
  search: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceLow,
    borderRadius: 99,
    paddingLeft: 16,
    paddingRight: 5,
    minHeight: 48,
  },
  searchInput: {
    fontFamily: typography.family,
    fontSize: 13,
    color: colors.text,
    flex: 1,
    paddingVertical: 12,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#EEEDF0',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categories: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 22,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 15,
    paddingVertical: 13,
    borderRadius: 99,
    backgroundColor: '#EEEDF0',
    minHeight: 48,
  },
  categorySelected: { backgroundColor: colors.primary },
  categoryLabel: {
    fontFamily: typography.family,
    fontSize: 12,
    fontWeight: '700',
    color: '#4F434F',
  },
  categoryLabelSelected: { color: 'white' },
  selectedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.turquoise,
  },
  mapHeading: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: typography.family,
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  resultCount: {
    fontFamily: typography.family,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  map: {
    marginHorizontal: 20,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#EEEAF2',
  },
  centerButton: {
    position: 'absolute',
    bottom: 27,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.surface,
    borderRadius: 99,
    paddingHorizontal: 13,
    minHeight: 48,
    elevation: 3,
  },
  centerText: {
    fontFamily: typography.family,
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  mapLoading: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  mapLoadingText: {
    fontFamily: typography.family,
    fontSize: 12,
    color: colors.muted,
  },
  retry: {
    fontFamily: typography.family,
    color: colors.primary,
    padding: 12,
    fontWeight: '700',
  },
  hint: {
    fontFamily: typography.family,
    fontSize: 11,
    lineHeight: 18,
    color: colors.muted,
    marginHorizontal: 24,
    marginTop: 15,
    marginBottom: 21,
    textAlign: 'center',
  },
  carouselContent: {
    paddingHorizontal: 20,
    gap: 14,
    paddingBottom: 12,
    alignItems: 'stretch',
  },
});
