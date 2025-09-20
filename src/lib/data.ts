import type { Product, Category, Order, Address } from '@/lib/types';

export const categories: Category[] = [
  { id: 'fruits', name: 'Fruits', subcategories: ['Citrus', 'Berries', 'Tropical'] },
  { id: 'vegetables', name: 'Vegetables', subcategories: ['Leafy Greens', 'Root Vegetables'] },
];

export const products: Product[] = [
  { id: '1', name: 'Apple', description: 'Crisp and sweet red apples.', price: 2.50, imageUrl: 'https://picsum.photos/seed/apple/400/400', imageHint: 'red apple', category: 'fruits', stock: 100 },
  { id: '2', name: 'Banana', description: 'Ripe and creamy bananas.', price: 1.80, imageUrl: 'https://picsum.photos/seed/banana/400/400', imageHint: 'yellow banana', category: 'fruits', subcategory: 'Tropical', stock: 150 },
  { id: '3', name: 'Orange', description: 'Juicy and vitamin C-rich oranges.', price: 3.10, imageUrl: 'https://picsum.photos/seed/orange/400/400', imageHint: 'orange fruit', category: 'fruits', subcategory: 'Citrus', stock: 80 },
  { id: '4', name: 'Strawberry', description: 'Sweet and fresh strawberries.', price: 4.00, imageUrl: 'https://picsum.photos/seed/strawberry/400/400', imageHint: 'strawberry fruit', category: 'fruits', subcategory: 'Berries', stock: 120 },
  { id: '5', name: 'Broccoli', description: 'Fresh green broccoli florets.', price: 2.75, imageUrl: 'https://picsum.photos/seed/broccoli/400/400', imageHint: 'broccoli vegetable', category: 'vegetables', stock: 90 },
  { id: '6', name: 'Carrot', description: 'Crunchy and sweet carrots.', price: 1.50, imageUrl: 'https://picsum.photos/seed/carrot/400/400', imageHint: 'carrot vegetable', category: 'vegetables', subcategory: 'Root Vegetables', stock: 200 },
  { id: '7', name: 'Tomato', description: 'Ripe and juicy red tomatoes.', price: 2.20, imageUrl: 'https://picsum.photos/seed/tomato/400/400', imageHint: 'tomato vegetable', category: 'vegetables', stock: 130 },
  { id: '8', name: 'Lettuce', description: 'Crisp iceberg lettuce.', price: 1.90, imageUrl: 'https://picsum.photos/seed/lettuce/400/400', imageHint: 'lettuce vegetable', category: 'vegetables', subcategory: 'Leafy Greens', stock: 70 },
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
