function speakText(textId) {
    const text = document.getElementById(textId).textContent;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja";
    window.speechSynthesis.speak(utterance);
}
