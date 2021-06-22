let db;
// create a new db request for a "BudgetDB" database.
const request = window.indexedDB.open("BudgetDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  // create object store called "BudgetStore" and set autoIncrement to true
  const BudgetStore = db.createObjectStore("BudgetDB", {
    autoIncrement: true});
};

request.onsuccess = function (event) {
  db = event.target.result;

  if (navigator.onLine) {
    checkDatabase();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode)

};

function saveRecord(record) {
  // create a transaction on the pending db with readwrite access
  const transaction = db.transaction(["BudgetDB"], "readwrite");

  // access your pending object store
  const budgetStore = transaction.objectStore("BudgetDB");

  // add record to your store with add method.
  budgetStore.add(record);
}

function checkDatabase() {
  // open a transaction on your pending db
  let transaction = db.transaction(["BudgetDB"], "readwrite");
  // access your pending object store
  const budgetStore = transaction.objectStore("BudgetDB");
  // get all records from store and set to a variable
  var getAll = budgetStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          // if successful, open a transaction on your pending db
          if (data.length > 0) {
           transaction = db.transaction(["BudgetDB"], "readwrite");
          }
          // access your pending object store
          const newStore = transaction.objectStore("BudgetDB");
          // clear all items in your store
          newStore.clear();
        });
    }
  };
}

// listen for app coming back online
window.addEventListener('online', checkDatabase);