
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  created_at: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category_id: string;
  created_at: string;
  categories?: Category;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

const RestaurantMenu = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredItems(menuItems);
    } else {
      setFilteredItems(menuItems.filter(item => item.category_id === selectedCategory));
    }
  }, [selectedCategory, menuItems]);

  // Auto-scroll effect for mobile categories
  useEffect(() => {
    if (scrollRef.current && categories.length > 0) {
      const scrollContainer = scrollRef.current;
      let scrollAmount = 0;
      const scrollStep = 1;
      const scrollDelay = 50;
      
      const autoScroll = () => {
        if (scrollContainer) {
          scrollAmount += scrollStep;
          if (scrollAmount >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
            scrollAmount = 0;
          }
          scrollContainer.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
          });
        }
      };

      const intervalId = setInterval(autoScroll, scrollDelay);
      
      // Pause auto-scroll on user interaction
      const handleUserInteraction = () => {
        clearInterval(intervalId);
        setTimeout(() => {
          const newIntervalId = setInterval(autoScroll, scrollDelay);
          return () => clearInterval(newIntervalId);
        }, 3000); // Resume after 3 seconds
      };

      scrollContainer.addEventListener('touchstart', handleUserInteraction);
      scrollContainer.addEventListener('mousedown', handleUserInteraction);

      return () => {
        clearInterval(intervalId);
        if (scrollContainer) {
          scrollContainer.removeEventListener('touchstart', handleUserInteraction);
          scrollContainer.removeEventListener('mousedown', handleUserInteraction);
        }
      };
    }
  }, [categories]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Load menu items with category information - include created_at from categories
      const { data: menuItemsData, error: menuItemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          categories (
            id,
            name,
            slug,
            created_at
          )
        `)
        .order('created_at', { ascending: true });

      if (menuItemsError) {
        console.error('Error loading menu items:', menuItemsError);
      } else {
        setMenuItems(menuItemsData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
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
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === selectedItem.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      const newCartItem: CartItem = {
        id: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: quantity,
        image: selectedItem.image
      };
      setCart([...cart, newCartItem]);
    }
    
    closeModal();
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const scrollToMenu = () => {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка меню...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🍽️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Каусар</h1>
                <p className="text-sm text-gray-600">Традиционная кухня</p>
              </div>
            </div>
            
            <Button 
              onClick={() => console.log('Cart clicked')}
              className="relative bg-orange-500 hover:bg-orange-600"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Корзина
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Добро пожаловать в Каусар</h1>
          <p className="text-xl mb-8">Традиционная кухня с современным подходом</p>
          <Button 
            onClick={scrollToMenu}
            size="lg" 
            className="bg-white text-orange-500 hover:bg-gray-100"
          >
            Посмотреть меню
          </Button>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-800">Наше меню</h2>
          
          {/* Categories */}
          <div className="mb-12">
            {/* Mobile horizontal scroll with auto-scroll */}
            <div className="block md:hidden">
              <div 
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
              >
                <Card 
                  className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                    selectedCategory === 'all' 
                      ? 'ring-2 ring-orange-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleCategoryClick('all')}
                >
                  <CardContent className="p-4 text-center min-w-[100px]">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">🍽️</span>
                    </div>
                    <p className="font-medium text-gray-800 text-sm whitespace-nowrap">Все блюда</p>
                  </CardContent>
                </Card>
                
                {categories.map((category) => (
                  <Card 
                    key={category.id}
                    className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                      selectedCategory === category.id 
                        ? 'ring-2 ring-orange-500 shadow-lg' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <CardContent className="p-4 text-center min-w-[100px]">
                      <div className="w-12 h-12 mx-auto mb-2 overflow-hidden rounded-full">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center">
                            <span className="text-white text-xl">📂</span>
                          </div>
                        )}
                      </div>
                      <p className="font-medium text-gray-800 text-sm whitespace-nowrap">{category.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Desktop grid */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <Card 
                className={`cursor-pointer transition-all duration-300 ${
                  selectedCategory === 'all' 
                    ? 'ring-2 ring-orange-500 shadow-lg' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleCategoryClick('all')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl">🍽️</span>
                  </div>
                  <p className="font-medium text-gray-800">Все блюда</p>
                </CardContent>
              </Card>
              
              {categories.map((category) => (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    selectedCategory === category.id 
                      ? 'ring-2 ring-orange-500 shadow-lg' 
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 overflow-hidden rounded-full">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                          <span className="text-white text-2xl">📂</span>
                        </div>
                      )}
                    </div>
                    <p className="font-medium text-gray-800">{category.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center">
                      <span className="text-6xl">🍽️</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-2 text-gray-800">{item.name}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-orange-500">
                      {item.price.toLocaleString()} ₸
                    </span>
                    <Button 
                      onClick={() => openModal(item)}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      В корзину
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">В данной категории пока нет блюд</p>
            </div>
          )}
        </div>
      </section>

      {/* Add to Cart Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem?.image && (
              <div className="aspect-video overflow-hidden rounded-lg">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <p className="text-gray-600">{selectedItem?.description}</p>
            <p className="text-2xl font-bold text-orange-500">
              {selectedItem?.price.toLocaleString()} ₸
            </p>
            
            <div className="flex items-center space-x-4">
              <span className="font-medium">Количество:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
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
            </div>
            
            <div className="flex space-x-3 pt-4">
              <Button variant="outline" onClick={closeModal} className="flex-1">
                Отмена
              </Button>
              <Button onClick={addToCart} className="flex-1 bg-orange-500 hover:bg-orange-600">
                Добавить в корзину
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantMenu;
