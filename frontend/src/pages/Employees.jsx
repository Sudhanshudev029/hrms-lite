import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Trash2, Users, Building2, AlertTriangle } from 'lucide-react'
import { getEmployees, createEmployee, deleteEmployee } from '../api/employees'
import { LoadingSpinner, InlineSpinner } from '../components/common/LoadingSpinner'
import EmptyState from '../components/common/EmptyState'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import { useToast } from '../hooks/useToast'
import ToastContainer from '../components/common/Toast'
import styles from './Employees.module.css'

const DEPARTMENTS = [
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Human Resources',
  'Finance',
  'Operations',
  'Legal',
  'Customer Support',
]

const INITIAL_FORM = { employee_id: '', full_name: '', email: '', department: '' }

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function Employees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [targetEmployee, setTargetEmployee] = useState(null)
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const fetchEmployees = () => {
    setLoading(true)
    getEmployees()
      .then(setEmployees)
      .catch(() => addToast('Failed to load employees.', 'error'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase()
    if (!q) return employees
    return employees.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        e.employee_id.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    )
  }, [employees, searchTerm])

  const validate = () => {
    const errs = {}
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required'
    if (!form.full_name.trim()) errs.full_name = 'Full name is required'
    if (!form.email.trim()) {
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address'
    }
    if (!form.department) errs.department = 'Department is required'
    return errs
  }

  const handleAddSubmit = async () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setSubmitting(true)
    try {
      await createEmployee(form)
      addToast(`${form.full_name} added successfully.`, 'success')
      setIsAddOpen(false)
      setForm(INITIAL_FORM)
      setErrors({})
      fetchEmployees()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setDeleting(true)
    try {
      await deleteEmployee(targetEmployee.id)
      addToast(`${targetEmployee.full_name} has been removed.`, 'success')
      setIsDeleteOpen(false)
      setTargetEmployee(null)
      fetchEmployees()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleCloseAdd = () => {
    setIsAddOpen(false)
    setForm(INITIAL_FORM)
    setErrors({})
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Employees</h1>
            <p className={styles.pageSubtitle}>Manage your organisation&apos;s employee records</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus size={16} />
            Add Employee
          </Button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by name, ID, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.card}>
          {loading ? (
            <LoadingSpinner text="Loading employees..." />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={Users}
              title={searchTerm ? 'No results found' : 'No employees yet'}
              description={
                searchTerm
                  ? `No employees match "${searchTerm}". Try a different search.`
                  : 'Add your first employee to get started with HRMS Lite.'
              }
              action={
                !searchTerm && (
                  <Button onClick={() => setIsAddOpen(true)}>
                    <Plus size={15} />
                    Add Employee
                  </Button>
                )
              }
            />
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div className={styles.empName}>{emp.full_name}</div>
                      <div className={styles.empId}>{emp.employee_id}</div>
                    </td>
                    <td>
                      <span className={styles.email}>{emp.email}</span>
                    </td>
                    <td>
                      <span className={styles.dept}>
                        <Building2 size={11} />
                        {emp.department}
                      </span>
                    </td>
                    <td>
                      <span className={styles.dateText}>{formatDate(emp.created_at)}</span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => {
                            setTargetEmployee(emp)
                            setIsDeleteOpen(true)
                          }}
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={handleCloseAdd}
        title="Add New Employee"
        subtitle="Fill in the details to register a new employee"
        footer={
          <>
            <Button variant="ghost" onClick={handleCloseAdd} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={submitting}>
              {submitting ? <InlineSpinner /> : <Plus size={15} />}
              {submitting ? 'Saving...' : 'Add Employee'}
            </Button>
          </>
        }
      >
        <div className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Employee ID <span className={styles.required}>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.employee_id ? styles.hasError : ''}`}
                placeholder="e.g. EMP001"
                value={form.employee_id}
                onChange={(e) => handleFormChange('employee_id', e.target.value)}
              />
              {errors.employee_id && (
                <span className={styles.errorMsg}>{errors.employee_id}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Full Name <span className={styles.required}>*</span>
              </label>
              <input
                className={`${styles.input} ${errors.full_name ? styles.hasError : ''}`}
                placeholder="e.g. John Smith"
                value={form.full_name}
                onChange={(e) => handleFormChange('full_name', e.target.value)}
              />
              {errors.full_name && (
                <span className={styles.errorMsg}>{errors.full_name}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Email Address <span className={styles.required}>*</span>
            </label>
            <input
              className={`${styles.input} ${errors.email ? styles.hasError : ''}`}
              type="email"
              placeholder="e.g. john@company.com"
              value={form.email}
              onChange={(e) => handleFormChange('email', e.target.value)}
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Department <span className={styles.required}>*</span>
            </label>
            <select
              className={`${styles.select} ${errors.department ? styles.hasError : ''}`}
              value={form.department}
              onChange={(e) => handleFormChange('department', e.target.value)}
            >
              <option value="">Select a department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            {errors.department && (
              <span className={styles.errorMsg}>{errors.department}</span>
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => {
          if (!deleting) {
            setIsDeleteOpen(false)
            setTargetEmployee(null)
          }
        }}
        title="Remove Employee"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteOpen(false)
                setTargetEmployee(null)
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? <InlineSpinner /> : <Trash2 size={14} />}
              {deleting ? 'Removing...' : 'Yes, Remove'}
            </Button>
          </>
        }
      >
        <div className={styles.confirmContent}>
          <p className={styles.confirmText}>
            Are you sure you want to remove{' '}
            <span className={styles.confirmName}>{targetEmployee?.full_name}</span>?
          </p>
          <div className={styles.warningBox}>
            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>
              This will permanently delete the employee along with all their attendance records.
              This action cannot be undone.
            </span>
          </div>
        </div>
      </Modal>
    </>
  )
}
