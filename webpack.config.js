/*
  Okay folks, want to learn a little bit about webpack?
*/

const path = require('path');
const webpack = require('webpack');
const WebPackBar = require('webpackbar');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const autoprefixer = require('autoprefixer');
/*
  webpack sees every file as a module.
  How to handle those files is up to loaders.
  We only have a single entry point (a .js file) and everything is required from that js file
*/

const postcss = {
  loader: 'postcss-loader',
  options: {
    plugins() {
      return [autoprefixer({
        browsers: 'last 3 versions'
      })];
    },
  },
};

// OK - now it's time to put it all together
const config = {
  entry: {
    // we only have 1 entry, but I've set it up for multiple in the future
    app: './public/javascripts/delicious-app.js',
  },
  // we're using sourcemaps and here is where we specify which kind of sourcemap to use
  devtool: 'source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        uglifyOptions: {
          compress: false,
          ecma: 6,
          mangle: true,
        },
        sourceMap: true,
      }),
    ],
  },
  // Once things are done, we kick it out to a file.
  output: {
    // path is a built in node module
    // __dirname is a variable from node that gives us the
    path: path.resolve(__dirname, 'public', 'dist'),
    // we can use "substitutions" in file names like [name] and [hash]
    // name will be `app` because that is what we used above in our entry
    filename: '[name].bundle.js',
  },

  // remember we said webpack sees everthing as modules and how different loaders are responsible for different file types? Here is is where we implement them. Pass it the rules for our JS and our styles
  module: {
    rules: [{
        test: /\.(js)$/, // see how we match anything that ends in `.js`? Cool
        use: [{
          loader: 'babel-loader',
          options: {
            presets: ['@babel/env']
          },
        }],
      },
      {
        // here we pass the options as query params b/c it's short.
        // remember above we used an object for each loader instead of just a string?
        // We don't just pass an array of loaders, we run them through the extract plugin so they can be outputted to their own .css file
        rules: [{
          test: /\.(scss)$/,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader?sourceMap',
            postcss,
            'sass-loader?sourceMap',
          ],
        }],
      },
    ],
  },
  // finally we pass it an array of our plugins
  plugins: [
    new WebPackBar(),
    // here is where we tell it to output our css to a separate file
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: 'style.css',
    }),
  ],
};
// webpack is cranky about some packages using a soon to be deprecated API. shhhhhhh
// process.noDeprecation = true;

module.exports = config;
