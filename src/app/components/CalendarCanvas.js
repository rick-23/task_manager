'use client';
import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import UnassignedTasks from './UnassignedTasks';
import CalendarGrid from './CalendarGrid';
import SearchBar from './SearchBar';

const CalendarCanvas = () => {
    const [search, setSearch] = useState('');
    const handleSearchChange = useCallback((newSearch) => {
        setSearch(newSearch);
    }, []);

    // Memoize the search state to avoid unnecessary re-renders
    const memoizedSearch = React.useMemo(() => search, [search]);
    return (
        <div className="calendar-canvas">
            <div className='calendar-sidebar'>
                <Link href="/tasks/createTask">+</Link>
                <UnassignedTasks search={search} />

            </div>

            <div className="calendar-main">
                <SearchBar search={search} setSearch={setSearch} />
                <CalendarGrid search={search} />
            </div>
        </div>
    );
};

export default CalendarCanvas;