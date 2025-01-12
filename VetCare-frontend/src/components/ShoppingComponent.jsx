import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ShoppingComponent.css';

const ShoppingComponent = ({ userId }) => {
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (userId) {  // Only fetch if we have a userId
            fetchProducts();
            fetchOrders();
        }
    }, [userId]); // Add userId as dependency

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        }
    };

    const fetchOrders = async () => {
        try {
            // First get all orders for the user
            const ordersResponse = await axios.get(`http://localhost:8080/api/orders/user/${userId}`);
            
            if (!ordersResponse.data) {
                console.log('No orders found');
                setOrders([]);
                return;
            }

            // Then get details for each order
            const ordersWithDetails = await Promise.all(
                ordersResponse.data.map(async (order) => {
                    try {
                        // Get details for this specific order
                        const detailsResponse = await axios.get(`http://localhost:8080/api/order-details/order/${order.id}`);
                        return {
                            ...order,
                            details: detailsResponse.data || []
                        };
                    } catch (detailError) {
                        console.error(`Error fetching details for order ${order.id}:`, detailError);
                        return {
                            ...order,
                            details: []
                        };
                    }
                })
            );

            console.log('Orders with details:', ordersWithDetails);
            setOrders(ordersWithDetails);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Failed to load orders');
        }
    };

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.productId === product.id);
        if (existingItem) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: Number(item.quantity) + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: Number(product.price),
                quantity: 1
            }]);
        }
        setSuccess('Item added to cart');
        setTimeout(() => setSuccess(''), 2000);
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return;
        setCart(cart.map(item =>
            item.productId === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const calculateTotal = () => {
        const total = cart.reduce((sum, item) => {
            const price = Number(item.price);
            const quantity = Number(item.quantity);
            return sum + (price * quantity);
        }, 0);
        
        return Number(total.toFixed(2)); // Ensure 2 decimal places
    };

    const formatDateForBackend = (date) => {
        return date.toISOString().split('.')[0]; // Remove milliseconds if needed
    };

    const createOrderDetail = async (orderId, item) => {
        const orderDetail = {
            orderId: orderId,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        };

        try {
            const response = await axios.post('http://localhost:8080/api/order-details', orderDetail);
            return response.data;
        } catch (error) {
            console.error('Error creating order detail:', error);
            throw error;
        }
    };

    const placeOrder = async () => {
        if (isLoading) return;
        if (cart.length === 0) {
            setError('Your cart is empty');
            return;
        }

        setIsLoading(true);
        setError('');
        
        try {
            const orderRequest = {
                userId: Number(userId),
                date: new Date().toISOString(),
                totalPrice: calculateTotal()
            };

            console.log('Sending order request:', orderRequest);
            
            // First, get the saved order ID
            const savedOrderResponse = await axios.get(`http://localhost:8080/api/orders/latest/${userId}`);
            console.log('Latest order response:', savedOrderResponse.data);

            if (!savedOrderResponse.data || !savedOrderResponse.data.id) {
                throw new Error('Could not retrieve order ID');
            }

            const orderId = savedOrderResponse.data.id;
            console.log('Using order ID:', orderId);

            // Create order details
            for (const item of cart) {
                const orderDetailRequest = {
                    orderId: orderId,
                    productId: Number(item.productId),
                    quantity: Number(item.quantity),
                    price: Number(item.price)
                };

                console.log('Creating order detail:', orderDetailRequest);
                
                await axios.post('http://localhost:8080/api/order-details', orderDetailRequest, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Success! Clear cart and show confirmation
            setCart([]);
            setShowCart(false);
            setSuccess('Order placed successfully!');
            fetchOrders();
        } catch (error) {
            console.error('Error placing order:', error);
            
            let errorMessage = 'Failed to place order: ';
            
            if (error.response) {
                console.error('Server error:', error.response.data);
                errorMessage += error.response.data?.message || 'Server error';
            } else {
                errorMessage += error.message;
            }
            
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="shopping-management">
            <div className="shopping-header">
                <h2 className="shopping-title">Pet Shop Products</h2>
                <div className="shopping-actions">
                    <button 
                        className="view-cart-button"
                        onClick={() => {
                            setShowCart(true);
                            setShowOrders(false);
                        }}
                    >
                        Cart ({cart.length})
                    </button>
                    <button 
                        className="view-orders-button"
                        onClick={() => {
                            setShowOrders(true);
                            setShowCart(false);
                        }}
                    >
                        My Orders
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {showCart ? (
                <div className="cart-container">
                    <h3>Shopping Cart</h3>
                    {cart.length === 0 ? (
                        <p className="empty-cart">Your cart is empty</p>
                    ) : (
                        <>
                            <div className="cart-items">
                                {cart.map(item => (
                                    <div key={item.productId} className="cart-item">
                                        <div className="item-info">
                                            <h4>{item.name}</h4>
                                            <p className="price">${item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="item-actions">
                                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                                            <button onClick={() => removeFromCart(item.productId)} className="remove-button">Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="cart-summary">
                                <p className="total">Total: ${calculateTotal().toFixed(2)}</p>
                                <button 
                                    onClick={placeOrder} 
                                    className="place-order-button"
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : 'Place Order'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ) : showOrders ? (
                <div className="orders-container">
                    <h3>My Orders</h3>
                    {orders.length === 0 ? (
                        <p className="no-orders">No orders found</p>
                    ) : (
                        <div className="orders-list">
                            {orders.map(order => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <h4>Order #{order.id}</h4>
                                        <p className="order-date">{formatDate(order.date)}</p>
                                        <p className="order-total">Total: ${order.totalPrice.toFixed(2)}</p>
                                    </div>
                                    <div className="order-details">
                                        {order.details.map(detail => {
                                            const product = products.find(p => p.id === detail.productId);
                                            return (
                                                <div key={detail.id} className="order-item">
                                                    <p>{product?.name}</p>
                                                    <p>Quantity: {detail.quantity}</p>
                                                    <p>${detail.price.toFixed(2)}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="products-grid">
                    {products.map(product => (
                        <div key={product.id} className="product-card">
                            <div className="product-info">
                                <h3>{product.name}</h3>
                                <p className="description">{product.description}</p>
                                <p className="price">
                                    ${typeof product.price === 'number' ? product.price.toFixed(2) : '0.00'}
                                </p>
                                <p className="stock">
                                    {product.stock > 0 ? `In Stock: ${product.stock}` : 'Out of Stock'}
                                </p>
                            </div>
                            <button 
                                className="add-to-cart-button"
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0}
                            >
                                Add to Cart
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShoppingComponent; 