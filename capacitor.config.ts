const config = {
  appId: 'com.ioncleaner.app',
  appName: 'Ion Cleaner',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Filesystem: {
      persistDirectory: true
    }
  }
};

export default config;
