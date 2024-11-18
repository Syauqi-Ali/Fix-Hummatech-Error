(async function () {

  if (document.title === 'Server Error') return;

  const attendanceCardHTML = `
            <div class="col-lg-7">
              <div class="card w-100 h-100">
                <div class="card-body">
                  <div>
                    <div>
                      <h5 class="card-title fw-semibold">Data Absensi</h5>
                      <p class="card-subtitle mb-2">Terbaru</p>
                    </div>
                  </div>
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
                  <div class="d-flex justify-content-between">
                    <div>
                      <h5 class="card-title fw-semibold">Data Jurnal</h5>
                      <p class="card-subtitle mb-2">Terbaru</p>
                    </div>
                    <div>
                      <button type="button" class="btn mb-1 btn-light-primary text-primary btn-lg px-4 fs-4 font-medium ms-3" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Tambah</button>
                    </div>
                  </div>
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

  const zoomCss = `<style>
    
  </style>`;
  document.head.insertAdjacentHTML("afterbegin", zoomCss);

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

    const attendanceCells = Array.from(attendanceRow.querySelectorAll('td'));
    const attendanceSelectedCells = [attendanceCells[1], attendanceCells[3], attendanceCells[4], attendanceCells[5], attendanceCells[6]];
    const attendanceTr = document.createElement('tr');
    attendanceSelectedCells.forEach(cell => attendanceTr.appendChild(cell.cloneNode(true)));
    document.querySelector("[sa-attendances]").append(attendanceTr);

    const journalResponse = await fetch('https://pkl.hummatech.com/student/data/journal');
    const journalHtml = await journalResponse.text();
    const journalDoc = parser.parseFromString(journalHtml, 'text/html');

    const journalRow = journalDoc.querySelector('div.card .card-body div.table-responsive table.table tbody tr');
    const journalCells = Array.from(journalRow.querySelectorAll('td'));
    const selectedCells = [journalCells[1], journalCells[4]];
    const journalTr = document.createElement('tr');

    selectedCells.forEach(cell => journalTr.appendChild(cell.cloneNode(true)));
    document.querySelector("[sa-journals]").append(journalTr);

    const journalCreateModal = journalDoc.getElementById('staticBackdrop');
    document.body.prepend(journalCreateModal);

    const journalEditModal = journalDoc.getElementById('detail');
    document.body.prepend(journalEditModal);
  } catch (error) {
    console.error("Error handling server error:", error);
  }

  document.querySelectorAll('.btn-edit').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = this.getAttribute('data-id');
      var title = this.getAttribute('data-title');
      var description = this.getAttribute('data-description').replace(/<br\s*\/?>/gi, "\n");
      var image = this.getAttribute('data-image');

      document.getElementById('form-update').setAttribute('action', '/siswa-offline/journal/' + id);
      document.getElementById('title-edit').value = title;
      document.getElementById('description-edit').value = description;
      document.getElementById('image-edit').setAttribute('src', image);
      openModal("#modal-edit");
    });
  });

  document.querySelector('input[onchange="preview(event)"]').addEventListener("change", preview);

  function preview(event) {
    var input = event.target;
    var previewImages = document.getElementsByClassName('image-preview');

    if (input.files && input.files[0]) {
      var reader = new FileReader();

      reader.onload = function (e) {
        Array.from(previewImages).forEach(function (previewImage) {
          previewImage.src = e.target.result;
          previewImage.style.display = 'block';
        });
      };

      reader.readAsDataURL(input.files[0]);
    }
  }

  document.querySelectorAll('.btn-detail').forEach(function (button) {
    button.addEventListener('click', function () {
      var detail = document.getElementById('detail-content');
      detail.innerHTML = '';

      var id = this.getAttribute('data-id');
      var name = this.getAttribute('data-name');
      var date = this.getAttribute('data-date');
      var school = this.getAttribute('data-school');
      var description = this.getAttribute('data-description');
      var image = this.getAttribute('data-image');

      var modalBody = document.createElement('div');
      modalBody.classList.add('modal-body');

      modalBody.innerHTML = `
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
      openModal("#detail");
    });
  });

  document.addEventListener("click", function (event) {
    const { body } = document;

    // if (event.target.matches("[data-bs-toggle=modal]")) {
    //   const targetModal = event.target.getAttribute("data-bs-target");
    //   openModal(targetModal);
    // }

    if (event.target.matches("[data-bs-dismiss=modal]")) {
      const modal = event.target.closest(".modal");
      closeModal(modal);
    }
  });

  function openModal(targetModal) {
    const { body } = document;
    const modal = document.querySelector(targetModal);

    modal.classList.add("show");
    modal.style.display = "block";
    body.classList.add("modal-open");
    body.style.overflow = "hidden";

    const backdrop = document.createElement("div");
    backdrop.classList = "modal-backdrop fade show";
    body.append(backdrop);

    backdrop.addEventListener("click", () => closeModal(modal));
  }

  function closeModal(modal) {
    const { body } = document;

    modal.classList.remove("show");
    modal.style.display = "none";

    body.classList.remove("modal-open");
    body.style = "";

    const backdrop = document.querySelector("div.modal-backdrop.fade.show");
    backdrop.remove();
  }

  document.getElementById("description").addEventListener("keyup", function () {
    countCharacters(this);
  });

  function countCharacters(textarea) {
    var textWithoutSpaces = textarea.value.replace(/\s/g, '');
    var count = textWithoutSpaces.length;
    var countElement = document.getElementById('characterCount');
    countElement.innerText = count + ' karakter';

    if (count >= 150) {
      countElement.style.color = 'green';
    } else {
      countElement.style.color = 'red';
    }
  }

  document.addEventListener('click', function (event) {
    if (event.target.classList.contains('zoom')) {
      const src = event.target.getAttribute('src');

      // Buat elemen tampilan zoom
      const zoomedImage = document.createElement('div');
      zoomedImage.classList.add('zoomed-image');

      const closeButton = document.createElement('button');
      closeButton.classList.add('close-btn');

      const img = document.createElement('img');
      img.src = src;
      img.classList.add('img-fluid');

      zoomedImage.appendChild(closeButton);
      zoomedImage.appendChild(img);
      document.body.appendChild(zoomedImage);

      // Menangani zoom gambar dengan klik
      img.addEventListener('click', function () {
        img.classList.toggle('zoomed');
      });

      // Hapus tampilan zoomed saat gambar atau tombol close diklik
      zoomedImage.addEventListener('click', function (e) {
        // Mencegah event click pada gambar dan tombol close
        if (e.target === img || e.target === closeButton) return;
        zoomedImage.remove();
      });

      // Hapus saat tombol close diklik
      closeButton.addEventListener('click', function (e) {
        e.stopPropagation(); // Mencegah event click pada zoomedImage parent
        zoomedImage.remove();
      });
    }
  });


})();