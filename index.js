const http = require("http");
const app = require("./app");
const { API_PORT } = process.env;

const server = http.createServer(app);

const port = process.env.PORT || API_PORT;

server.listen(port, () => {
  console.log(`server listening @ port ${port}`);
});
