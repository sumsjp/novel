let lastClickTime = 0; // Store the last click time

function speakText(btn, startId, count) {
    let currentTime = Date.now(); // Get the current timestamp
    if (currentTime - lastClickTime < 1000) 
        return    
    lastClickTime = currentTime

    let img = btn.querySelector("img");
    img.src = "../blue-speaker.svg";
    for (i=startId; i<startId + count; ++i) {
        const text = document.getElementById("L" + i).textContent;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja";
        window.speechSynthesis.speak(utterance);
    }
}

function speakText5(startId, count) {
    for (i=startId; i<startId + count; ++i) {
        const text = document.getElementById("L" + i).textContent;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja";
        window.speechSynthesis.speak(utterance);
    }
}
