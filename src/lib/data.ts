import type { Product, Category, Order, Address } from '@/lib/types';

export const categories: Category[] = [
  { id: 'fruits', name: 'Fruits', subcategories: ['Citrus', 'Berries', 'Tropical'] },
  { id: 'vegetables', name: 'Vegetables', subcategories: ['Leafy Greens', 'Root Vegetables'] },
];

export const products: Product[] = [
  { id: '1', name: 'Apple', description: 'Crisp and sweet red apples.', price: 2.50, imageUrl: 'https://images.unsplash.com/photo-1576179635662-9d1983e97e1e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMXx8YXBwbGV8ZW58MHx8fHwxNzU4MjkwMDU0fDA&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'red apple', category: 'fruits', stock: 100 },
  { id: '2', name: 'Banana', description: 'Ripe and creamy bananas.', price: 1.80, imageUrl: 'https://images.unsplash.com/photo-1640958900081-7b069dd23e9c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxiYW5uYW5hfGVufDB8fHx8MTc1ODM1OTExN3ww&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'yellow banana', category: 'fruits', subcategory: 'Tropical', stock: 150 },
  { id: '3', name: 'Orange', description: 'Juicy and vitamin C-rich oranges.', price: 3.10, imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxvcmFuZ2V8ZW58MHx8fHwxNzU4MzU5MTM2fDA&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'orange fruit', category: 'fruits', subcategory: 'Citrus', stock: 80 },
  { id: '4', name: 'Strawberry', description: 'Sweet and fresh strawberries.', price: 4.00, imageUrl: 'https://images.unsplash.com/photo-1591271300850-22d6784e0a7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxTdHJhd2JlcnJ5fGVufDB8fHx8MTc1ODM1OTIwMnww&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'strawberry fruit', category: 'fruits', subcategory: 'Berries', stock: 120 },
  { id: '5', name: 'Broccoli', description: 'Fresh green broccoli florets.', price: 2.75, imageUrl: 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxicm9jY29saXxlbnwwfHx8fDE3NTgzNTkyMjd8MA&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'broccoli vegetable', category: 'vegetables', stock: 90 },
  { id: '6', name: 'Carrot', description: 'Crunchy and sweet carrots.', price: 1.50, imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxfHxjYXJyb3R8ZW58MHx8fHwxNzU4MzU5MjcwfDA&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'carrot vegetable', category: 'vegetables', subcategory: 'Root Vegetables', stock: 200 },
  { id: '7', name: 'Tomato', description: 'Ripe and juicy red tomatoes.', price: 2.20, imageUrl: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHx0b21hdG98ZW58MHx8fHwxNzU4MzU5MjkxfDA&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'tomato vegetable', category: 'vegetables', stock: 130 },
  { id: '8', name: 'Lettuce', description: 'Crisp iceberg lettuce.', price: 1.90, imageUrl: 'https://images.unsplash.com/photo-1640958904159-51ae08bd3412?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxsZXR0dWNlfGVufDB8fHx8MTc1ODM1OTMwOHww&ixlib=rb-4.1.0&q=80&w=1080', imageHint: 'lettuce vegetable', category: 'vegetables', subcategory: 'Leafy Greens', stock: 70 },
  { id: '9', name: 'Grapes', description: 'Sweet and juicy green grapes.', price: 5.50, imageUrl: 'https://picsum.photos/seed/grapes/400/400', imageHint: 'grapes fruit', category: 'fruits', stock: 60 },
  { id: '10', name: 'Avocado', description: 'Creamy and ripe avocados.', price: 3.50, imageUrl: 'https://picsum.photos/seed/avocado/400/400', imageHint: 'avocado fruit', category: 'fruits', subcategory: 'Tropical', stock: 50 },
  { id: '11', name: 'Potato', description: 'Versatile and starchy potatoes.', price: 1.20, imageUrl: 'https://picsum.photos/seed/potato/400/400', imageHint: 'potato vegetable', category: 'vegetables', subcategory: 'Root Vegetables', stock: 250 },
  { id: '12', name: 'Cucumber', description: 'Cool and refreshing cucumbers.', price: 1.00, imageUrl: 'https://picsum.photos/seed/cucumber/400/400', imageHint: 'cucumber vegetable', category: 'vegetables', stock: 110 },
];

export const userAddresses: Address[] = [
    { id: 'addr1', street: '123 Market St', city: 'Greenfield', state: 'CA', zip: '90210', isDefault: true },
    { id: 'addr2', street: '456 Orchard Ave', city: 'Greenfield', state: 'CA', zip: '90210', isDefault: false },
];

export const userOrders: Order[] = [
    { 
        id: 'order1', 
        date: '2024-07-20', 
        status: 'Delivered', 
        total: 25.50,
        shippingAddress: userAddresses[0],
        items: [
            { id: '1', name: 'Apple', price: 2.50, imageUrl: 'https://picsum.photos/seed/apple/400/400', quantity: 4 },
            { id: '6', name: 'Carrot', price: 1.50, imageUrl: 'https://picsum.photos/seed/carrot/400/400', quantity: 2 },
        ]
    },
    { 
        id: 'order2', 
        date: '2024-07-28', 
        status: 'Processing', 
        total: 10.80,
        shippingAddress: userAddresses[0],
        items: [
            { id: '2', name: 'Banana', price: 1.80, imageUrl: 'https://picsum.photos/seed/banana/400/400', quantity: 6 },
        ]
    },
];
