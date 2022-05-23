const path = require('path')

// Export as two seperate libraries
module.exports = [{
  entry: './src/tulons.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'tulons.bundle.js',
    library: 'Tulons',
    libraryExport: 'Tulons',
    libraryTarget: 'var',
  },
  resolve: {
    extensions: ['.ts', '.js', '.json']
  },
  module: {
    rules: [{ test: /.ts$/, use: 'ts-loader' }],
  }
}];
