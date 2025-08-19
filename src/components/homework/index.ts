// 作业管理系统组件导出

// 主要组件
export { default as HomeworkDashboard } from './HomeworkDashboard'

// 作业创建组件
export { default as HomeworkBuilder } from './Creation/HomeworkBuilder'
export { default as QuestionSelector } from './Creation/QuestionSelector'
export { default as TimeSettings } from './Creation/TimeSettings'
export { default as AssignmentManager } from './Creation/AssignmentManager'

// 作业提交组件
export { default as HomeworkViewer } from './Submission/HomeworkViewer'
export { default as AnswerInput } from './Submission/AnswerInput'
// export { default as ProgressTracker } from './Submission/ProgressTracker'
// export { default as SubmissionHistory } from './Submission/SubmissionHistory'

// 批改系统组件
export { default as GradingQueue } from './Grading/GradingQueue'
// export { default as AutoGrader } from './Grading/AutoGrader'
// export { default as ManualGrading } from './Grading/ManualGrading'
// export { default as FeedbackSystem } from './Grading/FeedbackSystem'

// 分析统计组件
export { default as PerformanceStats } from './Analytics/PerformanceStats'
// export { default as ProgressReports } from './Analytics/ProgressReports'
// export { default as TrendAnalysis } from './Analytics/TrendAnalysis'

// 工具函数和常量
export * from '../../data/homework-examples/year3-templates'
export * from '../../data/homework-examples/year6-templates'