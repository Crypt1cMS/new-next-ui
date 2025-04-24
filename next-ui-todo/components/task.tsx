'use client';

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button, Card, CardBody, Checkbox } from "@heroui/react";

interface TaskProps {
  id: string;
  task: string;
  status: boolean;
  onDelete?: () => void;
  onComplete?: () => void;
}

export default function Task({ id, task, status, onDelete, onComplete }: TaskProps) {
  const [isCompleted, setIsCompleted] = useState(status);

  async function handleToggleStatus() {
    try {
      const newStatus = !isCompleted;
      setIsCompleted(newStatus);
      
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  }

  async function handleDeleteTask() {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Notify parent component if callback is provided
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <Card className="mb-2">
      <CardBody className="flex flex-row justify-between items-center py-2">
        <div className="flex items-center gap-3">
          <Checkbox 
            isSelected={isCompleted}
            onChange={handleToggleStatus}
            size="md"
          />
          <p className={isCompleted ? "line-through text-gray-400" : ""}>
            {truncateText(task, 35)}
          </p>
        </div>
        <div>
          <Button 
            color="danger" 
            variant="light" 
            size="sm" 
            onClick={handleDeleteTask}
          >
            Delete
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}