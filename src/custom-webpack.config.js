module.exports = {
  entry: {
    background: 'src/background.ts',
    'content-script': 'src/content-script.ts',
    'injected-script': 'src/injected-script.ts',
  },
  optimization: {
    runtimeChunk: false,
  }
}
