module.exports = [{
    test: /\.html$/,
    exclude: /node_modules/,
    use: { loader: 'html-loader' }
}, {
    test: /\.js$/,
    exclude: /node_modules/,
    loader: 'babel-loader'
}]