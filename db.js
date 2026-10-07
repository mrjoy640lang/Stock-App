// Local database stored inside your phone. No internet needed.
const DB = (() => {
  let db;

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("DeshElectricDB", 1);

      req.onupgradeneeded = (e) => {
        const d = e.target.result;
        d.createObjectStore("godowns", { keyPath: "id" });
        d.createObjectStore("products", { keyPath: "id", autoIncrement: true });

        const t = d.createObjectStore("transactions", {
          keyPath: "id",
          autoIncrement: true
        });

        t.createIndex("godown_id", "godown_id");
        t.createIndex("product_id", "product_id");
        t.createIndex("date", "date");

        d.createObjectStore("settings", { keyPath: "key" });

        // Create the 4 godowns automatically
        const g = e.target.transaction.objectStore("godowns");

        [1, 2, 3, 4].forEach((n) => {
          g.add({
            id: n,
            name: "Godown " + n
          });
        });
      };

      req.onsuccess = (e) => {
        db = e.target.result;

        // Ask the phone to protect our data from automatic cleaning
        if (navigator.storage && navigator.storage.persist) {
          navigator.storage.persist();
        }

        resolve();
      };

      req.onerror = () => reject(req.error);
    });
  }

  function getAll(store) {
    return new Promise((resolve, reject) => {
      const r = db
        .transaction(store)
        .objectStore(store)
        .getAll();

      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  }

  return {
    open,
    getAll
  };
})();
