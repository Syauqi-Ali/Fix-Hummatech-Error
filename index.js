(async function () {
    'use strict';

    const { document, location } = window;

    if (document.title === 'Server Error') {
        try {
            const response = await fetch('https://pkl.hummatech.com/login');
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const tokenInput = doc.querySelector('input[type="hidden"][name="_token"]');

            if (tokenInput) {
                const loginResponse = await fetch('https://pkl.hummatech.com/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Accept': 'application/json',
                        'X-CSRF-TOKEN': tokenInput.value
                    },
                    body: new URLSearchParams({
                        _token: tokenInput.value,
                        email: 'sauqi2019@gmail.com',
                        password: 'SyauqiAli'
                    })
                });

                if (loginResponse.ok) location.reload();
                else console.error('Login request failed:', loginResponse.statusText);
            }
        } catch (error) {
            console.error("Error handling server error:", error);
        }
    }

    if (location.pathname === "/siswa-offline") {
        // Buat elemen dari HTML string dengan insertAdjacentHTML
        const attendanceCardHTML = `
            <div class="col-lg-7">
              <div class="card w-100 h-100">
                <div class="card-body">
                  <div class="table-responsive">
                    <table class="table search-table align-middle text-nowrap">
                      <thead class="header-item">
                        <tr>
                          <th>Tanggal</th>
                          <th>Masuk</th>
                          <th>Istirahat</th>
                          <th>Kembali</th>
                          <th>Pulang</th>
                        </tr>
                      </thead>
                      <tbody sa-attendances>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>`;

        const journalCardHTML = `
            <div class="col-lg-5">
              <div class="card w-100 h-100">
                <div class="card-body">
                  <div class="table-responsive rounded-2 mb-4">
                    <table class="table border text-nowrap customize-table mb-0 align-middle">
                      <thead class="text-dark fs-4">
                        <tr>
                          <th>
                            <h6 class="fs-4 fw-semibold mb-0">Tanggal</h6>
                          </th>
                          <th>
                            <h6 class="fs-4 fw-semibold mb-0">Aksi</h6>
                          </th>
                        </tr>
                      </thead>
                      <tbody sa-journals>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>`;

        const journalModal = `<div class="modal fade modal-bookmark" id="detail" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-scrollable" role="document">
                <div class="modal-content px-2">
                    <div class="modal-header border-bottom">
                        <h5 class="modal-title me-2" id="exampleModalLabel">Detail Jurnal</h5>
                        <button class="btn-close" type="button" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div id="detail-content">
                    </div>
                    <div class="modal-footer">
                        <div class="d-flex justify-content-end">
                            <button class="purchase-btn btn btn-hover-effect btn-light-danger text-danger f-w-500" type="button" data-bs-dismiss="modal">Tutup</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML("afterbegin", journalModal);

        const container = document.querySelector(".row.gap-2.flex-wrap .col-lg-12>.row");
        if (container) {
            container.insertAdjacentHTML("afterbegin", journalCardHTML);
            container.insertAdjacentHTML("afterbegin", attendanceCardHTML);
        }

        try {
            const parser = new DOMParser();

            const attendanceResponse = await fetch('https://pkl.hummatech.com/siswa-offline/absensi');
            const attendanceHtml = await attendanceResponse.text();
            const attendanceDoc = parser.parseFromString(attendanceHtml, 'text/html');

            const attendanceRow = attendanceDoc.querySelector('div.card.card-body div.table-responsive table.table.search-table.align-middle.text-nowrap tbody tr');
            const attendanceCells = Array.from(attendanceRow.querySelectorAll('td')).slice(1, 6);
            const attendanceTr = document.createElement('tr');

            attendanceCells.forEach(cell => attendanceTr.appendChild(cell.cloneNode(true)));
            document.querySelector("[sa-attendances]").insertAdjacentHTML("afterbegin", attendanceTr.outerHTML);

            const journalResponse = await fetch('https://pkl.hummatech.com/student/data/journal');
            const journalHtml = await journalResponse.text();
            const journalDoc = parser.parseFromString(journalHtml, 'text/html');

            const journalRow = journalDoc.querySelector('div.card .card-body div.table-responsive table.table tbody tr');
            const journalCells = Array.from(journalRow.querySelectorAll('td'));
            const selectedCells = [journalCells[1], journalCells[4]];
            const journalTr = document.createElement('tr');

            selectedCells.forEach(cell => journalTr.appendChild(cell.cloneNode(true)));
            document.querySelector("[sa-journals]").insertAdjacentHTML("afterbegin", journalTr.outerHTML);


        } catch (error) {
            console.error("Error handling server error:", error);
        }

        document.querySelectorAll('.btn-detail').forEach(function (button) {
            button.addEventListener('click', function () {
                var detail = document.getElementById('detail-content');

                if (detail) { // Check if detail is not null
                    detail.innerHTML = ''; // Kosongkan isi detail

                    var id = this.dataset.id;
                    var name = this.dataset.name;
                    var date = this.dataset.date;
                    var school = this.dataset.school;
                    var description = this.dataset.description;
                    var image = this.dataset.image;

                    var modalBody = document.createElement('div');
                    modalBody.classList.add('modal-body');

                    modalBody.innerHTML += `
                        <div class="mb-2">
                            <h6 class="f-w-600">Nama</h6>
                            <p class="text-muted">${name}</p>
                        </div>
                        <div class="mb-2">
                            <h6 class="f-w-600">Tanggal</h6>
                            <p class="text-muted">${date}</p>
                        </div>
                        <div class="mb-2">
                            <h6 class="f-w-600">Sekolah</h6>
                            <p class="text-muted">${school}</p>
                        </div>
                        <div class="mb-2">
                            <h6 class="f-w-600">Kegiatan</h6>
                            <p style="word-wrap: break-word;">${description}</p>
                        </div>
                        <div class="mb-2">
                            <h6 class="f-w-600">Bukti</h6>
                            <img src="${image}" class="img-fluid zoom" style="width:50%; max-width:300px; object-fit:cover">
                        </div>
                    `;

                    detail.appendChild(modalBody);
                    var modalElement = document.getElementById('detail');
                    var modalInstance = new bootstrap.Modal(modalElement);
                    modalInstance.show();
                } else {
                    console.error("Detail content element not found.");
                }
            });
        });

    }

    if (location.pathname === "/login") {
        document.querySelector('#formAuthentication button').addEventListener('click', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            if (email && password) {
                await setAccount(email, password);
            }
        });
    }

    async function getAccount() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['account'], result => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve(result.account);
            });
        });
    }

    async function setAccount(email, password) {
        return new Promise((resolve, reject) => {
            chrome.storage.local.set({ account: { email, password } }, () => {
                if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                else resolve();
            });
        });
    }

})();
