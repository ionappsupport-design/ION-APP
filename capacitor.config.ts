const config = {
  appId: 'com.ioncleaner.app',
  appName: 'Ion Cleaner',
  webDir: 'dist',
  backgroundColor: '#0B1120',
  android: {
    backgroundColor: '#0B1120',
  },
  plugins: {
    Filesystem: {
      persistDirectory: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com']
    }
  }
};

export default config;
