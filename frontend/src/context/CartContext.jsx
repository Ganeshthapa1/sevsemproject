import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, getToken } = useAuth();
  
  // API URL without the trailing slash
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

  // Fetch cart
  const fetchCart = async () => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, skipping cart fetch');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching cart from API');
      const token = getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get(`${API_URL}/cart`, config);
      console.log('Cart data received:', response.data);
      setCart(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load cart. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Add item to cart
  const addToCart = async (productId, quantity) => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, cannot add to cart');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Adding to cart:', { productId, quantity });
      const token = getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.post(
        `${API_URL}/cart/add`,
        { productId, quantity },
        config
      );
      
      console.log('Item added to cart:', response.data);
      await fetchCart(); // Refresh cart after adding
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Update cart item
  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, cannot update cart');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Updating cart item:', { productId, quantity });
      const token = getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.patch(
        `${API_URL}/cart/update/${productId}`,
        { quantity },
        config
      );
      
      console.log('Cart item updated:', response.data);
      await fetchCart(); // Refresh cart after update
      return true;
    } catch (err) {
      console.error('Error updating cart item:', err);
      setError('Failed to update cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, cannot remove from cart');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Removing from cart:', productId);
      const token = getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.delete(
        `${API_URL}/cart/remove/${productId}`,
        config
      );
      
      console.log('Item removed from cart:', response.data);
      await fetchCart(); // Refresh cart after removal
      return true;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Failed to remove item from cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated()) {
      console.log('User not authenticated, cannot clear cart');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Clearing cart');
      const token = getToken();
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.delete(`${API_URL}/cart/clear`, config);
      console.log('Cart cleared:', response.data);
      setCart(null);
      return true;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError('Failed to clear cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load cart once on component mount
  useEffect(() => {
    const checkAndLoadCart = async () => {
      if (isAuthenticated()) {
        console.log('User authenticated, fetching cart');
        await fetchCart();
      } else {
        console.log('User not authenticated, setting cart to null');
        setCart(null);
      }
    };
    
    checkAndLoadCart();
    // Empty dependency array - only run once on mount
  }, []);
  
  // Add listener for login event to refresh cart
  useEffect(() => {
    const handleUserLogin = () => {
      console.log('Login event detected, refreshing cart');
      fetchCart();
    };
    
    // Listen for the custom login event
    window.addEventListener('userLogin', handleUserLogin);
    
    // Cleanup
    return () => {
      window.removeEventListener('userLogin', handleUserLogin);
    };
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 