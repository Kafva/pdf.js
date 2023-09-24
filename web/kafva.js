/* eslint-disable no-undef */
/* eslint-disable import/no-cycle */

import { getPageSizeInches, SpreadMode } from "./ui_utils.js";
import { PDFViewerApplication } from "./app.js";

/* Smooth scrolling does not work properly */
const SCROLL_BEHAVIOUR = "auto";
const SCROLL_STEP = 100;

/*
 * XXX: Tab selection does not work when bundling with firefox, pdf.js
 * does not appear to have access to `chrome` like a normal extension.
 */
function moveToTab(direction) {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (activeTabs) {
        if (activeTabs.length === 0) {
            console.log("No active tabs")
            return
        }
        const activeTab = activeTabs[0]
        chrome.tabs.query({ currentWindow: true }, function (tabs) {
            let newTab
            const lastIndex = tabs.length - 1

            if (lastIndex === 1) {
                return
            }
            switch (direction) {
                case 'left':
                    newTab = activeTab.index === 0 ? tabs[lastIndex] : tabs[activeTab.index - 1]
                    break;
                case 'right':
                    newTab = activeTab.index === lastIndex ? tabs[0] : tabs[activeTab.index + 1]
                    break;
            }
            chrome.tabs.update(newTab.id, { active: true });
        });
    })
}

/**
 * Automatically use a 2-page spread if the viewport has a width above X
 * and is not a presentation. We consider any
 * document with a (width/height) quotient close to or below 1
 * (i.e. a lying rectange form) a presentation
 */
function KafvaUpdateSpreads() {
    const { pdfDocument, pdfViewer } = PDFViewerApplication;
    const widthLimitPx = 1700;
    pdfDocument.getPage(1).then(pdfPage => {
        const pageSize = getPageSizeInches(pdfPage, 0);
        if (
            pageSize.width / pageSize.height <= 1 &&
            (window.innerWidth > widthLimitPx ||
                document.documentElement.clientWidth > widthLimitPx)
        ) {
            if (pdfViewer._spreadMode !== SpreadMode.ODD) {
                console.log("[!]: Switching to 2-spread mode");
                pdfViewer.spreadMode = SpreadMode.ODD;
            }
        } else if (pdfViewer._spreadMode !== SpreadMode.NONE) {
            console.log("[!]: Switching to single-spread mode");
            pdfViewer.spreadMode = SpreadMode.NONE;
        }
        pdfViewer.update();
    });
}

function KafvaHandleKeyDown(cmd, evt, handled) {
    const { pdfViewer } = PDFViewerApplication;
    const viewerContainer = document.querySelector("#viewerContainer");
    handled = true;

    // No control key pressed at all.
    if (cmd === 0) {
        switch (evt.keyCode) {
            case 246: // 'ö'
            case 186:
            case 59:
                moveToTab('left')
                break;
            case 228: // 'ä'
            case 222:
                moveToTab('right')
                break;
            case 71: // 'g'
                PDFViewerApplication.page = 1;
                break;
            case 80: // 'p'
                window.history.back();
                break;
            case 72: // 'h'
                viewerContainer.scrollBy({
                    left: -SCROLL_STEP,
                    top: 0,
                    behavior: SCROLL_BEHAVIOUR,
                });
                break;
            case 74: // 'j'
                viewerContainer.scrollBy({
                    left: 0,
                    top: SCROLL_STEP,
                    behavior: SCROLL_BEHAVIOUR,
                });
                break;
            case 75: // 'k'
                viewerContainer.scrollBy({
                    left: 0,
                    top: -SCROLL_STEP,
                    behavior: SCROLL_BEHAVIOUR,
                });
                break;
            case 76: // 'l'
                viewerContainer.scrollBy({
                    left: SCROLL_STEP,
                    top: 0,
                    behavior: SCROLL_BEHAVIOUR,
                });
                break;
            case 68: // 'd'
                pdfViewer.nextPage();
                break;
            case 85: // 'u'
                pdfViewer.previousPage();
                break;
            default:
                console.log(`Unhandled keycode: ${evt.keyCode}`)
                handled = false;
        }
    } else if (cmd === 4) {
        switch (evt.keyCode) {
            case 74: // j
                pdfViewer.nextPage();
                break;
            case 75: // k
                pdfViewer.previousPage();
                break;
            case 71: // 'G'
                PDFViewerApplication.page = PDFViewerApplication.pagesCount;
                break;
            case 55: // 7 ('/' with shift)
                if (!PDFViewerApplication.supportsIntegratedFind) {
                    PDFViewerApplication.findBar.open();
                }
                break;
            default:
                handled = false;
        }
    } else {
        handled = false;
    }

    return handled;
}

export { KafvaHandleKeyDown, KafvaUpdateSpreads };
