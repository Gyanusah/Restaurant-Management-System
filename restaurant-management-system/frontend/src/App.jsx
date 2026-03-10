import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import HomePage from './pages/HomePage';
import { KitchenPage } from './pages/KitchenPage';
import AdminPage from './pages/AdminPage';
import MenuPage from './pages/MenuPage';
import {Toaster} from 'react-hot-toast'
import KitchenDashboard from './pages/KitchenDashboard';
import AdminDashboard from './pages/AdminDashboard';
import NotFound from './pages/NotFound';
import QRScanner from './components/QRScanner';
import CustomerOrderTracking from './pages/CustomerOrderTracking';
import CustomerOrderHistory from './pages/CustomerOrderHistory';
import CustomerLogin from './pages/CustomerLogin';
import CustomerReview from './pages/CustomerReview';
import MenuItemDetail from './components/MenuItemDetail';
import Footer from './components/Footer';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import MenuItemsManagement from './pages/MenuItemsManagement';
import CategoriesManagement from './pages/CategoriesManagement';
import TablesManagement from './pages/TablesManagement';
import UsersManagement from './pages/UsersManagement';
import ReviewsManagement from './pages/ReviewsManagement';
import QRCodeGenerator from './pages/QRCodeGenerator';
import RawMaterialsManagement from './pages/RawMaterialsManagement';

export default function App() {
    return (
        <BrowserRouter
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
            }}>
            <AuthProvider>
                <div className="min-h-screen flex flex-col">
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/menu" element={<MenuPage />} />
                            <Route path="/menu/item/:id" element={<MenuItemDetail />} />
                            <Route path="/scan" element={<QRScanner />} />
                            <Route path="/table/:tableId" element={<MenuPage />} />
                            <Route path="/order/:orderId/tracking" element={<CustomerOrderTracking />} />
                            <Route path="/customer-login" element={<CustomerLogin />} /> 
                            <Route path="/review/:orderId" element={<CustomerReview />} />
                            <Route path="/my-orders" element={<CustomerOrderHistory />} />

                            {/* Staff login routes */}
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/signup" element={<SignupPage />} />

                            {/* Staff-only routes - customers cannot login */}
                            <Route
                                path="/kitchen"
                                element={
                                    <PrivateRoute requiredRole={['kitchen']}>
                                        <KitchenPage />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/admin"
                                element={
                                    <PrivateRoute requiredRole={['admin', 'manager']}>
                                        <AdminPage />
                                    </PrivateRoute>
                                }
                            />

                            {/* Admin Management Routes */}
                            <Route
                                path="/admin/menu-items"
                                element={
                                    <PrivateRoute requiredRole={['admin']}>
                                        <MenuItemsManagement />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/admin/categories"
                                element={
                                    <PrivateRoute requiredRole={['admin']}>
                                        <CategoriesManagement />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/admin/tables"
                                element={
                                    <PrivateRoute requiredRole={['admin']}>
                                        <TablesManagement />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/admin/users"
                                element={
                                    <PrivateRoute requiredRole={['admin']}>
                                        <UsersManagement />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/admin/reviews"
                                element={
                                    <PrivateRoute requiredRole={['admin']}>
                                        <ReviewsManagement />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/admin/qrcodes"
                                element={
                                    <PrivateRoute requiredRole={['admin']}>
                                        <QRCodeGenerator />
                                    </PrivateRoute>
                                }
                            />

                            <Route
                                path="/admin/raw-materials"
                                element={
                                    <PrivateRoute requiredRole={['admin', 'manager']}>
                                        <RawMaterialsManagement />
                                    </PrivateRoute>
                                }
                            />

                            <Route path="/unauthorized" element={<div className="text-center mt-20 text-2xl">Unauthorized Access</div>} />
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#363636',
                            color: '#fff',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#4ade80',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    );
}
