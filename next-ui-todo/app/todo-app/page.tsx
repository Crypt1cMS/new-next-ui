"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { title, subtitle } from "@/components/primitives";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Form } from "@heroui/react";
import Task from "@/components/task";
import { useAuth } from "@/app/providers";

interface TaskItem {
  id: string;
  task: string;
  status: boolean;
  user_id: string;
}

export default function TodoApp() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only redirect if auth is done loading and no user
    if (!authLoading && !user) {
      router.push("/");
      return;
    }

    // Only fetch tasks if we have a user
    if (user) {
      fetchTasks();
      setLoading(false);
    }
  }, [user, router, authLoading]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([
          { 
            task: newTask, 
            status: false, 
            user_id: user?.id 
          }
        ])
        .select();
        
      if (error) throw error;
      
      setNewTask("");
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Show loading while auth is being checked or tasks are loading
  if (authLoading || loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">

        <div className="flex w-full justify-center items-center">
          <h1 className={title({ size: "lg" })}>Todo App</h1>
        </div>

      </div>

      <Form className="flex gap-2 mb-8" onSubmit={addTask}>
        <div className="flex w-full gap-2">
        <Input 
          className="flex-grow"
          placeholder="Add a new todo..." 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Button type="submit" color="primary">Add</Button>
        </div>
      </Form>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <p className={subtitle()}>No todos yet. Add one above!</p>
        ) : (
          tasks.map((task) => (
            <Task
              key={task.id}
              id={task.id}
              task={task.task}
              status={task.status}
              onDelete={fetchTasks}
              onComplete={fetchTasks}
            />
          ))
        )}
      </div>
    </div>
  );
}