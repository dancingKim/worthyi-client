import os from "os";

function getLocalIpAddress() {
    const interfaces = os.networkInterfaces();
    for (let iface in interfaces) {
        for (let alias of interfaces[iface]) {
            if (alias.family === 'IPv4' && !alias.internal) {
                return alias.address;
            }
        }
    }
    return '127.0.0.1';
}

export default ({config}) => {
    const ENV = process.env.NODE_ENV || 'development';
    const localIpAddress = getLocalIpAddress();
    console.log('localIpAddress', localIpAddress);

    const extra = {
        ENV,
        development: {
            OAUTH_BASE_URL: `http://${localIpAddress}.nip.io:8080`,
            BASE_URL: `http://${localIpAddress}:8080`,
        },
        staging: {},
        production: {},
    };

    return {
        ...config,
        extra: {
            ...extra,
            BASE_URL: extra[ENV]?.BASE_URL,
            OAUTH_BASE_URL: extra[ENV]?.OAUTH_BASE_URL
        },
    };
};

