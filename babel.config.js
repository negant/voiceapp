module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
        safe: false,
        allowUndefined: true,
      },
    ],
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          '@': './src',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
