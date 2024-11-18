// index.js
document.addEventListener("DOMContentLoaded", async () => {
    'use strict';

    const { pathname, origin } = location;

    // Constants
    const API = {
        LOGIN: `${origin}/login`,
        STORAGE_KEY: 'account'
    };

    // Handle server error case
    if (document.title === 'Server Error') {
        await handleServerError();
    }

    // Handle login page
    if (pathname === "/login") {
        setupLoginHandler();
    }

    // Main error handler
    async function handleServerError() {
        try {
            const token = await fetchCSRFToken();
            if (!token) throw new Error('CSRF token not found');

            const account = await getAccount();
            if (!account) throw new Error('No stored credentials');

            await attemptLogin(token, account);
        } catch (error) {
            console.error("Error handling server error:", error);
            location.href = API.LOGIN;
        }
    }

    // Fetch CSRF token
    async function fetchCSRFToken() {
        const response = await fetch(API.LOGIN);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.querySelector('input[type="hidden"][name="_token"]')?.value;
    }

    // Attempt login
    async function attemptLogin(token, account) {
        const response = await fetch(API.LOGIN, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': token
            },
            body: new URLSearchParams({
                _token: token,
                ...account
            })
        });

        if (response.ok) {
            location.reload();
        } else {
            throw new Error(`Login failed: ${response.statusText}`);
        }
    }

    // Setup login form handler
    function setupLoginHandler() {
        const loginButton = document.querySelector('#formAuthentication button');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');

        loginButton?.addEventListener('click', async (e) => {
            e.preventDefault();

            const email = emailInput?.value;
            const password = passwordInput?.value;

            if (email && password) {
                await setAccount(email, password);
            }
        });
    }

    // Storage helpers with better error handling
    async function getAccount() {
        return new Promise((resolve) => {
            chrome.storage.local.get([API.STORAGE_KEY], ({ account, error }) => {
                if (error || !account) {
                    console.warn('Failed to get account:', error);
                    resolve(null);
                    return;
                }
                resolve(account);
            });
        });
    }

    async function setAccount(email, password) {
        return new Promise((resolve) => {
            const account = { email, password };
            chrome.storage.local.set({ [API.STORAGE_KEY]: account }, () => {
                const error = chrome.runtime.lastError;
                if (error) {
                    console.warn('Failed to save account:', error);
                    resolve(false);
                    return;
                }
                resolve(true);
            });
        });
    }
});