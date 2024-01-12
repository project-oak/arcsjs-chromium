(function() {
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'update':
                {
                    document.getElementById('doc').innerHTML = message.text;
                    break;
                }
        }
    }); 
}());