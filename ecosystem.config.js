module.exports = {
  apps: [
    {
      name: 'bles-backend',
      script: 'npx',
      args: 'tsx src/server.ts',
      interpreter: 'none',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'bles-frontend',
      script: 'npm',
      args: 'run start',
      interpreter: 'none',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
