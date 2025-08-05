// Node.js built-in module for working with file paths
const path = require("path");

// Webpack plugin to generate an HTML file from a template
const HtmlWebpackPlugin = require("html-webpack-plugin");

// Webpack plugin for React Fast Refresh (Hot Module Replacement)
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

// A variable to check if we are in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  // Sets the mode for webpack to 'development' or 'production'.
  // This enables optimizations for each environment.
  mode: isDevelopment ? 'development' : 'production',

  // The entry point of your application. Webpack starts bundling from here.
  // We've set this to the path you specified.
  entry: "./src/components/index.js",

  // Where to output the bundled files
  output: {
    // The filename of the bundled JavaScript.
    filename: "bundle.js",
    // The absolute path to the output directory.
    path: path.resolve(__dirname, "dist"),
    // The public URL of the output directory when referenced in a browser.
    // This is crucial for client-side routing (React Router).
    publicPath: "/",
    // Cleans the /dist folder before each build, so you only have generated files.
    clean: true,
  },

  // Configuration for the webpack-dev-server
  devServer: {
    // The port to run the server on.
    port: 3000,
    // Automatically open the browser when the server starts.
    open: true,
    // Enable Hot Module Replacement (HMR).
    hot: true,
    // For Single Page Applications (like React), this redirects all 404s to /index.html.
    // This allows React Router to handle routing.
    historyApiFallback: true,
  },

  // Rules for how to handle different types of files (modules)
  module: {
    rules: [
      // Rule for JavaScript and JSX files
      {
        test: /\.(js|jsx)$/, // Look for .js and .jsx files
        exclude: /node_modules/, // Don't transpile code from node_modules
        use: {
          loader: "babel-loader",
          options: {
            presets: [
                "@babel/preset-env", // Transpiles modern JavaScript down to ES5
                ["@babel/preset-react", { "runtime": "automatic" }] // Transpiles JSX and enables modern React features
            ],
            // This plugin is for React Fast Refresh
            plugins: [
              isDevelopment && require.resolve('react-refresh/babel')
            ].filter(Boolean), // .filter(Boolean) removes false values in production
          },
        },
      },
      // Rule for CSS files
      {
        test: /\.css$/, // Look for .css files
        use: [
            "style-loader", // 2. Injects styles into the DOM
            "css-loader"    // 1. Translates CSS into CommonJS
        ],
      },
      // Rule for image files (png, svg, jpg, jpeg, gif)
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource', // Uses Webpack 5's built-in asset modules
      },
    ],
  },

  // This allows you to import modules without specifying their extension
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  
  // Plugins to enhance webpack's functionality
  plugins: [
    // Generates an index.html file with the bundled javascript injected.
    new HtmlWebpackPlugin({
      // Path to your HTML template
      template: "./public/index.html",
    }),
    
    // This plugin enables React Fast Refresh.
    // It's only added in development mode for better performance.
    isDevelopment && new ReactRefreshWebpackPlugin(),

  ].filter(Boolean), // .filter(Boolean) is a trick to remove any 'false' items from the array
};