export type TimelineUnit = 'day' | 'week' | 'month';

export interface Task {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number; // 0..100
  priority: number; // 1..5
  assignee: string;
  color: string;
}

export interface Milestone {
  id: string;
  name: string;
  date: Date;
  color?: string;
}

export interface TaskDependency {
  id: string;
  fromId: string;
  toId: string;
  type?: 'fs' | 'ss' | 'ff' | 'sf';
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
  milestones: Milestone[];
  dependencies: TaskDependency[];
  startDate: Date;
  endDate: Date;
}
