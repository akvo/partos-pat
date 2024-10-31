import classNames from "classnames";
import { useTranslations } from "next-intl";

const scoreColors = {
  0: "#FFFFFF",
  1: "#FDEDBB",
  2: "#FFDE7B",
  3: "#FBBB04",
  4: "#D3A107",
};

const ScoreLegend = ({ isPrint = false }) => {
  const t = useTranslations("Session");
  const ulStyles = isPrint
    ? {
        listStyleType: "none",
        marginLeft: "-24px",
      }
    : {};
  const liStyles = isPrint
    ? {
        display: "flex",
        gap: 10,
        paddingTop: 4,
        paddingBottom: 4,
      }
    : {};

  return (
    <ul className="space-y-2 text-sm" style={{ ...ulStyles }}>
      {Array.from({ length: 5 })
        .map((_, x) => x)
        .sort((a, b) => b - a)
        .map((s) => {
          return (
            <li key={s} className="flex gap-2.5" style={{ ...liStyles }}>
              {isPrint ? (
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    backgroundColor: scoreColors?.[s],
                    borderWidth: 1,
                    borderColor: "#8B8B8B",
                  }}
                >
                  {``}
                </div>
              ) : (
                <span
                  className={classNames("w-5 h-5 rounded-sm", {
                    "bg-light-1 border border-dark-2": s === 0,
                    "bg-score-4": s === 4,
                    "bg-score-3": s === 3,
                    "bg-score-2": s === 2,
                    "bg-score-1": s === 1,
                  })}
                />
              )}
              <span>{t(`score${s}`)}</span>
            </li>
          );
        })}
    </ul>
  );
};

export default ScoreLegend;
