'use client';

import { useState } from 'react';
import { Label, createLabel, updateLabel, deleteLabel } from '@/actions/label';
import { useToast } from "@/components/ui/use-toast";

const LABEL_TYPES = ['PRIORITY', 'CATEGORY', 'STATUS', 'CUSTOM'] as const;

interface LabelDisplayProps {
  labels: Label[];
}

const LabelDisplay = ({ labels: initialLabels }: LabelDisplayProps) => {
  const [labels, setLabels] = useState<Label[]>(initialLabels);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelType, setNewLabelType] = useState<typeof LABEL_TYPES[number]>('CUSTOM');
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);
  const { toast } = useToast();

  // 新增標籤
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;

    const response = await createLabel({ 
      name: newLabelName,
      type: newLabelType
    });
    if (response.status === 'success') {
      setLabels([...labels, response.data[0]]);
      setNewLabelName('');
      setNewLabelType('CUSTOM');
      toast({
        title: "成功",
        description: "標籤已新增",
      });
    } else {
      toast({
        variant: "destructive",
        title: "錯誤",
        description: response.message,
      });
    }
  };

  // 更新標籤
  const handleUpdate = async (id: string, label: Pick<Label, 'name' | 'type'>) => {
    const response = await updateLabel(id, { 
      name: label.name,
      type: label.type
    });
    if (response.status === 'success') {
      setLabels(labels.map(l => 
        l.id === id ? response.data[0] : l
      ));
      setEditingLabel(null);
    } else {
      toast({
        variant: "destructive",
        title: "錯誤",
        description: response.message,
      });
    }
  };

  // 刪除標籤
  const handleDelete = async (id: string) => {
    const response = await deleteLabel(id);
    if (response.status === 'success') {
      setLabels(labels.filter(label => label.id !== id));
    } else {
      toast({
        variant: "destructive",
        title: "錯誤",
        description: response.message,
      });
    }
  };

  // Group labels by type
  const groupedLabels = labels.reduce((groups, label) => {
    const group = groups[label.type] || [];
    group.push(label);
    groups[label.type] = group;
    return groups;
  }, {} as Record<typeof LABEL_TYPES[number], Label[]>);

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          type="text"
          value={newLabelName}
          onChange={(e) => setNewLabelName(e.target.value)}
          placeholder="新增標籤"
          className="border p-2 rounded flex-1"
        />
        <select
          value={newLabelType}
          onChange={(e) => setNewLabelType(e.target.value as typeof LABEL_TYPES[number])}
          className="border p-2 rounded"
        >
          {LABEL_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          新增
        </button>
      </form>

      <div className="space-y-6">
        {LABEL_TYPES.map(type => (
          groupedLabels[type]?.length > 0 && (
            <div key={type} className="space-y-2">
              <h2 className="text-xl font-bold text-gray-700">{type}</h2>
              <table className="w-full border table-fixed">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left w-1/2">名稱</th>
                    <th className="border p-2 text-left w-1/2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {groupedLabels[type].map((label) => (
                    <tr key={label.id} className="border-b">
                      <td className="border p-2">
                        {editingLabel?.id === label.id ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editingLabel.name}
                              onChange={(e) => setEditingLabel({ ...editingLabel, name: e.target.value })}
                              className="border p-1 rounded w-7/12"
                            />
                            <select
                              value={editingLabel.type}
                              onChange={(e) => setEditingLabel({ 
                                ...editingLabel, 
                                type: e.target.value as typeof LABEL_TYPES[number] 
                              })}
                              className="border p-1 rounded w-5/12"
                            >
                              {LABEL_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="truncate">{label.name}</div>
                        )}
                      </td>
                      <td className="border p-2">
                        <div className="flex gap-2">
                          {editingLabel?.id === label.id ? (
                            <>
                              <button
                                onClick={() => handleUpdate(label.id, {
                                  name: editingLabel.name,
                                  type: editingLabel.type
                                })}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ))}
      </div>
    </div>
  );
};

export default LabelDisplay;
