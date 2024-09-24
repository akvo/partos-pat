import { PARTOS } from "@/static/config";
import { PartosLogo } from "./Icons";

const PATLogo = () => {
  return (
    <div className="w-fit min-h-14 flex gap-2 items-center justify-center">
      <span className="w-14">
        <PartosLogo width="100%" height="auto" />
      </span>
      <h1 className="w-fit font-bold text-lg">{PARTOS.name}</h1>
    </div>
  );
};

export default PATLogo;
