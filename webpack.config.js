const path = require("path");

module.exports = {
  mode: "development",
  entry: "./wpsrc/index.ts",
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist",
    port: 8081,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".css"],
  },
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
};
