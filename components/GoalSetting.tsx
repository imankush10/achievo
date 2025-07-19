import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useGoals, Goal } from '@/hooks/useGoals';
import { Playlist } from '@/types';

interface GoalSettingProps {
  playlists: Playlist[];
  userId?: string;
}

export const GoalSetting: React.FC<GoalSettingProps> = ({ playlists, userId }) => {
  const { goals, loading, updateGoal, createGoal, deleteGoal, updateAllGoalProgress } = useGoals(userId, playlists);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // Update goal progress when playlists change
  useEffect(() => {
    if (!loading) {
      updateAllGoalProgress();
    }
  }, [playlists, loading]);

  const GoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    const isCompleted = goal.completed;

    return (
      <div className={`p-4 rounded-lg border transition-all duration-200 ${
        isCompleted 
          ? 'bg-green-500/10 border-green-500/50' 
          : 'bg-neutral-800/50 border-neutral-700/50'
      }`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">{goal.title}</h4>
            <p className="text-sm text-neutral-400">{goal.description}</p>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            {isCompleted && (
              <CheckCircleIcon className="w-5 h-5 text-green-400" />
            )}
            <button
              onClick={() => setEditingGoal(goal)}
              className="p-1 text-neutral-400 hover:text-white transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => deleteGoal(goal.id)}
              className="p-1 text-red-400 hover:text-red-300 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-300">
              {goal.current.toFixed(goal.type === 'weekly_hours' ? 1 : 0)} / {goal.target} {goal.unit}
            </span>
            <span className="text-sm font-medium text-white">
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isCompleted 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="text-xs">
          {isCompleted ? (
            <span className="text-green-400 font-medium">🎉 Goal completed!</span>
          ) : (
            <span className="text-neutral-500">
              {(goal.target - goal.current).toFixed(goal.type === 'weekly_hours' ? 1 : 0)} {goal.unit} to go
            </span>
          )}
        </div>
      </div>
    );
  };

  const CreateGoalForm: React.FC = () => {
    const [formData, setFormData] = useState({
      type: 'weekly_hours' as Goal['type'],
      title: '',
      description: '',
      target: 1,
      unit: 'hours'
    });

    const goalTypes = [
      { value: 'weekly_hours', label: 'Weekly Learning Hours', unit: 'hours' },
      { value: 'monthly_playlists', label: 'Monthly Playlists', unit: 'playlists' },
      { value: 'daily_streak', label: 'Learning Streak', unit: 'days' }
    ];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.title.trim()) return;

      createGoal(formData);
      setShowCreateForm(false);
      setFormData({
        type: 'weekly_hours',
        title: '',
        description: '',
        target: 1,
        unit: 'hours'
      });
    };

    const handleTypeChange = (type: Goal['type']) => {
      const typeInfo = goalTypes.find(t => t.value === type);
      setFormData(prev => ({
        ...prev,
        type,
        unit: typeInfo?.unit || 'units',
        title: typeInfo?.label || '',
        target: type === 'daily_streak' ? 7 : type === 'weekly_hours' ? 5 : 2
      }));
    };

    return (
      <div className="p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-white">Create New Goal</h4>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="text-neutral-400 hover:text-white"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">Goal Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as Goal['type'])}
              className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
            >
              {goalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400"
              placeholder="Enter goal title..."
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400"
              placeholder="Describe your goal..."
            />
          </div>

          <div>
            <label className="block text-sm text-neutral-300 mb-2">
              Target ({formData.unit})
            </label>
            <input
              type="number"
              min="1"
              value={formData.target}
              onChange={(e) => setFormData(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
              className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              Create Goal
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="glass-panel p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-700 rounded w-1/3"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">🎯 Learning Goals</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          New Goal
        </button>
      </div>

      {/* Create Goal Form */}
      {showCreateForm && <CreateGoalForm />}

      {/* Goals Grid */}
      {goals.length > 0 ? (
        <div className="grid gap-4">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <h4 className="text-lg font-medium text-white mb-2">No goals set yet</h4>
          <p className="text-neutral-400 mb-4">Create your first learning goal to stay motivated!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Set Your First Goal
          </button>
        </div>
      )}
    </div>
  );
};
