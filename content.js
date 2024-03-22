function isAlphabetic(text) {
    return /^[a-zA-Z]+$/.test(text);
  }
  
document.addEventListener('mouseup', function(event) {
    if (event.button === 2) { // 右クリック
        const selectedText = window.getSelection().toString().trim();
        if (isAlphabetic(selectedText)) {
        chrome.runtime.sendMessage({ type: 'addToAnki', word: selectedText });
        }
    }
});
