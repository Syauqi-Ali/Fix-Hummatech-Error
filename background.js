const PROXY_HOST = "de01.uniplex.xyz";
const PROXY_PORT = 1523;

chrome.runtime.onInstalled.addListener(enableStaticProxy);

function enableStaticProxy() {
  chrome.proxy.settings.set(
    {
      value: {
        mode: "fixed_servers",
        rules: {
          singleProxy: { scheme: "http", host: PROXY_HOST, port: PROXY_PORT }
        }
      },
      scope: "regular"
    },
    () => console.log(`Proxy set to ${PROXY_HOST}:${PROXY_PORT}`)
  );
}