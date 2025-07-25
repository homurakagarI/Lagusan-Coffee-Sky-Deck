import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase/config'

// Test function to add sample menu items
export const addSampleMenuItems = async () => {
  const sampleItems = [
    {
      name: 'Espresso',
      description: 'Rich and bold coffee shot',
      price: 120,
      category: 'Hot Coffee',
      available: true,
      imageUrl: ''
    },
    {
      name: 'Cappuccino',
      description: 'Espresso with steamed milk and foam',
      price: 150,
      category: 'Hot Coffee',
      available: true,
      imageUrl: ''
    },
    {
      name: 'Iced Americano',
      description: 'Espresso with cold water and ice',
      price: 140,
      category: 'Cold Coffee',
      available: true,
      imageUrl: ''
    }
  ]

  try {
    for (const item of sampleItems) {
      await addDoc(collection(db, 'menu_items'), item)
    }
    console.log('Sample menu items added successfully')
    return { success: true }
  } catch (error) {
    console.error('Error adding sample items:', error)
    return { success: false, error }
  }
}

// Test function to add sample contact info
export const addSampleContactInfo = async () => {
  const contactInfo = {
    businessName: 'Lagusan Coffee Sky Deck',
    phone: '+63 123 456 7890',
    email: 'info@lagusancoffee.com',
    website: 'https://lagusancoffee.com',
    address: 'Lagusan, Butuan City, Philippines',
    openingTime: '06:00',
    closingTime: '22:00',
    description: 'A beautiful coffee shop with sky deck views overlooking the scenic landscapes of Lagusan.',
    socialMedia: {
      facebook: 'https://facebook.com/lagusancoffee',
      instagram: 'https://instagram.com/lagusancoffee',
      twitter: ''
    }
  }

  try {
    await addDoc(collection(db, 'contact_info'), contactInfo)
    console.log('Sample contact info added successfully')
    return { success: true }
  } catch (error) {
    console.error('Error adding contact info:', error)
    return { success: false, error }
  }
}
