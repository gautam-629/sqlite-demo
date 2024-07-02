// App.tsx
import React, { useState, useEffect } from 'react';
import { Database } from 'sql.js';
import { addPerson, deletePerson, getPeople, initDBFromLocalStorage, login, syncDatabase, updatePerson } from './service'


const App: React.FC = () => {
  const [db, setDb] = useState<Database | null>(null);
  const [people, setPeople] = useState<Array<{ id: number; name: string; age: number }>>([]);
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<number | ''>('');

  useEffect(() => {
    const initializeDB = async () => {
      try {
        const database = await initDBFromLocalStorage();
        setDb(database);
        setPeople(getPeople(database));
      } catch (error) {
        console.error('Error initializing database', error);
      }
    };

    initializeDB();
  }, []);

  const handleLogin = async () => {
    await login('user', 'password');
    const database = await initDBFromLocalStorage();
    setDb(database);
    setPeople(getPeople(database));
  };

  const handleAddPerson = () => {
    if (db && name && age !== '') {
      addPerson(db, name, Number(age));
      setPeople(getPeople(db));
    }
  };

  const handleUpdatePerson = (id: number) => {
    if (db) {
      const updatedName = prompt('Enter new name:', name);
      const updatedAge = prompt('Enter new age:', String(age));
      if (updatedName && updatedAge !== '') {
        updatePerson(db, id, updatedName, Number(updatedAge));
        setPeople(getPeople(db));
      }
    }
  };

  const handleDeletePerson = (id: number) => {
    if (db) {
      deletePerson(db, id);
      setPeople(getPeople(db));
    }
  };

  const handleSync = async () => {
    if (db) {
      await syncDatabase(db);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Mobile Khata</h1>
      <button onClick={handleLogin} className="bg-blue-500 text-white p-2 mb-4">Login</button>
      <div className="mb-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="border p-2 mr-2"
        />
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          placeholder="Age"
          className="border p-2 mr-2"
        />
        <button onClick={handleAddPerson} className="bg-green-500 text-white p-2">Add Person</button>
      </div>
      <ul>
        {people.map((person) => (
          <li key={person.id}>
            {person.name} - {person.age}
            <button onClick={() => handleUpdatePerson(person.id)} className="ml-2 bg-yellow-500 text-white p-1">Edit</button>
            <button onClick={() => handleDeletePerson(person.id)} className="ml-2 bg-red-500 text-white p-1">Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={handleSync} className="bg-blue-500 text-white p-2 mt-4">Sync</button>
    </div>
  );
};

export default App;