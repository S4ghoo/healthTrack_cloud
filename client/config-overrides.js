const { override, addWebpackResolve } = require('customize-cra');

module.exports = override(
    addWebpackResolve({
        fallback: {
            path: require.resolve('path-browserify'),
            crypto: require.resolve('crypto-browserify'),
            stream: require.resolve('stream-browserify'),
            timers: require.resolve('timers-browserify'),
            os: require.resolve('os-browserify/browser'),
            buffer: require.resolve('buffer/'),
            util: require.resolve('util/'),
            querystring: require.resolve('querystring-es3'),
            http: require.resolve('stream-http'),
            url: require.resolve('url/'),
            fs: false,
            net: false,
            tls: false,
            zlib: false,
            dns: false,
            child_process: false,
            'fs/promises': false,
            'timers/promises': false,
            process: false
        }
    })
);