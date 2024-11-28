'use client';

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Todo } from '@/actions/todo';

const locales = {
  'zh-TW': zhTW
}

const localizer = dateFnsLocalizer({
  format: (date: Date, formatStr: string) => format(date, formatStr, { locale: zhTW }),
  parse: (str: string, formatStr: string) => parse(str, formatStr, new Date(), { locale: zhTW }),
  startOfWeek: () => startOfWeek(new Date(), { locale: zhTW, weekStartsOn: 1 }),
  getDay,
  locales,
});

interface TodoCalendarDisplayProps {
  todos: Todo[];
}

const TodoCalendarDisplay: React.FC<TodoCalendarDisplayProps> = ({ todos }) => {
  const events = todos.map(todo => ({
    id: todo.id,
    title: todo.title,
    start: todo.startDate || todo.endDate || new Date(),
    end: todo.endDate || todo.startDate || new Date(),
    isDone: todo.isDone,
    allDay: true, // 設定為全天事件
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
  };

  return (
    <div className="h-[calc(100vh-200px)]">
      <Calendar
        localizer={localizer}
        events={events}
        views={[Views.MONTH, Views.WEEK]}
        defaultView={Views.MONTH}
        startAccessor="start"
        endAccessor="end"
        messages={messages}
        culture='zh-TW'
        eventPropGetter={(event) => ({
          style: {
            backgroundColor: event.isDone ? '#4CAF50' : '#2196F3',
            border: 'none',
            borderRadius: '4px',
          },
        })}
      />
    </div>
  );
};

export default TodoCalendarDisplay;
