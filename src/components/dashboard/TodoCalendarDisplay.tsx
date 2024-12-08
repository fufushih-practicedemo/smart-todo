'use client';

import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Todo } from '@actions/types';
import { useState, useEffect } from 'react';

const locales = {
  'zh-TW': zhTW
}

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => format(date, formatStr, { locale: zhTW }),
  parse: (str: string, formatStr: string) => parse(str, formatStr, new Date(), { locale: zhTW }),
  startOfWeek: () => startOfWeek(new Date(), { locale: zhTW }),
  getDay,
  locales,
});

interface TodoCalendarDisplayProps {
  todos: Todo[];
}

const TodoCalendarDisplay: React.FC<TodoCalendarDisplayProps> = ({ todos }) => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<View>(Views.MONTH);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && view === Views.WEEK) {
        setView(Views.DAY);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [view]);

  const events = todos.map(todo => ({
    id: todo.id,
    title: todo.title,
    start: new Date(todo.startDate || todo.endDate || new Date()),
    end: new Date(todo.endDate || todo.startDate || new Date()),
    isDone: todo.isDone,
    allDay: true,
  }));

  const messages = {
    week: '週',
    work_week: '工作週',
    day: '日',
    month: '月',
    previous: '上一個',
    next: '下一個',
    today: '今天',
    agenda: '議程',
    showMore: (total: number) => `+${total} 更多`,
  };

  return (
    <div className={`${isMobile ? 'h-[calc(100vh-150px)]' : 'h-[calc(100vh-200px)]'}`}>
      <Calendar
        localizer={localizer}
        events={events}
        views={isMobile ? [Views.MONTH, Views.DAY] : [Views.MONTH, Views.WEEK]}
        defaultView={Views.MONTH}
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        culture='zh-TW'
        popup
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.isDone ? '#4CAF50' : '#2196F3',
            border: 'none',
            borderRadius: '4px',
            padding: isMobile ? '2px' : '4px',
            fontSize: isMobile ? '12px' : '14px',
          },
        })}
      />
    </div>
  );
};

export default TodoCalendarDisplay;
