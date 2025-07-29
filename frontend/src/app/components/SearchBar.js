import React, { useState, useEffect } from 'react';

const SearchBar = ({ search, setSearch }) => {
    const [input, setInput] = useState(search);

    useEffect(() => {
        setInput(search);
    }, [search]);

    useEffect(() => {
        const handler = setTimeout(() => setSearch(input), 300);
        return () => clearTimeout(handler);
    }, [input, setSearch]);

    return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
                type="text"
                placeholder="Search tasks..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
            />
            {search && (
                <button onClick={() => { setInput(''); setSearch(''); }}>Clear</button>
            )}
        </div>
    );
};

export default SearchBar;