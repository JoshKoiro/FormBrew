window.generatePDF = function(data, save = false) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Define parameters
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const lineHeight = 7;
    const colWidth = (pageWidth - margin * 3) / 2;
    const colHeaderHeight = 10;
    const fontSize = 10;
    const headingFontSize = 12;
    let yOffset = margin;

    // helper functions for formatting
    const setDefault = () => {
        doc.setFontSize(fontSize);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
    };

    // set up the document
    doc.setFontSize(14);
    doc.text('Checklist - ' + window.selections.quote_number + ' - ' + window.selections.customer + '', margin, yOffset);
    yOffset += colHeaderHeight;

    // addColumnHeaders, adds the column headers to a PDF document. 
    // It takes no parameters and returns the updated yOffset.
    const addColumnHeaders = () => {
        setDefault();
        doc.text('Category', margin, yOffset);
        doc.text('Selection', margin + colWidth + margin, yOffset);
        doc.line(margin, yOffset + 2, pageWidth - margin, yOffset + 2);
        yOffset += colHeaderHeight;
        return yOffset;
    };

    // helper function for wrapping text
    // This is a text wrapping function. It takes a string of text, an x-coordinate, 
    // and a maximum width. It splits the text into lines, then wraps each line to fit within the maximum width
    // by adding words one by one and checking if the resulting line width exceeds the maximum. If it does, the 
    // current line is added to the result array and a new line is started with the current word. The function 
    // returns an array of wrapped lines. Note that this function relies on the doc.getTextWidth from the jsPDF 
    // library, to calculate the width of the text.
    const wrapText = (text, x, maxWidth) => {
        const lines = text.split('\n'); // split into lines first
        const wrappedLines = [];
    
        for (let line of lines) {
            const words = line.split(' ');
            let currentLine = words[0];
    
            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const width = doc.getTextWidth(currentLine + " " + word);
                if (width < maxWidth) {
                    currentLine += " " + word;
                } else {
                    wrappedLines.push(currentLine);
                    currentLine = word;
                }
            }
            wrappedLines.push(currentLine);
        }
        return wrappedLines;
    };

    function gatherOptions(data) {
        const options = [];
        
        // Loop through all form fields
        for (const group of window.formConfig.groups) {
            for (const field of group.categories) {
                const fieldName = window.getVariableName(field.category);
                
                // Check if this field is marked as an option
                if (field.optional && data[`${fieldName}_option`] === 'on') {
                    if (field.type === 'dropdown') {
                        // Handle dropdown options
                        field.options.forEach(option => {
                            const optionFieldName = `${fieldName}_opt_${window.getVariableName(option)}`;
                            if (data[optionFieldName] === 'on') {
                                options.push({
                                    category: field.category,
                                    selection: option,
                                    notes: data[`${fieldName}_notes`] || ''
                                });
                            }
                        });
                    } else if (field.type === 'checkbox') {
                        // Handle checkbox options
                        options.push({
                            category: field.category,
                            selection: 'X',
                            notes: data[`${fieldName}_notes`] || ''
                        });
                    } else if (data[fieldName]) {
                        // Handle other field types
                        options.push({
                            category: field.category,
                            selection: data[fieldName],
                            notes: data[`${fieldName}_notes`] || ''
                        });
                    }
                }
            }
        }
        
        return options;
    }
    
    // addRow adds a row to a PDF document using the jsPDF library. The function takes four parameters: category, selection, 
    // notes, and yOffset. It first wraps the category and selection text into lines that fit within a certain width, 
    // then prints these lines to the PDF document. If the notes parameter is provided, it also prints the notes in 
    // italics below the category and selection. The function handles cases where the text exceeds the page height by 
    // adding a new page. It returns the updated yOffset value, which is the vertical position of the next row.
    const addRow = (category, selection, notes, yOffset) => {
        setDefault();
        const maxWidth = colWidth - margin;
    
        const selectionLines = wrapText(selection, margin + colWidth + margin, maxWidth);
    
        if (selectionLines.length > 1) {
            const categoryLines = wrapText(category, margin, maxWidth);
    
            const totalLines = Math.max(categoryLines.length, selectionLines.length);
    
            for (let i = 0; i < totalLines; i++) {
                if (categoryLines[i]) {
                    doc.text(categoryLines[i], margin, yOffset);
                }
                if (selectionLines[i]) {
                    if (yOffset + lineHeight > pageHeight - margin) {
                        doc.addPage();
                        yOffset = margin;
                    }
                    doc.text(selectionLines[i], margin + colWidth + margin, yOffset);
                }
                yOffset += lineHeight;
            }
        } else {
            const categoryLines = wrapText(category, margin, maxWidth);
    
            const totalLines = Math.max(categoryLines.length, selectionLines.length);
    
            if (yOffset + totalLines * lineHeight > pageHeight - margin) {
                doc.addPage();
                yOffset = margin;
            }
    
            for (let i = 0; i < totalLines; i++) {
                if (categoryLines[i]) {
                    doc.text(categoryLines[i], margin, yOffset);
                }
                if (selectionLines[i]) {
                    doc.text(selectionLines[i], margin + colWidth + margin, yOffset);
                }
                yOffset += lineHeight;
            }
        }
    
        if (notes) {
            const notesLines = wrapText(notes, margin + colWidth + margin, maxWidth);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(128, 128, 128);
            for (let line of notesLines) {
                if (yOffset + lineHeight > pageHeight - margin) {
                    doc.addPage();
                    yOffset = margin;
                }
                doc.text(line, margin + colWidth + margin, yOffset);
                yOffset += lineHeight;
            }
        }
    
        return yOffset + lineHeight / 2; // Add a small gap between rows
    };
    // drawGroupHeader, draws a header for a group in a PDF document. It takes a heading string and a yOffset 
    // (vertical position) as parameters. Here's what it does:
    // - Checks if adding the header would exceed the page height; if so, it adds a new page.
    // - Sets the font size and style to bold Helvetica.
    // - Prints the heading text at the specified position.
    // - Draws a horizontal line below the heading.
    // - Resets the font style to default.
    // - Returns the updated yOffset value.
    const drawGroupHeader = (heading, yOffset) => {
        if (yOffset + colHeaderHeight * 2 > pageHeight - margin) {
            doc.addPage();
            yOffset = margin;
        }
        yOffset += colHeaderHeight / 2;
        doc.setFontSize(headingFontSize);
        doc.setFont("helvetica", "bold");
        doc.text(heading, margin, yOffset);
        doc.line(margin, yOffset + 2, pageWidth - margin, yOffset + 2);
        yOffset += colHeaderHeight;
        setDefault();
        return yOffset;
    };

    for (const group of window.formConfig.groups) {
        yOffset = drawGroupHeader(group.heading, yOffset);
        yOffset = addColumnHeaders();

        for (const field of group.categories) {
            const category = window.getVariableName(field.category);
            const notes = data[`${category}_notes`] || '';
            let selection;

            if (field.type === 'checkbox') {
                selection = data[category] === 'on' ? 'X' : '';
                if (!selection) {
                    continue;
                }
            } else {
                selection = data[category] || '';
            }

            yOffset = addRow(window.getDisplayName(category), selection, notes, yOffset);
        }
    }

     // Add Options section
     const options = gatherOptions(data);
     if (options.length > 0) {
         yOffset = drawGroupHeader('Quote Options', yOffset);
         yOffset = addColumnHeaders();
         
         options.forEach(option => {
             yOffset = addRow(option.category, option.selection, option.notes, yOffset);
         });
     }

    // Outputs pdf to browser
    const pdfOutput = doc.output('blob');
    // creates url from blob
    const pdfUrl = URL.createObjectURL(pdfOutput);

    // if save parameter is true in the function call (generatePDF), save the pdf
    // if save parameter is false in the function call (generatePDF), open the pdf
    if(save === true) {
        doc.save(`${window.selections.quote_number} - Checklist.pdf`);
    } else {
        window.open(pdfUrl, '_blank');
    }
};
