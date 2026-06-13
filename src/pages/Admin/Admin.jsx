import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import '../../styles/navbar-admin.css';

function Admin() {
    return (
        <div className="admin-wrapper">
            <Sidebar role="admin" />
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}

export default Admin;
