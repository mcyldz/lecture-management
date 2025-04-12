import { useEffect, useState } from "react";
import { Container, Row, Col, Table, Pagination, Form, Button, Alert, Modal, Card, Badge } from "react-bootstrap";

export default function User() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState({
        identityNo: '',
        name: '',
        surname: '',
        gender: '',
        role: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [pageItems, setPageItems] = useState([]);
    const [errorMessage, setErrorMessage] = useState(null);
    const [show, setShow] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const handleShow = () => setShow(true);
    const handleClose = () => setShow(false);
    const handleShowForm = () => setShowForm(true);
    const handleCloseForm = () => setShowForm(false);

    const styles = {
        cardHeader: {
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e3e6f0'
        },
        actionButton: {
            marginRight: '0.5rem'
        },
        table: {
            fontSize: '0.9rem',
            boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)'
        },
        badge: {
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.35em 0.65em'
        },
        headerTitle: {
            color: '#4e73df',
            fontWeight: 700,
            fontSize: '1.75rem',
            marginBottom: '1.5rem'
        },
        formLabel: {
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '0.5rem'
        }
    };

    useEffect(() => {
        loadUsers();
    }, [currentPage]);

    function loadUsers() {
        fetch(`http://localhost:8080/api/users?page=${currentPage - 1}`)
            .then(res => res.json())
            .then((result) => {
                setUsers(result.content);
                let items = [];
                for (let index = 1; index <= result.totalPages; index++) {
                    items.push(
                        <Pagination.Item key={index} active={currentPage === index} onClick={() => setCurrentPage(index)} >
                            {index}
                        </Pagination.Item>
                    );
                    setPageItems(items);
                }
            });
    }

    function clearForm() {
        setSelectedUser({
            identityNo: '',
            name: '',
            surname: '',
            gender: '',
            role: ''
        });
    }

    function isNotClear() {
        return (
            selectedUser.identityNo !== '' ||
            selectedUser.name !== '' ||
            selectedUser.surname !== '' ||
            selectedUser.gender !== '' ||
            selectedUser.role !== ''
        );
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setSelectedUser({ ...selectedUser, [name]: value });
    }

    function saveUser() {
        fetch('http://localhost:8080/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(selectedUser)
        }).then((res) => res.json())
            .then((result) => {
                if (result.errorMessage) {
                    setErrorMessage(result.errorMessage);
                } else {
                    loadUsers();
                    clearForm();
                    setErrorMessage(null);
                    handleCloseForm();
                }
            });
    }

    function deleteUser() {
        fetch(`http://localhost:8080/api/users/${selectedUser.id}`, {
            method: 'DELETE'
        }).then(() => {
            loadUsers();
            clearForm();
            handleClose();
        });
    }

    function editUser(user) {
        setSelectedUser(user);
        handleShowForm();
    }

    function getRoleBadgeVariant(role) {
        return role === 'TEACHER' ? 'primary' : 'success';
    }

    function getGenderBadgeVariant(gender) {
        return gender === 'MALE' ? 'secondary' : 'danger';
    }

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={styles.headerTitle}>User Management</h2>
                <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                        clearForm();
                        handleShowForm();
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New User
                </Button>
            </div>

            <Card style={styles.table} className="mb-4">
                <Card.Header style={styles.cardHeader} className="py-3">
                    <h6 className="m-0 font-weight-bold">Users List</h6>
                </Card.Header>
                <Card.Body>
                    <div className="table-responsive">
                        <Table hover bordered className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Identity No</th>
                                    <th>Name</th>
                                    <th>Surname</th>
                                    <th>Gender</th>
                                    <th>Role</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.identityNo}</td>
                                        <td>{user.name}</td>
                                        <td>{user.surname}</td>
                                        <td>
                                            <Badge
                                                bg={getGenderBadgeVariant(user.gender)}
                                                style={styles.badge}
                                                pill
                                            >
                                                {user.gender}
                                            </Badge>
                                        </td>
                                        <td>
                                            <Badge
                                                bg={getRoleBadgeVariant(user.role)}
                                                style={styles.badge}
                                                pill
                                            >
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="text-center">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                style={styles.actionButton}
                                                onClick={() => editUser(user)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    handleShow();
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                    {pageItems.length > 1 && (
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination size="sm">{pageItems}</Pagination>
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal
                show={showForm}
                onHide={handleCloseForm}
                centered
                backdrop="static"
                size="lg"
            >
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>{selectedUser.id ? 'Edit User' : 'Create New User'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {errorMessage && (
                        <Alert variant="danger" className="mb-4">
                            {errorMessage}
                        </Alert>
                    )}
                    <Form>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="identityNo">
                                    <Form.Label style={styles.formLabel}>Identity No</Form.Label>
                                    <Form.Control
                                        type='text'
                                        autoComplete='off'
                                        placeholder='Enter identity number'
                                        name='identityNo'
                                        maxLength={'11'}
                                        value={selectedUser.identityNo}
                                        onChange={(e) => handleInputChange(e)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="name">
                                    <Form.Label style={styles.formLabel}>Name</Form.Label>
                                    <Form.Control
                                        type='text'
                                        autoComplete='off'
                                        placeholder='Enter name'
                                        name='name'
                                        value={selectedUser.name}
                                        onChange={(e) => handleInputChange(e)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="surname">
                                    <Form.Label style={styles.formLabel}>Surname</Form.Label>
                                    <Form.Control
                                        type='text'
                                        autoComplete='off'
                                        placeholder='Enter surname'
                                        name='surname'
                                        value={selectedUser.surname}
                                        onChange={(e) => handleInputChange(e)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="gender">
                                    <Form.Label style={styles.formLabel}>Gender</Form.Label>
                                    <Form.Select
                                        aria-label="Please select gender"
                                        value={selectedUser.gender}
                                        name='gender'
                                        onChange={(e) => handleInputChange(e)}
                                    >
                                        <option value=''>Please select gender</option>
                                        <option value='MALE'>Male</option>
                                        <option value='FEMALE'>Female</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3" controlId="role">
                            <Form.Label style={styles.formLabel}>Role</Form.Label>
                            <Form.Select
                                aria-label="Please select role"
                                value={selectedUser.role}
                                name='role'
                                onChange={(e) => handleInputChange(e)}
                            >
                                <option value=''>Please select role</option>
                                <option value='STUDENT'>Student</option>
                                <option value='TEACHER'>Teacher</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseForm}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={saveUser}
                        disabled={!isNotClear()}
                    >
                        {selectedUser.id ? 'Update' : 'Create'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={show} onHide={handleClose} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this user?
                    <div className="alert alert-warning mt-3">
                        <strong>Warning:</strong> This action cannot be undone.
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={deleteUser}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}