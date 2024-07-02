//index.js
import axios from 'axios';
import initSqlJs, { Database } from 'sql.js';

const API_URL = 'http://localhost:3000';

export const login = async (username: string, password: string): Promise<void> => {
    try {
        const response = await axios.post(`${API_URL}/login`, 
          { username: username, password: password },
          { responseType: 'arraybuffer' }
        );
        
        // Convert the response data (array buffer) into a Uint8Array
        const arr = new Uint8Array(response.data);

        // Convert the Uint8Array to a regular array and then to a JSON string
        localStorage.setItem('dbFile', JSON.stringify(Array.from(arr)));
    
    } catch (error) {
        console.error('Login failed:', error);
    }
}

export const initDBFromLocalStorage = async (): Promise<Database> => {
    // Load the SQL.js library, specifying where to locate the necessary files
    const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
    });

    // Retrieve the database file from local storage
    const dbFile = localStorage.getItem('dbFile');
    if (!dbFile) throw new Error('No database file found in local storage');

    // Parse the JSON string from local storage into an array of integers
    const uint8Array = new Uint8Array(JSON.parse(dbFile));

    // Create a new SQL.js database instance using the array buffer
    const db = new SQL.Database(uint8Array);

    // Return the database instance
    return db;
};


export const getPeople = (db: Database): Array<{ id: number; name: string; age: number }> => {
    const stmt = db.prepare('SELECT * FROM people');
    const people = [];
    while (stmt.step()) {
        const row = stmt.getAsObject();
        people.push(row);
    }
    stmt.free();
    return people;
};

export const addPerson = (db: Database, name: string, age: number): void => {
    db.run('INSERT INTO people (name, age) VALUES (?, ?)', [name, age]);
    saveDatabaseToLocalStorage(db);
};

export const updatePerson = (db: Database, id: number, name: string, age: number): void => {
    db.run('UPDATE people SET name = ?, age = ? WHERE id = ?', [name, age, id]);
    saveDatabaseToLocalStorage(db);
};

export const deletePerson = (db: Database, id: number): void => {
    db.run('DELETE FROM people WHERE id = ?', [id]);
    saveDatabaseToLocalStorage(db);
};

const saveDatabaseToLocalStorage = (db: Database): void => {
    // Export the current state of the database to a binary array
    const binaryArray = db.export();

    // Convert the binary array to a regular array and then to a JSON string
    const dbFile = JSON.stringify(Array.from(binaryArray));

    // Store the JSON string in local storage with the key 'dbFile'
    localStorage.setItem('dbFile', dbFile);
};


export const syncDatabase = async (db: Database): Promise<void> => {
    // Export the current state of the database to a binary array
    const binaryArray = db.export();
    
    // Convert the binary array to a regular array and then to a JSON string
    const dbFile = JSON.stringify(Array.from(binaryArray));
    
    // Send the JSON string to the server for synchronization
    await axios.post(`${API_URL}/sync`, { dbFile });
};
