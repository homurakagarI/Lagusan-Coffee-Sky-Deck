import { addMenuItem } from '../firebase/services'

// Current menu items from the website
const currentMenuItems = [
  {
    name: 'Signature Espresso',
    description: 'Rich, bold espresso shot from our premium house blend',
    price: 4.50,
    category: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1497515114629-f71d768fd07c?w=400',
    available: true
  },
  {
    name: 'Sky Deck Latte',
    description: 'Smooth espresso with steamed milk and our signature foam art',
    price: 6.25,
    category: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400',
    available: true
  },
  {
    name: 'Cappuccino Supreme',
    description: 'Traditional cappuccino with perfectly balanced milk foam',
    price: 5.75,
    category: 'coffee',
    imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
    available: true
  },
  {
    name: 'Iced Golden Latte',
    description: 'Cold brew with turmeric, ginger, and coconut milk',
    price: 7.00,
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400',
    available: true
  },
  {
    name: 'Matcha Cloud',
    description: 'Premium matcha powder with steamed oat milk',
    price: 6.50,
    category: 'drinks',
    imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400',
    available: true
  },
  {
    name: 'Chocolate Croissant',
    description: 'Buttery, flaky croissant filled with rich dark chocolate',
    price: 4.25,
    category: 'pastry',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab794f6eb9f3?w=400',
    available: true
  },
  {
    name: 'Blueberry Muffin',
    description: 'Fresh baked muffin bursting with juicy blueberries',
    price: 3.75,
    category: 'pastry',
    imageUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400',
    available: true
  },
  {
    name: 'Avocado Toast',
    description: 'Multigrain bread topped with fresh avocado and herbs',
    price: 8.50,
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1541519920360-d25eedec68eb?w=400',
    available: true
  },
  {
    name: 'Breakfast Sandwich',
    description: 'Egg, cheese, and bacon on a toasted English muffin',
    price: 9.25,
    category: 'food',
    imageUrl: 'https://images.unsplash.com/photo-1582196016295-f8c8bd4b3a99?w=400',
    available: true
  }
]

export const migrateCurrentMenuToFirestore = async () => {
  console.log('Starting menu migration to Firestore...')
  let successCount = 0
  let errorCount = 0
  
  for (const item of currentMenuItems) {
    try {
      const result = await addMenuItem(item)
      if (result.success) {
        successCount++
        console.log(`✅ Added: ${item.name}`)
      } else {
        errorCount++
        console.error(`❌ Failed to add ${item.name}:`, result.error)
      }
    } catch (error) {
      errorCount++
      console.error(`❌ Error adding ${item.name}:`, error)
    }
  }
  
  console.log(`Migration complete: ${successCount} success, ${errorCount} errors`)
  return { successCount, errorCount, total: currentMenuItems.length }
}

export { currentMenuItems }
