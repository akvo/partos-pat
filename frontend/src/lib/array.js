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
  items.map(({ scores, ...item }) => {
    const decisionScores = scores?.length
      ? scores
      : orgs?.map((o) => ({
          organization_id: o?.id,
          score: null,
          id: null,
          desired: null,
        }));
    const transformedScores = decisionScores
      .filter((s) => s?.desired === false || !s?.desired)
      .reduce((acc, score) => {
        acc[score.organization_id] = score.score;
        acc[`id_${score.organization_id}`] = score.id;
        return acc;
      }, {});

    let transformedDesires = {};
    if (scores?.length) {
      transformedDesires = scores
        .filter((s) => s?.desired)
        .reduce((acc, curr) => {
          acc[`desired.${curr.organization_id}`] = curr.score;
          acc[`desired_id_${curr.organization_id}`] = curr.id;
          return acc;
        }, {});
    }

    return {
      ...item,
      ...transformedScores,
      ...transformedDesires,
    };
  });
