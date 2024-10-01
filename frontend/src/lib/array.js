export const errorsMapping = (errors = {}, errorTrans = null) =>
  Object.keys(errors).flatMap((dk) => {
    if (!Array.isArray(errors[dk])) {
      return Object.keys(errors[dk]).flatMap((_, k) => {
        return Object.keys(errors[dk][k]).map((kx) => ({
          name: [dk, k, kx],
          errors: errors[dk][k][kx],
        }));
      });
    }
    return [
      {
        name: dk,
        errors:
          typeof errorTrans === "function"
            ? errors[dk]?.map((err) => errorTrans(err))
            : errors[dk],
      },
    ];
  });

export const decisionsToTable = (items = [], orgs = []) =>
  items.map((item) => {
    const scores = item?.scores?.length
      ? item.scores
      : orgs?.map((o) => ({
          organization_id: o?.id,
          score: null,
          id: null,
        }));
    const transformedScores = scores.reduce((acc, score) => {
      acc[score.organization_id] = score.score;
      acc[`id_${score.organization_id}`] = score.id;
      return acc;
    }, {});
    return {
      ...item,
      ...transformedScores,
    };
  });
