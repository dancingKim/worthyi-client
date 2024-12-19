const getLocalIpAddress = () => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

export default ({ config }) => {
    const localIpAddress = getLocalIpAddress();
    const ENV = process.env.NODE_ENV || "local";
    console.log("ENV:", ENV);
    console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
    
    const envConfig = {
        local: {
            OAUTH_BASE_URL: `http://${localIpAddress}.nip.io:8080`,
            BASE_URL: `http://${localIpAddress}:8080`,
        },
        development: {
            OAUTH_BASE_URL: "https://api-dev.worthyi.com",
            BASE_URL: "https://api-dev.worthyi.com",
        },
        production: {
            OAUTH_BASE_URL: "https://api.worthyi.com",
            BASE_URL: "https://api.worthyi.com",
        },
    };

    return {
        ...config,
        extra: {
            eas: {
                projectId: "ba041c45-0229-437a-8d3e-81aba979dd5b"
            },
            ENV,
            ...envConfig[ENV],
            localIpAddress,
        },
        updates: {
            url: "https://u.expo.dev/ba041c45-0229-437a-8d3e-81aba979dd5b"
        }
    };
};