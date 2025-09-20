import { userOrders } from '../data';
import type { Order } from '../types';

// This is a server-side mock of a database/context.
// In a real application, you would replace this with a database call.

export function addOrder(order: Order) {
  // In a real app, you'd save this to a database associated with the user.
  // For this demo, we'll just add it to our in-memory data.
  userOrders.push(order);
  console.log('Order added on server:', order.id);
}

export function getOrder(orderId: string): Order | undefined {
  return userOrders.find(o => o.id === orderId);
}
