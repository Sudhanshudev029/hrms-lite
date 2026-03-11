import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, CalendarCheck2, Building2 } from 'lucide-react'
import styles from './Sidebar.module.css'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/employees', icon: Users, label: 'Employees' },
  { path: '/attendance', icon: CalendarCheck2, label: 'Attendance' },
]

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandIcon}>
          <Building2 size={18} />
        </div>
        <div className={styles.brandText}>
          <span className={styles.brandName}>HRMS Lite</span>
          <span className={styles.brandSub}>Admin Portal</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <span className={styles.navLabel}>Main Menu</span>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={17} className={styles.navIcon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.footerAdmin}>
          <div className={styles.footerAvatar}>A</div>
          <div className={styles.footerInfo}>
            <span className={styles.footerName}>Administrator</span>
            <span className={styles.footerRole}>Super Admin</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
