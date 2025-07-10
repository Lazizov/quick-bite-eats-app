
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react';

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
}

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  items: any[];
  total: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('categories');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const { toast } = useToast();

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    image: ''
  });

  // Menu item form state
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image: ''
  });

  useEffect(() => {
    const loginStatus = sessionStorage.getItem('adminLoggedIn');
    if (loginStatus === 'true') {
      setIsLoggedIn(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    await Promise.all([loadCategories(), loadMenuItems(), loadOrders()]);
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить категории',
        variant: 'destructive'
      });
    }
  };

  const loadMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить блюда',
        variant: 'destructive'
      });
    }
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить заказы',
        variant: 'destructive'
      });
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      setIsLoggedIn(true);
      sessionStorage.setItem('adminLoggedIn', 'true');
      loadData();
      toast({
        title: 'Успешно',
        description: 'Добро пожаловать в админ панель!'
      });
    } else {
      toast({
        title: 'Ошибка',
        description: 'Неверный логин или пароль',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('adminLoggedIn');
    setLoginForm({ username: '', password: '' });
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const slug = categoryForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
      
      const { error } = await supabase
        .from('categories')
        .insert([{
          name: categoryForm.name,
          slug: slug,
          image: categoryForm.image || null
        }]);

      if (error) throw error;

      setCategoryForm({ name: '', image: '' });
      setShowAddCategory(false);
      await loadCategories();
      
      toast({
        title: 'Успешно',
        description: 'Категория добавлена!'
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить категорию',
        variant: 'destructive'
      });
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('menu_items')
        .insert([{
          name: itemForm.name,
          description: itemForm.description,
          price: parseFloat(itemForm.price),
          category_id: itemForm.category_id,
          image: itemForm.image || null
        }]);

      if (error) throw error;

      setItemForm({ name: '', description: '', price: '', category_id: '', image: '' });
      setShowAddItem(false);
      await loadMenuItems();
      
      toast({
        title: 'Успешно',
        description: 'Блюдо добавлено!'
      });
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось добавить блюдо',
        variant: 'destructive'
      });
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию? Все блюда этой категории также будут удалены.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadCategories();
      await loadMenuItems(); // Reload items as they might be affected
      
      toast({
        title: 'Успешно',
        description: 'Категория удалена!'
      });
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить категорию',
        variant: 'destructive'
      });
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить это блюдо?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadMenuItems();
      
      toast({
        title: 'Успешно',
        description: 'Блюдо удалено!'
      });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить блюдо',
        variant: 'destructive'
      });
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('restaurant_orders')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      await loadOrders();
      
      toast({
        title: 'Успешно',
        description: 'Статус заказа обновлен!'
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус заказа',
        variant: 'destructive'
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'category' | 'item') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === 'category') {
          setCategoryForm(prev => ({ ...prev, image: result }));
        } else {
          setItemForm(prev => ({ ...prev, image: result }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">🔐 Админ панель</CardTitle>
            <p className="text-center text-gray-600">Авторизация для доступа к панели управления</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Логин</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Введите логин"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Введите пароль"
                  required
                />
              </div>
              <Button type="submit" className="w-full">Войти</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">🍽️ Админ панель ресторана "Каусар"</h1>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => window.location.href = '/'}>
                ← На сайт
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="categories">📂 Категории</TabsTrigger>
            <TabsTrigger value="items">🍕 Блюда</TabsTrigger>
            <TabsTrigger value="orders">📋 Заказы</TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Управление категориями</h2>
              <Button onClick={() => setShowAddCategory(!showAddCategory)}>
                <Plus className="w-4 h-4 mr-2" />
                Добавить категорию
              </Button>
            </div>

            {showAddCategory && (
              <Card>
                <CardHeader>
                  <CardTitle>Добавить новую категорию</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <Label htmlFor="categoryName">Название категории</Label>
                      <Input
                        id="categoryName"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Например: Пицца"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="categoryImage">Изображение категории</Label>
                      <Input
                        id="categoryImage"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'category')}
                      />
                      {categoryForm.image && (
                        <img src={categoryForm.image} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                        Отмена
                      </Button>
                      <Button type="submit">Сохранить</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {categories.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Категории не найдены. Добавьте первую категорию.</p>
              ) : (
                categories.map((category) => (
                  <Card key={category.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">📂</div>
                        )}
                        <div>
                          <h3 className="font-semibold">{category.name}</h3>
                          <p className="text-sm text-gray-500">ID: {category.id}</p>
                          <p className="text-sm text-gray-500">
                            Создано: {new Date(category.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      <Button variant="destructive" size="sm" onClick={() => deleteCategory(category.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="items" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Управление блюдами</h2>
              <Button 
                onClick={() => {
                  if (categories.length === 0) {
                    toast({
                      title: 'Ошибка',
                      description: 'Сначала добавьте хотя бы одну категорию!',
                      variant: 'destructive'
                    });
                    return;
                  }
                  setShowAddItem(!showAddItem);
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить блюдо
              </Button>
            </div>

            {showAddItem && (
              <Card>
                <CardHeader>
                  <CardTitle>Добавить новое блюдо</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddMenuItem} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="itemName">Название блюда</Label>
                        <Input
                          id="itemName"
                          value={itemForm.name}
                          onChange={(e) => setItemForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Например: Маргарита"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="itemCategory">Категория</Label>
                        <select
                          id="itemCategory"
                          value={itemForm.category_id}
                          onChange={(e) => setItemForm(prev => ({ ...prev, category_id: e.target.value }))}
                          className="w-full p-2 border rounded"
                          required
                        >
                          <option value="">Выберите категорию</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="itemPrice">Цена (₸)</Label>
                        <Input
                          id="itemPrice"
                          type="number"
                          value={itemForm.price}
                          onChange={(e) => setItemForm(prev => ({ ...prev, price: e.target.value }))}
                          placeholder="2500"
                          min="0"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="itemImage">Изображение блюда</Label>
                        <Input
                          id="itemImage"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'item')}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="itemDescription">Описание</Label>
                      <Textarea
                        id="itemDescription"
                        value={itemForm.description}
                        onChange={(e) => setItemForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Описание блюда"
                        rows={3}
                        required
                      />
                    </div>
                    {itemForm.image && (
                      <img src={itemForm.image} alt="Preview" className="w-24 h-24 object-cover rounded" />
                    )}
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowAddItem(false)}>
                        Отмена
                      </Button>
                      <Button type="submit">Сохранить</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4">
              {menuItems.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Блюда не найдены. Добавьте первое блюдо.</p>
              ) : (
                menuItems.map((item) => {
                  const category = categories.find(cat => cat.id === item.category_id);
                  return (
                    <Card key={item.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">🍽️</div>
                          )}
                          <div>
                            <h3 className="font-semibold">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.description}</p>
                            <p className="text-sm text-gray-500">
                              Категория: {category?.name || 'Неизвестно'}
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              {item.price.toLocaleString()} ₸
                            </p>
                            <p className="text-sm text-gray-500">
                              Создано: {new Date(item.created_at).toLocaleString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <Button variant="destructive" size="sm" onClick={() => deleteMenuItem(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Управление заказами</h2>
              <div className="flex gap-4 text-sm">
                <span className="bg-blue-100 px-2 py-1 rounded">
                  📊 Всего заказов: {orders.length}
                </span>
                <span className="bg-red-100 px-2 py-1 rounded">
                  🆕 Новых: {orders.filter(o => o.status === 'new').length}
                </span>
                <span className="bg-yellow-100 px-2 py-1 rounded">
                  👨‍🍳 Готовятся: {orders.filter(o => o.status === 'preparing').length}
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              {orders.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Заказы не найдены.</p>
              ) : (
                orders.map((order) => (
                  <Card key={order.id} className={`border-l-4 ${
                    order.status === 'new' ? 'border-l-red-500' :
                    order.status === 'preparing' ? 'border-l-yellow-500' :
                    order.status === 'ready' ? 'border-l-green-500' :
                    'border-l-gray-500'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold">Заказ #{order.id.slice(0, 8)}</h3>
                          <p className="text-sm text-gray-600">Клиент: {order.customer_name}</p>
                          <p className="text-sm text-gray-600">Телефон: {order.customer_phone}</p>
                          <p className="text-sm text-gray-600">
                            Дата: {new Date(order.created_at).toLocaleString('ru-RU')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={order.status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="p-1 border rounded text-sm"
                          >
                            <option value="new">Новый</option>
                            <option value="preparing">Готовится</option>
                            <option value="ready">Готов</option>
                            <option value="delivered">Доставлен</option>
                          </select>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.status === 'new' ? 'bg-red-100 text-red-800' :
                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'ready' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'new' ? 'Новый' :
                             order.status === 'preparing' ? 'Готовится' :
                             order.status === 'ready' ? 'Готов' :
                             'Доставлен'}
                          </span>
                        </div>
                      </div>
                      <div className="mb-4">
                        <strong className="text-sm">Заказ:</strong>
                        <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                          {order.items.map((item: any, index: number) => (
                            <li key={index}>
                              {item.name} - {item.quantity} шт. × {item.price} ₸ = {(item.quantity * item.price).toLocaleString()} ₸
                            </li>
                          ))}
                        </ul>
                      </div>
                      <p className="font-semibold">Итого: {order.total.toLocaleString()} ₸</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
