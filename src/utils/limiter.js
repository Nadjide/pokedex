// File d'attente asynchrone : au plus `max` tâches en cours à la fois, lancées
// dans l'ordre d'arrivée. Une tâche dont le `signal` est annulé avant son
// démarrage est écartée sans être lancée (sa promesse est rejetée).
export function createLimiter(max) {
  let active = 0;
  const queue = [];

  const next = () => {
    while (active < max && queue.length > 0) {
      const { task, signal, resolve, reject } = queue.shift();
      if (signal?.aborted) {
        reject(signal.reason ?? new Error('Aborted'));
        continue;
      }

      active += 1;
      // L'exécuteur appelle la tâche immédiatement et capture une éventuelle exception.
      new Promise((settle) => settle(task())).then(resolve, reject).finally(() => {
        active -= 1;
        next();
      });
    }
  };

  return (task, { signal } = {}) =>
    new Promise((resolve, reject) => {
      queue.push({ task, signal, resolve, reject });
      next();
    });
}
