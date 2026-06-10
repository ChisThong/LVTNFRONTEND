import { Outlet } from 'react-router-dom';
import AdminNavbar from '../../components/AdminNavbar';
import '../../styles/navbar-admin.css';

function Admin() {
    return (
        <div className="admin-wrapper">
            <AdminNavbar />
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}

export default Admin;
