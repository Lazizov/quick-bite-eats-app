
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Minus, Plus } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category_id: string;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function RestaurantMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadMenuItems();
    loadCartFromStorage();
  }, []);

  useEffect(() => {
    filterItems();
  }, [activeCategory, menuItems]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
    }
  };

  const filterItems = () => {
    if (activeCategory === 'all') {
      setFilteredItems(menuItems);
    } else {
      const filtered = menuItems.filter(item => item.category_id === activeCategory);
      setFilteredItems(filtered);
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem('restaurantCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(Array.isArray(parsedCart) ? parsedCart : []);
      } catch (error) {
        console.error('Error loading cart:', error);
        setCart([]);
      }
    }
  };

  const saveCartToStorage = (newCart: CartItem[]) => {
    try {
      localStorage.setItem('restaurantCart', JSON.stringify(newCart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const openModal = (item: MenuItem) => {
    setSelectedItem(item);
    setQuantity(1);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setQuantity(1);
  };

  const addToCart = () => {
    if (!selectedItem) return;

    const existingItem = cart.find(item => item.id === selectedItem.id);
    let newCart;

    if (existingItem) {
      newCart = cart.map(item =>
        item.id === selectedItem.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: quantity
      };
      newCart = [...cart, newItem];
    }

    setCart(newCart);
    saveCartToStorage(newCart);
    closeModal();
    
    toast({
      title: 'Добавлено в корзину',
      description: `${selectedItem.name} добавлен в корзину!`
    });
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const openCart = () => {
    // Open cart page in new tab
    window.open('/cart.html', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-400 to-red-500 text-white">
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">«Каусар»</h1>
          <p className="text-xl mb-8">обитель комфорта и счастья...</p>
          <Button 
            onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
            size="lg"
            className="bg-white text-orange-500 hover:bg-gray-100"
          >
            🍽️ Меню
          </Button>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Наше меню</h2>
          
          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setActiveCategory('all')}
              className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
                activeCategory === 'all' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-2xl mb-2">🍽️</span>
              <span>Все блюда</span>
            </button>
            
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-col items-center p-4 rounded-lg transition-colors ${
                  activeCategory === category.id 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-8 h-8 rounded-full object-cover mb-2"
                  />
                ) : (
                  <span className="text-2xl mb-2">📂</span>
                )}
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500 text-lg">
                  {menuItems.length === 0 
                    ? 'Блюда загружаются...' 
                    : 'В этой категории пока нет блюд'}
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square bg-gray-200">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-400 to-red-500">
                        <span className="text-6xl text-white">🍽️</span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-orange-600">
                        {item.price.toLocaleString()} ₸
                      </span>
                      <Button onClick={() => openModal(item)} size="sm">
                        В корзину
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Контакты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl mb-4">📞</div>
              <p className="font-semibold">+7 (702) 965 58-68</p>
            </div>
            <div>
              <div className="text-4xl mb-4">📍</div>
              <p className="font-semibold">г. Алматы, ул. Амир Темура, 25</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🕒</div>
              <p className="font-semibold">Ежедневно: 10:00 - 23:00</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">{selectedItem.name}</h3>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Отмена
              </Button>
              <Button onClick={addToCart} className="flex-1">
                Добавить в корзину
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Button */}
      <button
        onClick={openCart}
        className="fixed bottom-6 right-6 bg-orange-500 text-white p-4 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            {getTotalItems()}
          </span>
        )}
      </button>
    </div>
  );
}
