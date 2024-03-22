chrome.runtime.onInstalled.addListener(function() {
    console.log('Extension installed');
    chrome.contextMenus.create({
      id: 'addToAnki',
      title: 'Add to Anki',
      contexts: ['selection']
    });
    console.log('Context menu created');
  });
  
  function fetchWordInfo(word) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get('dictionary', function(result) {
        if (result.dictionary && result.dictionary[word]) {
          const meaning = result.dictionary[word];
          resolve({ definitions: [meaning], examples: [] });
        } else {
          reject(`No definition found for word: ${word}`);
        }
      });
    });
  }
  
  function isAlphabetic(text) {
    console.log('Checking if text is alphabetic:', text);
    const result = /^[a-zA-Z]+$/.test(text);
    console.log('Is alphabetic:', result);
    return result;
  }
  
  function addNoteToAnki(front, back) {
    console.log('Adding note to Anki');
    console.log('Front:', front);
    console.log('Back:', back);
  
    // chrome.storage.syncから設定値を読み込む
    chrome.storage.sync.get(['deckName', 'modelName'], function(result) {
      const deckName = result.deckName || 'Default';
      const modelName = result.modelName || 'Basic';
  
      const note = {
        deckName: deckName,
        modelName: modelName,
        fields: {
          Front: front,
          Back: back.join('<br>')
        },
        options: {
          allowDuplicate: false,
          duplicateScope: 'deck'
        },
        tags: ['chrome-extension']
      };
  
      return invoke('addNote', 6, { note })
        .then(noteId => {
          console.log('Note added successfully:', noteId);
          return noteId;
        })
        .catch(error => {
          console.error('Error adding note to Anki:', error);
          throw error;
        });
    });
  }
  
  // background.js
  chrome.contextMenus.onClicked.addListener(function(info, tab) {
    console.log('Context menu item clicked');
    console.log('Info:', info);
    console.log('Tab:', tab);
  
    if (info.menuItemId === 'addToAnki') {
      console.log('Add to Anki menu item clicked');
      const selectedText = info.selectionText.trim().toLowerCase();
      console.log('Selected text:', selectedText);
  
      if (isAlphabetic(selectedText)) {
        console.log('Selected text is alphabetic');
        fetchWordInfo(selectedText)
          .then(wordInfo => {
            console.log('Word info fetched');
            const front = selectedText;
            const back = [
              ...wordInfo.definitions,
              ...wordInfo.examples
            ];
            console.log('Front:', front);
            console.log('Back:', back);
            return addNoteToAnki(front, back);
          })
          .catch(error => console.error('Error:', error));
      } else {
        console.log('Selected text is not alphabetic');
      }
    }
  });
  
  function invoke(action, version, params={}) {
    return fetch('http://127.0.0.1:8765', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({action, version, params})
    })
    .then(response => response.json())
    .then(response => {
      if (Object.getOwnPropertyNames(response).length !== 2) {
        throw new Error('response has an unexpected number of fields');
      }
      if (!response.hasOwnProperty('error')) {
        throw new Error('response is missing required error field');
      }
      if (!response.hasOwnProperty('result')) {
        throw new Error('response is missing required result field');
      }
      if (response.error) {
        throw new Error(response.error);
      }
      return response.result;
    });
  }
