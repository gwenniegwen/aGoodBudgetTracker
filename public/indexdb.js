

const request = window.indexedDB.open("budget", 1);
let db;


request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onerror = function (e) {
    console.log("error");
};

request.onsuccess = function (e) {
    db = e.target.result;


    if (navigator.onLine) {
        checkDatabase();
    }

};
function saveRecord(record){
    const transaction = db.transaction(["pending"], "readwrite")
    const store = transaction.objectStore("pending")
    store.add(record)
}
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite")
    const store = transaction.objectStore("pending")
    const getAll = store.getAll()
    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(getAll.result)
            }).then((res) => {
                return res.json();

            }).then(() => {
                const transaction = db.transaction(["pending"], "readwrite")
                const store = transaction.objectStore("pending")
                store.clear()
            })
        }
    }
}
window.addEventListener("online", checkDatabase)
