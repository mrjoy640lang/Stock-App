const app = document.getElementById("app");

function toast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2500);
}

async function loadSummary() {
  const godowns = await DB.getAll("godowns");
  const products = await DB.getAll("products");
  const txs = await DB.getAll("transactions");

  const active = new Set(
    products
      .filter((p) => p.status === "ACTIVE")
      .map((p) => p.id)
  );

  return godowns.map((g) => {
    const items = {};

    txs
      .filter(
        (t) =>
          t.godown_id === g.id &&
          active.has(t.product_id)
      )
      .forEach((t) => {
        items[t.product_id] =
          (items[t.product_id] || 0) + t.qty;
      });

    const ids = Object.keys(items);

    const total = ids.reduce(
      (s, k) => s + items[k],
      0
    );

    return {
      id: g.id,
      name: g.name,
      count: ids.length,
      total: total
    };
  });
}

async function showDashboard() {
  const summary = await loadSummary();

  const cards = summary
    .map(
      (g) => `
      <div class="card" onclick="toast('${g.name} screen comes in Stage 5')">
        <h3>${g.name.toUpperCase()}</h3>
        <p>Products: ${g.count}</p>
        <p>Total: ${g.total} CTN</p>
      </div>
    `
    )
    .join("");

  const soon = (name) =>
    `onclick="toast('${name} comes in a later stage')"`;

  app.innerHTML = `
    <header>DESH ELECTRIC CO.</header>

    <div class="wrap">

      <div class="grid">
        ${cards}
      </div>

      <div class="section-title">
        Quick actions
      </div>

      <div class="grid">
        <button class="btn green" ${soon("Stock In")}>
          STOCK IN
        </button>

        <button class="btn red" ${soon("Stock Out")}>
          STOCK OUT
        </button>
      </div>

      <div class="section-title">
        More
      </div>

      <div class="grid">
        <button class="btn" onclick="showProducts()">
  PRODUCTS
</button>

        <button class="btn" ${soon("Transactions")}>
          TRANSACTIONS
        </button>

        <button class="btn" ${soon("Reports")}>
          REPORTS
        </button>

        <button class="btn" ${soon("Low Stock")}>
          LOW STOCK
        </button>

        <button class="btn grey" ${soon("Settings")}>
          SETTINGS
        </button>
      </div>

    </div>
  `;
}

async function start() {
  try {
    await DB.open();
    await showDashboard();
  } catch (e) {
    app.innerHTML =
      '<div class="wrap"><div class="card">Could not open the database. Please close and reopen the app.</div></div>';
  }

  setTimeout(() => {
    document
      .getElementById("splash")
      .classList.add("hidden");

    app.classList.remove("hidden");
  }, 1500);
}
async function showProducts() {
  const products = await DB.getAll("products");

  app.innerHTML = `
    <header>PRODUCTS</header>

    <div class="wrap">

      <button class="btn grey" onclick="showDashboard()">
        ← BACK TO DASHBOARD
      </button>

      <div class="section-title">
        Products
      </div>

      <div class="card">
        ${
          products.length === 0
            ? "<p>No products added yet.</p>"
            : products
                .map(
                  (p) => `
                    <div>
                      <strong>${p.name || "Unnamed Product"}</strong>
                      <p>Code: ${p.code || "-"}</p>
                      <p>Status: ${p.status || "ACTIVE"}</p>
                    </div>
                    <hr>
                  `
                )
                .join("")
        }
      </div>

    </div>
  `;
}
start();
