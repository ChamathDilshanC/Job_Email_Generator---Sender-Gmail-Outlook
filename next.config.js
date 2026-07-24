// /** @type {import('next').NextConfig} */
// // const nextConfig = {
// //   compiler: {
// //     // Remove only console.log in production, keep error and warn
// //     removeConsole:
// //       process.env.NODE_ENV === 'production'
// //         ? {
// //             exclude: ['error', 'warn'],
// //           }
// //         : false,
// //   },
// // };

/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    // Remove only console.log in production, keep error and warn
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },
  async redirects() {
    return [
      {
        source: '/privacy-policy',
        destination: '/privacy',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
