import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputInstance,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography } from '../../shared/theme';
import { Action, BrandBar } from '../../shared/ui';
import { Icon } from '../../shared/Icon';
import {
  authenticationMessage,
  loginValidation,
  type Authentication,
} from './authentication';

export function LoginScreen({ signIn }: Pick<Authentication, 'signIn'>) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef(false);
  const passwordInput = useRef<TextInputInstance>(null);

  async function submit() {
    if (pending.current) return;
    const invalid = loginValidation(email, password);
    setError(invalid);
    if (invalid) return;
    pending.current = true;
    setBusy(true);
    Keyboard.dismiss();
    try {
      await signIn(email.trim(), password);
      setPassword('');
    } catch (cause) {
      setError(authenticationMessage(cause));
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <BrandBar />
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.intro}>
            <Text accessibilityRole="header" style={typography.title}>
              Inicia sesión
            </Text>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Correo electrónico</Text>
            <TextInput
              accessibilityLabel="Correo electrónico"
              style={styles.input}
              placeholder="tu@correo.com"
              placeholderTextColor={colors.muted}
              value={email}
              onChangeText={setEmail}
              editable={!busy}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              onSubmitEditing={() => passwordInput.current?.focus()}
            />
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordRow}>
              <TextInput
                ref={passwordInput}
                accessibilityLabel="Contraseña"
                style={[styles.input, styles.password]}
                placeholder="Tu contraseña"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                editable={!busy}
                secureTextEntry={!visible}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                textContentType="password"
                returnKeyType="go"
                onSubmitEditing={submit}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
                accessibilityState={{ disabled: busy }}
                disabled={busy}
                onPress={() => setVisible(!visible)}
                style={styles.eye}
              >
                <Icon
                  name={visible ? 'eyeOff' : 'eye'}
                  color={colors.primary}
                  size={22}
                />
              </Pressable>
            </View>
            {error && (
              <Text
                accessibilityRole="alert"
                accessibilityLiveRegion="polite"
                style={styles.error}
              >
                {error}
              </Text>
            )}
            <View style={styles.submit}>
              <Action
                label={busy ? 'Ingresando…' : 'Ingresar'}
                onPress={submit}
                disabled={busy}
                icon="arrow"
              />
            </View>
          </View>
          <Text style={styles.note}>Usa la cuenta demo del README</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  fill: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: 20, gap: 24, justifyContent: 'center' },
  intro: { gap: 12 },
  form: {
    padding: 20,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  label: {
    fontFamily: typography.family,
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  input: {
    fontFamily: typography.family,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.surfaceLow,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
  },
  passwordRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLow,
    borderRadius: 14,
  },
  password: { flex: 1 },
  eye: { minWidth: 48, alignItems: 'center', justifyContent: 'center' },
  error: {
    fontFamily: typography.family,
    color: colors.danger,
    fontSize: 13,
    lineHeight: 20,
  },
  submit: { marginTop: 10 },
  note: {
    fontFamily: typography.family,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
});
