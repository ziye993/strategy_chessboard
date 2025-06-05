module.exports = {
    test: /\.css$/,
    use: [
        'style-loader',
        'css-loader',
        'postcss-loader', // 添加 PostCSS 处理
    ],
}