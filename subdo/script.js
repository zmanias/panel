document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // KODE UNTUK HALAMAN VALIDASI API KEY (index.html) - TIDAK BERUBAH
    // ===================================================================
    const apiKeyForm = document.getElementById('apiKeyForm');
    if (apiKeyForm) {
        // ... (Kode sama persis seperti sebelumnya)
        apiKeyForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const apiKey = document.getElementById('apiKey').value;
            const messageDiv = document.getElementById('message');
            const submitBtn = document.getElementById('submitBtn');

            submitBtn.disabled = true;
            submitBtn.textContent = 'Memeriksa...';
            messageDiv.textContent = '';

            try {
                const response = await fetch('https://api.fandirr.my.id/apikey/list?masterkey=FANDIRR-DEV');
                const data = await response.json();

                if (data.status === 200) {
                    const isValid = data.data.some(item => item.key === apiKey);
                    if (isValid) {
                        messageDiv.textContent = 'API Key valid! Anda akan diarahkan...';
                        messageDiv.style.color = 'green';
                        sessionStorage.setItem('userApiKey', apiKey);
                        setTimeout(() => {
                            window.location.href = 'create.html';
                        }, 1500);
                    } else {
                        messageDiv.textContent = 'Akses ditolak! API Key tidak valid.';
                        messageDiv.style.color = 'red';
                    }
                } else {
                    messageDiv.textContent = 'Gagal memvalidasi API Key. Coba lagi.';
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Error:', error);
                messageDiv.textContent = 'Terjadi kesalahan jaringan.';
                messageDiv.style.color = 'red';
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Lanjutkan';
            }
        });
    }

    // ===================================================================
    // KODE UNTUK HALAMAN CREATE SUBDOMAIN (create.html) - DIPERBARUI
    // ===================================================================
    const createSubdomainForm = document.getElementById('createSubdomainForm');
    if (createSubdomainForm) {
        if (!sessionStorage.getItem('userApiKey')) {
            window.location.href = 'index.html';
            return;
        }

        const domainSelect = document.getElementById('domain');
        // ✨ Ambil data domain (yang sekarang berisi objek) dari LocalStorage
        const managedDomains = JSON.parse(localStorage.getItem('managedDomains')) || [];
        
        if (managedDomains.length === 0) {
             const option = document.createElement('option');
             option.textContent = 'Tidak ada domain tersedia';
             option.disabled = true;
             domainSelect.appendChild(option);
             document.getElementById('createBtn').disabled = true;
        } else {
            // ✨ Isi dropdown. Value-nya sekarang adalah index dari array.
            managedDomains.forEach((domainData, index) => {
                const option = document.createElement('option');
                option.value = index; // Simpan index sebagai value
                option.textContent = domainData.domain; // Tampilkan nama domain
                domainSelect.appendChild(option);
            });
        }

        createSubdomainForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // ✨ Ambil data berdasarkan index yang dipilih pengguna
            const selectedIndex = domainSelect.value;
            const selectedDomainData = managedDomains[selectedIndex];

            const name = document.getElementById('subdomainName').value;
            const ipvps = document.getElementById('ipAddress').value;
            const messageDiv = document.getElementById('message');
            const createBtn = document.getElementById('createBtn');
            
            // ✨ Gunakan token dan zone ID dinamis dari data yang dipilih
            const domain = selectedDomainData.domain;
            const cfToken = selectedDomainData.token;
            const cfZoneId = selectedDomainData.zoneId;

            createBtn.disabled = true;
            createBtn.textContent = 'Membuat...';
            messageDiv.textContent = '';

            const apiUrl = `https://api.fandirr.my.id/cf/subdomain/create?token=${cfToken}&zone=${cfZoneId}&domain=${domain}&name=${name}&ipvps=${ipvps}`;

            try {
                const response = await fetch(apiUrl);
                const result = await response.json();
                if (result.success) {
                    messageDiv.textContent = `Subdomain ${result.result.name} berhasil dibuat!`;
                    messageDiv.style.color = 'green';
                } else {
                    const errorMessage = result.errors.length > 0 ? result.errors[0].message : 'Gagal membuat subdomain.';
                    messageDiv.textContent = `Error: ${errorMessage}`;
                    messageDiv.style.color = 'red';
                }
            } catch (error) {
                console.error('Error:', error);
                messageDiv.textContent = 'Terjadi kesalahan jaringan.';
                messageDiv.style.color = 'red';
            } finally {
                createBtn.disabled = false;
                createBtn.textContent = 'Buat Subdomain';
            }
        });
    }

    // ===================================================================
    // KODE UNTUK HALAMAN ADMIN LOGIN (admin-login.html) - TIDAK BERUBAH
    // ===================================================================
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        // ... (Kode sama persis seperti sebelumnya)
        adminLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('message');
            const ADMIN_PASSWORD = 'admin123'; 

            if (password === ADMIN_PASSWORD) {
                sessionStorage.setItem('isAdmin', 'true');
                window.location.href = 'admin-dashboard.html';
            } else {
                messageDiv.textContent = 'Password salah!';
                messageDiv.style.color = 'red';
            }
        });
    }
    
    // ===================================================================
    // KODE UNTUK HALAMAN ADMIN DASHBOARD (admin-dashboard.html) - DIPERBARUI
    // ===================================================================
    const adminDashboard = document.getElementById('adminDashboard');
    if (adminDashboard) {
        if (sessionStorage.getItem('isAdmin') !== 'true') {
            window.location.href = 'admin-login.html';
            return;
        }

        // ✨ Logika utama untuk MANAJEMEN DOMAIN + KREDENSIAL
        const domainTableBody = document.querySelector('#domainTable tbody');
        const addDomainForm = document.getElementById('addDomainForm');
        // ✨ Sekarang 'managedDomains' adalah array berisi objek
        let managedDomains = JSON.parse(localStorage.getItem('managedDomains')) || [];

        function renderDomains() {
            domainTableBody.innerHTML = ''; 
            if (managedDomains.length === 0) {
                domainTableBody.innerHTML = '<tr><td colspan="3">Belum ada domain yang ditambahkan.</td></tr>';
                return;
            }
            managedDomains.forEach((data, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${data.domain}</td>
                    <td>${data.zoneId}</td>
                    <td><button class="delete-btn" data-index="${index}">Hapus</button></td>
                `;
                domainTableBody.appendChild(row);
            });
        }
        
        function saveAndRenderDomains() {
            localStorage.setItem('managedDomains', JSON.stringify(managedDomains));
            renderDomains();
        }

        addDomainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newDomain = document.getElementById('newDomain').value.trim().toLowerCase();
            const newCfToken = document.getElementById('newCfToken').value.trim();
            const newCfZoneId = document.getElementById('newCfZoneId').value.trim();
            
            // Validasi sederhana
            if (!newDomain || !newCfToken || !newCfZoneId) {
                alert('Semua field harus diisi!');
                return;
            }

            // Cek duplikasi
            const isDuplicate = managedDomains.some(d => d.domain === newDomain);
            if (isDuplicate) {
                alert('Domain tersebut sudah ada dalam daftar.');
                return;
            }

            // ✨ Tambahkan objek baru ke array
            managedDomains.push({
                domain: newDomain,
                token: newCfToken,
                zoneId: newCfZoneId
            });

            saveAndRenderDomains();
            addDomainForm.reset(); // Kosongkan form
        });

        // ✨ Event listener untuk hapus domain
        domainTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const index = e.target.dataset.index;
                if (confirm(`Yakin ingin menghapus domain ${managedDomains[index].domain}?`)) {
                    managedDomains.splice(index, 1);
                    saveAndRenderDomains();
                }
            }
        });
        
        // --- Logika untuk daftar dan hapus subdomain (perlu sedikit penyesuaian) ---
        async function fetchSubdomains() { /* ... (kode tidak berubah) ... */ }
        async function deleteSubdomain(id, name) {
            // Note: API hapus subdomain Anda tampaknya tidak butuh token/zone spesifik,
            // jadi kita bisa asumsikan ia menggunakan token global dari API endpointnya.
            // Jika butuh, logikanya harus diubah untuk mencari token berdasarkan nama subdomain.
            /* ... (kode tidak berubah) ... */
        }

        // Inisialisasi awal saat halaman dimuat
        renderDomains();
        fetchSubdomains(); 
    }
});