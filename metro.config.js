const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = ['tsx', 'ts', 'js', 'jsx'];
config.resolver.resolveRequest = (context, request, platform) => {
  if (request.startsWith('@/')) {
    return context.resolveRequest(
      context,
      request.replace(/^@\/(.*)$/, './src/$1'),
      platform
    );
  }
  return context.resolveRequest(context, request, platform);
};

module.exports = config;