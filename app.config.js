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
    const ENV = process.env.NODE_ENV || "development";
    console.log("Build ENV:", ENV);
    
    const envConfig = {
        development: {
            OAUTH_BASE_URL: `http://${localIpAddress}.nip.io:8080`,
            BASE_URL: `http://${localIpAddress}:8080`,
        },
        preview: {
            OAUTH_BASE_URL: "https://api-dev.worthyilife.com",
            BASE_URL: "https://api-dev.worthyilife.com",
        },
        preview_simulator: {
            OAUTH_BASE_URL: "https://api-dev.worthyilife.com",
            BASE_URL: "https://api-dev.worthyilife.com",
        },
        production: {
            OAUTH_BASE_URL: "https://api.worthyilife.com",
            BASE_URL: "https://api.worthyilife.com",
        },
    };

    const envSettings = envConfig[ENV] || envConfig.development;

    return {
        ...config,
        extra: {
            eas: {
                projectId: "ba041c45-0229-437a-8d3e-81aba979dd5b"
            },
            ENV,
            localIpAddress,
            ...envSettings,
        },
        updates: {
            url: "https://u.expo.dev/ba041c45-0229-437a-8d3e-81aba979dd5b"
        }
    };
};