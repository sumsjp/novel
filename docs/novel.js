function speakText(textId) {
    const text = document.getElementById(textId).textContent;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja";
    window.speechSynthesis.speak(utterance);
}

function speakText5(startId, count) {
    for (i=startId; i<startId + count; ++i) {
        const text = document.getElementById("L" + i).textContent;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "ja";
        window.speechSynthesis.speak(utterance);
    }
}
