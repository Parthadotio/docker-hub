import express from "express";
import httpProxy from "http-proxy";


const proxyApp = express();
const proxy = httpProxy.createProxy();

proxyApp.use((req, res) => {

  const hostname = req.hostname.split(".")[0];

  return proxy.web(req, res, {
    target: `http://${hostname}:80`,
  });
});

proxyApp.listen(80, () => {
  console.log("Reverse proxy is running on PORT 80");
});

export default proxy;
