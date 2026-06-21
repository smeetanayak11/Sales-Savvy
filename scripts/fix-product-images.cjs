const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, '../src/data/products.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const mapping = {
  smartphone: 'smartphone',
  oneplus: 'smartphone',
  laptop: 'laptop',
  sony: 'laptop',
  headphones: 'headphones',
  boat: 'headphones',
  watch: 'watch',
  titan: 'watch',
  'running-shoes': 'shoes',
  puma: 'shoes',
  tshirt: 'tshirt',
  jeans: 'jeans',
  jacket: 'jacket',
  'leather-bag': 'bag',
  cookbook: 'book',
  airfryer: 'kitchen',
  cushion: 'home',
  lipstick: 'beauty',
  'gaming-headset': 'gaming',
  earbuds: 'accessories',
  nike: 'shoes',
  sunglasses: 'accessories',
  powerbank: 'accessories',
  'induction-cooktop': 'kitchen',
  home: 'home',
  books: 'book',
  kitchen: 'kitchen',
  beauty: 'beauty',
  gaming: 'gaming',
  accessories: 'accessories',
  bag: 'bag',
};
let changed = false;
for (const item of data) {
  const url = item.image_url;
  if (typeof url === 'string' && url.startsWith('https://source.unsplash.com/')) {
    let key = null;
    const lowerUrl = url.toLowerCase();
    for (const token of Object.keys(mapping)) {
      if (lowerUrl.includes(token)) {
        key = mapping[token];
        break;
      }
    }
    if (!key) {
      const source = `${item.name} ${item.category_name}`.toLowerCase();
      for (const token of Object.keys(mapping)) {
        if (source.includes(token)) {
          key = mapping[token];
          break;
        }
      }
    }
    if (!key) {
      key = 'product-placeholder';
    }
    item.image_url = key;
    changed = true;
    console.log(`updated ${item.name} -> ${item.image_url}`);
  }
}
if (changed) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`wrote ${data.length} entries`);
} else {
  console.log('no changes');
}
