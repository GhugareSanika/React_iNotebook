import { createContext, useState, useEffect } from "react";

export const NoteContext = createContext();

export function NoteProvider(props) {
    const HOST = "http://localhost:3002";
    const initialNotes = [];

    const [notes, setNotes] = useState(initialNotes);

    useEffect(() => {
        // Fetch notes when the component mounts
        getNotes();
    }, []); // Empty dependency array to ensure it only runs once

    const getNotes = async () => {
        try {
            const response = await fetch(`${HOST}/api/notes/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token'),
                },
            });
    
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
    
            const json = await response.json();
    
            if (Array.isArray(json)) {
                // Assume the response is an array of notes
                setNotes(json);
            } else if (json.data && Array.isArray(json.data)) {
                // Assume the response has a "data" property containing an array
                setNotes(json.data);
            } else {
                console.error("Unexpected API response structure:", json);
            }
        } catch (error) {
            console.error("Error fetching notes:", error.message);
        }
    };
    


    const add = async (newNote) => {
        try {
            const response = await fetch(`${HOST}/api/notes/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token'),
                },
                body: JSON.stringify(newNote),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const json = await response.json();
            setNotes((prevNotes) => [...prevNotes, json]); // Update state after successful API response
            console.log(json);
        } catch (error) {
            console.error("Error adding note:", error.message);
        }
    };

    const remove = async (removeId) => {
        try {
            const response = await fetch(`${HOST}/api/notes/${removeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token'),
                },
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const json = await response.json();
            setNotes((prevNotes) => prevNotes.filter((note) => note._id !== removeId)); // Update state after successful API response
            console.log(json);
        } catch (error) {
            console.error("Error removing note:", error.message);
        }
    };

    const edit = async (title, description, tag, id) => {
        try {
            const response = await fetch(`${HOST}/api/notes/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': localStorage.getItem('token'),
                },
                body: JSON.stringify({ title, description, tag }),
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }

            const json = await response.json();
            setNotes((prevNotes) =>
                prevNotes.map((note) => (note._id === id ? { ...note, title, description, tag } : note))
            ); // Update state after successful API response
            console.log(json);
        } catch (error) {
            console.error("Error editing note:", error.message);
        }
    };

    return (
        <NoteContext.Provider value={{ notes, add, remove, edit, getNotes }}>
            {props.children}
        </NoteContext.Provider>
    );
}
