document.addEventListener('DOMContentLoaded', () => {
    // === DOM ELEMENT REFERENCES ===
    const selectBlockType = document.getElementById('select-block-type');
    const btnAddBlock = document.getElementById('btn-add-block');
    const editorArea = document.getElementById('editor-area');
    const cssEditor = document.getElementById('css-editor');
    const htmlCodeOutput = document.getElementById('html-code-output');
    const cssCodeOutput = document.getElementById('css-code-output');
    const livePreviewFrame = document.getElementById('live-preview-frame');
    const btnExportZip = document.getElementById('btn-export-zip');
    const editorEmptyState = document.getElementById('editor-empty-state');
    const saveNotification = document.getElementById('save-notification');
    const mobileNavButtons = document.querySelectorAll('.mobile-nav-btn');
    const panels = document.querySelectorAll('.panel');

    let blockCounter = 0;
    let saveTimeout;

    // === CORE FUNCTIONS ===

    /**
     * Adds a new content block to the editor area.
     * @param {string} type - The type of block to add.
     * @param {object} data - Pre-filled data for the block (used for loading).
     */
    function addBlock(type, data = {}) {
        blockCounter++;
        const blockId = `block-${Date.now()}-${blockCounter}`;
        let blockContentHtml = '';

        switch (type) {
            case 'heading':
                blockContentHtml = `<input type="text" placeholder="Teks Judul..." data-type="heading" value="${data.text || ''}">`;
                break;
            case 'paragraph':
                blockContentHtml = `<textarea rows="3" placeholder="Teks Paragraf..." data-type="paragraph">${data.text || ''}</textarea>`;
                break;
            case 'image':
                blockContentHtml = `
                    <input type="text" placeholder="URL Gambar..." data-type="image-src" value="${data.src || ''}">
                    <input type="text" placeholder="Teks Alternatif..." data-type="image-alt" value="${data.alt || ''}">`;
                break;
            case 'button':
                blockContentHtml = `
                    <input type="text" placeholder="Teks Tombol..." data-type="button-text" value="${data.text || ''}">
                    <input type="text" placeholder="URL Link..." data-type="button-href" value="${data.href || '#'}">`;
                break;
            case 'divider':
                blockContentHtml = `<input type="hidden" data-type="divider">`;
                break;
        }

        const newBlock = document.createElement('div');
        newBlock.className = 'content-block';
        newBlock.id = blockId;
        newBlock.dataset.blockType = type;
        newBlock.innerHTML = `
            <div class="block-header">
                <i class="fas fa-grip-vertical drag-handle"></i>
                <strong>${type.charAt(0).toUpperCase() + type.slice(1)}</strong>
                <div class="block-controls">
                    <button class="btn-remove-block" title="Hapus Blok"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
            <div class="block-content">${blockContentHtml}</div>`;
        
        editorArea.appendChild(newBlock);
        
        newBlock.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', updateLiveView);
        });
        
        updateLiveView();
    }

    /**
     * Reads all blocks and updates the code outputs and live preview.
     */
    function updateLiveView() {
        let generatedHtml = '';
        const blocks = editorArea.querySelectorAll('.content-block');

        blocks.forEach(block => {
            const type = block.dataset.blockType;
            switch (type) {
                case 'heading':
                    generatedHtml += `<h1>${block.querySelector('[data-type="heading"]').value}</h1>\n`;
                    break;
                case 'paragraph':
                    generatedHtml += `<p>${block.querySelector('[data-type="paragraph"]').value}</p>\n`;
                    break;
                case 'image':
                    const src = block.querySelector('[data-type="image-src"]').value;
                    const alt = block.querySelector('[data-type="image-alt"]').value;
                    if(src) generatedHtml += `<img src="${src}" alt="${alt || ''}" style="max-width: 100%; height: auto;">\n`;
                    break;
                case 'button':
                    const text = block.querySelector('[data-type="button-text"]').value;
                    const href = block.querySelector('[data-type="button-href"]').value;
                    if(text) generatedHtml += `<a href="${href || '#'}" class="btn-link"><button>${text}</button></a>\n`;
                    break;
                case 'divider':
                    generatedHtml += `<hr>\n`;
                    break;
            }
        });

        const userCss = cssEditor.value;

        htmlCodeOutput.textContent = generatedHtml || '';
        cssCodeOutput.textContent = userCss || '/* Kode CSS akan muncul di sini */';
        
        const previewDoc = livePreviewFrame.contentDocument || livePreviewFrame.contentWindow.document;
        previewDoc.open();
        previewDoc.write(`
            <!DOCTYPE html><html><head><style>body { margin: 15px; } ${userCss}</style></head><body>${generatedHtml}</body></html>
        `);
        previewDoc.close();
        
        updateEmptyState();
        saveData();
    }
    
    function updateEmptyState() {
        if (editorArea.querySelector('.content-block')) {
            editorEmptyState.classList.add('hidden');
        } else {
            editorEmptyState.classList.remove('hidden');
        }
    }

    function saveData() {
        const blocksData = [];
        editorArea.querySelectorAll('.content-block').forEach(block => {
            const type = block.dataset.blockType;
            const data = { type };
            switch(type) {
                case 'heading':
                case 'paragraph':
                    data.text = block.querySelector('input, textarea').value;
                    break;
                case 'image':
                    data.src = block.querySelector('[data-type="image-src"]').value;
                    data.alt = block.querySelector('[data-type="image-alt"]').value;
                    break;
                case 'button':
                    data.text = block.querySelector('[data-type="button-text"]').value;
                    data.href = block.querySelector('[data-type="button-href"]').value;
                    break;
            }
            blocksData.push(data);
        });

        const dataToSave = { blocks: blocksData, css: cssEditor.value };
        localStorage.setItem('advancedHtmlBuilderProject', JSON.stringify(dataToSave));

        saveNotification.textContent = 'Tersimpan';
        saveNotification.classList.add('visible');
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveNotification.classList.remove('visible');
        }, 2000);
    }

    function loadData() {
        const savedData = localStorage.getItem('advancedHtmlBuilderProject');
        if (savedData) {
            const project = JSON.parse(savedData);
            cssEditor.value = project.css || '';
            if (project.blocks && project.blocks.length > 0) {
                project.blocks.forEach(blockData => addBlock(blockData.type, blockData));
            }
        }
        updateLiveView();
    }

    function exportToZip() {
        const zip = new JSZip();
        const finalHtml = `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Proyek Saya</title><link rel="stylesheet" href="style.css"></head><body>\n${htmlCodeOutput.textContent}\n</body></html>`;
        zip.file("index.html", finalHtml);
        zip.file("style.css", cssEditor.value);
        zip.generateAsync({type:"blob"}).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = "proyek_website.zip";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    // === EVENT LISTENERS ===
    btnAddBlock.addEventListener('click', () => addBlock(selectBlockType.value));
    cssEditor.addEventListener('input', updateLiveView);
    btnExportZip.addEventListener('click', exportToZip);

    document.body.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.btn-remove-block');
        if (removeButton) {
            if (confirm('Anda yakin ingin menghapus blok ini?')) {
                removeButton.closest('.content-block').remove();
                updateLiveView();
            }
        }
        const copyButton = e.target.closest('.btn-copy');
        if (copyButton) {
            const targetId = copyButton.dataset.target;
            const textToCopy = document.getElementById(targetId).textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyButton.innerHTML;
                copyButton.innerHTML = `<i class="fas fa-check"></i>`;
                setTimeout(() => { copyButton.innerHTML = originalText; }, 2000);
            });
        }
    });

    mobileNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            mobileNavButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('is-active'));
            const targetPanelId = button.dataset.target;
            button.classList.add('active');
            document.getElementById(targetPanelId).classList.add('is-active');
        });
    });

    // === INITIALIZATION ===
    new Sortable(editorArea, {
        animation: 150,
        handle: '.block-header',
        onEnd: updateLiveView
    });
    
    // Set initial active panels for mobile
    if (window.innerWidth <= 768) {
        panels.forEach(panel => panel.classList.remove('is-active'));
        document.getElementById('panel-editor').classList.add('is-active');
    }
    
    loadData();
});