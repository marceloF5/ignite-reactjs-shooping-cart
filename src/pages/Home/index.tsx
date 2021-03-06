import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';
import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';

interface IProduct {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface IProductFormatted extends IProduct {
  priceFormatted: string;
}

interface ICartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState<IProductFormatted[]>([]);
  const { addProduct, cart } = useCart();

  const cartItemsAmount = cart.reduce((sumAmount, product) => {
    const newSumAmount = {...sumAmount}
    newSumAmount[product.id] = product.amount
    
    return newSumAmount
  }, {} as ICartItemsAmount)

  useEffect(() => {
    async function loadProducts() {
      const { data } = await api.get<IProduct[]>('/products')
      const productsWithPriceFormatted = data.map((d) => {
        return {...d, priceFormatted: formatPrice(d.price)}
      })
      
      
      setProducts(productsWithPriceFormatted)
    }

    loadProducts();
  }, []);

  function handleAddProduct(id: number) {
    addProduct(id)
  }

  return (
    <ProductList>
      {products && products.map(product => (
        <li key={product.id}>
          <img src={product.image} alt={product.title} />
          <strong>{product.title}</strong>
          <span>{product.priceFormatted}</span>
          <button
            type="button"
            data-testid="add-product-button"
            onClick={() => handleAddProduct(product.id)}
          >
            <div data-testid="cart-product-quantity">
              <MdAddShoppingCart size={16} color="#FFF" />
              {cartItemsAmount[product.id] || 0}
            </div>

            <span>ADICIONAR AO CARRINHO</span>
          </button>
        </li>
      ))}
    </ProductList>
  );
};

export default Home;
