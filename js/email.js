function sendEmail() {

    // prepare form
    const form = document.querySelector('form');

    // check validation of the form before exporting
    const event = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(event);
    if(checkValidation(event) === false) {
        return;
    }

    // prepare an email to send using the mailto protocol
    const email = 'jkoiro@rvii.com';
    const newLine = '%0D%0A';
    const subject = 'Checklist(s) ' + window.selections.quote_number + ' - ' + window.selections.customer + '' + ' complete';

    let body = 'Checklist ' + window.selections.quote_number + ' - ' + window.selections.customer + 
    ' has been completed on ' + new Date().toLocaleDateString() + ' at ' + new Date().toLocaleTimeString() + 
    ' by ' + window.selections.sales_person + '.';

    const dueDateText = () => {
        if(window.selections.due_date) {
            return newLine + 'Due Date: ' + window.selections.due_date;
        }
        return '';
    }

    body += newLine + newLine + dueDateText() + newLine + newLine + ' Attached are the checklist(s)';
    


    const mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;

    // send the email
    window.open(mailtoLink);

    // update meta data
    window.metadata.emailSent = new Date();

    // save metadata
    window.saveForm();
}

window.sendEmail = sendEmail;