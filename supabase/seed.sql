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

insert into public.product_detail_enums (enum_group, option_id, option_title, sort_order)
values
  ('optionsGroup1', '64gb', '64 GB', 1),
  ('optionsGroup1', '128gb', '128 GB', 2),
  ('optionsGroup1', '256gb', '256 GB', 3),
  ('optionsGroup1', '512gb', '512 GB', 4),
  ('optionsGroup2', 'new', 'New', 1),
  ('optionsGroup2', 'refurbished', 'Refurbished', 2),
  ('optionsGroup2', 'used', 'Used', 3),
  ('optionsGroup3', 'wifi', 'Wi-Fi', 1),
  ('optionsGroup3', 'cellular', 'Cellular', 2),
  ('optionsGroup3', 'wifi-cellular', 'Wi-Fi + Cellular', 3),
  ('colors', '#111827', '#111827', 1),
  ('colors', '#3C50E0', '#3C50E0', 2),
  ('colors', '#EF4444', '#EF4444', 3),
  ('colors', '#F97316', '#F97316', 4),
  ('gender', 'men', 'Men', 1),
  ('gender', 'women', 'Women', 2),
  ('gender', 'unisex', 'Unisex', 3),
  ('gender', 'kids', 'Kids', 4)
on conflict (enum_group, option_id) do nothing;

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

update public.products
set details = jsonb_build_object(
  'rating', 4.6,
  'category', 'Gaming Accessories',
  'shortDescription', 'A dependable USB gamepad with responsive controls for casual and competitive play.',
  'description', 'The Havit HV-G69 USB Gamepad delivers comfortable handling, responsive buttons, and a storefront-ready image gallery sourced directly from the database.',
  'availability', 'In Stock',
  'badge', 'SALE 20% OFF',
  'promoText', 'Free delivery available',
  'brand', 'Havit',
  'model', 'HV-G69',
  'colors', jsonb_build_array('#111827', '#3C50E0', '#EF4444'),
  'highlights', jsonb_build_array('Free delivery available', 'Plug and play setup'),
  'specificationSummary', 'Responsive gaming controls with durable construction and USB connectivity.',
  'careInstructions', 'Store in a dry place and avoid cable strain during transport.',
  'optionsGroup1', '[]'::jsonb,
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'standard', 'title', 'Standard')),
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Havit'),
    jsonb_build_object('label', 'Model', 'value', 'HV-G69'),
    jsonb_build_object('label', 'Category', 'value', 'Gaming Accessories')
  )
)
where title = 'Havit HV-G69 USB Gamepad' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.9,
  'category', 'Smartphones',
  'shortDescription', 'Large-screen iPhone configuration with premium camera performance and configurable storage.',
  'description', 'The iPhone 14 Plus product record includes dynamic pricing, gallery images, option groups, and specification rows managed from Supabase.',
  'availability', 'In Stock',
  'badge', 'SALE 30% OFF',
  'promoText', 'Sales 30% Off Use Code: PROMO30',
  'brand', 'Apple',
  'model', 'iPhone 14 Plus',
  'colors', jsonb_build_array('#111827', '#3C50E0', '#F97316', '#EC4899'),
  'highlights', jsonb_build_array('Free delivery available', 'Sales 30% Off Use Code: PROMO30'),
  'specificationSummary', 'Premium smartphone with OLED display, high-performance chipset, and multiple storage options.',
  'careInstructions', 'Use a protective case, avoid extreme temperatures, and clean with a microfiber cloth.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', '128gb', 'title', '128 GB'),
    jsonb_build_object('id', '256gb', 'title', '256 GB'),
    jsonb_build_object('id', '512gb', 'title', '512 GB')
  ),
  'optionsGroup2', jsonb_build_array(
    jsonb_build_object('id', 'active', 'title', 'Active'),
    jsonb_build_object('id', 'inactive', 'title', 'Inactive')
  ),
  'optionsGroup3', jsonb_build_array(
    jsonb_build_object('id', 'dual', 'title', 'Dual'),
    jsonb_build_object('id', 'e-sim', 'title', 'E Sim')
  ),
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Apple'),
    jsonb_build_object('label', 'Model', 'value', 'iPhone 14 Plus'),
    jsonb_build_object('label', 'Display Size', 'value', '6.7 inches'),
    jsonb_build_object('label', 'Chipset', 'value', 'Apple A15 Bionic'),
    jsonb_build_object('label', 'Memory', 'value', '128GB / 256GB / 512GB')
  )
)
where title = 'iPhone 14 Plus , 6/128GB' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.8,
  'category', 'Desktop Computers',
  'shortDescription', 'All-in-one desktop with a vibrant display and streamlined performance.',
  'description', 'The iMac listing is fully database-driven with synced gallery media, pricing, highlights, and supporting detail content.',
  'availability', 'In Stock',
  'badge', 'LIMITED STOCK',
  'promoText', 'Free delivery available',
  'brand', 'Apple',
  'model', 'iMac M1 24-inch 2021',
  'colors', jsonb_build_array('#60A5FA', '#22C55E', '#F59E0B'),
  'highlights', jsonb_build_array('Free delivery available', 'Desktop setup assistance included'),
  'specificationSummary', 'All-in-one desktop computer with premium display quality and balanced performance.',
  'careInstructions', 'Keep vents unobstructed and clean screen surface with approved display-safe materials.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', '256gb', 'title', '256 GB'),
    jsonb_build_object('id', '512gb', 'title', '512 GB')
  ),
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'desktop', 'title', 'Desktop')),
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Apple'),
    jsonb_build_object('label', 'Model', 'value', 'iMac M1 24-inch 2021'),
    jsonb_build_object('label', 'Category', 'value', 'Desktop Computers')
  )
)
where title = 'Apple iMac M1 24-inch 2021' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.8,
  'category', 'Laptops',
  'shortDescription', 'Slim laptop configuration with M1 performance and a lightweight build.',
  'description', 'The MacBook Air listing now pulls all storefront detail content from the database, including images, highlights, and option sets.',
  'availability', 'In Stock',
  'badge', 'BEST VALUE',
  'promoText', 'Free delivery available',
  'brand', 'Apple',
  'model', 'MacBook Air M1',
  'colors', jsonb_build_array('#94A3B8', '#111827'),
  'highlights', jsonb_build_array('Lightweight everyday laptop', 'Long battery life'),
  'specificationSummary', 'Portable notebook designed for efficient daily workflows and travel-ready performance.',
  'careInstructions', 'Use a padded sleeve during travel and avoid pressure on the display lid.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', '256gb', 'title', '256 GB'),
    jsonb_build_object('id', '512gb', 'title', '512 GB')
  ),
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'notebook', 'title', 'Notebook')),
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Apple'),
    jsonb_build_object('label', 'Model', 'value', 'MacBook Air M1'),
    jsonb_build_object('label', 'Category', 'value', 'Laptops')
  )
)
where title = 'MacBook Air M1 chip, 8/256GB' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.7,
  'category', 'Wearables',
  'shortDescription', 'Rugged smartwatch for training, travel, and all-day notifications.',
  'description', 'Apple Watch Ultra content is synced from the database, including merchandising copy and attribute rows used on the details page.',
  'availability', 'In Stock',
  'badge', 'NEW ARRIVAL',
  'promoText', 'Fast shipping available',
  'brand', 'Apple',
  'model', 'Watch Ultra',
  'colors', jsonb_build_array('#F59E0B', '#111827'),
  'highlights', jsonb_build_array('Rugged design', 'Fast shipping available'),
  'specificationSummary', 'Performance-focused wearable with premium materials and advanced activity tracking.',
  'careInstructions', 'Clean sensors regularly and charge with approved accessories only.',
  'optionsGroup1', '[]'::jsonb,
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'gps-cellular', 'title', 'GPS + Cellular')),
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Apple'),
    jsonb_build_object('label', 'Model', 'value', 'Watch Ultra'),
    jsonb_build_object('label', 'Category', 'value', 'Wearables')
  )
)
where title = 'Apple Watch Ultra' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.8,
  'category', 'Accessories',
  'shortDescription', 'Precision productivity mouse designed for creators and advanced workflows.',
  'description', 'The MX Master 3 listing demonstrates how accessory products can also carry structured details data in the database.',
  'availability', 'In Stock',
  'badge', 'TOP RATED',
  'promoText', 'Free delivery available',
  'brand', 'Logitech',
  'model', 'MX Master 3',
  'colors', jsonb_build_array('#111827', '#6B7280'),
  'highlights', jsonb_build_array('Ergonomic design', 'Free delivery available'),
  'specificationSummary', 'Advanced wireless mouse optimized for precision, comfort, and multitasking workflows.',
  'careInstructions', 'Keep sensor area clean and charge periodically for best battery performance.',
  'optionsGroup1', '[]'::jsonb,
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'wireless', 'title', 'Wireless')),
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Logitech'),
    jsonb_build_object('label', 'Model', 'value', 'MX Master 3'),
    jsonb_build_object('label', 'Category', 'value', 'Accessories')
  )
)
where title = 'Logitech MX Master 3 Mouse' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.7,
  'category', 'Tablets',
  'shortDescription', 'Portable tablet with balanced performance for work, creativity, and media.',
  'description', 'This iPad Air record is now able to drive the storefront details page entirely from database content.',
  'availability', 'In Stock',
  'badge', 'SALE 15% OFF',
  'promoText', 'Free delivery available',
  'brand', 'Apple',
  'model', 'iPad Air 5th Gen',
  'colors', jsonb_build_array('#60A5FA', '#A855F7', '#F8FAFC'),
  'highlights', jsonb_build_array('Lightweight body', 'Free delivery available'),
  'specificationSummary', 'Versatile tablet suited for media consumption, note taking, and light productivity.',
  'careInstructions', 'Use a screen protector and avoid exposing the device to moisture.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', '64gb', 'title', '64 GB'),
    jsonb_build_object('id', '256gb', 'title', '256 GB')
  ),
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'wifi', 'title', 'Wi‑Fi')),
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Apple'),
    jsonb_build_object('label', 'Model', 'value', 'iPad Air 5th Gen'),
    jsonb_build_object('label', 'Category', 'value', 'Tablets')
  )
)
where title = 'Apple iPad Air 5th Gen - 64GB' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.5,
  'category', 'Networking',
  'shortDescription', 'Dual-band router for stable coverage in homes and small office setups.',
  'description', 'The Asus router record includes dynamic merchandising details from the database, just like the rest of the catalog.',
  'availability', 'In Stock',
  'badge', 'FEATURED',
  'promoText', 'Fast shipping available',
  'brand', 'Asus',
  'model', 'RT Dual Band Router',
  'colors', jsonb_build_array('#111827', '#F3F4F6'),
  'highlights', jsonb_build_array('Dual-band coverage', 'Fast shipping available'),
  'specificationSummary', 'Reliable networking hardware with practical coverage for everyday home connectivity.',
  'careInstructions', 'Place in a ventilated area and avoid blocking external antennas.',
  'optionsGroup1', '[]'::jsonb,
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'router', 'title', 'Router')),
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Asus'),
    jsonb_build_object('label', 'Model', 'value', 'RT Dual Band Router'),
    jsonb_build_object('label', 'Category', 'value', 'Networking')
  )
)
where title = 'Asus RT Dual Band Router' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

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

insert into public.site_content (key, title, content)
values
  (
    'header.menu',
    'Header Menu',
    '{"items":[{"id":1,"title":"Popular","newTab":false,"path":"/"},{"id":2,"title":"Shop","newTab":false,"path":"/shop-with-sidebar"},{"id":3,"title":"Contact","newTab":false,"path":"/contact"},{"id":6,"title":"Pages","newTab":false,"path":"/","submenu":[{"id":61,"title":"Shop With Sidebar","newTab":false,"path":"/shop-with-sidebar"},{"id":62,"title":"Shop Without Sidebar","newTab":false,"path":"/shop-without-sidebar"},{"id":64,"title":"Checkout","newTab":false,"path":"/checkout"},{"id":65,"title":"Cart","newTab":false,"path":"/cart"},{"id":66,"title":"Wishlist","newTab":false,"path":"/wishlist"},{"id":67,"title":"Sign in","newTab":false,"path":"/signin"},{"id":68,"title":"Sign up","newTab":false,"path":"/signup"},{"id":69,"title":"My Account","newTab":false,"path":"/my-account"},{"id":70,"title":"Contact","newTab":false,"path":"/contact"},{"id":75,"title":"Error","newTab":false,"path":"/error"},{"id":63,"title":"Mail Success","newTab":false,"path":"/mail-success"}]},{"id":7,"title":"Blogs","newTab":false,"path":"/","submenu":[{"id":71,"title":"Blog Grid with sidebar","newTab":false,"path":"/blogs/blog-grid-with-sidebar"},{"id":72,"title":"Blog Grid","newTab":false,"path":"/blogs/blog-grid"},{"id":73,"title":"Blog details with sidebar","newTab":false,"path":"/blogs/blog-details-with-sidebar"},{"id":74,"title":"Blog details","newTab":false,"path":"/blogs/blog-details"}]}]}'::jsonb
  ),
  (
    'home.hero_main',
    'Home Hero Main Slide',
    '{"salePercent":"30%","title":"True Wireless Noise Cancelling Headphone","description":"Lorem ipsum dolor sit amet, consectetur adipiscing elit.","ctaLabel":"Shop Now","ctaHref":"#","image":"/images/hero/hero-01.png"}'::jsonb
  ),
  (
    'home.hero_feature',
    'Home Hero Features',
    '{"items":[{"img":"/images/icons/icon-01.svg","title":"Free Shipping","description":"For all orders $200"},{"img":"/images/icons/icon-02.svg","title":"1 & 1 Returns","description":"Cancellation after 1 day"},{"img":"/images/icons/icon-03.svg","title":"100% Secure Payments","description":"Gurantee secure payments"},{"img":"/images/icons/icon-04.svg","title":"24/7 Dedicated Support","description":"Anywhere & anytime"}]}'::jsonb
  ),
  (
    'home.hero_side',
    'Home Hero Side Cards',
    '{"cards":[{"title":"iPhone 14 Plus & 14 Pro Max","caption":"limited time offer","price":"$699","oldPrice":"$999","image":"/images/hero/hero-02.png"},{"title":"Wireless Headphone","caption":"limited time offer","price":"$699","oldPrice":"$999","image":"/images/hero/hero-01.png"}]}'::jsonb
  ),
  (
    'home.promo',
    'Home Promo Banner',
    '{"headline":"UP TO 30% OFF","subhead":"Apple iPhone 14 Plus","description":"iPhone 14 has the same superspeedy chip that is in iPhone 13 Pro.","ctaLabel":"Buy Now","ctaHref":"#","image":"/images/promo/promo-01.png"}'::jsonb
  ),
  (
    'home.countdown',
    'Home Countdown Banner',
    '{"deadline":"December, 31, 2026","tag":"Don\u2019t Miss!!","title":"Enhance Your Music Experience","description":"The Havit H206d is a wired PC headphone.","ctaLabel":"Check it Out!","ctaHref":"#","image":"/images/countdown/countdown-01.png"}'::jsonb
  ),
  (
    'common.newsletter',
    'Newsletter Block',
    '{"title":"Don\u0027t Miss Out Latest Trends & Offers","description":"Register to receive news about the latest offers and discount codes.","buttonLabel":"Subscribe"}'::jsonb
  ),
  (
    'footer.contact',
    'Footer Contact',
    '{"title":"Help & Support","address":"685 Market Street, Las Vegas, LA 95820, United States.","phone":"(+099) 532-786-9843","email":"support@example.com"}'::jsonb
  ),
  (
    'contact.info',
    'Contact Page Info',
    '{"name":"Tiny Libaas Support","phone":"1234 567890","address":"7398 Smoke Ranch Road, Las Vegas, Nevada 89128"}'::jsonb
  )
on conflict (key) do nothing;
