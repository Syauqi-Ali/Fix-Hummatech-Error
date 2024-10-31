const url = 'https://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@raw.githubusercontent.com/Syauqi-Ali/Fix-Hummatech-Error';
let lastModified = null;

// Atur interval pembaruan dalam satuan jam
const updateInterval = 24; // Misalnya setiap 24 jam
const updateIntervalMs = updateInterval * 60 * 60 * 1000;

async function checkForUpdates() {
    try {
        const response = await fetch(url, {
            method: 'HEAD'
        });

        if (response.ok) {
            const newModified = response.headers.get('Last-Modified');

            if (lastModified !== newModified) {
                console.log('Update detected. Fetching and executing new script...');
                lastModified = newModified;
                await fetchAndExecuteScript();
            } else {
                console.log('No updates found.');
            }
        } else {
            console.error('Failed to check for updates:', response.status);
        }
    } catch (error) {
        console.error('Error checking for updates:', error);
    }
}

async function fetchAndExecuteScript() {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const scriptContent = await response.text();

            // Buat elemen <script> baru untuk mengeksekusi kode
            const script = document.createElement('script');
            script.textContent = scriptContent;
            document.body.appendChild(script);

            console.log('Script executed successfully.');
        } else {
            console.error('Failed to fetch script:', response.status);
        }
    } catch (error) {
        console.error('Error fetching script:', error);
    }
}

// Periksa pembaruan sesuai interval yang diatur
setInterval(checkForUpdates, updateIntervalMs);

// Jalankan pertama kali saat inisialisasi
checkForUpdates();
