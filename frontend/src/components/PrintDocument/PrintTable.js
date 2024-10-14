"use client";

import React from "react";

const tableStyles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "12px",
  },
  th: {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "left",
    backgroundColor: "#f2f2f2",
  },
  td: {
    border: "1px solid #000",
    padding: "8px",
    textAlign: "left",
  },
};

const Thead = ({ children, style = {}, ...props }) => (
  <th
    style={{
      ...tableStyles.th,
      ...style,
    }}
    {...props}
  >
    {children}
  </th>
);
const Tdata = ({ children, style = {}, ...props }) => (
  <td
    style={{
      ...tableStyles.td,
      ...style,
    }}
    {...props}
  >
    {children}
  </td>
);
const PrintTable = ({ children, style = {} }) => {
  return (
    <table
      style={{
        ...tableStyles.table,
        ...style,
      }}
    >
      {children}
    </table>
  );
};

PrintTable.TH = Thead;
PrintTable.TD = Tdata;

export default PrintTable;
