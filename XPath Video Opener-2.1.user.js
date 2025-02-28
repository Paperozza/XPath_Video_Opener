// ==UserScript==
// @name         XPath Video Opener
// @namespace    https://github.com/Paperozza/XPath_Video_Opener
// @version      2.1
// @description  This script lets you use XPath to open a video source in a new browser tab. It’s particularly useful for web platforms where videos lack controls to skip to specific timestamps, adjust playback speed, or use other standard video features. By isolating the video source, you gain access to native browser controls for greater flexibility.
// @author       Paperozza
// @match        *://*/*
// @grant        GM_openInTab
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';

    const STORAGE_KEY = 'savedVideoXPath';

    GM_addStyle(`
        #videoXPathBtn {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            z-index: 9999 !important;
            padding: 12px 20px;
            background: #007bff;
            color: white !important;
            border: none !important;
            border-radius: 5px;
            cursor: pointer;
            font-family: Arial !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.2s;
            opacity: 0.9;
            margin: 0 !important;
            min-width: 180px;
            text-align: center;
        }

        #videoXPathBtn:hover {
            opacity: 1 !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3) !important;
        }

        #videoXPathBtn.saved {
            background: #28a745 !important;
            padding-right: 40px !important;
        }

        #videoXPathBtn.saved::after {
            content: "✓";
            position: absolute;
            right: 15px;
        }
    `);

    const btn = document.createElement('button');
    btn.id = 'videoXPathBtn';
    btn.title = "Left-click: Open video\nAlt+Click: Update XPath\nDouble-click: Clear XPath";
    document.body.appendChild(btn);

    // Resto del codice rimane identico alla versione precedente
    function updateButtonState() {
        const savedXPath = GM_getValue(STORAGE_KEY);
        btn.classList.toggle('saved', !!savedXPath);
        btn.textContent = savedXPath ? '🎥 Open Video' : '🎥 Set Video XPath';
    }

    btn.addEventListener('click', function(event) {
        if (event.altKey) {
            const currentXPath = GM_getValue(STORAGE_KEY, '');
            const newXPath = prompt('Enter new XPath (cancel to keep existing):', currentXPath);
            if (newXPath !== null) {
                GM_setValue(STORAGE_KEY, newXPath || '');
                updateButtonState();
            }
            return;
        }

        const xpath = GM_getValue(STORAGE_KEY);
        if (!xpath) {
            const newXPath = prompt('Enter the XPath to the video element:');
            if (newXPath) {
                GM_setValue(STORAGE_KEY, newXPath);
                updateButtonState();
                processXPath(newXPath);
            }
            return;
        }

        processXPath(xpath);
    });

    btn.addEventListener('dblclick', function() {
        GM_setValue(STORAGE_KEY, '');
        updateButtonState();
        alert('Saved XPath cleared!');
    });

    function processXPath(xpath) {
        try {
            const result = document.evaluate(
                xpath,
                document,
                null,
                XPathResult.FIRST_ORDERED_NODE_TYPE,
                null
            );
            const element = result.singleNodeValue;

            if (!element) throw new Error('Element not found');

            const attributes = ['src', 'href', 'data-src', 'data-url', 'data-video-url'];
            const videoUrl = attributes
                .map(attr => element.getAttribute(attr))
                .find(value => value);

            if (videoUrl) {
                GM_openInTab(new URL(videoUrl, location.href).href, true);
            } else {
                throw new Error('No video URL found');
            }
        } catch (error) {
            alert(`Error: ${error.message}\nTry updating the XPath with Alt+Click.`);
        }
    }

    updateButtonState();
})();