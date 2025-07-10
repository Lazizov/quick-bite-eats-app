
-- Создаем таблицу для категорий
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу для блюд
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC NOT NULL,
  image TEXT,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу для заказов
CREATE TABLE public.restaurant_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_orders ENABLE ROW LEVEL SECURITY;

-- Создаем политики безопасности (разрешаем всем читать, но только админу изменять)
CREATE POLICY "Allow public read access on categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access on menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access on restaurant_orders" ON public.restaurant_orders FOR SELECT USING (true);

-- Политики для вставки (пока разрешим всем, потом можно ограничить)
CREATE POLICY "Allow insert on categories" ON public.categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on menu_items" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow insert on restaurant_orders" ON public.restaurant_orders FOR INSERT WITH CHECK (true);

-- Политики для обновления
CREATE POLICY "Allow update on categories" ON public.categories FOR UPDATE USING (true);
CREATE POLICY "Allow update on menu_items" ON public.menu_items FOR UPDATE USING (true);
CREATE POLICY "Allow update on restaurant_orders" ON public.restaurant_orders FOR UPDATE USING (true);

-- Политики для удаления
CREATE POLICY "Allow delete on categories" ON public.categories FOR DELETE USING (true);
CREATE POLICY "Allow delete on menu_items" ON public.menu_items FOR DELETE USING (true);
CREATE POLICY "Allow delete on restaurant_orders" ON public.restaurant_orders FOR DELETE USING (true);
