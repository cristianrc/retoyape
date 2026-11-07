export const colors = {
  background: '#FAF9FC',
  surface: '#FFFFFF',
  text: '#1A1C1E',
  muted: '#817380',
  primary: '#742284',
  primarySoft: '#FCEBFF',
  border: '#ECE7F2',
  green: '#006B5D',
  danger: '#B33B4A',
  dark: '#171027',
  primaryDeep: '#59006A',
  turquoise: '#57FBDF',
  turquoiseText: '#005045',
  surfaceLow: '#F4F3F6',
};

export const typography = {
  family: 'PlusJakartaSans',
  title: {
    fontFamily: 'PlusJakartaSans',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '800' as const,
    letterSpacing: -0.64,
    color: colors.text,
  },
};
