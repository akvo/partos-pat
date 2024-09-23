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
