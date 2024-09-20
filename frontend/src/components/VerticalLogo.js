import { PARTOS } from "@/static/config";
import { PartosLogo } from "./Icons";

const VerticalLogo = () => {
  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <PartosLogo width={123} height={123} />
      <strong className="font-bold text-lg">{PARTOS.name}</strong>
    </div>
  );
};

export default VerticalLogo;
