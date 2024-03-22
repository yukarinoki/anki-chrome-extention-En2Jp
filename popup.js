document.addEventListener('DOMContentLoaded', function() {
    const loadButton = document.getElementById('loadButton');
    const dictionaryPreview = document.getElementById('dictionaryPreview');

    const deckNameInput = document.getElementById('deckName');
    const modelNameInput = document.getElementById('modelName');
    const saveSettingsButton = document.getElementById('saveSettings');

    // 設定値を読み込む
    chrome.storage.sync.get(['deckName', 'modelName'], function(result) {
        if (result.deckName) {
        deckNameInput.value = result.deckName;
        }
        if (result.modelName) {
        modelNameInput.value = result.modelName;
        }
    });

    saveSettingsButton.addEventListener('click', function() {
        const deckName = deckNameInput.value || 'Default';
        const modelName = modelNameInput.value || 'Basic';
        chrome.storage.sync.set({ deckName, modelName }, function() {
          console.log('Settings saved');
        });
    });
   
    chrome.storage.local.get('dictionaryLoaded', function(result) {
      if (result.dictionaryLoaded) {
        loadButton.disabled = true;
        // previewDictionary();
      }
    });
   
    loadButton.addEventListener('click', function() {
      loadDictionary();
    });
   

    function loadDictionary() {
        fetch('ejdict-hand-utf8.txt')
          .then(response => response.text())
          .then(data => {      const lines = data.split('\n');
            const dictionary = {};
      
            for (const line of lines) {
              if (line.trim() !== '') {
                const [word, meaning] = line.split('\t');
                const lowerCaseWord = word.toLowerCase();
      
                if (lowerCaseWord.includes(',')) {
                  const [mainWord, ...alternateWords] = lowerCaseWord.split(',');
                  const alternates = alternateWords.map(alternate => alternate.trim());
      
                  dictionary[mainWord] = `${meaning} / ${alternates.join(', ')}`;
      
                  for (const alternate of alternates) {
                    dictionary[alternate] = `${meaning} / ${mainWord}`;
                  }
                } else {
                  dictionary[lowerCaseWord] = meaning;
                }
              }
            }
      
            chrome.storage.local.set({ dictionary, dictionaryLoaded: true }, function() {
              console.log('Dictionary loaded and stored in chrome.storage.local');
              document.getElementById('loadButton').disabled = true;
            //   previewDictionary();
            });
          })
          .catch(error => {
            console.error('Error loading dictionary:', error);
          });
      }
   
    // chrome.storage.onChanged.addListener(function(changes, namespace) {
    //   if (namespace === 'local' && changes.dictionary) {
    //     previewDictionary();
    //   }
    // });
   });
