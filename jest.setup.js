/* global jest */
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('@io/native', () => ({
  CustomMap: 'IoMap',
  IoSecurity: {
    requestMockSecureToken: jest.fn().mockResolvedValue('opaque-test-token'),
    requestDemoToken: jest.fn().mockResolvedValue('opaque-demo-token'),
    openSecureView: jest.fn().mockResolvedValue(undefined),
    onSecureEvent: jest.fn(() => ({ remove: jest.fn() })),
  },
}));

jest.mock('react-native-svg', () => ({
  __esModule: true,
  default: 'Svg',
  Circle: 'SvgCircle',
  Path: 'SvgPath',
  Rect: 'SvgRect',
  Defs: 'SvgDefs',
  LinearGradient: 'SvgLinearGradient',
  Stop: 'SvgStop',
}));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(() => jest.fn()),
  signInWithEmailAndPassword: jest.fn().mockResolvedValue({}),
  signOut: jest.fn().mockResolvedValue(undefined),
}));
