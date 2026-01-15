import React, { useState } from 'react';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Icon, IconName } from './Icon';

export interface CustomQuestion {
  id: string;
  type: 'text' | 'select' | 'checkbox';
  label: string;
  required: boolean;
  options?: string[]; // For select type
}

interface CustomQuestionsBuilderProps {
  questions: CustomQuestion[];
  onChange: (questions: CustomQuestion[]) => void;
  maxQuestions?: number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const CustomQuestionsBuilder: React.FC<CustomQuestionsBuilderProps> = ({
  questions,
  onChange,
  maxQuestions = 5,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const addQuestion = () => {
    if (questions.length >= maxQuestions) return;
    const newQuestion: CustomQuestion = {
      id: generateId(),
      type: 'text',
      label: '',
      required: false,
    };
    onChange([...questions, newQuestion]);
    setEditingId(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<CustomQuestion>) => {
    onChange(
      questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      )
    );
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const moveQuestion = (id: string, direction: 'up' | 'down') => {
    const index = questions.findIndex((q) => q.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    )
      return;

    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[index],
    ];
    onChange(newQuestions);
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;
    const options = question.options || [];
    updateQuestion(questionId, { options: [...options, ''] });
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.options) return;
    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question?.options) return;
    const newOptions = question.options.filter((_, i) => i !== optionIndex);
    updateQuestion(questionId, { options: newOptions });
  };

  const questionTypes = [
    { value: 'text', label: 'Short Text' },
    { value: 'select', label: 'Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
  ];

  return (
    <div className="space-y-4">
      {questions.length === 0 ? (
        <div className="text-center py-8 text-warm-gray-500">
          <Icon name="help-circle" size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No custom questions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="border border-warm-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex items-start gap-3">
                {/* Drag handle / Order buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveQuestion(question.id, 'up')}
                    disabled={index === 0}
                    className="p-1 text-warm-gray-400 hover:text-warm-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <Icon name="chevron-up" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveQuestion(question.id, 'down')}
                    disabled={index === questions.length - 1}
                    className="p-1 text-warm-gray-400 hover:text-warm-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <Icon name="chevron-down" size={16} />
                  </button>
                </div>

                {/* Question content */}
                <div className="flex-1 space-y-3">
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Input
                        placeholder="Question text"
                        value={question.label}
                        onChange={(e) =>
                          updateQuestion(question.id, { label: e.target.value })
                        }
                      />
                    </div>
                    <div className="w-32">
                      <Select
                        value={question.type}
                        onChange={(val) =>
                          updateQuestion(question.id, {
                            type: val as CustomQuestion['type'],
                            options: val === 'select' ? [''] : undefined,
                          })
                        }
                        options={questionTypes}
                      />
                    </div>
                  </div>

                  {/* Options for select type */}
                  {question.type === 'select' && (
                    <div className="pl-4 border-l-2 border-warm-gray-100 space-y-2">
                      {(question.options || []).map((option, optIndex) => (
                        <div key={optIndex} className="flex gap-2 items-center">
                          <Input
                            placeholder={`Option ${optIndex + 1}`}
                            value={option}
                            onChange={(e) =>
                              updateOption(question.id, optIndex, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(question.id, optIndex)}
                            className="p-2 text-warm-gray-400 hover:text-error"
                            aria-label="Remove option"
                          >
                            <Icon name="x" size={16} />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(question.id)}
                        className="text-sm text-coral hover:underline flex items-center gap-1"
                      >
                        <Icon name="plus" size={14} /> Add option
                      </button>
                    </div>
                  )}

                  {/* Required toggle */}
                  <label className="flex items-center gap-2 text-sm text-warm-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={question.required}
                      onChange={(e) =>
                        updateQuestion(question.id, { required: e.target.checked })
                      }
                      className="rounded border-warm-gray-300 text-coral focus:ring-coral"
                    />
                    Required
                  </label>
                </div>

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="p-2 text-warm-gray-400 hover:text-error transition-colors"
                  aria-label="Delete question"
                >
                  <Icon name="trash-2" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {questions.length < maxQuestions && (
        <Button type="button" variant="secondary" onClick={addQuestion} className="w-full">
          <Icon name="plus" size={18} /> Add Custom Question
        </Button>
      )}

      {questions.length >= maxQuestions && (
        <p className="text-sm text-warm-gray-500 text-center">
          Maximum of {maxQuestions} custom questions reached
        </p>
      )}
    </div>
  );
};
