module.exports = {
  apps: [
    {
      // Application name to be shown in pm2 list
      name: "abin-app",

      // The script to run (your compiled JS entry point)
      script: "./build/app.js",

      // Watch files for changes and automatically restart (useful for dev, not production)
      watch: false,

      // Environment variables for production mode
      env: {
        NODE_ENV: "production",
        PORT: 5000
      },

      // Environment variables for development mode
      env_development: {
        NODE_ENV: "development",
        PORT: 5000
      }
    }
  ]
};
