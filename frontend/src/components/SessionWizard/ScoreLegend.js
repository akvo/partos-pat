import classNames from "classnames";
import { useTranslations } from "next-intl";

const ScoreLegend = () => {
  const t = useTranslations("Session");

  return (
    <ul className="space-y-2 text-sm">
      {Array.from({ length: 5 })
        .map((_, x) => x)
        .sort((a, b) => b - a)
        .map((s) => {
          return (
            <li key={s} className="flex gap-2.5">
              <span
                className={classNames({
                  "px-3 py-1.5 bg-light-1 border border-dark-2": s === 0,
                  "px-3 py-1.5 bg-score-4": s === 4,
                  "px-3 py-1.5 bg-score-3": s === 3,
                  "px-3 py-1.5 bg-score-2": s === 2,
                  "px-3 py-1.5 bg-score-1": s === 1,
                })}
              ></span>
              <span>{t(`score${s}`)}</span>
            </li>
          );
        })}
    </ul>
  );
};

export default ScoreLegend;
