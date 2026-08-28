const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.watchFolders = [__dirname];
config.resolver.blockList = [
  /node_modules\/.*/,
  /\.git\/.*/,
  /dist\/.*/,
  /\.expo\/.*/,
];

module.exports = config;