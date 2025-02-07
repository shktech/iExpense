const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = [...config.resolver.assetExts, "ttf"];

module.exports = withNativeWind(config, { input: './global.css' });
