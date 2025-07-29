'use client';
import CalendarCanvas from "./components/CalendarCanvas";
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchTasks } from './store/fetchTasks';

export default function Home() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  return (
    <div>
      <CalendarCanvas></CalendarCanvas>
    </div>
  );
}
