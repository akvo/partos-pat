"use client";

import React, { useState } from "react";
import { Button } from "antd";
import IFrame from "./IFrame";

const PrintDocument = ({ children, id = "ardoc-print-iframe" }) => {
  const [isPrint, setIsPrint] = useState(false);

  const onPrint = (fileName) => {
    const originalDocTitle = document.title;
    setIsPrint(true);
    setTimeout(() => {
      const print = document.getElementById(id);
      if (print) {
        const title = fileName || Date.now();
        // change iframe title
        print.contentDocument.title = title;
        // change document title
        document.title = title;
        print.focus();
        print.contentWindow.print();
      }
      setIsPrint(false);
      document.title = originalDocTitle;
    }, 2500);
  };

  return (
    <div>
      {React.Children.map(children, (child) => {
        // Check if the child is PrintDocument.Button
        if (
          React.isValidElement(child) &&
          child.type === PrintDocument.Button
        ) {
          const originalOnClick = child.props.onClick;
          const originLoading = child.props.loading;
          return React.cloneElement(child, {
            loading: originLoading || isPrint,
            onClick: (event) => {
              if (originalOnClick) {
                // Ensure compatibility with both sync and async functions
                const result = originalOnClick(
                  (props) => onPrint(props),
                  event,
                );

                // If the original function is asynchronous, wait for it
                Promise.resolve(result).then(() => {
                  if (!result) {
                    onPrint(); // Call onPrint if original function doesn't handle it
                  }
                });
              } else {
                onPrint(); // If no custom onClick is provided, just call onPrint
              }
            },
          });
        }
        if (React.isValidElement(child) && child.type === PrintDocument.Area) {
          if (!isPrint) {
            return null;
          }
          return React.cloneElement(child, {
            htmlID: id,
          });
        }
        return child;
      })}
    </div>
  );
};

PrintDocument.Button = Button;
PrintDocument.Area = IFrame;

export default PrintDocument;
