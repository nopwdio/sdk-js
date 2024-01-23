interface Table {
  name: string;
  id: string;
  auto: boolean;
}

export const open = function (name: string, tables: Table[]) {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!("indexedDB" in window)) {
      reject(new Error("indexedDB is undefined"));
      return;
    }

    let request = indexedDB.open(name);

    request.onerror = (event: any) => {
      console.log(event);
      reject(new Error(`can't open db '${name}' - ${event.target.error}`));
    };

    request.onupgradeneeded = (event: any) => {
      let db = event.target.result as IDBDatabase;

      tables.forEach((table) => {
        db.createObjectStore(table.name, { keyPath: table.id, autoIncrement: table.auto });
      });
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };
  });
};

export const getAllItems = async function <T>(db: IDBDatabase, name: string) {
  const store = await getStore(db, name);

  return new Promise<T[]>((resolve, reject) => {
    store.getAll().onsuccess = (event: any) => {
      resolve(event.target.result);
    };
  });
};

export const getItem = async function <T>(db: IDBDatabase, name: string, id: string) {
  const store = await getStore(db, name);

  return new Promise<T>((resolve, reject) => {
    store.get(id).onsuccess = (event: any) => {
      resolve(event.target.result);
    };
  });
};

export const putItem = async function <T>(db: IDBDatabase, name: string, data: T) {
  const store = await getStore(db, name);

  return new Promise<T>((resolve, reject) => {
    store.put(data).onsuccess = (event: any) => {
      resolve(event.target.result);
    };
  });
};

export const deleteItem = async function <T>(db: IDBDatabase, name: string, id: string) {
  const store = await getStore(db, name);

  return new Promise<T>((resolve, reject) => {
    store.delete(id).onsuccess = (event: any) => {
      resolve(event.target.result);
    };
  });
};

const getStore = function (db: IDBDatabase, name: string) {
  return new Promise<IDBObjectStore>((resolve, reject) => {
    let transaction = db.transaction([name], "readwrite");

    transaction.onerror = (event) => {
      reject(event);
    };

    const store = transaction.objectStore(name);
    resolve(store);
  });
};
