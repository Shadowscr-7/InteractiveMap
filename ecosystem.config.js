module.exports = {
  apps: [
    {
      name: "next-server",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "C:/Users/jgomez/Documents/Projects/OSM/mapa-osm",
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "websocket-server",
      script: "server.js",
      cwd: "C:/Users/jgomez/Documents/Projects/OSM/mapa-osm",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
