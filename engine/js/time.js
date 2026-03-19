function diff(time1, time2) {
    let t1 = new Date(time1)
    let t2 = new Date(time2)
    let time = Math.abs(t1 - t2);
    let days = Math.floor(time / (1000 * 60 * 60 * 24));
    let hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((time % (1000 * 60)) / 1000);
    
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}



function format(time) {
    const date = new Date(time);
    return date.toLocaleString();
}

// function to convert duration into days, hours, minutes, seconds
function formatDuration(duration) {
    let days = Math.floor(duration / (1000 * 60 * 60 * 24));
    let hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let seconds = Math.floor((duration % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${seconds}s`;
}


window.diff = diff;
window.format = format;
window.formatDuration = formatDuration;