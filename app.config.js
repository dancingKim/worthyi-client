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
      console.log("localIpAddress:",localIpAddress);
      
      const envConfig = {
          preview: {
              OAUTH_BASE_URL: "https://api-dev.worthyilife.com",
              BASE_URL: "https://api-dev.worthyilife.com",
          },
        local: {
            OAUTH_BASE_URL: `http://${localIpAddress}.nip.io:8080`,
            BASE_URL: `http://${localIpAddress}:8080`,
        },
        share: {
            OAUTH_BASE_URL: "https://api-dev.worthyilife.com",
            BASE_URL: "https://api-dev.worthyilife.com",
        },
          development: {
              OAUTH_BASE_URL: "https://api-dev.worthyilife.com",
              BASE_URL: "https://api-dev.worthyilife.com",
          },
          production: {
              OAUTH_BASE_URL: "https://api-dev.worthyilife.com",
              BASE_URL: "https://api-dev.worthyilife.com",
          },
      };
  
      const envSettings = envConfig[ENV] || envConfig.development;
  
      // 디버깅을 위해 현재 ENV 값을 로그에 출력 (빌드 시 제거 가능)
      console.log(`Current APP_ENV: ${ENV}`);
  
      // 프로필에 따른 앱 이름 설정
      const appName = ENV === 'production' ? "Worthy I" : `Worthy I - ${ENV}`;
  
      // 프로필에 따른 iOS bundleIdentifier 설정
      const iosBundleIdentifier = ENV === 'production' ? "com.worthyilife.thanks" : `com.worthyilife.thanks.${ENV}`;
  
      // 프로필에 따른 Android package 설정
      const androidPackage = ENV === 'production' ? "com.worthyilife.thanks" : `com.worthyilife.thanks.${ENV}`;
  
      return {
          ...config,
          name: appName,
          ios: {
              ...config.ios,
              bundleIdentifier: iosBundleIdentifier,
              infoPlist: ENV === 'local' ? {
                  NSAppTransportSecurity: {
                      NSAllowsArbitraryLoads: true,
                      NSExceptionDomains: {
                          localhost: {
                              NSTemporaryExceptionAllowsInsecureHTTPLoads: true,
                              NSIncludesSubdomains: true
                          }
                      }
                  }
              } : {},
          },
          android: {
              ...config.android,
              package: androidPackage,
          },
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