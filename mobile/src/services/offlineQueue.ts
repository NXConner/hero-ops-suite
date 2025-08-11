import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CONFIG } from '../config';

export type QueuedRequest = {
  id: string;
  method: 'POST' | 'PUT' | 'DELETE';
  url: string;
  body?: any;
  createdAt: number;
};

function uuidv4() {
  // Simple RFC4122-ish UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const STORAGE_KEY = 'offline_queue_v1';

export async function enqueue(req: Omit<QueuedRequest, 'id' | 'createdAt'>) {
  const queue = await readQueue();
  const item: QueuedRequest = { ...req, id: uuidv4(), createdAt: Date.now() };
  queue.push(item);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  return item.id;
}

export async function readQueue(): Promise<QueuedRequest[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as QueuedRequest[]) : [];
}

export async function replaceQueue(queue: QueuedRequest[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export async function processQueue(): Promise<{ sent: number; remaining: number }> {
  const queue = await readQueue();
  if (queue.length === 0) return { sent: 0, remaining: 0 };
  const nextQueue: QueuedRequest[] = [];
  let sent = 0;
  for (const item of queue) {
    try {
      const url = `${CONFIG.API_BASE_URL}${item.url}`;
      if (item.method === 'POST') await axios.post(url, item.body);
      else if (item.method === 'PUT') await axios.put(url, item.body);
      else if (item.method === 'DELETE') await axios.delete(url);
      sent += 1;
    } catch (e) {
      nextQueue.push(item);
    }
  }
  await replaceQueue(nextQueue);
  return { sent, remaining: nextQueue.length };
}