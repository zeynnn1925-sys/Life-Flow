import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Clock, CheckCircle2, Circle, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List, Globe, ExternalLink } from 'lucide-react';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

import { useLanguage } from '../contexts/LanguageContext';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { exportTasks } from '../services/exportService';
import { ConfirmationModal } from './ConfirmationModal';
import { fetchCalendarEvents, CalendarEvent } from '../services/googleCalendarService';

type ScheduleView = 'daily' | 'weekly' | 'monthly';

export default function DailySchedule() {
  const { language, t } = useLanguage();
  const { tasks, saveTask, deleteTask: deleteTaskFromDb } = useData();
  const { user, googleAccessToken, isCalendarConnected, connectGoogleCalendar, disconnectGoogleCalendar } = useAuth();

  const [view, setView] = useState<ScheduleView>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const [googleEvents, setGoogleEvents] = useState<CalendarEvent[]>([]);
  const [isFetchingGoogle, setIsFetchingGoogle] = useState(false);

  useEffect(() => {
    const fetchGoogleEvents = async () => {
      if (!googleAccessToken || !isCalendarConnected) {
        setGoogleEvents([]);
        return;
      }

      setIsFetchingGoogle(true);
      try {
        // Fetch events for a larger range (e.g., current month) to cover all views or just for the current view
        // For simplicity, let's fetch for the current month of selectedDate
        const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        
        const events = await fetchCalendarEvents(googleAccessToken, startOfMonth, endOfMonth);
        setGoogleEvents(events);
      } catch (error) {
        console.error('Error in fetching google events component:', error);
        if ((error as Error).message === 'UNAUTHORIZED') {
          disconnectGoogleCalendar();
        }
      } finally {
        setIsFetchingGoogle(false);
      }
    };

    fetchGoogleEvents();
  }, [googleAccessToken, isCalendarConnected, selectedDate.getMonth(), selectedDate.getFullYear()]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !date) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      date,
      startTime,
      endTime,
      completed: false,
    };

    saveTask(newTask);
    setTitle('');
    setStartTime('');
    setEndTime('');
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      saveTask({ ...task, completed: !task.completed });
    }
  };

  const deleteTask = (id: string) => {
    deleteTaskFromDb(id);
    setTaskToDelete(null);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const changeMonth = (months: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + months);
    setSelectedDate(newDate);
  };

  const filteredTasks = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return tasks.filter(t => t.date === dateStr);
  }, [tasks, selectedDate]);

  const filteredGoogleEvents = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const day = selectedDate.getDate();
    
    return googleEvents.filter(event => {
      const start = event.start.dateTime ? new Date(event.start.dateTime) : (event.start.date ? new Date(event.start.date) : null);
      if (!start) return false;
      return start.getFullYear() === year && start.getMonth() === month && start.getDate() === day;
    });
  }, [googleEvents, selectedDate]);

  const weekDays = useMemo(() => {
    const days = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    return days;
  }, [selectedDate]);

  const monthDays = useMemo(() => {
    const days = [];
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    
    // Padding for start of month
    const startPadding = firstDayOfMonth.getDay();
    for (let i = 0; i < startPadding; i++) {
      const day = new Date(firstDayOfMonth);
      day.setDate(firstDayOfMonth.getDate() - (startPadding - i));
      days.push({ date: day, isCurrentMonth: false });
    }
    
    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push({ date: new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i), isCurrentMonth: true });
    }
    
    // Padding for end of month
    const endPadding = 42 - days.length; // 6 rows of 7 days
    for (let i = 1; i <= endPadding; i++) {
      const day = new Date(lastDayOfMonth);
      day.setDate(lastDayOfMonth.getDate() + i);
      days.push({ date: day, isCurrentMonth: false });
    }
    
    return days;
  }, [selectedDate]);

  const renderDailyView = () => (
    <div className="bg-surface-1 rounded-lg shadow-card border border-hairline overflow-hidden">
      <div className="p-6 border-b border-hairline flex items-center justify-between gap-4 bg-surface-1/50">
        <div className="flex items-center gap-2 sm:gap-6 flex-1">
          <button onClick={() => changeDate(-1)} className="p-2 hover:bg-surface-2 rounded-md transition-colors shrink-0 text-ink-tertiary hover:text-ink">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-heading-sm font-bold text-ink text-center flex-1 truncate">
            {selectedDate.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h3>
          <button onClick={() => changeDate(1)} className="p-2 hover:bg-surface-2 rounded-md transition-colors shrink-0 text-ink-tertiary hover:text-ink">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <Clock className="w-5 h-5 text-ink-tertiary hidden sm:block shrink-0" />
      </div>
      <div className="divide-y divide-hairline">
        <AnimatePresence initial={false} mode="wait">
          {filteredTasks.length === 0 && filteredGoogleEvents.length === 0 ? (
            <div className="p-16 text-center text-ink-tertiary text-body-sm italic">
              {t('noTasks')}
            </div>
          ) : (
            <div key="tasks">
              {/* Google Calendar Events */}
              {filteredGoogleEvents.map((event) => {
                const startTime = event.start.dateTime 
                  ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                  : '--:--';
                const endTime = event.end.dateTime 
                  ? new Date(event.end.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                  : '';

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 flex items-center justify-between group transition-colors relative border-l-2 border-[#4285F4] bg-[#4285F4]/5"
                  >
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="w-6 h-6 rounded-md border border-[#4285F4]/30 flex items-center justify-center bg-white text-[#4285F4]">
                        <Globe className="w-3 h-3" />
                      </div>
                      <div>
                        <div className="text-body-sm font-bold text-[#4285F4] flex items-center gap-2">
                          {event.summary}
                          <span className="text-[9px] bg-[#4285F4]/10 px-1.5 py-0.5 rounded uppercase">{t('googleCalendar')}</span>
                        </div>
                        <div className="text-[10px] text-ink-tertiary flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span className="font-mono">{startTime}</span>
                          {endTime && (
                            <>
                              <span className="text-hairline-strong">—</span>
                              <span className="font-mono">{endTime}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Local Tasks */}
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    backgroundColor: task.completed ? '#141516' : '#0f1011'
                  }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 flex items-center justify-between group transition-colors relative border-l-2 ${
                    task.completed ? 'border-ink-tertiary' : 'hover:bg-surface-2 border-transparent hover:border-accent'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
                        task.completed ? 'bg-accent border-accent text-white shadow-glow-accent scale-110' : 'border-hairline-strong bg-surface-1 text-transparent hover:border-accent hover:scale-105'
                      }`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ 
                          scale: task.completed ? 1 : 0,
                          rotate: task.completed ? 0 : -90
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </motion.div>
                    </button>
                    <div>
                      <div className={`text-body-sm font-bold transition-all relative inline-block ${task.completed ? 'text-ink-tertiary' : 'text-ink'}`}>
                        {task.title}
                        <motion.div 
                          className="absolute left-0 top-1/2 h-[1.5px] bg-ink-tertiary/40 -translate-y-1/2"
                          initial={false}
                          animate={{ width: task.completed ? '100%' : '0%' }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                        />
                      </div>
                      <div className="text-[10px] text-ink-tertiary flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span className="font-mono">{task.startTime}</span>
                        {task.endTime && (
                          <>
                            <span className="text-hairline-strong">—</span>
                            <span className="font-mono">{task.endTime}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setTaskToDelete(task.id)}
                    className="p-2 text-ink-tertiary hover:text-danger rounded-md opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderWeeklyView = () => (
    <div className="bg-surface-1 rounded-lg shadow-card border border-hairline overflow-hidden">
      <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface-1/50">
        <div className="flex items-center gap-6">
          <button onClick={() => changeDate(-7)} className="p-2 hover:bg-surface-2 rounded-md transition-colors text-ink-tertiary hover:text-ink">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-heading-sm font-bold text-ink">
            {t('weekOf')} {weekDays[0].toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' })}
          </h3>
          <button onClick={() => changeDate(7)} className="p-2 hover:bg-surface-2 rounded-md transition-colors text-ink-tertiary hover:text-ink">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 divide-x divide-hairline min-h-[450px]">
          {weekDays.map((day, idx) => {
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, '0');
          const d = String(day.getDate()).padStart(2, '0');
          const dayStr = `${year}-${month}-${d}`;
          const dayTasks = tasks.filter(t => t.date === dayStr);
          const dayGoogleEvents = googleEvents.filter(event => {
            const start = event.start.dateTime ? new Date(event.start.dateTime) : (event.start.date ? new Date(event.start.date) : null);
            if (!start) return false;
            return start.getFullYear() === year && start.getMonth() === day.getMonth() && start.getDate() === day.getDate();
          });
          
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const isToday = dayStr === todayStr;
          
          return (
            <div key={idx} className={`p-2 space-y-3 ${isToday ? 'bg-surface-2/30' : ''}`}>
              <div className="text-center pb-3 border-b border-hairline/50">
                <div className="text-eyebrow text-ink-tertiary uppercase mb-1">
                  {day.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' })}
                </div>
                <div className={`text-heading-xs font-black ${isToday ? 'text-accent' : 'text-ink-subtle'}`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-1.5">
                {/* Google Events in Weekly */}
                {dayGoogleEvents.map(event => {
                  const startTime = event.start.dateTime 
                    ? new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                    : '--:--';
                  return (
                    <div 
                      key={event.id} 
                      className="text-[10px] p-2 rounded-md border bg-[#4285F4]/10 border-[#4285F4]/20 text-[#4285F4] truncate relative overflow-hidden shadow-sm"
                      title={event.summary}
                    >
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="font-mono opacity-60 shrink-0">{startTime}</span>
                        <span className="truncate">{event.summary}</span>
                      </div>
                    </div>
                  );
                })}

                {/* Local Tasks in Weekly */}
                {dayTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`text-[10px] p-2 rounded-md border transition-all ${
                      task.completed 
                        ? 'bg-accent/10 border-accent/20 text-accent opacity-60' 
                        : 'bg-surface-1 border-hairline text-ink-muted shadow-sm hover:border-hairline-strong'
                    } truncate relative overflow-hidden`}
                    title={task.title}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      <span className="font-mono opacity-60 shrink-0">{task.startTime}</span>
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );

  const renderMonthlyView = () => (
    <div className="bg-surface-1 rounded-lg shadow-card border border-hairline overflow-hidden">
      <div className="p-6 border-b border-hairline flex items-center justify-between bg-surface-1/50">
        <div className="flex items-center gap-6">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-surface-2 rounded-md transition-colors text-ink-tertiary hover:text-ink">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h3 className="text-heading-sm font-bold text-ink">
            {selectedDate.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-surface-2 rounded-md transition-colors text-ink-tertiary hover:text-ink">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div>
          <div className="grid grid-cols-7 text-center border-b border-hairline">
            {(language === 'id' ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map(d => (
              <div key={d} className="py-3 text-eyebrow text-ink-tertiary uppercase">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 divide-x divide-y divide-hairline">
            {monthDays.map((dayObj, idx) => {
          const year = dayObj.date.getFullYear();
          const month = String(dayObj.date.getMonth() + 1).padStart(2, '0');
          const d = String(dayObj.date.getDate()).padStart(2, '0');
          const dayStr = `${year}-${month}-${d}`;
          const dayTasks = tasks.filter(t => t.date === dayStr);
          const dayGoogleEvents = googleEvents.filter(event => {
            const start = event.start.dateTime ? new Date(event.start.dateTime) : (event.start.date ? new Date(event.start.date) : null);
            if (!start) return false;
            return start.getFullYear() === year && start.getMonth() === dayObj.date.getMonth() && start.getDate() === dayObj.date.getDate();
          });
          
          const today = new Date();
          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          const isToday = dayStr === todayStr;
          
          const selYear = selectedDate.getFullYear();
          const selMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
          const selDay = String(selectedDate.getDate()).padStart(2, '0');
          const isSelected = dayStr === `${selYear}-${selMonth}-${selDay}`;
          
          return (
            <div 
              key={idx} 
              onClick={() => {
                setSelectedDate(dayObj.date);
                setView('daily');
              }}
              className={`min-h-[110px] p-2 cursor-pointer transition-all relative group ${
                !dayObj.isCurrentMonth ? 'bg-surface-2/20 opacity-30 grayscale' : 'hover:bg-surface-2'
              } ${isSelected ? 'bg-accent/5 ring-1 ring-inset ring-accent' : isToday ? 'bg-accent/5' : ''}`}
            >
              <div className={`text-[10px] font-bold mb-2.5 w-7 h-7 flex items-center justify-center rounded-md border transition-all ${
                isSelected ? 'bg-accent border-accent text-white shadow-glow-accent' : 
                isToday ? 'bg-surface-3 border-accent text-accent' : 
                'text-ink-tertiary border-transparent group-hover:border-hairline-strong'
              }`}>
                {dayObj.date.getDate()}
              </div>
              <div className="space-y-1">
                {/* Google Events in Monthly */}
                {dayGoogleEvents.slice(0, 2).map(event => (
                  <div 
                    key={event.id} 
                    className="w-full px-1.5 py-1 rounded text-[9px] truncate font-bold border border-[#4285F4]/20 bg-[#4285F4]/10 text-[#4285F4] transition-colors shadow-sm"
                    title={event.summary}
                  >
                    {event.summary}
                  </div>
                ))}
                
                {/* Local Tasks in Monthly */}
                {dayTasks.slice(0, 3 - Math.min(dayGoogleEvents.length, 2)).map(task => (
                  <div 
                    key={task.id} 
                    className={`w-full px-1.5 py-1 rounded text-[9px] truncate font-bold border transition-colors shadow-sm ${
                      task.completed 
                        ? 'bg-accent/10 border-accent/20 text-accent opacity-60' 
                        : 'bg-surface-1 border-hairline text-ink-subtle'
                    }`}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-[9px] font-black text-ink-tertiary text-center bg-surface-2 rounded-md py-1 border border-hairline">
                    +{dayTasks.length - 3}
                  </div>
                )}
              </div>
            </div>
          );
        })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.1]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #CBD5E1 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }}
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6 relative z-10"
      >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-heading-md font-bold text-ink">{t('schedule')}</h2>
        <div className="flex items-center bg-surface-2 p-1 rounded-pill border border-hairline shadow-sm w-fit">
          <button
            onClick={() => exportTasks(tasks, user?.displayName || 'User', t)}
            className="p-2 text-ink-tertiary hover:text-accent hover:bg-surface-3 rounded-pill transition-all mr-1"
            title={t('exportCSV')}
          >
            <List className="w-4 h-4 rotate-90" />
          </button>
          <div className="w-px h-4 bg-hairline mx-1" />
          <button
            onClick={() => setView('daily')}
            className={`p-2 rounded-pill transition-all ${view === 'daily' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
            title={t('dailyView')}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`p-2 rounded-pill transition-all ${view === 'weekly' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
            title={t('weeklyView')}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('monthly')}
            className={`p-2 rounded-pill transition-all ${view === 'monthly' ? 'bg-accent text-white shadow-glow-accent' : 'text-ink-tertiary hover:text-ink'}`}
            title={t('monthlyView')}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          
          <div className="w-px h-4 bg-hairline mx-1" />
          
          {isCalendarConnected ? (
            <button
              onClick={() => disconnectGoogleCalendar()}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-pill border border-[#4285F4]/20 bg-[#4285F4]/10 text-[#4285F4] text-[10px] font-black uppercase tracking-tight hover:bg-[#4285F4]/20 transition-all ${isFetchingGoogle ? 'animate-pulse' : ''}`}
            >
              <Globe className="w-3 h-3" />
              {isFetchingGoogle ? t('fetchingEvents') : t('googleCalendar')}
            </button>
          ) : (
            <button
              onClick={async () => {
                try {
                  await connectGoogleCalendar();
                } catch (err) {
                  // Error is already logged in AuthContext
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-pill border border-hairline bg-surface-1 text-ink-tertiary text-[10px] font-black uppercase tracking-tight hover:border-[#4285F4]/50 hover:text-[#4285F4] transition-all"
            >
              <Globe className="w-3 h-3" />
              {t('connectGoogleCalendar')}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 lg:sticky lg:top-24 h-fit">
          <form onSubmit={addTask} className="bg-surface-1 p-8 rounded-lg shadow-card border border-hairline space-y-6 group">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-accent/10 border border-accent/20 rounded-xl flex items-center justify-center text-accent shadow-sm transition-transform group-hover:rotate-12">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <h3 className="text-heading-sm font-black text-ink uppercase tracking-tight">{t('addSchedule')}</h3>
            </div>
            
            <div>
              <label className="block text-eyebrow font-black text-ink-tertiary uppercase mb-2 tracking-widest">{t('activity')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-14 px-6 bg-surface-2 border border-hairline rounded-md focus:border-accent outline-none text-ink text-body-sm font-black transition-all placeholder:font-medium placeholder:text-ink-tertiary/20 shadow-inner"
                placeholder="e.g. Morning Run, Meeting"
              />
            </div>
            
            <div>
              <label className="block text-eyebrow font-black text-ink-tertiary uppercase mb-2 tracking-widest">{t('date')}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-14 px-6 bg-surface-2 border border-hairline rounded-md focus:border-accent outline-none text-ink text-body-sm font-black transition-all shadow-inner"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-eyebrow font-black text-ink-tertiary uppercase mb-2 tracking-widest">{t('startTime')}</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-surface-2 border border-hairline rounded-md focus:border-accent outline-none text-ink text-body-sm font-mono font-black transition-all shadow-inner"
                  />
                </div>
              </div>
              <div>
                <label className="block text-eyebrow font-black text-ink-tertiary uppercase mb-2 tracking-widest">{t('endTime')}</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-tertiary" />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full h-14 pl-12 pr-4 bg-surface-2 border border-hairline rounded-md focus:border-accent outline-none text-ink text-body-sm font-mono font-black transition-all shadow-inner"
                  />
                </div>
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full h-14 bg-accent text-white rounded-pill font-black text-button uppercase tracking-widest shadow-glow-accent hover:bg-accent-hover active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Plus className="w-6 h-6" />
              {t('addToSchedule')}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + selectedDate.toISOString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'daily' && renderDailyView()}
              {view === 'weekly' && renderWeeklyView()}
              {view === 'monthly' && renderMonthlyView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ConfirmationModal
        isOpen={!!taskToDelete}
        title={t('deleteTask')}
        message={t('deleteTaskConfirm')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        type="danger"
        onConfirm={() => taskToDelete && deleteTask(taskToDelete)}
        onCancel={() => setTaskToDelete(null)}
      />
    </motion.div>
    </div>
  );
}
