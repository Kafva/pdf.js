import { PDFViewerApplication } from "./app.js";
import { getPageSizeInches, SpreadMode } from "./ui_utils.js";

/*
 * Tab selection functions copied from https://github.com/philc/vimium
 * XXX: These do not work when bundling with firefox, pdf.js does not appear
 * to have access to `chrome` like a normal extension.
 */

/* Smooth scrolling does not work properly */
const SCROLL_BEHAVIOUR = "auto";
const SCROLL_STEP = 100;

/* Selects a tab before or after the currently selected tab.
 * - direction: "next", "previous", "first" or "last".
 */
function selectTab(direction) {
  let tab = chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tab) {
    chrome.tabs.query({ currentWindow: true }, function (tabs) {
      if (tabs.length > 1) {
        const toSelect = (() => {
          switch (direction) {
            case "next":
              return (getTabIndex(tab, tabs) + 1) % tabs.length;
            case "previous":
              return ((getTabIndex(tab, tabs) - 1) + tabs.length) % tabs.length;
            case "first":
              return Math.min(tabs.length - 1, 0);
            case "last":
              return Math.max(0, tabs.length - 1);
          }
        })();
        chrome.tabs.update(tabs[toSelect].id, { active: true });
      }
    });
  });
}

/* Find a tab's actual index in a given tab array returned by chrome.tabs.query. In Firefox, there
 * may be hidden tabs, so tab.tabIndex may not be the actual index into the array of visible tabs.
 */
function getTabIndex(tab, tabs) {
  // First check if the tab is where we expect it, to avoid searching the array.
  if (tabs.length > tab.index && tabs[tab.index].index === tab.index) {
    return tab.index;
  } else {
    return tabs.findIndex((t) => t.index === tab.index);
  }
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
      case 186: // 'ö'
      case 59:
        selectTab("previous")
        break;
      case 222: // 'ä'
        selectTab("next")
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
