'use client';

import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Todo } from "@/actions/todo";
import { format, subDays, isWithinInterval } from 'date-fns';

interface DashboardDisplayProps {
  todos: Todo[];
}

const DashboardDisplay: React.FC<DashboardDisplayProps> = ({ todos }) => {
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const getFilteredTodos = useMemo(() => {
    const now = new Date();
    const startDate = (() => {
      switch (timeRange) {
        case 'day': return subDays(now, 1);
        case 'week': return subDays(now, 7);
        case 'month': return subDays(now, 30);
        case 'year': return subDays(now, 365);
      }
    })();

    return todos.filter(todo => 
      todo.startDate && isWithinInterval(new Date(todo.startDate), { start: startDate, end: now })
    );
  }, [todos, timeRange]);

  const todayTodos = useMemo(() => todos.filter(todo => 
    todo.startDate && format(new Date(todo.startDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  ), [todos]);

  const getTodoStats = (todoList: Todo[]) => {
    const total = todoList.length;
    const completed = todoList.filter(todo => todo.isDone).length;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(2) : '0.00';
    return { total, completed, completionRate };
  };

  const todayStats = getTodoStats(todayTodos);
  const totalStats = getTodoStats(todos);
  const filteredStats = getTodoStats(getFilteredTodos);

  const todoStatusData = [
    { value: filteredStats.completed, name: '已完成' },
    { value: filteredStats.total - filteredStats.completed, name: '未完成' }
  ];

  return (
    <>
      <h1 className="text-2xl font-bold mb-4">儀表板</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>今日任務</CardTitle>
          </CardHeader>
          <CardContent>
            <p>總數: {todayStats.total}</p>
            <p>已完成: {todayStats.completed}</p>
            <p>完成度: {todayStats.completionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>總共任務</CardTitle>
          </CardHeader>
          <CardContent>
            <p>總數: {totalStats.total}</p>
            <p>已完成: {totalStats.completed}</p>
            <p>完成度: {totalStats.completionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>數據篩選</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={timeRange} onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setTimeRange(value)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="選擇時間範圍" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">今天</SelectItem>
                <SelectItem value="week">本週</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="year">本年</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>待辦事項狀態分佈 ({timeRange})</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts 
            option={{
              tooltip: {
                trigger: 'item'
              },
              legend: {
                orient: 'vertical',
                left: 'left'
              },
              series: [
                {
                  name: '待辦事項狀態',
                  type: 'pie',
                  radius: '50%',
                  data: todoStatusData,
                  emphasis: {
                    itemStyle: {
                      shadowBlur: 10,
                      shadowOffsetX: 0,
                      shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                  }
                }
              ]
            }} 
            style={{ height: '300px' }} 
          />
        </CardContent>
      </Card>
    </>
  );
};

export default DashboardDisplay;
