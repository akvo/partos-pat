"use client";

import React, { useState, useMemo, useEffect } from "react";
import ReactDOM from "react-dom";

const handleBrowsers = ["firefox"];

const IFrame = ({ children, htmlID = "ardoc-print-iframe" }) => {
  const [isBraveBrowser, setIsBraveBrowser] = useState(false);
  const [iframeBody, setIframeBody] = useState(null);
  const [ref, setRef] = useState(null);
  const head = ref?.contentDocument?.head;
  const body = ref?.contentDocument?.body;

  // create a style
  const css = `
    * {
      -webkit-print-color-adjust: exact !important;
      color-adjust: exact !important;
      font-family: "Open Sans", sans-serif;
    }
    @page {
      size: A4;
    }`
  const style = document.createElement("style");
  style.type = "text/css";
  style.media = "print";
  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  const browser = useMemo(() => {
    const userAgent = navigator.userAgent;
    let browserName;
    if (userAgent.match(/chrome|chromium|crios/i)) {
      browserName = "chrome";
    } else if (userAgent.match(/firefox|fxios/i)) {
      browserName = "firefox";
    } else if (userAgent.match(/safari/i)) {
      browserName = "safari";
    } else if (userAgent.match(/opr\//i)) {
      browserName = "opera";
    } else if (userAgent.match(/edg/i)) {
      browserName = "edge";
    } else {
      browserName = "No browser detection";
    }
    return browserName;
  }, []);

  useEffect(() => {
    navigator.brave &&
      navigator.brave.isBrave().then((x) => setIsBraveBrowser(x));
  }, []);

  useEffect(() => {
    // apply page css into print content
    if ((head && !handleBrowsers.includes(browser)) || isBraveBrowser) {
      head.appendChild(style);
    }
  }, [head, browser, isBraveBrowser, style]);

  const handleLoad = (event) => {
    const iframe = event.target;
    if (iframe?.contentDocument) {
      const head = iframe.contentDocument.head;
      if (head) {
        head.appendChild(style);
      }
      setIframeBody(iframe.contentDocument.body);
    }
  };

  if (handleBrowsers.includes(browser) && !isBraveBrowser) {
    return (
      <iframe
        id={htmlID}
        title={Math.random()}
        width={0}
        height={0}
        frameBorder={0}
        onLoad={handleLoad}
      >
        {iframeBody && ReactDOM.createPortal(children, iframeBody)}
      </iframe>
    );
  }

  return (
    <iframe
      id={htmlID}
      ref={setRef}
      title={Math.random()}
      width={0}
      height={0}
      frameBorder={0}
    >
      {body && ReactDOM.createPortal(children, body)}
    </iframe>
  );
};

export default IFrame;
