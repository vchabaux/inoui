module.exports.nodePlugin = {
  addPlugin(context, moment, action, fn) {
    if (moment !== "after" && moment !== "before") {
      throw Error(
        `In order to add an action you have to specifiy 'before' or 'after' argument `
      );
    }

    if (action !== "create" && action !== "update") {
      throw Error(
        `Missing or invalid argument 'action', must be either 'create' or 'update`
      );
    }

    if (!this[context]) this[context] = initActions();

    this[context][moment][action].push(fn);
  },

  async executeFunctions(context, moment, action, data) {
    return new Promise(async (resolve) => {
      if (
        this[context] &&
        this[context][moment] &&
        this[context][moment][action]
      ) {
        for (const fns of this[context][moment][action]) {
          if (isPromise(fns)) await fns(data);
          else fns(data);
        }
      }
      resolve();
    });
  },
};

function isPromise(p) {
  return typeof p === "object" && typeof p.then === "function";
}

function initActions() {
  return {
    "before": {
      "create": [],
      "update": [],
    },
    "after": {
      create: [],
      update: [],
    },
  };
}
