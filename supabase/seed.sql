insert into public.categories (title, img)
values
  ('Women''s Fashion', '/images/categories/categories-01.png'),
  ('Men''s Fashion', '/images/categories/categories-02.png'),
  ('Kids'' Wear', '/images/categories/categories-03.png'),
  ('Accessories', '/images/categories/categories-04.png'),
  ('Footwear', '/images/categories/categories-05.png'),
  ('Bags & Wallets', '/images/categories/categories-06.png'),
  ('Activewear', '/images/categories/categories-07.png')
on conflict do nothing;

insert into public.product_detail_enums (enum_group, option_id, option_title, sort_order)
values
  ('optionsGroup1', 'xs', 'XS', 1),
  ('optionsGroup1', 's', 'S', 2),
  ('optionsGroup1', 'm', 'M', 3),
  ('optionsGroup1', 'l', 'L', 4),
  ('optionsGroup1', 'xl', 'XL', 5),
  ('optionsGroup2', 'regular', 'Regular Fit', 1),
  ('optionsGroup2', 'slim', 'Slim Fit', 2),
  ('optionsGroup2', 'oversized', 'Oversized Fit', 3),
  ('optionsGroup3', 'cotton', 'Cotton', 1),
  ('optionsGroup3', 'denim', 'Denim', 2),
  ('optionsGroup3', 'linen', 'Linen', 3),
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
  ('Floral Midi Dress', 42, 89.00, 59.00, '{/images/products/product-1-sm-1.png,/images/products/product-1-sm-2.png}', '{/images/products/product-1-bg-1.png,/images/products/product-1-bg-2.png}'),
  ('Tailored Linen Blazer', 28, 129.00, 99.00, '{/images/products/product-2-sm-1.png,/images/products/product-2-sm-2.png}', '{/images/products/product-2-bg-1.png,/images/products/product-2-bg-2.png}'),
  ('Kids Printed Hoodie Set', 37, 69.00, 49.00, '{/images/products/product-3-sm-1.png,/images/products/product-3-sm-2.png}', '{/images/products/product-3-bg-1.png,/images/products/product-3-bg-2.png}'),
  ('Classic Straight Jeans', 51, 79.00, 55.00, '{/images/products/product-4-sm-1.png,/images/products/product-4-sm-2.png}', '{/images/products/product-4-bg-1.png,/images/products/product-4-bg-2.png}'),
  ('Leather Crossbody Bag', 33, 119.00, 85.00, '{/images/products/product-5-sm-1.png,/images/products/product-5-sm-2.png}', '{/images/products/product-5-bg-1.png,/images/products/product-5-bg-2.png}'),
  ('Minimalist Analog Watch', 21, 149.00, 109.00, '{/images/products/product-6-sm-1.png,/images/products/product-6-sm-2.png}', '{/images/products/product-6-bg-1.png,/images/products/product-6-bg-2.png}'),
  ('Unisex Cotton Overshirt', 44, 74.00, 52.00, '{/images/products/product-7-sm-1.png,/images/products/product-7-sm-2.png}', '{/images/products/product-7-bg-1.png,/images/products/product-7-bg-2.png}'),
  ('Running Sneakers Pro', 39, 99.00, 69.00, '{/images/products/product-8-sm-1.png,/images/products/product-8-sm-2.png}', '{/images/products/product-8-bg-1.png,/images/products/product-8-bg-2.png}')
on conflict do nothing;

update public.products
set details = jsonb_build_object(
  'rating', 4.8,
  'category', 'Women''s Fashion',
  'shortDescription', 'Flowy midi dress with floral print for brunches, parties, and warm evenings.',
  'description', 'The Floral Midi Dress combines a feminine silhouette with breathable fabric and premium stitching for all-day comfort.',
  'availability', 'In Stock',
  'badge', 'SALE 35% OFF',
  'promoText', 'Free delivery on orders above $75',
  'brand', 'Urban Loom',
  'model', 'FLR-MIDI-24',
  'colors', jsonb_build_array('#111827', '#EF4444', '#F97316'),
  'highlights', jsonb_build_array('Lightweight fabric', 'Free delivery on orders above $75'),
  'specificationSummary', 'Elegant midi length with relaxed waist and soft drape for versatile styling.',
  'careInstructions', 'Machine wash cold on gentle cycle and hang dry to maintain print vibrancy.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', 's', 'title', 'S'),
    jsonb_build_object('id', 'm', 'title', 'M'),
    jsonb_build_object('id', 'l', 'title', 'L')
  ),
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'regular', 'title', 'Regular Fit')),
  'optionsGroup3', jsonb_build_array(jsonb_build_object('id', 'cotton', 'title', 'Cotton')),
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Urban Loom'),
    jsonb_build_object('label', 'Model', 'value', 'FLR-MIDI-24'),
    jsonb_build_object('label', 'Category', 'value', 'Women''s Fashion')
  )
)
where title = 'Floral Midi Dress' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.7,
  'category', 'Men''s Fashion',
  'shortDescription', 'Breathable linen blazer tailored for smart-casual and occasion wear.',
  'description', 'The Tailored Linen Blazer features clean lines, lightweight construction, and refined detailing for elevated styling.',
  'availability', 'In Stock',
  'badge', 'BEST SELLER',
  'promoText', 'Limited stock in selected sizes',
  'brand', 'North Lane',
  'model', 'LIN-BLZR-11',
  'colors', jsonb_build_array('#111827', '#3C50E0', '#F3F4F6'),
  'highlights', jsonb_build_array('Breathable linen blend', 'Limited stock in selected sizes'),
  'specificationSummary', 'Structured shoulders with a modern cut and comfortable movement throughout the day.',
  'careInstructions', 'Dry clean recommended to preserve shape and texture.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', 'm', 'title', 'M'),
    jsonb_build_object('id', 'l', 'title', 'L'),
    jsonb_build_object('id', 'xl', 'title', 'XL')
  ),
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'slim', 'title', 'Slim Fit')),
  'optionsGroup3', jsonb_build_array(jsonb_build_object('id', 'linen', 'title', 'Linen')),
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'North Lane'),
    jsonb_build_object('label', 'Model', 'value', 'LIN-BLZR-11'),
    jsonb_build_object('label', 'Category', 'value', 'Men''s Fashion')
  )
)
where title = 'Tailored Linen Blazer' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.9,
  'category', 'Kids'' Wear',
  'shortDescription', 'Soft hoodie and jogger set designed for playtime comfort and easy movement.',
  'description', 'The Kids Printed Hoodie Set offers cozy layering, durable seams, and playful prints for everyday adventures.',
  'availability', 'In Stock',
  'badge', 'NEW ARRIVAL',
  'promoText', 'Buy 2 sets and save 10%',
  'brand', 'Little Drift',
  'model', 'KID-HOOD-08',
  'colors', jsonb_build_array('#3C50E0', '#EF4444', '#22C55E'),
  'highlights', jsonb_build_array('Soft inner fleece', 'Buy 2 sets and save 10%'),
  'specificationSummary', 'Comfort-first kids set with ribbed cuffs, adjustable waistband, and vibrant print finish.',
  'careInstructions', 'Wash inside out on cold cycle and tumble dry low.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', 'xs', 'title', 'XS'),
    jsonb_build_object('id', 's', 'title', 'S'),
    jsonb_build_object('id', 'm', 'title', 'M')
  ),
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'regular', 'title', 'Regular Fit')),
  'optionsGroup3', jsonb_build_array(jsonb_build_object('id', 'cotton', 'title', 'Cotton')),
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Little Drift'),
    jsonb_build_object('label', 'Model', 'value', 'KID-HOOD-08'),
    jsonb_build_object('label', 'Category', 'value', 'Kids'' Wear')
  )
)
where title = 'Kids Printed Hoodie Set' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.8,
  'category', 'Men''s Fashion',
  'shortDescription', 'Classic straight-leg denim made for everyday wear and timeless styling.',
  'description', 'The Classic Straight Jeans deliver durable denim comfort with a versatile wash that works from day to night.',
  'availability', 'In Stock',
  'badge', 'TOP RATED',
  'promoText', 'Extra 10% off with code DENIM10',
  'brand', 'Denim Republic',
  'model', 'STR-JEAN-32',
  'colors', jsonb_build_array('#111827', '#1D4ED8'),
  'highlights', jsonb_build_array('Durable denim weave', 'Extra 10% off with code DENIM10'),
  'specificationSummary', 'Mid-rise straight fit with flexible comfort and premium wash retention.',
  'careInstructions', 'Wash with similar colors and avoid bleach to preserve denim tone.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', 'm', 'title', 'M'),
    jsonb_build_object('id', 'l', 'title', 'L'),
    jsonb_build_object('id', 'xl', 'title', 'XL')
  ),
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'regular', 'title', 'Regular Fit')),
  'optionsGroup3', jsonb_build_array(jsonb_build_object('id', 'denim', 'title', 'Denim')),
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Denim Republic'),
    jsonb_build_object('label', 'Model', 'value', 'STR-JEAN-32'),
    jsonb_build_object('label', 'Category', 'value', 'Men''s Fashion')
  )
)
where title = 'Classic Straight Jeans' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.6,
  'category', 'Accessories',
  'shortDescription', 'Compact leather crossbody bag with functional pockets and polished finish.',
  'description', 'The Leather Crossbody Bag is built for everyday essentials with premium hardware and a refined, minimal silhouette.',
  'availability', 'In Stock',
  'badge', 'LIMITED STOCK',
  'promoText', 'Complimentary dust bag included',
  'brand', 'Maison Vale',
  'model', 'CRS-BAG-15',
  'colors', jsonb_build_array('#111827', '#7C2D12', '#F3F4F6'),
  'highlights', jsonb_build_array('Adjustable strap', 'Complimentary dust bag included'),
  'specificationSummary', 'Premium faux-leather finish with organized compartments and zip security.',
  'careInstructions', 'Wipe clean with a soft dry cloth and store away from direct sunlight.',
  'optionsGroup1', '[]'::jsonb,
  'optionsGroup2', '[]'::jsonb,
  'optionsGroup3', jsonb_build_array(jsonb_build_object('id', 'cotton', 'title', 'Cotton Lining')),
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Maison Vale'),
    jsonb_build_object('label', 'Model', 'value', 'CRS-BAG-15'),
    jsonb_build_object('label', 'Category', 'value', 'Accessories')
  )
)
where title = 'Leather Crossbody Bag' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.5,
  'category', 'Accessories',
  'shortDescription', 'Elegant analog watch with minimalist dial and all-day versatility.',
  'description', 'The Minimalist Analog Watch balances clean styling and durable build quality, ideal for both formal and casual outfits.',
  'availability', 'In Stock',
  'badge', 'FEATURED',
  'promoText', 'Fast shipping available',
  'brand', 'Chrona',
  'model', 'MIN-WATCH-04',
  'colors', jsonb_build_array('#111827', '#F59E0B', '#9CA3AF'),
  'highlights', jsonb_build_array('Scratch-resistant glass', 'Fast shipping available'),
  'specificationSummary', 'Minimal case profile with reliable quartz movement and premium strap comfort.',
  'careInstructions', 'Avoid prolonged water exposure and clean gently with a microfiber cloth.',
  'optionsGroup1', '[]'::jsonb,
  'optionsGroup2', '[]'::jsonb,
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Chrona'),
    jsonb_build_object('label', 'Model', 'value', 'MIN-WATCH-04'),
    jsonb_build_object('label', 'Category', 'value', 'Accessories')
  )
)
where title = 'Minimalist Analog Watch' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.7,
  'category', 'Unisex Fashion',
  'shortDescription', 'Relaxed overshirt in soft cotton for easy layering across seasons.',
  'description', 'The Unisex Cotton Overshirt is a wardrobe staple with premium stitching and a breathable texture for daily wear.',
  'availability', 'In Stock',
  'badge', 'WARDROBE ESSENTIAL',
  'promoText', 'Bundle with tees and save 15%',
  'brand', 'Threadline',
  'model', 'UNI-OVER-21',
  'colors', jsonb_build_array('#111827', '#6B7280', '#D97706'),
  'highlights', jsonb_build_array('Easy layering piece', 'Bundle with tees and save 15%'),
  'specificationSummary', 'Midweight cotton weave with relaxed structure and button-through front.',
  'careInstructions', 'Machine wash cold and iron on low heat if needed.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', 's', 'title', 'S'),
    jsonb_build_object('id', 'm', 'title', 'M'),
    jsonb_build_object('id', 'l', 'title', 'L')
  ),
  'optionsGroup2', jsonb_build_array(jsonb_build_object('id', 'oversized', 'title', 'Oversized Fit')),
  'optionsGroup3', jsonb_build_array(jsonb_build_object('id', 'cotton', 'title', 'Cotton')),
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Threadline'),
    jsonb_build_object('label', 'Model', 'value', 'UNI-OVER-21'),
    jsonb_build_object('label', 'Category', 'value', 'Unisex Fashion')
  )
)
where title = 'Unisex Cotton Overshirt' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

update public.products
set details = jsonb_build_object(
  'rating', 4.9,
  'category', 'Footwear',
  'shortDescription', 'Performance-inspired sneakers combining cushioning, breathability, and modern street style.',
  'description', 'Running Sneakers Pro are engineered for all-day comfort with responsive sole support and breathable upper material.',
  'availability', 'In Stock',
  'badge', 'NEW DROP',
  'promoText', 'Free returns within 30 days',
  'brand', 'Stride Co',
  'model', 'RUN-PRO-09',
  'colors', jsonb_build_array('#111827', '#F8FAFC', '#EF4444'),
  'highlights', jsonb_build_array('Responsive cushioning', 'Free returns within 30 days'),
  'specificationSummary', 'Lightweight construction with grip outsole designed for daily movement.',
  'careInstructions', 'Spot clean with mild soap and air dry naturally.',
  'optionsGroup1', jsonb_build_array(
    jsonb_build_object('id', 's', 'title', 'S'),
    jsonb_build_object('id', 'm', 'title', 'M'),
    jsonb_build_object('id', 'l', 'title', 'L')
  ),
  'optionsGroup2', '[]'::jsonb,
  'optionsGroup3', '[]'::jsonb,
  'additionalInformation', jsonb_build_array(
    jsonb_build_object('label', 'Brand', 'value', 'Stride Co'),
    jsonb_build_object('label', 'Model', 'value', 'RUN-PRO-09'),
    jsonb_build_object('label', 'Category', 'value', 'Footwear')
  )
)
where title = 'Running Sneakers Pro' and coalesce(details, '{}'::jsonb) = '{}'::jsonb;

insert into public.blogs (title, date, views, img, content)
values
  ('2026 Women''s Fashion Trends You Can Wear Every Day', 'Mar 27, 2022', 300000, '/images/blog/blog-01.jpg', 'Explore practical trend styling with wearable silhouettes, color pairings, and outfit formulas for weekday to weekend looks.'),
  ('Men''s Capsule Wardrobe: 12 Pieces for 30 Looks', 'Mar 27, 2022', 250000, '/images/blog/blog-02.jpg', 'Build a versatile menswear wardrobe with essential shirts, trousers, denim, outerwear, and smart accessories that mix effortlessly.'),
  ('Kids Style Guide: Comfortable Outfits for School & Play', 'Mar 27, 2022', 180000, '/images/blog/blog-03.jpg', 'Discover durable, breathable, and playful kids outfits that balance movement comfort with polished day-to-day style.'),
  ('How to Choose the Perfect Bag for Work, Travel, and Weekends', 'Mar 27, 2022', 50000, '/images/blog/blog-04.jpg', 'From tote to crossbody, learn how to match bag size, material, and compartments to your lifestyle and daily essentials.'),
  ('Streetwear Meets Tailoring: The New Smart-Casual Formula', 'Mar 27, 2022', 120000, '/images/blog/blog-05.jpg', 'Blend relaxed streetwear with structured tailoring through proportion, layering, and footwear choices for modern everyday dressing.'),
  ('Accessory Layering 101: Watches, Belts, and Minimal Jewelry', 'Mar 27, 2022', 75000, '/images/blog/blog-06.jpg', 'Master subtle accessory layering by balancing metals, leather tones, and statement pieces without overstyling your look.'),
  ('Sustainable Fabrics Explained: Cotton, Linen, and Denim', 'Mar 27, 2022', 90000, '/images/blog/blog-07.jpg', 'A practical guide to fabric feel, durability, and care so you can shop responsibly and make your clothes last longer.'),
  ('How to Build Seasonal Looks on a Budget Without Compromise', 'Mar 27, 2022', 150000, '/images/blog/blog-08.jpg', 'Plan seasonal outfits with smart layering pieces, strategic sale shopping, and capsule combinations that maximize every purchase.'),
  ('Sneaker Styling Ideas for Women, Men, and Kids', 'Mar 27, 2022', 60000, '/images/blog/blog-09.jpg', 'Style sneakers across casual, sporty, and dressy outfits with age-inclusive ideas for women, men, and kids.' )
on conflict do nothing;

insert into public.testimonials (review, author_name, author_role, author_img)
values
  ('I found complete family outfits in one place. Great quality fabrics, reliable sizing, and super fast delivery.', 'Amina Yusuf', 'Fashion Entrepreneur', '/images/users/user-01.jpg'),
  ('The menswear edit is clean and versatile. Every piece I ordered matched the fit guide perfectly.', 'Daniel Okoro', 'Product Designer', '/images/users/user-02.jpg'),
  ('From kids sets to accessories, the collections feel curated and premium. Shopping here is effortless.', 'Laila Mensah', 'Lifestyle Creator', '/images/users/user-03.jpg')
on conflict do nothing;

insert into public.site_content (key, title, content)
values
  (
    'header.menu',
    'Header Menu',
    '{"items":[{"id":1,"title":"Women","newTab":false,"path":"/shop-with-sidebar","hidden":false},{"id":2,"title":"Men","newTab":false,"path":"/shop-with-sidebar","hidden":false},{"id":3,"title":"Kids","newTab":false,"path":"/shop-with-sidebar","hidden":false},{"id":4,"title":"Accessories","newTab":false,"path":"/shop-with-sidebar","hidden":false},{"id":5,"title":"Sale","newTab":false,"path":"/shop-with-sidebar","hidden":false},{"id":6,"title":"Pages","newTab":false,"path":"/","hidden":false,"submenu":[{"id":61,"title":"Shop With Sidebar","newTab":false,"path":"/shop-with-sidebar","hidden":false},{"id":62,"title":"Shop Without Sidebar","newTab":false,"path":"/shop-without-sidebar","hidden":false},{"id":64,"title":"Checkout","newTab":false,"path":"/checkout","hidden":false},{"id":65,"title":"Cart","newTab":false,"path":"/cart","hidden":false},{"id":66,"title":"Wishlist","newTab":false,"path":"/wishlist","hidden":false},{"id":67,"title":"Sign in","newTab":false,"path":"/signin","hidden":false},{"id":68,"title":"Sign up","newTab":false,"path":"/signup","hidden":false},{"id":69,"title":"My Account","newTab":false,"path":"/my-account","hidden":false},{"id":70,"title":"Contact","newTab":false,"path":"/contact","hidden":false},{"id":75,"title":"Error","newTab":false,"path":"/error","hidden":false},{"id":63,"title":"Mail Success","newTab":false,"path":"/mail-success","hidden":false}]},{"id":7,"title":"Blogs","newTab":false,"path":"/","hidden":false,"submenu":[{"id":71,"title":"Blog Grid with sidebar","newTab":false,"path":"/blogs/blog-grid-with-sidebar","hidden":false},{"id":72,"title":"Blog Grid","newTab":false,"path":"/blogs/blog-grid","hidden":false},{"id":73,"title":"Blog details with sidebar","newTab":false,"path":"/blogs/blog-details-with-sidebar","hidden":false},{"id":74,"title":"Blog details","newTab":false,"path":"/blogs/blog-details","hidden":false}]}]}'::jsonb
  ),
  (
    'home.hero_main',
    'Home Hero Main Slide',
    '{"items":[{"salePercent":"40%","title":"New Season \u2014 Women\u2019s Collection","description":"Discover effortlessly chic styles crafted for the modern woman. Fresh cuts, soft fabrics, bold prints.","ctaLabel":"Shop Women","href":"/shop-with-sidebar","image":"/images/hero/hero-01.png"},{"salePercent":"30%","title":"Sharp & Effortless \u2014 Men\u2019s Style Edit","description":"Elevate your everyday look with our curated menswear essentials. Smart, casual, and everything in between.","ctaLabel":"Shop Men","href":"/shop-with-sidebar","image":"/images/hero/hero-02.png"}]}'::jsonb
  ),
  (
    'home.hero_feature',
    'Home Hero Features',
    '{"items":[{"img":"/images/icons/icon-01.svg","title":"Free Shipping","description":"On all orders over $75"},{"img":"/images/icons/icon-02.svg","title":"Easy 30-Day Returns","description":"Hassle-free exchanges & refunds"},{"img":"/images/icons/icon-03.svg","title":"100% Secure Payments","description":"Your data is always safe"},{"img":"/images/icons/icon-04.svg","title":"Style Advice","description":"Expert fashion guidance 24/7"}]}'::jsonb
  ),
  (
    'home.hero_side',
    'Home Hero Side Cards',
    '{"cards":[{"title":"Kids\u2019 New Arrivals","caption":"limited time offer","price":"$29","oldPrice":"$49","image":"/images/hero/hero-02.png","href":"/shop-with-sidebar"},{"title":"Premium Accessories","caption":"limited time offer","price":"$59","oldPrice":"$89","image":"/images/hero/hero-01.png","href":"/shop-with-sidebar"}]}'::jsonb
  ),
  (
    'home.promo',
    'Home Promo Banner',
    '{"headline":"UP TO 40% OFF","subhead":"Women\u2019s Summer Collection","description":"Shop our curated end-of-season edit. Premium fabrics, contemporary cuts, unbeatable prices.","ctaLabel":"Shop the Sale","ctaHref":"/shop-with-sidebar","image":"/images/promo/promo-01.png"}'::jsonb
  ),
  (
    'home.countdown',
    'Home Countdown Banner',
    '{"deadline":"2026-12-31T23:59:59Z","tag":"Don\u2019t Miss!!","title":"End of Season Sale \u2014 Final Hours","description":"Grab your favourite styles before they\u2019re gone. Up to 50% off Women\u2019s, Men\u2019s, Kids & Accessories.","ctaLabel":"Shop the Sale","ctaHref":"/shop-with-sidebar","image":"/images/countdown/countdown-01.png"}'::jsonb
  ),
  (
    'common.newsletter',
    'Newsletter Block',
    '{"title":"Stay Ahead of the Trend","description":"Sign up for curated style picks, exclusive member offers, and early access to new collections.","buttonLabel":"Subscribe"}'::jsonb
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
