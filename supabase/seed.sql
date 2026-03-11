insert into public.categories (title, img)
values
  ('Televisions', '/images/categories/categories-01.png'),
  ('Laptop & PC', '/images/categories/categories-02.png'),
  ('Mobile & Tablets', '/images/categories/categories-03.png'),
  ('Games & Videos', '/images/categories/categories-04.png'),
  ('Home Appliances', '/images/categories/categories-05.png'),
  ('Health & Sports', '/images/categories/categories-06.png'),
  ('Watches', '/images/categories/categories-07.png')
on conflict do nothing;

insert into public.products (title, reviews, price, discounted_price, thumbnails, previews)
values
  ('Havit HV-G69 USB Gamepad', 15, 59.00, 29.00, '{/images/products/product-1-sm-1.png,/images/products/product-1-sm-2.png}', '{/images/products/product-1-bg-1.png,/images/products/product-1-bg-2.png}'),
  ('iPhone 14 Plus , 6/128GB', 5, 899.00, 99.00, '{/images/products/product-2-sm-1.png,/images/products/product-2-sm-2.png}', '{/images/products/product-2-bg-1.png,/images/products/product-2-bg-2.png}'),
  ('Apple iMac M1 24-inch 2021', 5, 59.00, 29.00, '{/images/products/product-3-sm-1.png,/images/products/product-3-sm-2.png}', '{/images/products/product-3-bg-1.png,/images/products/product-3-bg-2.png}'),
  ('MacBook Air M1 chip, 8/256GB', 6, 59.00, 29.00, '{/images/products/product-4-sm-1.png,/images/products/product-4-sm-2.png}', '{/images/products/product-4-bg-1.png,/images/products/product-4-bg-2.png}'),
  ('Apple Watch Ultra', 3, 99.00, 29.00, '{/images/products/product-5-sm-1.png,/images/products/product-5-sm-2.png}', '{/images/products/product-5-bg-1.png,/images/products/product-5-bg-2.png}'),
  ('Logitech MX Master 3 Mouse', 15, 59.00, 29.00, '{/images/products/product-6-sm-1.png,/images/products/product-6-sm-2.png}', '{/images/products/product-6-bg-1.png,/images/products/product-6-bg-2.png}'),
  ('Apple iPad Air 5th Gen - 64GB', 15, 59.00, 29.00, '{/images/products/product-7-sm-1.png,/images/products/product-7-sm-2.png}', '{/images/products/product-7-bg-1.png,/images/products/product-7-bg-2.png}'),
  ('Asus RT Dual Band Router', 15, 59.00, 29.00, '{/images/products/product-8-sm-1.png,/images/products/product-8-sm-2.png}', '{/images/products/product-8-bg-1.png,/images/products/product-8-bg-2.png}')
on conflict do nothing;

insert into public.blogs (title, date, views, img, content)
values
  ('How to Start a Successful E-commerce Business', 'Mar 27, 2022', 300000, '/images/blog/blog-01.jpg', 'Blog content placeholder'),
  ('The Benefits of Regular Exercise for a Healthy Lifestyle', 'Mar 27, 2022', 250000, '/images/blog/blog-02.jpg', 'Blog content placeholder'),
  ('Exploring the Wonders of Modern Art: A Gallery Tour', 'Mar 27, 2022', 180000, '/images/blog/blog-03.jpg', 'Blog content placeholder'),
  ('The Ultimate Guide to Traveling on a Budget', 'Mar 27, 2022', 50000, '/images/blog/blog-04.jpg', 'Blog content placeholder'),
  ('Cooking Masterclass: Creating Delicious Italian Pasta', 'Mar 27, 2022', 120000, '/images/blog/blog-05.jpg', 'Blog content placeholder'),
  ('Tech Trends 2022: What''s Changing in the Digital World', 'Mar 27, 2022', 75000, '/images/blog/blog-06.jpg', 'Blog content placeholder'),
  ('A Guide to Sustainable Living: Reduce, Reuse, Recycle', 'Mar 27, 2022', 90000, '/images/blog/blog-07.jpg', 'Blog content placeholder'),
  ('The Psychology of Happiness: Finding Joy in Everyday Life', 'Mar 27, 2022', 150000, '/images/blog/blog-08.jpg', 'Blog content placeholder'),
  ('Exploring National Parks: Natural Beauty and Adventure', 'Mar 27, 2022', 60000, '/images/blog/blog-09.jpg', 'Blog content placeholder')
on conflict do nothing;

insert into public.testimonials (review, author_name, author_role, author_img)
values
  ('Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula', 'Davis Dorwart', 'Serial Entrepreneur', '/images/users/user-01.jpg'),
  ('Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula', 'Wilson Dias', 'Backend Developer', '/images/users/user-02.jpg'),
  ('Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitaeaugue suscipit beautiful vehicula', 'Miracle Exterm', 'Serial Entrepreneur', '/images/users/user-03.jpg')
on conflict do nothing;
