// Local database stored inside your phone. No internet needed.
const DB = (() => {
  let db;

  function open() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open("DeshElectricDB", 1);

      req.onupgradeneeded = (e) => {
        const d = e.target.result;

        if (!d.objectStoreNames.contains("godowns")) {
          const g = d.createObjectStore("godowns", {
            keyPath: "id"
          });

          [1, 2, 3, 4].forEach((n) => {
            g.add({
              id: n,
              name: "Godown " + n
            });
          });
        }

        if (!d.objectStoreNames.contains("products")) {
          d.createObjectStore("products", {
            keyPath: "id",
            autoIncrement: true
          });
        }

        if (!d.objectStoreNames.contains("transactions")) {
          const t = d.createObjectStore("transactions", {
            keyPath: "id",
            autoIncrement: true
          });

          t.createIndex("godown_id", "godown_id");
          t.createIndex("product_id", "product_id");
          t.createIndex("date", "date");
        }

        if (!d.objectStoreNames.contains("settings")) {
          d.createObjectStore("settings", {
            keyPath: "key"
          });
        }
      };

      req.onsuccess = (e) => {
        db = e.target.result;

        if (navigator.storage && navigator.storage.persist) {
          navigator.storage.persist();
        }

        resolve();
      };

      req.onerror = () => {
        reject(req.error);
      };
    });
  }

  function getAll(store) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const request = tx.objectStore(store).getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  function add(store, data) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const request = tx.objectStore(store).add(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  function update(store, data) {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const request = tx.objectStore(store).put(data);

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  return {
    open,
    getAll,
    add,
    update
  };
})();
