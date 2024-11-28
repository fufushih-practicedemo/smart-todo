'use client';

import { useState } from 'react';
import { Label, createLabel, updateLabel, deleteLabel } from '@/actions/label';

interface LabelDisplayProps {
  labels: Label[];
}

const LabelDisplay = ({ labels: initialLabels }: LabelDisplayProps) => {
  const [labels, setLabels] = useState<Label[]>(initialLabels);
  const [newLabelName, setNewLabelName] = useState('');
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const [error, setError] = useState('');

  // 新增標籤
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    const response = await createLabel({ name: newLabelName });
    if (response.status === 'success') {
      setLabels([...labels, response.data[0]]);
      setNewLabelName('');
    } else {
      setError(response.message);
    }
  };

  // 更新標籤
  const handleUpdate = async (id: string, name: string) => {
    const response = await updateLabel(id, { name });
    if (response.status === 'success') {
      setLabels(labels.map(label => 
        label.id === id ? response.data[0] : label
      ));
      setEditingLabel(null);
    } else {
      setError(response.message);
    }
  };

  // 刪除標籤
  const handleDelete = async (id: string) => {
    const response = await deleteLabel(id);
    if (response.status === 'success') {
      setLabels(labels.filter(label => label.id !== id));
    } else {
      setError(response.message);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-600 p-2 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
          placeholder="新增標籤"
          className="border p-2 rounded flex-1"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          新增
        </button>
      </form>

      <div className="space-y-2">
        {labels.map((label) => (
          <div key={label.id} className="flex items-center gap-2 p-2 border rounded">
            {editingLabel?.id === label.id ? (
              <input
                type="text"
                value={editingLabel.name}
                onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                className="border p-1 rounded flex-1"
              />
            ) : (
              <span className="flex-1">{label.name}</span>
            )}
            
            <div className="flex gap-2">
              {editingLabel?.id === label.id ? (
                <>
                  <button
                    onClick={() => handleUpdate(label.id, editingLabel.name)}
                    className="text-green-600 hover:text-green-800"
                  >
                    儲存
                  </button>
                  <button
                    onClick={() => setEditingLabel(null)}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    取消
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingLabel(label)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => handleDelete(label.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    刪除
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelDisplay;
