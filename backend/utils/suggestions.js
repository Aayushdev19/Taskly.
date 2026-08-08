function generateUserSuggestions(todos) {
  const total = todos.length;
  const completed = todos.filter((t) => t.status === "completed");
  const pending = todos.filter((t) => t.status === "pending");
  const completedCount = completed.length;
  const pendingCount = pending.length;

  const completionRate =
    total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const now = new Date();
  const overdue = pending.filter((t) => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < now;
  });
  const overdueCount = overdue.length;

  const dueSoon = pending.filter((t) => {
    if (!t.due_date) return false;
    const dueTime = new Date(t.due_date).getTime();
    const diffMs = dueTime - now.getTime();
    return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
  });
  const dueSoonCount = dueSoon.length;

  let avgCompletionTimeHours = 0;
  if (completedCount > 0) {
    const totalDurationMs = completed.reduce((sum, t) => {
      const created = new Date(t.created_at);
      const finished = t.completed_at ? new Date(t.completed_at) : new Date();
      return sum + (finished - created);
    }, 0);
    const avgDurationMs = totalDurationMs / completedCount;
    avgCompletionTimeHours =
      Math.round((avgDurationMs / (1000 * 60 * 60)) * 10) / 10;
  }

  const categoryCounts = {};
  todos.forEach((t) => {
    const cat = t.category || "other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const priorityCounts = { low: 0, medium: 0, high: 0 };
  todos.forEach((t) => {
    const prio = t.priority || "medium";
    if (priorityCounts[prio] !== undefined) {
      priorityCounts[prio]++;
    } else {
      priorityCounts[prio] = 1;
    }
  });
  const priorityData = Object.entries(priorityCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const historyMap = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    historyMap[dateStr] = { label, count: 0 };
  }

  completed.forEach((t) => {
    if (t.completed_at) {
      const compDateStr = new Date(t.completed_at).toISOString().split("T")[0];
      if (historyMap[compDateStr]) {
        historyMap[compDateStr].count++;
      }
    }
  });

  const completionHistory = Object.values(historyMap);

  const recommendations = [];

  // Sleep duration and pattern analysis
  let todaySleep = 0;
  let tomorrowSleep = 0;
  let hasSleepTasks = false;

  todos.forEach((t) => {
    const titleLower = t.title.toLowerCase();
    if (titleLower.includes("sleep")) {
      hasSleepTasks = true;
      const hoursMatch = t.title.match(/(\d+(?:\.\d+)?)/);
      if (hoursMatch) {
        const hours = parseFloat(hoursMatch[1]);
        let isToday = titleLower.includes("today");
        let isTomorrow = titleLower.includes("tomorrow");

        if (!isToday && !isTomorrow && t.due_date) {
          const dueDate = new Date(t.due_date);
          const todayDate = new Date();

          dueDate.setHours(0, 0, 0, 0);
          todayDate.setHours(0, 0, 0, 0);

          const diffTime = dueDate.getTime() - todayDate.getTime();
          const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays === 0) {
            isToday = true;
          } else if (diffDays === 1) {
            isTomorrow = true;
          }
        }

        if (isToday) {
          todaySleep += hours;
        } else if (isTomorrow) {
          tomorrowSleep += hours;
        }
      }
    }
  });

  if (hasSleepTasks && (todaySleep > 0 || tomorrowSleep > 0)) {
    const totalSleep = todaySleep + tomorrowSleep;
    if (
      todaySleep > 0 &&
      tomorrowSleep > 0 &&
      (todaySleep < 8 || tomorrowSleep < 8)
    ) {
      recommendations.push({
        id: "sleep_deprivation_harmful",
        title: "Sleep Deprivation Alert",
        type: "health",
        description: `Sleeping only ${todaySleep} hours today and ${tomorrowSleep} hours tomorrow is harmful. You need to sleep 8 hours daily.`,
        severity: "warning",
      });
    } else {
      if (todaySleep > 0 && todaySleep < 8) {
        recommendations.push({
          id: "sleep_deprivation_today",
          title: "Inadequate Sleep Today",
          type: "health",
          description: `Sleeping only ${todaySleep} hours today is harmful. You need to sleep 8 hours.`,
          severity: "warning",
        });
      }
      if (tomorrowSleep > 0 && tomorrowSleep < 8) {
        recommendations.push({
          id: "sleep_deprivation_tomorrow",
          title: "Low Sleep Scheduled",
          type: "health",
          description: `Sleeping only ${tomorrowSleep} hours tomorrow is harmful. You need to sleep 8 hours.`,
          severity: "warning",
        });
      }
    }
  }

  if (total === 0) {
    recommendations.push({
      id: "no_tasks",
      title: "Get Started!",
      type: "productivity",
      description:
        "Your workspace is empty. Try creating a few tasks and categorizing them to start building momentum.",
      severity: "info",
    });
  } else if (completionRate < 35 && total >= 3) {
    recommendations.push({
      id: "low_completion",
      title: "Action Item Overload",
      type: "productivity",
      description: `Your completion rate is currently ${completionRate}%. Try focusing on finishing pending tasks before creating new ones.`,
      severity: "warning",
    });
  } else if (completionRate >= 80 && total >= 3) {
    recommendations.push({
      id: "high_completion",
      title: "Superb Productivity!",
      type: "productivity",
      description: `Outstanding work! You have completed ${completionRate}% of your tasks. Continue maintaining this streak.`,
      severity: "success",
    });
  }

  if (overdueCount > 0) {
    recommendations.push({
      id: "overdue_tasks",
      title: "Address Overdue Items",
      type: "productivity",
      description: `You have ${overdueCount} overdue task(s). Prioritize rescheduling these or clearing them out to keep your dashboard clean.`,
      severity: "warning",
    });
  }

  if (dueSoonCount > 0) {
    recommendations.push({
      id: "due_soon_alert",
      title: "Upcoming Deadlines",
      type: "productivity",
      description: `You have ${dueSoonCount} task(s) due within the next 24 hours. Prepare your schedule to focus on these tasks.`,
      severity: "info",
    });
  }

  const workCount = categoryCounts["work"] || 0;
  const healthCount = categoryCounts["health"] || 0;

  if (total > 4) {
    const workRatio = workCount / total;
    if (workRatio > 0.7) {
      recommendations.push({
        id: "category_imbalance_work",
        title: "Work-Life Balance Alert",
        type: "health",
        description: `${Math.round(workRatio * 100)}% of your tasks are work-related. Set aside some health or personal goals to maintain balance.`,
        severity: "info",
      });
    }

    if (healthCount === 0) {
      recommendations.push({
        id: "category_health_missing",
        title: "Integrate Self-Care",
        type: "health",
        description:
          "You have no health-related tasks. Incorporate routine check-ups, exercise, or mindfulness sessions.",
        severity: "info",
      });
    }
  }

  const highPriorityPending = pending.filter(
    (t) => t.priority === "high",
  ).length;
  if (highPriorityPending >= 3) {
    recommendations.push({
      id: "high_prio_load",
      title: "High Priority Overload",
      type: "productivity",
      description: `You have ${highPriorityPending} pending high-priority tasks. Block out dedicated deep-work sessions to tackle them first.`,
      severity: "warning",
    });
  }

  if (pendingCount > 10) {
    recommendations.push({
      id: "large_backlog",
      title: "Minimize Backlog",
      type: "productivity",
      description: `You currently have ${pendingCount} pending tasks. Apply the Eisenhower Matrix to filter what is truly urgent and important.`,
      severity: "warning",
    });
  }

  if (completedCount > 2 && avgCompletionTimeHours > 48) {
    recommendations.push({
      id: "slow_completion_time",
      title: "Accelerate Task Velocity",
      type: "productivity",
      description: `Completed tasks take an average of ${avgCompletionTimeHours} hours. Try splitting goals into smaller daily checkpoints.`,
      severity: "info",
    });
  } else if (completedCount > 2 && avgCompletionTimeHours < 12) {
    recommendations.push({
      id: "fast_completion_time",
      title: "Fast Task Velocity",
      type: "productivity",
      description: `Tasks are completed in an average of ${avgCompletionTimeHours} hours. Excellent response times!`,
      severity: "success",
    });
  }

  const lowPriorityPending = pending.filter((t) => t.priority === "low").length;
  if (lowPriorityPending >= 5) {
    recommendations.push({
      id: "low_prio_clutter",
      title: "Clutter Control",
      type: "productivity",
      description: `You have ${lowPriorityPending} low-priority pending items. Consider removing or consolidating them to stay focused.`,
      severity: "info",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      id: "steady_progress",
      title: "Keep it Up!",
      type: "productivity",
      description:
        "You have a healthy, balanced schedule. Continue keeping track of your todos and updating deadlines.",
      severity: "success",
    });
  }

  return {
    metrics: {
      total,
      completed: completedCount,
      pending: pendingCount,
      overdue: overdueCount,
      completionRate,
      avgCompletionTimeHours,
    },
    charts: {
      categoryData,
      priorityData,
      completionHistory,
    },
    recommendations,
  };
}

module.exports = {
  generateUserSuggestions,
};
