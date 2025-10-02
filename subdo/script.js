document.addEventListener('DOMContentLoaded', () => {

    // ===================================================================
    // KODE UNTUK HALAMAN VALIDASI API KEY (index.html)
    // ===================================================================
    const apiKeyForm = document.getElementById('apiKeyForm');
    if (apiKeyForm) {
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
    // KODE UNTUK HALAMAN CREATE SUBDOMAIN (create.html)
    // ===================================================================
    const createSubdomainForm = document.getElementById('createSubdomainForm');
    if (createSubdomainForm) {
        if (!sessionStorage.getItem('userApiKey')) {
            window.location.href = 'index.html';
            return;
        }

        const domainSelect = document.getElementById('domain');
        let managedDomains = [];

        // Fungsi untuk mengambil data dari domains.json via GitHub Raw URL
        async function loadDomainsFromGithub() {
            // Ganti dengan username, nama repo, dan branch Anda
            const GITHUB_USERNAME = 'zmanias';
            const GITHUB_REPO = 'panel/refs/heads';
            const GITHUB_BRANCH = 'main/subdo';
            const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/${GITHUB_BRANCH}/domains.json`;

            try {
                // Tambahkan parameter acak untuk menghindari cache browser
                const response = await fetch(`${GITHUB_RAW_URL}?t=${new Date().getTime()}`);
                if (!response.ok) throw new Error('Gagal memuat domains.json dari GitHub');
                
                managedDomains = await response.json();
                
                if (managedDomains.length === 0) {
                    const option = document.createElement('option');
                    option.textContent = 'Tidak ada domain tersedia';
                    option.disabled = true;
                    domainSelect.appendChild(option);
                    document.getElementById('createBtn').disabled = true;
                } else {
                    managedDomains.forEach((domainData, index) => {
                        const option = document.createElement('option');
                        option.value = index;
                        option.textContent = domainData.domain;
                        domainSelect.appendChild(option);
                    });
                }

            } catch (error) {
                console.error(error);
                const option = document.createElement('option');
                option.textContent = 'Error memuat domain';
                option.disabled = true;
                domainSelect.appendChild(option);
                document.getElementById('createBtn').disabled = true;
            }
        }
        
        loadDomainsFromGithub();
        
        createSubdomainForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const selectedIndex = domainSelect.value;
            if (selectedIndex === '' || !managedDomains[selectedIndex]) {
                alert('Silakan pilih domain yang valid.');
                return;
            }
            const selectedDomainData = managedDomains[selectedIndex];

            const name = document.getElementById('subdomainName').value;
            const ipvps = document.getElementById('ipAddress').value;
            const messageDiv = document.getElementById('message');
            const createBtn = document.getElementById('createBtn');
            
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
    // KODE UNTUK HALAMAN ADMIN LOGIN (admin-login.html)
    // ===================================================================
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
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
    // KODE UNTUK HALAMAN ADMIN DASHBOARD (admin-dashboard.html)
    // ===================================================================
    const adminDashboard = document.getElementById('adminDashboard');
    if (adminDashboard) {
        if (sessionStorage.getItem('isAdmin') !== 'true') {
            window.location.href = 'admin-login.html';
            return;
        }

        // --- KONFIGURASI GITHUB (Sama seperti sebelumnya) ---
        const githubConfig = {
            username: 'zmanias',
            repo: 'panel',
            branch: 'main/subdo',
            filePath: 'domains.json',
            token: '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'
        };
        const GITHUB_API_URL = `https://api.github.com/repos/${githubConfig.username}/${githubConfig.repo}/contents/${githubConfig.filePath}`;

        let managedDomains = [];
        let fileSHA = null; 

        // --- Ambil elemen UI ---
        const domainTableBody = document.querySelector('#domainTable tbody');
        const addDomainForm = document.getElementById('addDomainForm');
        const submitDomainBtn = document.getElementById('submitDomainBtn');
        const domainLoader = document.getElementById('domain-loader');
        const zoneSelector = document.getElementById('zoneSelector'); // ✨ Elemen baru
        const subdomainTable = document.getElementById('subdomainTable');
        const subdomainTableBody = subdomainTable.querySelector('tbody');

        // Fungsi untuk mengambil file dari GitHub
        async function getDomainsFromGithub() {
            domainLoader.style.display = 'block';
            domainLoader.textContent = 'Memuat data domain...';
            domainTableBody.innerHTML = '';
            try {
                const response = await fetch(GITHUB_API_URL, {
                    headers: { 'Authorization': `token ${githubConfig.token}` }
                });
                if (response.status === 404) { // File tidak ditemukan
                    console.log('domains.json tidak ditemukan, akan dibuat saat penambahan pertama.');
                    managedDomains = [];
                    fileSHA = null;
                    renderDomains();
                    return;
                }
                if (!response.ok) throw new Error(`Gagal mengambil file: ${response.statusText}`);
                
                const data = await response.json();
                fileSHA = data.sha;
                const decodedContent = atob(data.content);
                managedDomains = JSON.parse(decodedContent);
                renderDomains();
            } catch (error) {
                console.error(error);
                domainLoader.textContent = 'Gagal memuat data. Periksa token dan konfigurasi.';
            } finally {
                domainLoader.style.display = 'none';
            }
        }

        // Fungsi untuk mengupdate (atau membuat) file di GitHub
        async function updateDomainsOnGithub(commitMessage) {
            submitDomainBtn.disabled = true;
            submitDomainBtn.textContent = 'Menyimpan...';
            try {
                const updatedContent = btoa(JSON.stringify(managedDomains, null, 2));
                
                const body = {
                    message: commitMessage,
                    content: updatedContent,
                    branch: githubConfig.branch
                };
                if (fileSHA) {
                    body.sha = fileSHA; // Sertakan SHA jika file sudah ada (untuk update)
                }

                const response = await fetch(GITHUB_API_URL, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${githubConfig.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(body)
                });

                if (!response.ok) throw new Error(`Gagal update file: ${response.statusText}`);
                
                const data = await response.json();
                fileSHA = data.content.sha;
                alert('File domains.json berhasil diperbarui di GitHub!');
                renderDomains();

            } catch (error) {
                console.error(error);
                alert('Gagal memperbarui file di GitHub. Cek console untuk detail.');
            } finally {
                submitDomainBtn.disabled = false;
                submitDomainBtn.textContent = 'Tambah Domain';
            }
        }
        
        function renderDomains() {
            domainTableBody.innerHTML = ''; 
            if (managedDomains.length === 0) {
                domainTableBody.innerHTML = '<tr><td colspan="3">Belum ada domain. Tambahkan melalui form di atas.</td></tr>';
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
        
        // ✨ Fungsi BARU untuk mengisi dropdown pemilih zona
        function populateZoneSelector() {
            zoneSelector.innerHTML = '';
            if (managedDomains.length === 0) {
                const option = document.createElement('option');
                option.textContent = 'Tidak ada zona tersedia';
                option.disabled = true;
                zoneSelector.appendChild(option);
            } else {
                managedDomains.forEach((domainData, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = domainData.domain;
                    zoneSelector.appendChild(option);
                });
                // ✨ Secara otomatis tampilkan subdomain untuk zona pertama
                zoneSelector.dispatchEvent(new Event('change'));
            }
        }
        
        addDomainForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newDomain = document.getElementById('newDomain').value.trim().toLowerCase();
            const newCfToken = document.getElementById('newCfToken').value.trim();
            const newCfZoneId = document.getElementById('newCfZoneId').value.trim();
            
            if (!newDomain || !newCfToken || !newCfZoneId) {
                alert('Semua field harus diisi!');
                return;
            }
            const isDuplicate = managedDomains.some(d => d.domain === newDomain);
            if (isDuplicate) {
                alert('Domain tersebut sudah ada dalam daftar.');
                return;
            }

            managedDomains.push({ domain: newDomain, token: newCfToken, zoneId: newCfZoneId });
            updateDomainsOnGithub(`Menambahkan domain ${newDomain}`);
            addDomainForm.reset();
        });

        domainTableBody.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const index = e.target.dataset.index;
                const domainNameToDelete = managedDomains[index].domain;
                if (confirm(`Yakin ingin menghapus ${domainNameToDelete}?`)) {
                    managedDomains.splice(index, 1);
                    updateDomainsOnGithub(`Menghapus domain ${domainNameToDelete}`);
                }
            }
        });
        
        getDomainsFromGithub();

        // ✨ Fungsi fetchSubdomains DIPERBARUI untuk menerima token dan zoneId
        async function fetchSubdomains(token, zoneId) {
            subdomainTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Memuat data subdomain...</td></tr>';
            const listApiUrl = `https://api.fandirr.my.id/cf/subdomain/list?token=${token}&zone=${zoneId}`;

            try {
                const response = await fetch(listApiUrl);
                const data = await response.json();
                subdomainTableBody.innerHTML = ''; // Kosongkan tabel sebelum diisi
                if (data.success && data.result.length > 0) {
                    data.result.forEach(sub => {
                        const row = `<tr>
                                        <td>${sub.name}</td>
                                        <td>${sub.content}</td>
                                        <td><button class="delete-btn" data-id="${sub.id}" data-name="${sub.name}">Hapus</button></td>
                                    </tr>`;
                        subdomainTableBody.innerHTML += row;
                    });
                } else {
                    subdomainTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Tidak ada subdomain di zona ini.</td></tr>';
                }
            } catch (error) {
                console.error("Error fetching subdomains:", error);
                subdomainTableBody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Gagal memuat data subdomain.</td></tr>';
            }
        }
        // ✨ Fungsi deleteSubdomain DIPERBARUI untuk menerima token dan zoneId
        async function deleteSubdomain(id, name, token, zoneId) {
            if (!confirm(`Apakah Anda yakin ingin menghapus ${name}?`)) return;
            const deleteApiUrl = `https://api.fandirr.my.id/cf/subdomain/delete?token=${token}&zone=${zoneId}&id=${id}`;
            try {
                const response = await fetch(deleteApiUrl);
                const result = await response.json();
                if (result.success) {
                    alert('Subdomain berhasil dihapus!');
                    // Panggil lagi fetchSubdomains dengan token dan zone yang sama
                    fetchSubdomains(token, zoneId); 
                } else {
                    alert('Gagal menghapus subdomain.');
                }
            } catch (error) {
                console.error("Error deleting subdomain:", error);
                alert('Terjadi kesalahan jaringan.');
            }
        }
        
        const subdomainTable = document.getElementById('subdomainTable');
        // ✨ Event listener untuk tombol hapus subdomain DIPERBARUI
        subdomainTable.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('delete-btn') && e.target.dataset.id) {
                // Ambil token dan zone dari zona yang sedang aktif di dropdown
                const selectedIndex = zoneSelector.value;
                const activeDomainData = managedDomains[selectedIndex];
                deleteSubdomain(e.target.dataset.id, e.target.dataset.name, activeDomainData.token, activeDomainData.zoneId);
            }
        });

        // ✨ Event listener BARU untuk dropdown zona
        zoneSelector.addEventListener('change', () => {
            const selectedIndex = zoneSelector.value;
            if (selectedIndex !== '' && managedDomains[selectedIndex]) {
                const selectedDomainData = managedDomains[selectedIndex];
                fetchSubdomains(selectedDomainData.token, selectedDomainData.zoneId);
            }
        });

        document.getElementById('logoutBtn').addEventListener('click', () => { sessionStorage.removeItem('isAdmin'); window.location.href = 'admin-login.html'; });
        // ✨ Event listener untuk tombol refresh
        document.getElementById('refreshBtn').addEventListener('click', () => {
            zoneSelector.dispatchEvent(new Event('change')); // Picu ulang event change
        });
        fetchSubdomains();
    }
});
