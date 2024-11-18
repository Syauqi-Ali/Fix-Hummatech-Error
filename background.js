const CONFIG_URL = "https://raw.githubusercontent.com/Syauqi-Ali/Fix-Hummatech-Error/refs/heads/main/config.json";
const CONFIG_TOKEN = 'Token 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';
let PROXY_HOST = null;
let PROXY_PORT = null;
const TARGET_URL = "https://pkl.hummatech.com";
const DAILY_ALARM_NAME = "dailyConfigCheck";

chrome.runtime.onInstalled.addListener(() => {
  fetchConfig().then(() => initializeProxySettings());
  scheduleDailyConfigCheck();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === DAILY_ALARM_NAME) {
    console.log("Daily config check triggered");
    fetchConfig();
  }
});

chrome.tabs.onActivated.addListener(({ tabId }) => handleTab(tabId));
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') handleTab(tabId);
});

// Fetch konfigurasi dari GitHub
async function fetchConfig() {
  try {
    const response = await fetch(CONFIG_URL, {
      headers: {
        Authorization: CONFIG_TOKEN
      }
    });
    if (!response.ok) throw new Error(`Failed to fetch config: ${response.status}`);
    const config = await response.json();

    PROXY_HOST = config.PROXY_HOST;
    PROXY_PORT = config.PROXY_PORT;

    console.log(`Config loaded: ${PROXY_HOST}:${PROXY_PORT}`);
  } catch (error) {
    console.error("Error fetching config:", error);
  }
}

// Inisialisasi pengaturan proxy saat ekstensi diinstal
async function initializeProxySettings() {
  if (!PROXY_HOST || !PROXY_PORT) {
    console.error("Proxy configuration not loaded");
    return;
  }

  const proxyAvailable = await checkProxyAvailability();

  if (proxyAvailable) {
    console.log("Proxy is available");
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

    if (tab?.url?.startsWith(TARGET_URL)) {
      enableStaticProxy();
    }
  } else {
    console.log("Proxy is not available");
    disableProxy();
  }
}

// Fungsi utama untuk menangani perubahan tab
async function handleTab(tabId) {
  if (!PROXY_HOST || !PROXY_PORT) {
    console.error("Proxy configuration not loaded");
    return;
  }

  try {
    const tab = await chrome.tabs.get(tabId);

    if (tab?.url?.startsWith(TARGET_URL)) {
      const proxyAvailable = await checkProxyAvailability();

      if (proxyAvailable) {
        enableStaticProxy();
      } else {
        disableProxy();
      }
    } else {
      disableProxy();
    }
  } catch (error) {
    console.error("Error handling tab:", error);
  }
}

// Mengaktifkan proxy statis
async function enableStaticProxy() {
  chrome.proxy.settings.set(
    {
      value: {
        mode: "fixed_servers",
        rules: {
          singleProxy: { scheme: "http", host: PROXY_HOST, port: parseInt(PROXY_PORT, 10) },
        },
      },
      scope: "regular",
    },
    () => console.log(`Proxy set to ${PROXY_HOST}:${PROXY_PORT}`)
  );
}

// Menonaktifkan proxy
function disableProxy() {
  chrome.proxy.settings.clear(
    { scope: "regular" },
    () => console.log("Proxy cleared")
  );
}

// Mengecek ketersediaan proxy
async function checkProxyAvailability() {
  const proxyURL = `http://${PROXY_HOST}:${PROXY_PORT}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 detik timeout

    const response = await fetch(proxyURL, {
      method: "GET",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error("Error checking proxy availability:", error);
    return false;
  }
}

// Menjadwalkan alarm untuk pengecekan konfigurasi harian
function scheduleDailyConfigCheck() {
  chrome.alarms.create(DAILY_ALARM_NAME, {
    periodInMinutes: 1440, // 1440 menit = 24 jam
  });
  console.log("Daily config check scheduled");
}
