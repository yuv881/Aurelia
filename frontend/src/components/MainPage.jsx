import Navbar from './shared/Navbar/Navbar';
import Footer from './shared/Footer/Footer';
import { Outlet } from 'react-router-dom';

const MainPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 mt-8 grow w-full">
                <Outlet />
            </main>
            {Footer && <Footer />}
        </div>
    );
};

export default MainPage;
