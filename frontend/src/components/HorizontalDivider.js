const HorizontalDivider = ({ children }) => (
  <div className="w-fit py-2">
    <div className="flex flex-row items-center divide-x-2 divide-solid">{children}</div>
  </div>
);

export default HorizontalDivider;
