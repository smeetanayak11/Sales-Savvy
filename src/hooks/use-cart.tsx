import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import productsData from "@/data/products.json";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  name: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: string;
  items: OrderItem[];
  total: number;
  address: string;
  paymentMethod?: string;
  paymentStatus?: string;
}

interface CartContextValue {
  items: Array<CartItem & { product: typeof productsData[number] | null }>;
  totalItems: number;
  totalAmount: number;
  addItem: (productId: string, quantity?: number) => void;
  setCartToSingle: (productId: string, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  placeOrder: (address: string, paymentMethod?: string, paymentStatus?: string) => Order;
  orders: Order[];
}

const LOCAL_CART_KEY = "sales-savvy-cart";
const LOCAL_ORDERS_KEY = "sales-savvy-orders";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(LOCAL_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(LOCAL_ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
}

function saveOrders(orders: Order[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
}

function createOrderId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(loadCart);
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  const productsById = useMemo(
    () => new Map(productsData.map((product) => [product.id, product] as const)),
    []
  );

  const items = useMemo(
    () =>
      cart.map((item) => ({
        ...item,
        product: productsById.get(item.productId) ?? null,
      })),
    [cart, productsById]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const totalAmount = useMemo(
    () =>
      items.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0),
    [items]
  );

  const addItem = (productId: string, quantity = 1) => {
    const product = productsById.get(productId);
    if (!product) return;
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...current, { productId, quantity }];
    });
  };

  const setCartToSingle = (productId: string, quantity = 1) => {
    const product = productsById.get(productId);
    if (!product) return;
    setCart([{ productId, quantity }]);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (productId: string) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const clearCart = () => setCart([]);

  const placeOrder = (address: string, paymentMethod = "card", paymentStatus = "paid") => {
    const orderItems: OrderItem[] = items
      .filter((item) => item.product)
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.product?.price ?? 0,
        name: item.product?.name ?? "Unknown product",
        imageUrl: item.product?.image_url,
      }));

    const order: Order = {
      id: createOrderId(),
      createdAt: new Date().toISOString(),
      status: paymentMethod === "cod" ? "Pending (COD)" : "Confirmed",
      items: orderItems,
      total: orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      address,
      paymentMethod,
      paymentStatus,
    };

    setOrders((current) => [order, ...current]);
    clearCart();
    return order;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalAmount,
        addItem,
        setCartToSingle,
        updateQuantity,
        removeItem,
        clearCart,
        placeOrder,
        orders,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
