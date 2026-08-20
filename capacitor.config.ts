const config = {
  appId: 'com.ioncleaner.app',
  appName: 'Ion Cleaner',
  webDir: 'dist',
  server: {
    url: 'http://192.168.1.101:3000',
    cleartext: true
  },
  plugins: {
    Filesystem: {
      persistDirectory: true
    }
  }
};

export default config;
