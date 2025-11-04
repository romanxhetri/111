import React, { useState, useEffect, useMemo } from 'react';
import { User, Order, MenuItem, Dietary, PromoCode, DailySpecial, CustomizationCategory, CustomizationOption } from '../types';
import { CATEGORIES } from '../constants';

type AdminTab = 'analytics' | 'orders' | 'kitchen' | 'menu' | 'users' | 'promos' | 'settings';

// --- ICONS ---
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>;
const KitchenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
const MenuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>;
const PromosIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7a1 1 0 011.414-1.414L10 14.586l6.293-6.293a1 1 0 011.414 0z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2zm4-4a1 1 0 100-2 1 1 0 000 2zm0 4a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>;


// --- MOCK DATA / HELPERS ---
const getAllOrders = (): (Order & { userEmail: string})[] => {
    const allOrders: (Order & { userEmail: string})[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('orderHistory_')) {
            const userEmail = key.replace('orderHistory_', '');
            const history = JSON.parse(localStorage.getItem(key) || '[]');
            history.forEach((order: Order) => allOrders.push({ ...order, userEmail }));
        }
    }
    return allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const getAllUsers = (): User[] => JSON.parse(localStorage.getItem('users') || '[]');

// --- AnalyticsDashboard ---
const AnalyticsDashboard = () => {
    const allOrders = useMemo(getAllOrders, []);
    const totalRevenue = allOrders.reduce((sum, order) => sum + order.totalPrice, 0);
    const totalOrders = allOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const itemSales = useMemo(() => {
        const sales: { [key: string]: number } = {};
        allOrders.forEach(order => { order.items.forEach(item => { sales[item.name] = (sales[item.name] || 0) + item.quantity; }); });
        return Object.entries(sales).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [allOrders]);
    const maxSales = itemSales.length > 0 ? itemSales[0][1] : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">Total Revenue</p><p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">Total Orders</p><p className="text-3xl font-bold">{totalOrders}</p></div>
                <div className="bg-white p-6 rounded-lg shadow"><p className="text-sm text-gray-500">Avg. Order Value</p><p className="text-3xl font-bold">${avgOrderValue.toFixed(2)}</p></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Top Selling Items</h3>
                <div className="space-y-4">
                    {itemSales.map(([name, count]) => (
                        <div key={name} className="flex items-center">
                            <span className="w-40 truncate text-sm font-semibold">{name}</span>
                            <div className="flex-grow bg-gray-200 rounded-full h-4 mr-4"><div className="bg-orange-500 h-4 rounded-full" style={{ width: `${(count / maxSales) * 100}%` }}></div></div>
                            <span className="font-bold text-sm">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- OrderManagement ---
const OrderManagement = () => {
    const allOrders = useMemo(getAllOrders, []);
    return (
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-100"><tr><th className="p-3">Order ID</th><th className="p-3">Date</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Items</th></tr></thead>
                <tbody>{allOrders.map(order => (<tr key={order.id} className="border-b hover:bg-gray-50"><td className="p-3 font-mono">{order.id}</td><td className="p-3">{new Date(order.date).toLocaleString()}</td><td className="p-3 truncate">{order.userEmail}</td><td className="p-3 font-semibold">${order.totalPrice.toFixed(2)}</td><td className="p-3">{order.items.reduce((sum, i) => sum + i.quantity, 0)}</td></tr>))}</tbody>
            </table>
        </div>
    );
};

// --- KitchenDisplay ---
const KitchenDisplay = () => {
     const recentOrders = useMemo(() => getAllOrders().slice(0, 10), []);
     const [orderStatuses, setOrderStatuses] = useState<{ [key: string]: 'new' | 'in_progress' | 'ready' }>({});
     const handleStatusChange = (orderId: string, status: 'new' | 'in_progress' | 'ready') => setOrderStatuses(prev => ({...prev, [orderId]: status}));
     const columns = { new: recentOrders.filter(o => !orderStatuses[o.id] || orderStatuses[o.id] === 'new'), in_progress: recentOrders.filter(o => orderStatuses[o.id] === 'in_progress'), ready: recentOrders.filter(o => orderStatuses[o.id] === 'ready'), };

     return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[70vh]"><p className="md:hidden text-center text-sm text-gray-500">Kitchen Display is best viewed on larger screens.</p>
            {Object.entries(columns).map(([status, orders]) => (<div key={status} className="bg-gray-200 rounded-lg p-3 hidden md:block"><h3 className="font-bold mb-3 capitalize text-center">{status.replace('_', ' ')} ({orders.length})</h3><div className="space-y-3 overflow-y-auto h-full pr-1">{orders.map(order => (<div key={order.id} className="bg-white p-3 rounded shadow"><p className="font-bold text-sm">#{order.id}</p><ul className="text-xs my-2 list-disc pl-4">{order.items.map(item => <li key={item.cartItemId}>{item.quantity}x {item.name}</li>)}</ul><div className="text-xs flex gap-1 mt-2">{status !== 'new' && <button onClick={() => handleStatusChange(order.id, 'new')} className="bg-gray-300 px-1 rounded">New</button>}{status !== 'in_progress' && <button onClick={() => handleStatusChange(order.id, 'in_progress')} className="bg-yellow-400 px-1 rounded">In Prog</button>}{status !== 'ready' && <button onClick={() => handleStatusChange(order.id, 'ready')} className="bg-green-500 px-1 rounded text-white">Ready</button>}</div></div>))}</div></div>))}
        </div>
     );
};

// --- MenuItemFormModal ---
const emptyItem: Omit<MenuItem, 'id' | 'reviews' | 'averageRating' | 'reviewCount'> = { name: '', description: '', price: 0, image: '', category: CATEGORIES[0].id, spicyLevel: 0, dietaryTags: [], isAvailable: true, customizationOptions: [] };
const MenuItemFormModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (item: MenuItem) => void, onAdd: (item: any) => void, onDelete: (id: number) => void, item: MenuItem | null }> = ({ isOpen, onClose, onSave, onAdd, onDelete, item }) => {
    const [formData, setFormData] = useState(item ? { ...item } : emptyItem);
    useEffect(() => { setFormData(item ? { ...item } : emptyItem); }, [item]);

    if (!isOpen) return null;
    const isNew = !item;
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            if (name === 'dietaryTags') {
                const tag = value as Dietary;
                const newTags = checked ? [...(formData.dietaryTags || []), tag] : (formData.dietaryTags || []).filter(t => t !== tag);
                setFormData(prev => ({...prev, dietaryTags: newTags}));
            } else {
                 setFormData(prev => ({ ...prev, [name]: checked }));
            }
        } else {
             setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'spicyLevel' ? Number(value) : value }));
        }
    };
    const handleSave = () => { isNew ? onAdd(formData) : onSave(formData as MenuItem); onClose(); };
    const handleDelete = () => { if (item && confirm('Are you sure?')) { onDelete(item.id); onClose(); }};

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col"><header className="p-4 border-b flex justify-between items-center"><h2 className="text-xl font-bold">{isNew ? 'Add New Item' : 'Edit Item'}</h2><button onClick={onClose}>&times;</button></header><main className="p-6 space-y-4 overflow-y-auto"><div className="grid grid-cols-2 gap-4"><input name="name" value={formData.name} onChange={handleChange} placeholder="Name" className="p-2 border rounded col-span-2" /><input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="Price" className="p-2 border rounded" /><select name="category" value={formData.category} onChange={handleChange} className="p-2 border rounded bg-white">{CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select><textarea name="description" value={formData.description} onChange={handleChange} placeholder="Description" className="p-2 border rounded col-span-2" rows={3}></textarea><input name="image" value={formData.image} onChange={handleChange} placeholder="Image URL" className="p-2 border rounded col-span-2" /><div><label className="font-semibold block mb-1">Spicy Level</label><select name="spicyLevel" value={formData.spicyLevel} onChange={handleChange} className="p-2 border rounded bg-white w-full">{[0,1,2,3].map(l => <option key={l} value={l}>{l}</option>)}</select></div><div><label className="font-semibold block mb-1">Dietary Tags</label>{Object.values(Dietary).map(tag => <label key={tag} className="inline-flex items-center mr-3"><input type="checkbox" name="dietaryTags" value={tag} checked={(formData.dietaryTags || []).includes(tag)} onChange={handleChange} className="h-4 w-4 rounded" /> <span className="ml-1">{tag}</span></label>)}</div><label className="col-span-2 flex items-center"><input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} className="h-5 w-5 rounded" /><span className="ml-2 font-semibold">Is Available</span></label></div></main><footer className="p-4 border-t flex justify-end gap-3">{!isNew && <button onClick={handleDelete} className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Delete</button>}<button onClick={onClose} className="bg-gray-200 py-2 px-4 rounded-lg">Cancel</button><button onClick={handleSave} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">Save</button></footer></div></div>
    );
};

// --- MenuManagement ---
const MenuManagement = ({ menuItems, onUpdateMenu, onAddMenu, onDeleteMenu }: { menuItems: MenuItem[], onUpdateMenu: any, onAddMenu: any, onDeleteMenu: any }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const handleEdit = (item: MenuItem) => { setEditingItem(item); setIsModalOpen(true); };
    const handleAdd = () => { setEditingItem(null); setIsModalOpen(true); };

    return (
        <div className="bg-white p-6 rounded-lg shadow">
            <button onClick={handleAdd} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg mb-4 hover:bg-green-700">Add New Item</button>
            <div className="space-y-2">
                {menuItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div><p className="font-bold">{item.name}</p><p className="text-sm text-gray-600">${item.price.toFixed(2)}</p></div>
                        <button onClick={() => handleEdit(item)} className="bg-blue-500 text-white font-semibold py-1 px-3 rounded-lg text-sm hover:bg-blue-600">Edit</button>
                    </div>
                ))}
            </div>
            <MenuItemFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} item={editingItem} onSave={onUpdateMenu} onAdd={onAddMenu} onDelete={onDeleteMenu} />
        </div>
    );
};

// --- UserManagement ---
const UserManagement = () => {
    const [users, setUsers] = useState<User[]>(getAllUsers());
    const handlePointsChange = (email: string, newPoints: number) => {
        if (isNaN(newPoints) || newPoints < 0) return;
        const newUsers = users.map(u => u.email === email ? {...u, spudPoints: newPoints} : u);
        setUsers(newUsers);
        localStorage.setItem('users', JSON.stringify(newUsers));
    };
    return (
         <div className="bg-white p-6 rounded-lg shadow">
             {users.map(user => (
                <div key={user.email} className="flex items-center justify-between p-2 border rounded-md mb-2">
                    <div><p className="font-bold">{user.name}</p><p className="text-sm text-gray-500">{user.email}</p></div>
                    <div className="flex items-center gap-2"><label className="text-sm font-semibold">Points:</label><input type="number" value={user.spudPoints} onChange={(e) => handlePointsChange(user.email, parseInt(e.target.value, 10))} className="p-1 border rounded w-20" /></div>
                </div>
             ))}
         </div>
    );
};

// --- PromotionsManagement ---
const PromotionsManagement: React.FC<{ promoCodes: PromoCode[], onUpdate: (codes: PromoCode[]) => void }> = ({ promoCodes, onUpdate }) => {
    const [newCode, setNewCode] = useState('');
    const [newDiscount, setNewDiscount] = useState(10);
    const handleAdd = () => {
        if (!newCode.trim()) return;
        const newPromo: PromoCode = { code: newCode.trim().toUpperCase(), discountPercentage: newDiscount, isActive: true };
        onUpdate([...promoCodes, newPromo]);
        setNewCode('');
    };
    const handleDelete = (code: string) => onUpdate(promoCodes.filter(p => p.code !== code));
    const handleToggle = (code: string) => onUpdate(promoCodes.map(p => p.code === code ? {...p, isActive: !p.isActive} : p));

    return (
        <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-bold mb-4">Add Promo Code</h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-grow"><label className="block text-sm font-semibold">Code</label><input value={newCode} onChange={e => setNewCode(e.target.value)} className="p-2 border rounded w-full" /></div>
                    <div><label className="block text-sm font-semibold">Discount %</label><input type="number" value={newDiscount} onChange={e => setNewDiscount(Number(e.target.value))} className="p-2 border rounded w-24" /></div>
                    <button onClick={handleAdd} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 h-10">Add</button>
                </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
                {promoCodes.map(p => <div key={p.code} className="flex items-center justify-between p-2 border rounded-md mb-2"><div><p className="font-bold">{p.code} <span className="font-normal text-sm">({p.discountPercentage}%)</span></p><p className={`text-xs font-semibold ${p.isActive ? 'text-green-600' : 'text-red-600'}`}>{p.isActive ? 'Active' : 'Inactive'}</p></div><div className="space-x-2"><button onClick={() => handleToggle(p.code)} className="text-xs bg-gray-200 px-2 py-1 rounded">Toggle</button><button onClick={() => handleDelete(p.code)} className="text-xs bg-red-200 px-2 py-1 rounded">Delete</button></div></div>)}
            </div>
        </div>
    );
};

// --- SiteSettings ---
const SiteSettings: React.FC<{ dailySpecial: DailySpecial, onUpdateSpecial: (s: DailySpecial) => void, menuItems: MenuItem[] }> = ({ dailySpecial, onUpdateSpecial, menuItems }) => {
    const [special, setSpecial] = useState(dailySpecial);
    const handleSave = () => onUpdateSpecial(special);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSpecial(prev => ({...prev, [name]: name === 'itemId' || name === 'specialPrice' ? Number(value) : value }));
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h3 className="text-lg font-bold">Daily Special</h3>
            <label className="block"><span className="font-semibold">Item</span><select name="itemId" value={special.itemId} onChange={handleChange} className="p-2 border rounded bg-white w-full mt-1">{menuItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
            <label className="block"><span className="font-semibold">Special Price</span><input name="specialPrice" type="number" value={special.specialPrice} onChange={handleChange} className="p-2 border rounded w-full mt-1" /></label>
            <label className="block"><span className="font-semibold">Description</span><textarea name="description" value={special.description} onChange={handleChange} className="p-2 border rounded w-full mt-1" rows={2}></textarea></label>
            <button onClick={handleSave} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700">Save Special</button>
        </div>
    );
};

// --- MAIN COMPONENT ---
interface AdminDashboardProps {
    onNavigateToMenu: () => void;
    menuItems: MenuItem[];
    onUpdateMenu: (item: MenuItem) => void;
    onAddMenu: (item: Omit<MenuItem, 'id' | 'reviews' | 'averageRating' | 'reviewCount'>) => void;
    onDeleteMenu: (itemId: number) => void;
    promoCodes: PromoCode[];
    onUpdatePromoCodes: (codes: PromoCode[]) => void;
    dailySpecial: DailySpecial;
    onUpdateDailySpecial: (special: DailySpecial) => void;
}

export default function AdminDashboard(props: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
    
    const tabs: { id: AdminTab; label: string; icon: React.ReactElement }[] = [
        { id: 'analytics', label: 'Analytics', icon: <ChartIcon /> },
        { id: 'orders', label: 'All Orders', icon: <OrdersIcon /> },
        { id: 'kitchen', label: 'Kitchen Display', icon: <KitchenIcon /> },
        { id: 'menu', label: 'Menu Management', icon: <MenuIcon /> },
        { id: 'users', label: 'User Management', icon: <UsersIcon /> },
        { id: 'promos', label: 'Promotions', icon: <PromosIcon /> },
        { id: 'settings', label: 'Site Settings', icon: <SettingsIcon /> },
    ];

    const { onNavigateToMenu, menuItems, onUpdateMenu, onAddMenu, onDeleteMenu, promoCodes, onUpdatePromoCodes, dailySpecial, onUpdateDailySpecial } = props;

    return (
        <div className="container mx-auto px-4 py-8">
            <button onClick={onNavigateToMenu} className="text-orange-600 hover:underline font-semibold mb-6">
                &larr; Back to Menu
            </button>
            <h1 className="text-4xl font-bold text-orange-600 mb-8">Admin Dashboard</h1>

            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <nav className="flex flex-col space-y-2">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center p-3 text-left font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-orange-500 text-white shadow' : 'hover:bg-gray-200'}`}>{tab.icon} {tab.label}</button>
                        ))}
                    </nav>
                </aside>
                <main className="flex-1">
                    {activeTab === 'analytics' && <AnalyticsDashboard />}
                    {activeTab === 'orders' && <OrderManagement />}
                    {activeTab === 'kitchen' && <KitchenDisplay />}
                    {activeTab === 'menu' && <MenuManagement menuItems={menuItems} onUpdateMenu={onUpdateMenu} onAddMenu={onAddMenu} onDeleteMenu={onDeleteMenu} />}
                    {activeTab === 'users' && <UserManagement />}
                    {activeTab === 'promos' && <PromotionsManagement promoCodes={promoCodes} onUpdate={onUpdatePromoCodes} />}
                    {activeTab === 'settings' && <SiteSettings dailySpecial={dailySpecial} onUpdateSpecial={onUpdateDailySpecial} menuItems={menuItems} />}
                </main>
            </div>
        </div>
    );
}