
module.exports = {
    apps: [
      {
        name: "api-backend",
        script: "server.js",
        watch: true,
        exec_mode: "cluster", // or "fork" depending on your needs
        instances: 2, // adjust based on your server's capabilities
        // other configuration options...
      },
    ],
  };
