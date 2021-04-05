import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart') 
  
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const { data: hasStock} = await api.get<Stock>(`/stock/${productId}`)
      const hasProductInCart = cart.find(product => product.id === productId)
      
      
      if (hasProductInCart?.amount === hasStock?.amount) {    
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      
      
      if (hasProductInCart) {
        const newCartItems = cart.map(product => (product.id === productId ? {...product, amount: product.amount + 1 } : product))
        
        setCart(newCartItems)
        localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartItems))
        return
      }
      
      const { data }  = await api.get(`/products/${productId}`)
      const product = {...data, amount: 1}
      const newCartItems = [...cart, product]
      
      setCart(newCartItems)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartItems))
    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const hasProductInCart = cart.find(product => product.id === productId)
      
      if (!hasProductInCart) throw new Error()
      
      const newCartItems = cart.filter(product => product.id !== productId)
      
      setCart(newCartItems)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartItems))
    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      const hasProductInCart = cart.find(product => product.id === productId)
      
      if (!hasProductInCart || amount < 1) throw new Error()
      
      const { data: hasStock} = await api.get<Stock>(`/stock/${productId}`)

      if (hasStock.amount < amount) {
        toast.error('Quantidade solicitada fora de estoque');
        return
      }
      
      const newCartItems = cart.map(product => (product.id === productId ? {...product, amount } : product))
      setCart(newCartItems)
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(newCartItems))
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
