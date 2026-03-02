import React from 'react';
import { X, ShoppingBag, Trash, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose, cartItems = [] }) => {
    const navigate = useNavigate();

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

    const handleCheckout = () => {
        if (!localStorage.getItem('token')) { navigate('/login'); return; }
        onClose();
        navigate('/checkout');
    };

    const handleQuantityChange = (item, type) => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const index = cart.findIndex((cartItem) => cartItem.id === item.id);
        if (index !== -1) {
            if (type === "increase") {
                cart[index].quantity += 1;
            } else {
                cart[index].quantity -= 1;
            }
            localStorage.setItem("cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("cartUpdated"));
        }
    }

    const handleRemoveItem = (item) => {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        const index = cart.findIndex((cartItem) => cartItem.id === item.id);
        if (index !== -1) {
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            window.dispatchEvent(new Event("cartUpdated"));
        }
    }


    return (
        <>
            <div
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-60 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-70 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-gray-900" />
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Shopping Cart</h2>
                        {cartItems.length > 0 && (
                            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                {cartItems.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="Close cart"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cart Items + Checkout */}
                <>
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                        {cartItems.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                                    <ShoppingBag className="w-10 h-10 text-blue-300" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Your cart is empty</h3>
                                    <p className="text-gray-500 mt-2 max-w-[250px] mx-auto">
                                        Looks like you haven't added anything to your cart yet.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-6 py-2.5 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className='flex justify-between w-full align-baseline'>
                                            <div className='flex gap-3'>
                                                <div>
                                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                                                </div>
                                                <div className='flex flex-col'>
                                                    <p className="font-medium text-gray-900 text-sm leading-snug line-clamp-2">{item.name}</p>
                                                    <p className="text-blue-600 font-semibold mt-0.5">₹{(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</p>
                                                    <div className='flex items-center mt-2'>
                                                        <button onClick={() => handleQuantityChange(item, 'decrease')} disabled={item.quantity === 1} className='border border-gray-300 text-gray-600 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-50 transition-colors leading-none disabled:opacity-40'>-</button>
                                                        <span className='w-10 flex items-center justify-center text-gray-900 font-medium'>
                                                            {item.quantity || 1}
                                                        </span>
                                                        <button onClick={() => handleQuantityChange(item, 'increase')} disabled={item.quantity === 10} className='border border-gray-300 text-gray-600 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-50 transition-colors leading-none disabled:opacity-40'>+</button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <button onClick={() => handleRemoveItem(item)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash className='w-4 h-4 text-red-400' /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Checkout Footer */}
                    {cartItems.length > 0 && (
                        <div className="border-t border-gray-100 p-6 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-end mb-1">
                                <p className="text-gray-500 font-medium">Subtotal</p>
                                <p className="text-2xl font-bold text-gray-900">₹{subtotal.toLocaleString('en-IN')}</p>
                            </div>
                            <p className="text-xs text-green-600 font-medium mb-4 flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> Free delivery on all orders
                            </p>
                            <button
                                onClick={handleCheckout}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-md shadow-blue-200 flex justify-center items-center gap-2"
                            >
                                Proceed to Checkout
                            </button>
                        </div>
                    )}
                </>
            </div>
        </>
    )
}

export default Cart;