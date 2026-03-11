import { useState, useEffect } from 'react'
import { Users, UserCheck, UserX, Clock, Building2, CalendarDays } from 'lucide-react'
import { getDashboardStats } from '../api/attendance'
import { getEmployees } from '../api/employees'
import { getAttendance } from '../api/attendance'
import { LoadingSpinner } from '../components/common/LoadingSpinner'
import Badge from '../components/common/Badge'
import styles from './Dashboard.module.css'

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className={styles.statCard}>
      <div className={`${styles.statIconWrap} ${styles[colorClass]}`}>
        <Icon size={20} />
      </div>
      <div className={styles.statInfo}>
        <div className={styles.statValue}>{value}</div>
        <div className={styles.statLabel}>{label}</div>
      </div>
    </div>
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [employees, setEmployees] = useState([])
  const [todayAttendance, setTodayAttendance] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    Promise.all([getDashboardStats(), getEmployees(), getAttendance({ date: today })])
      .then(([statsData, empData, attData]) => {
        setStats(statsData)
        setEmployees(empData)
        setTodayAttendance(attData)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner text="Loading dashboard..." />

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <p className={styles.pageSubtitle}>{getTodayLabel()}</p>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon={Users}
          label="Total Employees"
          value={stats?.total_employees ?? 0}
          colorClass="indigo"
        />
        <StatCard
          icon={UserCheck}
          label="Present Today"
          value={stats?.present_today ?? 0}
          colorClass="green"
        />
        <StatCard
          icon={UserX}
          label="Absent Today"
          value={stats?.absent_today ?? 0}
          colorClass="red"
        />
        <StatCard
          icon={Clock}
          label="Not Marked"
          value={stats?.not_marked_today ?? 0}
          colorClass="amber"
        />
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Recent Employees</span>
            <span className={styles.cardCount}>{employees.length} total</span>
          </div>
          {employees.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No employees added yet.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {employees.slice(0, 6).map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className={styles.empName}>{emp.full_name}</div>
                      <div className={styles.empId}>{emp.employee_id}</div>
                    </td>
                    <td>
                      <span className={styles.dept}>
                        <Building2 size={11} />
                        {emp.department}
                      </span>
                    </td>
                    <td>{formatDate(emp.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Today&apos;s Attendance</span>
            <span className={styles.cardCount}>{todayAttendance.length} marked</span>
          </div>
          {todayAttendance.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
              No attendance marked for today.
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAttendance.slice(0, 6).map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className={styles.empName}>{record.employee.full_name}</div>
                      <div className={styles.empId}>{record.employee.employee_id}</div>
                    </td>
                    <td>
                      <span className={styles.dept}>
                        <Building2 size={11} />
                        {record.employee.department}
                      </span>
                    </td>
                    <td>
                      <Badge variant={record.status === 'Present' ? 'present' : 'absent'}>
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
