module.exports = {
  dependency: {
    platforms: {
      android: {
        sourceDir: './android',
        packageImportPath: 'import com.io.nativekit.IoNativePackage;',
        packageInstance: 'new IoNativePackage()',
      },
      ios: null,
    },
  },
};
