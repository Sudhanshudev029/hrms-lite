import { useState, useEffect, useCallback } from 'react'
import { CalendarCheck2, Building2, CheckCircle, XCircle } from 'lucide-react'
import { getAttendance, markAttendance } from '../api/attendance'
import { getEmployees } from '../api/employees'
import { LoadingSpinner, InlineSpinner } from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Badge from '../components/common/Badge'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/common/Toast'
import styles from './Attendance.module.css'

const today = () => new Date().toISOString().split('T')[0]

function formatDate(dateStr) {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Attendance() {
  const [employees, setEmployees] = useState([])
  const [records, setRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ employee_id: '', date: today(), status: 'Present' })
  const [formErrors, setFormErrors] = useState({})
  const [filters, setFilters] = useState({ employee_id: '', start_date: '', end_date: '', status: '' })
  const { toasts, addToast, removeToast } = useToast()

  const fetchRecords = useCallback(() => {
    setLoadingRecords(true)
    const params = {}
    if (filters.employee_id) params.employee_id = filters.employee_id
    if (filters.start_date) params.start_date = filters.start_date
    if (filters.end_date) params.end_date = filters.end_date
    if (filters.status) params.status = filters.status
    getAttendance(params)
      .then(setRecords)
      .catch(() => addToast('Failed to load attendance records.', 'error'))
      .finally(() => setLoadingRecords(false))
  }, [filters])

  useEffect(() => {
    getEmployees().then(setEmployees).catch(() => {})
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  const validateForm = () => {
    const errs = {}
    if (!form.employee_id) errs.employee_id = 'Please select an employee'
    if (!form.date) errs.date = 'Date is required'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validateForm()
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      await markAttendance({
        employee_id: Number(form.employee_id),
        date: form.date,
        status: form.status,
      })
      const emp = employees.find((e) => e.id === Number(form.employee_id))
      addToast(
        `Attendance marked for ${emp?.full_name ?? 'employee'} — ${form.status}`,
        'success'
      )
      setForm((prev) => ({ ...prev, employee_id: '', date: today() }))
      setFormErrors({})
      fetchRecords()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const hasFilters = filters.employee_id || filters.start_date || filters.end_date || filters.status

  const clearFilters = () =>
    setFilters({ employee_id: '', start_date: '', end_date: '', status: '' })

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Attendance</h1>
          <p className={styles.pageSubtitle}>Mark and review daily attendance records</p>
        </div>

        <div className={styles.layout}>
          {/* Mark Attendance Form */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardTitle}>Mark Attendance</div>
              <div className={styles.cardSubtitle}>Record attendance for an employee</div>
            </div>
            <div className={styles.cardBody}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Employee <span className={styles.required}>*</span>
                  </label>
                  <select
                    className={styles.select}
                    value={form.employee_id}
                    onChange={(e) => {
                      setForm((p) => ({ ...p, employee_id: e.target.value }))
                      if (formErrors.employee_id)
                        setFormErrors((p) => ({ ...p, employee_id: '' }))
                    }}
                    style={formErrors.employee_id ? { borderColor: '#dc2626' } : {}}
                  >
                    <option value="">Select employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_id})
                      </option>
                    ))}
                  </select>
                  {formErrors.employee_id && (
                    <span style={{ fontSize: '12px', color: '#dc2626' }}>
                      {formErrors.employee_id}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Date <span className={styles.required}>*</span>
                  </label>
                  <input
                    className={styles.input}
                    type="date"
                    value={form.date}
                    max={today()}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Status</label>
                  <div className={styles.statusRow}>
                    <label className={styles.statusOption}>
                      <input
                        type="radio"
                        name="status"
                        value="Present"
                        checked={form.status === 'Present'}
                        onChange={() => setForm((p) => ({ ...p, status: 'Present' }))}
                      />
                      <span className={`${styles.statusLabel} ${styles.present}`}>
                        <CheckCircle size={15} />
                        Present
                      </span>
                    </label>
                    <label className={styles.statusOption}>
                      <input
                        type="radio"
                        name="status"
                        value="Absent"
                        checked={form.status === 'Absent'}
                        onChange={() => setForm((p) => ({ ...p, status: 'Absent' }))}
                      />
                      <span className={`${styles.statusLabel} ${styles.absent}`}>
                        <XCircle size={15} />
                        Absent
                      </span>
                    </label>
                  </div>
                </div>

                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? <InlineSpinner /> : <CalendarCheck2 size={16} />}
                  {submitting ? 'Saving...' : 'Mark Attendance'}
                </button>
              </form>
            </div>
          </div>

          {/* Attendance Records */}
          <div className={styles.card}>
            <div className={styles.recordsHeader}>
              <div>
                <div className={styles.cardTitle}>Attendance Records</div>
              </div>
              <div className={styles.filtersRow}>
                <select
                  className={styles.filterSelect}
                  value={filters.employee_id}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, employee_id: e.target.value }))
                  }
                >
                  <option value="">All Employees</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name}
                    </option>
                  ))}
                </select>

                <select
                  className={styles.filterSelect}
                  value={filters.status}
                  onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>

                <input
                  className={styles.filterInput}
                  type="date"
                  value={filters.start_date}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, start_date: e.target.value }))
                  }
                  title="From date"
                />
                <input
                  className={styles.filterInput}
                  type="date"
                  value={filters.end_date}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, end_date: e.target.value }))
                  }
                  title="To date"
                />

                {hasFilters && (
                  <button className={styles.clearBtn} onClick={clearFilters}>
                    Clear
                  </button>
                )}
                <span className={styles.recordCount}>{records.length} records</span>
              </div>
            </div>

            {loadingRecords ? (
              <LoadingSpinner text="Loading records..." />
            ) : records.length === 0 ? (
              <EmptyState
                icon={CalendarCheck2}
                title="No records found"
                description={
                  hasFilters
                    ? 'No attendance records match the selected filters.'
                    : 'Start marking attendance to see records here.'
                }
              />
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Department</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
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
                        <span className={styles.dateCell}>{formatDate(record.date)}</span>
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
    </>
  )
}
