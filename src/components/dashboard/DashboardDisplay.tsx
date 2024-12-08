'use client';

import React, { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Todo } from "@actions/types";
import { format, subDays, isWithinInterval } from 'date-fns';

interface DashboardDisplayProps {
  todos: Todo[];
}

const DashboardDisplay: React.FC<DashboardDisplayProps> = ({ todos }) => {
  const [pieChartTimeRange, setPieChartTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const getFilteredTodos = useMemo(() => {
    const now = new Date();
    const startDate = (() => {
      switch (pieChartTimeRange) {
      case 'day': return subDays(now, 1);
      case 'week': return subDays(now, 7);
      case 'month': return subDays(now, 30);
      case 'year': return subDays(now, 365);
      }
    })();

    return todos.filter(todo => 
      todo.startDate && isWithinInterval(new Date(todo.startDate), { start: startDate, end: now })
    );
  }, [todos, pieChartTimeRange]);

  // 修改：今日任務的計算邏輯
  const todayTodos = useMemo(() => todos.filter(todo => {
    if (!todo.startDate) return false;
    const todoDate = new Date(todo.startDate);
    const today = new Date();
    return format(todoDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  }), [todos]);

  const getTodoStats = (todoList: Todo[]) => {
    const total = todoList.length;
    const completed = todoList.filter(todo => todo.isDone).length;
    const completionRate = total > 0 ? (completed / total * 100).toFixed(2) : '0.00';
    return { total, completed, completionRate };
  };

  const todayStats = getTodoStats(todayTodos);
  const totalStats = getTodoStats(todos);
  const filteredStats = getTodoStats(getFilteredTodos);

  // 修改：getPieChartData 的計算邏輯
  const getPieChartData = (timeRange: 'day' | 'week' | 'month' | 'year') => {
    const now = new Date();
    const startDate = (() => {
      switch (timeRange) {
      case 'day': return subDays(now, 1);
      case 'week': return subDays(now, 7);
      case 'month': return subDays(now, 30);
      case 'year': return subDays(now, 365);
      }
    })();

    // 篩選指定時間範圍內的任務
    const filtered = todos.filter(todo => 
      todo.startDate && isWithinInterval(new Date(todo.startDate), { start: startDate, end: now })
    );

    if (filtered.length === 0) {
      return [
        { value: 0, name: '已完成' },
        { value: 0, name: '未完成' }
      ];
    }

    const completed = filtered.filter(todo => todo.isDone).length;
    const uncompleted = filtered.length - completed;

    return [
      { value: completed, name: '已完成' },
      { value: uncompleted, name: '未完成' }
    ];
  };

  const getCalendarData = useMemo(() => {
    const data = new Map<string, number>();
    
    todos.forEach(todo => {
      if (todo.startDate) {
        const dateStr = format(new Date(todo.startDate), 'yyyy-MM-dd');
        data.set(dateStr, (data.get(dateStr) || 0) + 1);
      }
    });

    return Array.from(data.entries()).map(([date, count]) => [date, count]);
  }, [todos]);

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-xl md:text-2xl font-bold mb-4">儀表板</h1>
      
      {/* 統計卡片區域 - 在小螢幕上單列，中等螢幕上雙列 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">今日任務</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">總數</p>
                <p className="text-lg font-semibold">{todayStats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-lg font-semibold">{todayStats.completed}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">完成度</p>
                <p className="text-lg font-semibold">{todayStats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">總共任務</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">總數</p>
                <p className="text-lg font-semibold">{totalStats.total}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">已完成</p>
                <p className="text-lg font-semibold">{totalStats.completed}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">完成度</p>
                <p className="text-lg font-semibold">{totalStats.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">年度任務分佈圖</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full aspect-[2/0.8] md:aspect-[2/0.6]">
            <ReactECharts 
              option={{
                tooltip: {
                  position: 'top',
                  formatter: (params: any) => {
                    return `${params.data[0]}<br/>待辦事項數量: ${params.data[1]}`;
                  }
                },
                visualMap: {
                  min: 0,
                  max: 10,
                  type: 'continuous',
                  orient: 'horizontal',
                  left: 'center',
                  top: 'top'
                },
                calendar: {
                  top: 70,
                  left: 30,
                  right: 30,
                  cellSize: ['auto', 20],
                  range: new Date().getFullYear(),
                  itemStyle: {
                    borderWidth: 0.5
                  },
                  yearLabel: { show: true }
                },
                series: {
                  type: 'heatmap',
                  coordinateSystem: 'calendar',
                  calendarIndex: 0,
                  data: getCalendarData
                }
              }}
              style={{ height: '100%', minHeight: '300px', maxHeight: '400px' }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle className="text-lg md:text-xl">待辦事項狀態分佈</CardTitle>
            <Select 
              value={pieChartTimeRange} 
              onValueChange={(value: 'day' | 'week' | 'month' | 'year') => setPieChartTimeRange(value)}
            >
              <SelectTrigger className="w-[120px] md:w-[150px]">
                <SelectValue placeholder="選擇時間範圍" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">今天</SelectItem>
                <SelectItem value="week">本週</SelectItem>
                <SelectItem value="month">本月</SelectItem>
                <SelectItem value="year">本年</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-[2/0.8] md:aspect-[2/0.6]">
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
                      data: getPieChartData(pieChartTimeRange),
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
                style={{ height: '100%', minHeight: '300px', maxHeight: '400px' }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardDisplay;
