import React, { useState, useEffect, useMemo } from 'react';
import { useStockStore } from '../store/stockStore';
import { useOrderStore } from '../store/orderStore';
import { useThemeStore } from '../store/themeStore';
import { ShoppingCart, Search, Plus, Minus, Trash2, CreditCard, Smartphone, Wallet, X, Loader2, CheckCircle, Image as ImageIcon, PackageOpen, ChevronRight, ScanLine } from 'lucide-react';
import { StockItem, OrderItem } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
// @ts-ignore
import QRCode from "react-qr-code";

const POS: React.FC = () => {
    const { items, fetchItems } = useStockStore();
    const { createOrder } = useOrderStore();
    const { t } = useThemeStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cart, setCart] = useState<OrderItem[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    // Derived State
    const categories = useMemo(() => ['All', ...new Set(items.map(i => i.category))], [items]);
    
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  item.sku.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory && item.status !== 'Out of Stock';
        });
    }, [items, searchTerm, selectedCategory]);

    // Cart Logic
    const addToCart = (product: StockItem) => {
        const existing = cart.find(i => i.productId === product.id);
        if (existing) {
            if (existing.quantity < product.quantity) {
                setCart(prev => prev.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
            }
        } else {
            setCart(prev => [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
        }
    };

    const updateQty = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const stockItem = items.find(i => i.id === productId);
                const newQty = item.quantity + delta;
                
                if (stockItem && newQty > stockItem.quantity) return item; 
                if (newQty < 1) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const clearCart = () => setCart([]);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.0; // 0% for POS usually, or configurable. Keeping flat 0 based on previous logic.
    const total = subtotal + tax;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-6 overflow-hidden">
            {/* LEFT: Product Catalog */}
            <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Header & Search */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex flex-col gap-4 z-10 bg-white dark:bg-slate-800 relative">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder={t('Search products...')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 dark:text-white transition-all"
                        />
                    </div>
                    
                    <div className="flex space-x-2 overflow-x-auto pb-1 custom-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                                    selectedCategory === cat 
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 dark:bg-slate-900/20">
                    <motion.div 
                        layout
                        className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map(item => (
                                <ProductCard key={item.id} item={item} onAdd={() => addToCart(item)} />
                            ))}
                        </AnimatePresence>
                    </motion.div>

                    {filteredItems.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
                             <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                                <PackageOpen size={40} className="opacity-40" />
                             </div>
                             <p className="font-medium">{t('No items found')}</p>
                             <p className="text-sm mt-1">Try adjusting your search</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT: Cart Sidebar */}
            <div className="w-full lg:w-[400px] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 h-[60vh] lg:h-auto relative overflow-hidden">
                {/* Cart Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg text-primary">
                            <ShoppingCart size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-900 dark:text-white">{t('Current Order')}</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Transaction ID: #{Date.now().toString().slice(-6)}</p>
                        </div>
                    </div>
                    <button 
                        onClick={clearCart}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Clear Cart"
                        disabled={cart.length === 0}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    <AnimatePresence initial={false}>
                        {cart.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4"
                            >
                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-700/50 rounded-full flex items-center justify-center">
                                    <ShoppingCart size={40} className="opacity-20" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-lg text-slate-600 dark:text-slate-300">Cart is empty</p>
                                    <p className="text-sm mt-1 max-w-[200px]">Select items from the catalog to start building an order</p>
                                </div>
                            </motion.div>
                        ) : (
                            cart.map(item => {
                                // Find original item to get image (optional optimization: store img in cart)
                                const stockItem = items.find(i => i.id === item.productId);
                                return (
                                    <CartItem 
                                        key={item.productId} 
                                        item={item} 
                                        image={stockItem?.image}
                                        onUpdateQty={updateQty} 
                                        onRemove={removeFromCart} 
                                    />
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Cart Footer */}
                <div className="p-5 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
                            <span>Tax (0%)</span>
                            <span className="font-medium">$0.00</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span className="text-lg font-bold text-slate-900 dark:text-white">Total</span>
                            <span className="text-2xl font-extrabold text-primary">${total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => setShowCheckout(true)}
                        disabled={cart.length === 0}
                        className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center group"
                    >
                        <span>Proceed to Payment</span>
                        <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckout && (
                    <CheckoutModal 
                        total={total} 
                        onClose={() => setShowCheckout(false)}
                        onConfirm={async (data) => {
                             const success = await createOrder({
                                 ...data,
                                 subtotal,
                                 tax,
                                 total,
                                 items: cart
                             });
                             if (success) {
                                 setCart([]);
                                 setShowCheckout(false);
                             }
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub Components ---

const ProductCard: React.FC<{ item: StockItem; onAdd: () => void }> = ({ item, onAdd }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -4 }}
            onClick={onAdd}
            className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-3 cursor-pointer shadow-sm hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/30 transition-all group flex flex-col h-full relative overflow-hidden"
        >
            {/* Image */}
            <div className="aspect-square bg-slate-100 dark:bg-slate-700 rounded-xl mb-3 overflow-hidden relative">
                {item.image ? (
                    <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                        <ImageIcon size={32} />
                    </div>
                )}
                {/* Stock Badge */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-md text-[10px] font-bold uppercase backdrop-blur-md border border-white/10 ${
                    item.quantity < 5 
                    ? 'bg-orange-500/90 text-white' 
                    : 'bg-black/50 text-white'
                }`}>
                    {item.quantity} Left
                </div>
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                    {item.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{item.sku}</p>
                
                <div className="mt-auto flex items-center justify-between">
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                        ${item.price}
                    </span>
                    <button className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 p-2 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                        <Plus size={16} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

const CartItem: React.FC<{ 
    item: OrderItem; 
    image?: string; 
    onUpdateQty: (id: string, delta: number) => void; 
    onRemove: (id: string) => void; 
}> = ({ item, image, onUpdateQty, onRemove }) => {
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center bg-white dark:bg-slate-700/30 border border-slate-100 dark:border-slate-700 p-3 rounded-xl shadow-sm group hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
            {/* Thumbnail */}
            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-600 rounded-lg mr-3 overflow-hidden flex-shrink-0">
                {image ? (
                    <img src={image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <ImageIcon size={20} />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0 mr-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">{item.name}</h4>
                <p className="text-primary font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
            </div>

            <div className="flex items-center gap-3">
                {/* Qty Controls */}
                <div className="flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-600">
                    <button 
                        onClick={() => onUpdateQty(item.productId, -1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-all active:scale-95"
                        aria-label="Decrease quantity"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                    <button 
                        onClick={() => onUpdateQty(item.productId, 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-md bg-primary text-white shadow-sm hover:bg-blue-600 transition-all active:scale-95"
                        aria-label="Increase quantity"
                    >
                        <Plus size={14} />
                    </button>
                </div>
                
                {/* Remove Button */}
                <button 
                    onClick={() => onRemove(item.productId)}
                    className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    aria-label="Remove item"
                >
                    <X size={18} />
                </button>
            </div>
        </motion.div>
    );
};

interface CheckoutModalProps {
    total: number;
    onClose: () => void;
    onConfirm: (data: any) => Promise<void>;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ total, onClose, onConfirm }) => {
    const { t } = useThemeStore();
    const [method, setMethod] = useState<'cash' | 'khqr' | 'card'>('cash');
    const [customerName, setCustomerName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        setIsProcessing(true);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API latency
        await onConfirm({
            customerName: customerName || 'Walk-in Customer',
            paymentMethod: method,
            status: 'paid'
        });
        setIsProcessing(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Modal Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('Checkout')}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Complete transaction</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-8 overflow-y-auto">
                    {/* Amount Display */}
                    <div className="text-center py-4">
                        <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
                        <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">${total.toFixed(2)}</p>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">{t('Payment Method')}</label>
                        <div className="grid grid-cols-3 gap-4">
                            <PaymentMethodCard 
                                icon={<Wallet size={24} />} 
                                label="Cash" 
                                selected={method === 'cash'} 
                                onClick={() => setMethod('cash')} 
                            />
                            <PaymentMethodCard 
                                icon={<ScanLine size={24} />} 
                                label="KHQR" 
                                selected={method === 'khqr'} 
                                onClick={() => setMethod('khqr')} 
                                color="red"
                            />
                            <PaymentMethodCard 
                                icon={<CreditCard size={24} />} 
                                label="Card" 
                                selected={method === 'card'} 
                                onClick={() => setMethod('card')} 
                                color="blue"
                            />
                        </div>
                    </div>

                    {/* Conditional Content */}
                    <AnimatePresence mode="wait">
                        {method === 'khqr' ? (
                            <motion.div 
                                key="khqr"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-900/10 rounded-2xl border-2 border-dashed border-red-200 dark:border-red-800/30"
                            >
                                 <div className="bg-white p-3 rounded-xl shadow-sm mb-3">
                                    <QRCode 
                                        value={`khqr://mock/payment?amount=${total}&currency=USD`} 
                                        size={160}
                                        viewBox={`0 0 256 256`}
                                    />
                                 </div>
                                 <div className="flex items-center text-red-600 dark:text-red-400 font-bold text-sm animate-pulse">
                                     <ScanLine size={16} className="mr-2" /> Scan via Bakong App
                                 </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="details"
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Customer Name (Optional)</label>
                                <input 
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="e.g. Walk-in Customer"
                                    className="w-full border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white p-3.5 rounded-xl focus:ring-2 focus:ring-primary/50 focus:outline-none focus:bg-white dark:focus:bg-slate-700 transition-all"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Action */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <button 
                        onClick={handleConfirm}
                        disabled={isProcessing}
                        className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-lg flex items-center justify-center disabled:opacity-70 disabled:active:scale-100"
                    >
                        {isProcessing ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle className="mr-2" />}
                        {method === 'khqr' ? 'Verify Payment' : 'Confirm Payment'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const PaymentMethodCard: React.FC<{ icon: React.ReactNode, label: string, selected: boolean, onClick: () => void, color?: 'blue' | 'red' }> = ({ icon, label, selected, onClick, color = 'blue' }) => {
    return (
        <button 
            onClick={onClick}
            className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
                selected 
                ? color === 'red' 
                    ? 'bg-red-50 border-red-500 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    : 'bg-blue-50 border-blue-600 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'bg-white dark:bg-slate-700 border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
        >
            {icon}
            <span className="text-sm font-bold">{label}</span>
        </button>
    )
}

export default POS;