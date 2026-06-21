-- Add seed products
BEGIN;

INSERT INTO public.products (name, description, price, image_url, stock, category_id)
VALUES
('Mechanical Keyboard Pro', 'High-performance mechanical keyboard with hot-swappable switches and RGB backlight.', 7999.00, 'keyboard', 25, NULL),
('Ergonomic Mouse X', 'Precision ergonomic mouse with configurable DPI and long battery life.', 2499.00, 'mouse', 40, NULL),
('Studio Headphones S', 'Over-ear studio headphones with balanced sound and noise isolation.', 5999.00, 'headphones', 15, NULL),
('Minimal Desk Lamp', 'Adjustable LED desk lamp with warm/cool modes and touch dimmer.', 3499.00, 'lamp', 30, NULL),
('Premium Deskpad', 'Large stitched deskpad for keyboards and mice, water-resistant surface.', 1999.00, 'deskpad', 50, NULL),
('Leather Folio Case', 'Slim folio case for notebooks and tablets with magnetic closure.', 3199.00, 'folio', 20, NULL),
('Insulated Bottle 750ml', 'Double-wall insulated bottle to keep drinks hot or cold for hours.', 999.00, 'bottle', 60, NULL),
('Signature Bundle', 'Curated bundle including keyboard, mouse, and deskpad for productivity.', 12999.00, 'hero', 10, NULL
);

COMMIT;
