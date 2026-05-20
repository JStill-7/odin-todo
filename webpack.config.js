const path = require('path');

module.exports = {
  mode: 'development', // Change to 'production' when you're ready to deploy
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
};