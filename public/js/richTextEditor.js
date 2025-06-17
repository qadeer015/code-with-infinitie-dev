document.addEventListener('DOMContentLoaded', function() {
    const editor = document.getElementById('editor');
    const boldBtn = document.getElementById('bold-btn');
    const italicBtn = document.getElementById('italic-btn');
    const ulBtn = document.getElementById('ul-btn');
    const olBtn = document.getElementById('ol-btn');
    const fontStyle = document.getElementById('font-style');
    const fontSize = document.getElementById('font-size');
    const alignLeftBtn = document.getElementById('align-left');
    const alignCenterBtn = document.getElementById('align-center');
    const alignRightBtn = document.getElementById('align-right');
    const alignJustifyBtn = document.getElementById('align-justify');
    const insertTableBtn = document.getElementById('insert-table');
    const tableOptions = document.getElementById('table-options');
    const addRowBtn = document.getElementById('add-row');
    const addColBtn = document.getElementById('add-col');
    const deleteRowBtn = document.getElementById('delete-row');
    const deleteColBtn = document.getElementById('delete-col');
    const tableBorderBtn = document.getElementById('table-border');
    const tableColorBtn = document.getElementById('table-color');
    const form = document.querySelector('form');
    const hiddenTextarea = document.getElementById('editor-content');
    
    // Modal elements
    const modal = document.getElementById('table-modal');
    const closeBtn = document.querySelector('.close');
    const createTableBtn = document.getElementById('create-table');
    
    let currentTable = null;
    let currentCell = null;

    // Basic formatting buttons
    boldBtn.addEventListener('click', function() {
        document.execCommand('bold', false, null);
        boldBtn.classList.toggle('active');
    });
    
    italicBtn.addEventListener('click', function() {
        document.execCommand('italic', false, null);
        italicBtn.classList.toggle('active');
    });
    
    ulBtn.addEventListener('click', function() {
        document.execCommand('insertUnorderedList', false, null);
        olBtn.classList.remove('active');
        ulBtn.classList.toggle('active');
    });
    
    olBtn.addEventListener('click', function() {
        document.execCommand('insertOrderedList', false, null);
        ulBtn.classList.remove('active');
        olBtn.classList.toggle('active');
    });
    
    fontStyle.addEventListener('change', function() {
        document.execCommand('fontName', false, this.value);
    });
    
    fontSize.addEventListener('change', function() {
        const selectedSize = this.value;
        document.execCommand('fontSize', false, selectedSize);
        
        // Fix for Firefox
        const fontElements = editor.getElementsByTagName('font');
        for (let i = 0; i < fontElements.length; i++) {
            if (fontElements[i].size) {
                fontElements[i].removeAttribute('size');
                fontElements[i].style.fontSize = getFontSizeFromValue(selectedSize);
            }
        }
    });
    
    // Alignment functions
    alignLeftBtn.addEventListener('click', function() {
        document.execCommand('justifyLeft', false, null);
        updateAlignmentButtons('left');
    });
    
    alignCenterBtn.addEventListener('click', function() {
        document.execCommand('justifyCenter', false, null);
        updateAlignmentButtons('center');
    });
    
    alignRightBtn.addEventListener('click', function() {
        document.execCommand('justifyRight', false, null);
        updateAlignmentButtons('right');
    });
    
    alignJustifyBtn.addEventListener('click', function() {
        document.execCommand('justifyFull', false, null);
        updateAlignmentButtons('justify');
    });
    
    function updateAlignmentButtons(alignment) {
        alignLeftBtn.classList.toggle('active', alignment === 'left');
        alignCenterBtn.classList.toggle('active', alignment === 'center');
        alignRightBtn.classList.toggle('active', alignment === 'right');
        alignJustifyBtn.classList.toggle('active', alignment === 'justify');
    }
    
    // Table creation modal
    insertTableBtn.addEventListener('click', function() {
        modal.style.display = 'block';
    });
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    createTableBtn.addEventListener('click', function(e) {
        e.preventDefault(); // Add this line to prevent default behavior
        
        const rows = document.getElementById('rows').value;
        const cols = document.getElementById('cols').value;
        const borderSize = document.getElementById('border-size').value;
        const borderColor = document.getElementById('border-color').value;
        const cellPadding = document.getElementById('cell-padding').value;
        
        const tableHtml = generateTableHtml(
            parseInt(rows), 
            parseInt(cols), 
            parseInt(borderSize), 
            borderColor, 
            parseInt(cellPadding)
        );
        
        document.execCommand('insertHTML', false, tableHtml);
        modal.style.display = 'none';
        showTableOptions();
    });
    
    function generateTableHtml(rows, cols, borderSize, borderColor, cellPadding) {
        let html = `<table style="width: 100%; border-collapse: collapse; margin: 10px 0; border: ${borderSize}px solid ${borderColor};">`;
        for (let i = 0; i < rows; i++) {
            html += '<tr>';
            for (let j = 0; j < cols; j++) {
                html += `<td style="padding: ${cellPadding}px; border: ${borderSize}px solid ${borderColor}; min-width: 50px;">&nbsp;</td>`;
            }
            html += '</tr>';
        }
        html += '</table>';
        return html;
    }
    
    // Table editing functions
    function showTableOptions() {
        tableOptions.style.display = 'inline-block';
    }
    
    function hideTableOptions() {
        tableOptions.style.display = 'none';
    }
    
    function getCurrentTable() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let node = selection.anchorNode;
            while (node && node.nodeName !== 'TABLE') {
                node = node.parentNode;
            }
            return node;
        }
        return null;
    }
    
    function getCurrentCell() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            let node = selection.anchorNode;
            while (node && node.nodeName !== 'TD' && node.nodeName !== 'TH') {
                node = node.parentNode;
            }
            return node;
        }
        return null;
    }
    
    addRowBtn.addEventListener('click', function() {
        const table = getCurrentTable();
        if (table) {
            const row = table.insertRow(-1);
            const cols = table.rows[0].cells.length;
            for (let i = 0; i < cols; i++) {
                const cell = row.insertCell(i);
                cell.innerHTML = '&nbsp;';
                // Copy styles from first row
                if (table.rows.length > 1) {
                    cell.style = table.rows[0].cells[i].style;
                }
            }
        }
    });
    
    addColBtn.addEventListener('click', function() {
        const table = getCurrentTable();
        if (table) {
            for (let i = 0; i < table.rows.length; i++) {
                const cell = table.rows[i].insertCell(-1);
                cell.innerHTML = '&nbsp;';
                // Copy styles from first cell
                if (table.rows[i].cells.length > 1) {
                    cell.style = table.rows[i].cells[0].style;
                }
            }
        }
    });
    
    deleteRowBtn.addEventListener('click', function() {
        const cell = getCurrentCell();
        if (cell) {
            const row = cell.parentNode;
            if (row.parentNode.rows.length > 1) {
                row.parentNode.deleteRow(row.rowIndex);
            } else {
                // If last row, remove the whole table
                row.parentNode.parentNode.removeChild(row.parentNode);
                hideTableOptions();
            }
        }
    });
    
    deleteColBtn.addEventListener('click', function() {
        const cell = getCurrentCell();
        if (cell) {
            const colIndex = cell.cellIndex;
            const table = cell.parentNode.parentNode;
            
            for (let i = 0; i < table.rows.length; i++) {
                if (table.rows[i].cells.length > 1) {
                    table.rows[i].deleteCell(colIndex);
                } else {
                    // If last column, remove the whole table
                    table.parentNode.removeChild(table);
                    hideTableOptions();
                    return;
                }
            }
        }
    });
    
    tableBorderBtn.addEventListener('click', function() {
        const table = getCurrentTable();
        if (table) {
            const currentBorder = table.style.border;
            if (currentBorder && currentBorder !== '0px none') {
                table.style.border = '0px none';
                const cells = table.getElementsByTagName('td');
                for (let cell of cells) {
                    cell.style.border = '0px none';
                }
            } else {
                table.style.border = '1px solid #000';
                const cells = table.getElementsByTagName('td');
                for (let cell of cells) {
                    cell.style.border = '1px solid #000';
                }
            }
        }
    });
    
    tableColorBtn.addEventListener('click', function() {
        const cell = getCurrentCell();
        if (cell) {
            const color = prompt('Enter color (name, hex, or rgb):', cell.style.backgroundColor || '');
            if (color !== null) {
                cell.style.backgroundColor = color;
            }
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key.toLowerCase()) {
                case 'b':
                    e.preventDefault();
                    boldBtn.click();
                    break;
                case 'i':
                    e.preventDefault();
                    italicBtn.click();
                    break;
                case 'l':
                    e.preventDefault();
                    alignLeftBtn.click();
                    break;
                case 'e':
                    e.preventDefault();
                    alignCenterBtn.click();
                    break;
                case 'r':
                    e.preventDefault();
                    alignRightBtn.click();
                    break;
                case 'j':
                    e.preventDefault();
                    alignJustifyBtn.click();
                    break;
            }
        }
    });
    
    // Highlight buttons when text has corresponding style
    editor.addEventListener('mouseup', function() {
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            const parentElement = range.commonAncestorContainer.parentElement;
            
            // Check for bold
            const isBold = document.queryCommandState('bold') || 
                          (parentElement && (parentElement.tagName === 'B' || parentElement.tagName === 'STRONG'));
            boldBtn.classList.toggle('active', isBold);
            
            // Check for italic
            const isItalic = document.queryCommandState('italic') || 
                            (parentElement && (parentElement.tagName === 'I' || parentElement.tagName === 'EM'));
            italicBtn.classList.toggle('active', isItalic);
            
            // Check for lists
            const isUL = parentElement && parentElement.tagName === 'UL';
            const isOL = parentElement && parentElement.tagName === 'OL';
            ulBtn.classList.toggle('active', isUL);
            olBtn.classList.toggle('active', isOL);
            
            // Check for alignment
            const isLeftAligned = document.queryCommandState('justifyLeft');
            const isCenterAligned = document.queryCommandState('justifyCenter');
            const isRightAligned = document.queryCommandState('justifyRight');
            const isJustifyAligned = document.queryCommandState('justifyFull');
            
            updateAlignmentButtons(
                isLeftAligned ? 'left' : 
                isCenterAligned ? 'center' : 
                isRightAligned ? 'right' :
                isJustifyAligned ? 'justify' : 'none'
            );
            
            // Check if we're in a table
            const table = getCurrentTable();
            if (table) {
                showTableOptions();
                currentTable = table;
                currentCell = getCurrentCell();
                
                // Highlight current cell
                if (currentCell) {
                    const cells = table.getElementsByTagName('td');
                    for (let cell of cells) {
                        cell.classList.remove('selected');
                    }
                    currentCell.classList.add('selected');
                }
            } else {
                hideTableOptions();
                currentTable = null;
                currentCell = null;
            }
        }
    });
    
    // Helper function to convert legacy font size (1-7) to px
    function getFontSizeFromValue(value) {
        const sizes = {
            '1': '8px',
            '2': '10px',
            '3': '12px',
            '4': '14px',
            '5': '18px',
            '6': '24px',
            '7': '36px'
        };
        return sizes[value] || '12px';
    }

    form.addEventListener('submit', function(e) {
        // Get the HTML content from the editor
        hiddenTextarea.value = editor.innerHTML;
    });
});