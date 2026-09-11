const config = {
  appId: 'com.ioncleaner.app',
  appName: 'Ion Cleaner',
  webDir: 'dist',
  backgroundColor: '#0B1120',
  server: {
    allowNavigation: [
      'checkout.razorpay.com',
      'api.razorpay.com',
      '*.razorpay.com',
      'rzp.io',
      '*.rzp.io',
      'accounts.google.com',
      '*.google.com',
      '*.firebaseapp.com',
      '*.googleapis.com'
    ]
  },
  android: {
    backgroundColor: '#0B1120',
    allowMixedContent: true
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

