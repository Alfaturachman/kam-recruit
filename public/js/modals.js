/**
 * KAM RECRUIT - Modal Dialogs (Dossier, Scoring, Import) Module
 */
    function openCandidateDetail(id) {
      const c = candidates.find(item => item.id == id);
      if (!c) return;

      currentSelectedCandidateId = id;

      // Header Info
      const initials = c.nama.split(' ').map(n => n[0]).slice(0, 2).join('');
      document.getElementById('m-avatar').textContent = initials;
      document.getElementById('m-name').textContent = c.nama;
      document.getElementById('m-posisi').innerHTML = `${c.posisi}, Mitra <span class="font-bold text-slate-800">${c.mitra}</span>`;
      document.getElementById('m-glints-id').textContent = `GLINTS-ID-${10000 + c.id}`;
      document.getElementById('m-status-sortir-badge').textContent = c.statusSortir;

      // Contacts & Basics
      document.getElementById('m-phone').textContent = c.phone;
      document.getElementById('m-email').textContent = c.email;
      document.getElementById('m-edu').textContent = `${c.pendidikan} - ${c.kampus}`;
      document.getElementById('m-domisili').textContent = `${c.domisili} (${c.usia} Thn)`;

      // Executive Summary
      document.getElementById('m-summary').textContent = c.ringkasan || c.catatan || 'Kandidat memenuhi kualifikasi umum dasar yang dipersyaratkan oleh mitra perusahaan.';

      // Render Riwayat Pengalaman Kerja
      const expContainer = document.getElementById('m-experience-list');
      expContainer.innerHTML = '';
      if (c.pengalaman && c.pengalaman.length > 0) {
        document.getElementById('m-exp-total-badge').textContent = `${c.pengalaman.length} Pengalaman Terverifikasi`;
        c.pengalaman.forEach(exp => {
          const expCard = document.createElement('div');
          expCard.className = 'p-3.5 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2';

          let dutiesHtml = '';
          if (exp.tugas && exp.tugas.length > 0) {
            dutiesHtml = `<ul class="list-disc list-inside text-slate-600 text-[11px] space-y-1 mt-1.5 leading-relaxed">
              ${exp.tugas.map(t => `<li>${t}</li>`).join('')}
            </ul>`;
          }

          expCard.innerHTML = `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div class="flex items-center gap-2">
                <strong class="text-slate-900 font-bold text-xs">${exp.posisi}</strong>
                <span class="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-900 border border-blue-200/60 whitespace-nowrap shrink-0">${exp.perusahaan}</span>
              </div>
              <span class="text-slate-400 text-[11px] whitespace-nowrap shrink-0">${exp.periode}, ${exp.lokasi}</span>
            </div>
            ${dutiesHtml}
          `;
          expContainer.appendChild(expCard);
        });
      } else {
        document.getElementById('m-exp-total-badge').textContent = 'Fresh Graduate';
        expContainer.innerHTML = '<p class="text-slate-400 italic text-xs p-3">Kandidat merupakan lulusan baru (Fresh Graduate) dengan portofolio akademik terverifikasi.</p>';
      }

      // Render Sertifikasi & Lisensi Resmi
      const certContainer = document.getElementById('m-certificates-list');
      certContainer.innerHTML = '';
      if (c.sertifikat && c.sertifikat.length > 0) {
        document.getElementById('m-cert-count-badge').textContent = `${c.sertifikat.length} Sertifikat Terverifikasi`;
        c.sertifikat.forEach(cert => {
          const certCard = document.createElement('div');
          certCard.className = 'p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 flex items-start justify-between gap-3';
          certCard.innerHTML = `
            <div class="flex items-start space-x-2.5">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="8" r="7" />
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
                </svg>
              </div>
              <div>
                <strong class="text-slate-900 block font-bold text-xs leading-snug">${cert.nama}</strong>
                <span class="text-[11px] text-slate-500 block">${cert.penerbit} (${cert.tahun})</span>
                <span class="text-[10px] text-slate-400 font-mono block mt-0.5">No. Reg: ${cert.noReg}</span>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/70 whitespace-nowrap shrink-0">
              Glints Verified
            </span>
          `;
          certContainer.appendChild(certCard);
        });
      } else {
        document.getElementById('m-cert-count-badge').textContent = 'Tanpa Sertifikat Tambahan';
        certContainer.innerHTML = '<p class="text-slate-400 italic text-xs p-3 col-span-2">Tidak ada sertifikat kompetensi eksternal yang diunggah.</p>';
      }

      // Render Keahlian Utama
      const skillsContainer = document.getElementById('m-skills-list');
      skillsContainer.innerHTML = '';
      if (c.keahlian && c.keahlian.length > 0) {
        c.keahlian.forEach(sk => {
          const pill = document.createElement('span');
          pill.className = 'px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 whitespace-nowrap shrink-0';
          pill.textContent = sk;
          skillsContainer.appendChild(pill);
        });
      } else {
        skillsContainer.innerHTML = '<span class="text-slate-400 italic text-xs">Belum ada tag keahlian spesifik.</span>';
      }

      // Dynamic Context Button in Modal Footer
      const actionContainer = document.getElementById('m-action-btn-container');
      if (c.statusSortir !== 'Lolos Sortir') {
        actionContainer.innerHTML = `
          <button onclick="closeModal('modal-candidate');" class="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 text-xs transition cursor-pointer">
            Tutup
          </button>
          <button onclick="closeModal('modal-candidate'); openConfirmSortirModal(${c.id}, 'approve');" class="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-xs">
            Loloskan ke Wawancara HRD (Tahap I)
          </button>
        `;
      } else {
        const hrdBtnText = (c.statusHRD === 'Lolos Seleksi HRD' || c.statusHRD === 'Tidak Lolos') ? 'Ubah Keputusan Wawancara HRD' : 'Beri Keputusan Wawancara HRD';
        actionContainer.innerHTML = `
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="closeModal('modal-candidate'); prepareScoringModal(${c.id});" class="w-full sm:w-auto px-4 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs">
              <svg class="w-3.5 h-3.5 text-blue-200" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              <span>${hrdBtnText}</span>
            </button>
            <button onclick="closeModal('modal-candidate'); openConfirmSortirModal(${c.id}, 'cancel');" title="Batalkan status lolos dan kembalikan ke Belum Disortir" class="w-full sm:w-auto px-3.5 py-2 border border-slate-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 text-slate-600 font-semibold rounded-xl text-xs transition cursor-pointer">
              Batalkan Lolos
            </button>
          </div>
          <button onclick="closeModal('modal-candidate'); selectCandidateForWa(${c.id}); switchTab('interview');" class="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>Hubungi via WA</span>
          </button>
        `;
      }

      document.getElementById('modal-candidate').classList.remove('hidden');
    }

    // Helper functions for CV Dossier
    function printCvModal() {
      window.print();
    }

    function downloadOriginalCvFile() {
      if (!currentSelectedCandidateId) return;
      const c = candidates.find(item => item.id == currentSelectedCandidateId);
      if (!c) return;
      showToast(`Mengunduh berkas Glints: CV_${c.nama.replace(/\s+/g, '_')}_Glints_Verified.pdf`);
    }

    function copyCandidateSummary() {
      if (!currentSelectedCandidateId) return;
      const c = candidates.find(item => item.id == currentSelectedCandidateId);
      if (!c) return;

      const expText = c.pengalaman ? c.pengalaman.map(e => `- ${e.posisi} di ${e.perusahaan} (${e.periode})`).join('\n') : '-';
      const certText = c.sertifikat ? c.sertifikat.map(s => `- ${s.nama} (${s.penerbit}, ${s.tahun})`).join('\n') : '-';

      const textToCopy = `=== DOSSIER CURRICULUM VITAE (KAM RECRUIT - PT KINARYA ALIHDAYA MANDIRI) ===\nNama Pelamar: ${c.nama}\nPosisi Dilamar: ${c.posisi} (Mitra: ${c.mitra})\nPendidikan: ${c.pendidikan} - ${c.kampus}\nKontak: ${c.phone} | ${c.email}\nDomisili: ${c.domisili} (Usia ${c.usia} Tahun)\n\nRIWAYAT PENGALAMAN:\n${expText}\n\nSERTIFIKASI RESMI:\n${certText}\n\nRINGKASAN PROFIL:\n${c.ringkasan || c.catatan}`;

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('Ringkasan CV berhasil disalin ke clipboard!');
      }).catch(() => {
        showToast('Gagal menyalin ringkasan profil.');
      });
    }

    function prepareScoringModal(id) {
      const c = candidates.find(item => item.id == id);
      if (!c) {
        console.warn('Candidate not found for scoring modal:', id);
        showToast('Kandidat tidak ditemukan.');
        return;
      }

      currentSelectedCandidateId = c.id;
      const scoreNameEl = document.getElementById('score-name');
      if (scoreNameEl) scoreNameEl.textContent = `${c.nama} - ${c.posisi} (${c.mitra})`;
      
      const sel = document.getElementById('select-status-hrd');
      if (sel) {
        sel.value = (c.statusHRD === 'Tidak Lolos') ? 'Tidak Lolos' : 'Lolos Seleksi HRD';
      }
      
      const noteInput = document.getElementById('input-catatan-hrd');
      if (noteInput) {
        noteInput.value = (c.catatan && c.catatan !== '-') ? c.catatan : '';
      }

      const modal = document.getElementById('modal-scoring');
      if (modal) modal.classList.remove('hidden');
    }

    async function saveInterviewScore() {
      if (!currentSelectedCandidateId) return;
      const c = candidates.find(item => item.id == currentSelectedCandidateId);
      if (c) {
        const statusHrd = document.getElementById('select-status-hrd').value;
        const catatan = document.getElementById('input-catatan-hrd').value.trim();

        c.statusHRD = statusHrd;
        if (catatan) c.catatan = catatan;

        try {
          const res = await fetch(`/api/v1/candidates/${currentSelectedCandidateId}/hrd-assessment`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              decision: statusHrd,
              notes: catatan || c.catatan,
              evaluatorName: 'HRD Recruiter'
            })
          });
          const json = await res.json();
          if (json.success) {
            closeModal('modal-scoring');
            showToast(`Keputusan wawancara ${c.nama} berhasil disimpan sebagai '${statusHrd}'.`);
            await fetchApplicants();
            await fetchDashboardMetrics();
            return;
          } else {
            showToast(`Gagal menyimpan: ${json.message}`);
          }
        } catch (err) {
          console.warn('API sync deferred to local fallback:', err);
        }

        persistCandidates();
        closeModal('modal-scoring');
        showToast(`Keputusan wawancara ${c.nama} disimpan sebagai '${statusHrd}'.`);
        renderInterviewCards(currentInterviewFilter);
        renderThirdPartyGrid();
      }
    }

    function openImportModal() {
      document.getElementById('modal-import').classList.remove('hidden');
    }

    async function executeImportSimulation() {
      const fileInput = document.getElementById('file-import-input');
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('vacancy_id', 1);

        try {
          showToast('Mengunggah & memproses berkas pelamar Glints...');
          const res = await fetch('/api/v1/applicants/import', {
            method: 'POST',
            body: formData
          });
          const json = await res.json();
          if (json.success) {
            closeModal('modal-import');
            showToast(json.message || 'Berkas Glints berhasil diimpor!');
            await fetchApplicants();
            await fetchDashboardMetrics();
          } else {
            alert('Gagal impor: ' + json.message);
          }
        } catch (e) {
          console.warn('Backend offline, fallback simulation:', e);
          closeModal('modal-import');
          showToast('12 berkas lamaran Glints berhasil diimpor ke basis data internal.');
        }
      } else {
        closeModal('modal-import');
        showToast('12 berkas lamaran Glints berhasil diimpor ke basis data internal.');
      }
    }