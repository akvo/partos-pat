import { Card } from "antd";
import classNames from "classnames";
import { openSans } from "@/app/fonts";
import { FAQCollapsible } from "@/components";

const FAQPage = () => {
  return (
    <Card>
      <div className={classNames(openSans.className, "p-12")}>
        <FAQCollapsible
          wrapClass="w-full flex flex-col items-start justify-start"
          contentClass="w-full 2xl:w-10/12"
          center={false}
        />
      </div>
    </Card>
  );
};

export default FAQPage;
