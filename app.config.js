export default ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000',
      SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:3000',
    },
    plugins: [
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "",
          enableGooglePay: false
        }
      ]
    ],
  };
};
