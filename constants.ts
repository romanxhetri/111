import { type Category, type MenuItem, Dietary } from './types';

export const CATEGORIES: Category[] = [
  { id: 'loaded-fries', name: 'Loaded Fries' },
  { id: 'specialty-potatoes', name: 'Specialty Potatoes' },
  { id: 'sides', name: 'Sides' },
  { id: 'drinks', name: 'Drinks' },
];

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: 'Classic Cheesy Fries',
    description: 'Crispy golden fries smothered in our signature three-cheese sauce and topped with fresh chives.',
    price: 8.99,
    image: 'https://picsum.photos/seed/cheesyfries/400/300',
    category: 'loaded-fries',
    spicyLevel: 0,
    dietaryTags: [Dietary.Vegetarian],
    isAvailable: true,
    customizationOptions: [
      {
        title: 'Extra Toppings',
        type: 'multi',
        options: [
          { name: 'Bacon Bits', price: 1.50 },
          { name: 'Jalapeños', price: 0.75 },
          { name: 'Extra Cheese', price: 2.00 },
          { name: 'Sour Cream', price: 0.50 }
        ]
      },
      {
        title: 'Dipping Sauce',
        type: 'single',
        options: [
          { name: 'Ranch (Free)', price: 0.00 },
          { name: 'Spicy Aioli', price: 0.50 },
          { name: 'BBQ Sauce (Free)', price: 0.00 }
        ]
      }
    ],
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  },
  {
    id: 2,
    name: 'Spicy Volcano Fries',
    description: 'A fiery explosion of flavor! Fries topped with spicy beef, jalapeños, and a lava-hot cheese sauce.',
    price: 11.99,
    image: 'https://picsum.photos/seed/volcanofries/400/300',
    category: 'loaded-fries',
    spicyLevel: 3,
    dietaryTags: [],
    isAvailable: true,
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  },
  {
    id: 3,
    name: 'The Vegan Supreme',
    description: 'Plant-based perfection. Fries loaded with vegan chili, dairy-free cheese, and avocado crema.',
    price: 12.99,
    image: 'https://picsum.photos/seed/veganfries/400/300',
    category: 'loaded-fries',
    spicyLevel: 1,
    dietaryTags: [Dietary.Vegetarian, Dietary.Vegan],
    isAvailable: true,
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  },
  {
    id: 4,
    name: 'Twice-Baked Titan',
    description: 'A giant baked potato, hollowed, mixed with sour cream, bacon, and cheese, then baked again to perfection.',
    price: 10.50,
    image: 'https://picsum.photos/seed/bakedpotato/400/300',
    category: 'specialty-potatoes',
    spicyLevel: 0,
    dietaryTags: [],
    isAvailable: true,
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  },
  {
    id: 5,
    name: 'Garlic Herb Potato Wedges',
    description: 'Thick-cut potato wedges roasted with garlic, rosemary, and thyme. Served with a side of aioli.',
    price: 6.50,
    image: 'https://picsum.photos/seed/wedges/400/300',
    category: 'sides',
    spicyLevel: 0,
    dietaryTags: [Dietary.Vegetarian, Dietary.Vegan, Dietary.GlutenFree],
    isAvailable: true,
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  },
  {
    id: 6,
    name: 'Crispy Onion Rings',
    description: 'Golden, beer-battered onion rings served with our special dipping sauce.',
    price: 5.99,
    image: 'https://picsum.photos/seed/onionrings/400/300',
    category: 'sides',
    spicyLevel: 0,
    dietaryTags: [Dietary.Vegetarian],
    isAvailable: true,
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  },
  {
    id: 7,
    name: 'Fresh Lemonade',
    description: 'House-made lemonade, perfectly sweet and tart.',
    price: 3.50,
    image: 'https://picsum.photos/seed/lemonade/400/300',
    category: 'drinks',
    spicyLevel: 0,
    dietaryTags: [Dietary.Vegetarian, Dietary.Vegan, Dietary.GlutenFree],
    isAvailable: true,
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  },
  {
    id: 8,
    name: 'BBQ Pulled Pork Fries',
    description: 'Slow-cooked pulled pork piled high on our classic fries, with a drizzle of BBQ sauce and coleslaw.',
    price: 13.50,
    image: 'https://picsum.photos/seed/bbqfries/400/300',
    category: 'loaded-fries',
    spicyLevel: 0,
    dietaryTags: [],
    isAvailable: false,
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  },
  {
    id: 9,
    name: 'Gluten-Free Potato Skins',
    description: 'Crispy potato skins filled with cheddar cheese and chives. A gluten-free favorite!',
    price: 9.99,
    image: 'https://picsum.photos/seed/potatoskins/400/300',
    category: 'specialty-potatoes',
    spicyLevel: 0,
    dietaryTags: [Dietary.Vegetarian, Dietary.GlutenFree],
    isAvailable: true,
    reviews: [],
    averageRating: 0,
    reviewCount: 0,
  }
];

export const AVATAR_PARTS = {
  bases: ['potato-base'],
  accessories: {
    'First Fry': 'chef-hat',
    'Loaded Legend': 'crown',
    'Spud Saver': 'monocle',
  }
};

export const BADGE_INFO: Record<string, { icon: string; title: string; description: string; unlocks?: string }> = {
    'First Fry': { icon: '🍟', title: 'First Fry', description: 'Placed your very first order!', unlocks: AVATAR_PARTS.accessories['First Fry'] },
    'Loaded Legend': { icon: '👑', title: 'Loaded Legend', description: 'Tried every loaded fry on the menu.', unlocks: AVATAR_PARTS.accessories['Loaded Legend'] },
    'Spud Saver': { icon: '🧐', title: 'Spud Saver', description: 'Redeemed points for the first time.', unlocks: AVATAR_PARTS.accessories['Spud Saver']},
};