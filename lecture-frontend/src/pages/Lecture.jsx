import { useEffect, useState } from "react";
import { Row, Col, Pagination, Form, Button, Alert, Modal, Card, ListGroup, Accordion } from "react-bootstrap";

export default function Lecture() {
    const [lectures, setLectures] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageItems, setPageItems] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [lectureStudents, setLectureStudents] = useState([]);
    const [allStudents, setAllStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState({
        name: '',
        teacherId: 0,
        teacher: {},
        students: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const styles = {
        cardHeader: {
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #e3e6f0'
        },
        headerTitle: {
            color: '#4e73df',
            fontWeight: 700,
            fontSize: '1.75rem',
            marginBottom: '1.5rem'
        },
        cardTitle: {
            color: '#3a3b45',
            fontWeight: 700,
            fontSize: '1.1rem',
            marginBottom: '0'
        },
        lectureCard: {
            transition: 'all 0.2s',
            marginBottom: '1rem',
            boxShadow: '0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.1)'
        },
        teacherInfo: {
            fontStyle: 'italic',
            color: '#6c757d',
            fontSize: '0.9rem'
        },
        studentCount: {
            backgroundColor: '#e3f2fd',
            color: '#0d6efd',
            fontWeight: 600,
            padding: '0.25em 0.5em',
            borderRadius: '0.25rem'
        },
        studentItem: {
            transition: 'all 0.2s',
            borderLeft: '3px solid transparent',
            backgroundColor: '#fbfbfb'
        }
    };

    useEffect(() => {
        loadAllStudents();
    }, []);

    useEffect(() => {
        loadLectures();
        loadTeachers();
    }, [currentPage]);

    function loadAllStudents() {
        fetch(`http://localhost:8080/api/users/by-role?role=STUDENT`)
            .then(res => res.json())
            .then(result => {
                setAllStudents(Array.isArray(result) ? result : []);
            })
            .catch(err => {
                console.error("Error loading all students:", err);
            });
    }

    function loadLectureStudents(lecture) {
        setIsLoading(true);
        setError(null);

        if (allStudents.length === 0) {
            fetch(`http://localhost:8080/api/users/by-role?role=STUDENT`)
                .then(res => res.json())
                .then(result => {
                    const students = Array.isArray(result) ? result : [];
                    setAllStudents(students);

                    const enrolledIds = new Set(lecture.students.map(s => s.id));
                    const potentialStudents = students.filter(s => !enrolledIds.has(s.id));
                    setLectureStudents(potentialStudents);
                    setIsLoading(false);
                })
                .catch(err => {
                    console.error("Error loading students:", err);
                    setLectureStudents([]);
                    setIsLoading(false);
                });
            return;
        }

        const enrolledIds = new Set(lecture.students.map(s => s.id));
        const potentialStudents = allStudents.filter(s => !enrolledIds.has(s.id));
        setLectureStudents(potentialStudents);
        setIsLoading(false);
    }

    function loadLectures() {
        setIsLoading(true);
        fetch(`http://localhost:8080/api/lectures?page=${currentPage - 1}`)
            .then(res => res.json())
            .then((result) => {
                setLectures(result.content);
                let items = [];
                for (let index = 1; index <= result.totalPages; index++) {
                    items.push(
                        <Pagination.Item key={index} active={currentPage === index} onClick={() => setCurrentPage(index)}>
                            {index}
                        </Pagination.Item>
                    );
                    setPageItems(items);
                }
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Error loading lectures:', err);
                setError('Failed to load lectures. Please try again.');
                setIsLoading(false);
            });
    }

    function loadTeachers() {
        fetch(`http://localhost:8080/api/users/by-role?role=TEACHER`)
            .then(res => res.json())
            .then((result) => {
                setTeachers(result);
            })
            .catch(err => {
                console.error('Error loading teachers:', err);
            });
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setSelectedLecture({ ...selectedLecture, [name]: value });
        setLectureStudents([]);
    }

    function createLecture() {
        const lecture = {
            name: selectedLecture.name,
            teacher: {
                id: Number(selectedLecture.teacherId)
            }
        }

        fetch('http://localhost:8080/api/lectures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(lecture)
        }).then((res) => res.json())
            .then((result) => {
                loadLectures();
                clearForm();
                handleCloseModal();
            })
            .catch(err => {
                console.error('Error creating lecture:', err);
                setError('Failed to create lecture. Please try again.');
            });
    }

    function clearForm() {
        setSelectedLecture({
            name: '',
            teacherId: 0,
            teacher: {},
            students: []
        });
        setLectureStudents([]);
        setError(null);
    }

    function addStudent(student) {
        const updatedLecture = {
            ...selectedLecture,
            students: [...selectedLecture.students, student]
        };
        setSelectedLecture(updatedLecture);

        setLectureStudents(lectureStudents.filter(s => s.id !== student.id));

        fetch('http://localhost:8080/api/lectures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(updatedLecture)
        }).then((res) => res.json())
            .then((result) => {
                loadLectures();
                const updatedLecture = result;
                const enrolledIds = new Set(updatedLecture.students.map(s => s.id));
                const potentialStudents = allStudents.filter(s => !enrolledIds.has(s.id));
                setLectureStudents(potentialStudents);
                setSelectedLecture(updatedLecture);
            })
            .catch(err => {
                console.error('Error adding student:', err);
                loadLectureStudents(selectedLecture);
                setSelectedLecture({ ...selectedLecture });
            });
    }

    function setLecture(lecture) {
        setError(null);

        if (lecture.id === selectedLecture.id) {
            clearForm();
        } else {
            lecture.teacherId = lecture.teacher.id;
            setSelectedLecture(lecture);
            loadLectureStudents(lecture);
        }
    }

    function removeStudent(studentId) {
        const removedStudent = selectedLecture.students.find(s => s.id === studentId);

        const updatedStudents = selectedLecture.students.filter(
            (student) => student.id !== studentId
        );

        const updatedLecture = {
            ...selectedLecture,
            students: updatedStudents
        };

        setSelectedLecture(updatedLecture);

        if (removedStudent) {
            setLectureStudents([...lectureStudents, removedStudent]);
        }

        fetch('http://localhost:8080/api/lectures', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            mode: 'cors',
            body: JSON.stringify(updatedLecture)
        }).then((res) => res.json())
            .then((result) => {
                loadLectures();
                const updatedLecture = result;
                const enrolledIds = new Set(updatedLecture.students.map(s => s.id));
                const potentialStudents = allStudents.filter(s => !enrolledIds.has(s.id));
                setLectureStudents(potentialStudents);
                setSelectedLecture(updatedLecture);
            })
            .catch(err => {
                console.error('Error removing student:', err);
                loadLectureStudents(selectedLecture);
                setSelectedLecture({ ...selectedLecture });
            });
    }

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    return (
        <>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={styles.headerTitle}>Lecture Management</h2>
                <Button
                    variant="primary"
                    onClick={() => {
                        clearForm();
                        handleShowModal();
                    }}
                >
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Lecture
                </Button>
            </div>

            {isLoading && lectures.length === 0 ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading data...</p>
                </div>
            ) : (
                <Row>
                    <Col lg={8}>
                        {lectures.length === 0 ? (
                            <Alert variant="info">
                                No lectures found. Click "Add New Lecture" to create one.
                            </Alert>
                        ) : (
                            lectures.map((lecture) => (
                                <Card
                                    key={lecture.id}
                                    style={styles.lectureCard}
                                    className={`mb-3 ${selectedLecture.id === lecture.id ? 'border-primary' : ''}`}
                                >
                                    <Card.Header
                                        style={styles.cardHeader}
                                        className={`d-flex justify-content-between align-items-center ${selectedLecture.id === lecture.id ? 'bg-primary text-white' : ''}`}
                                    >
                                        <div>
                                            <h5 style={selectedLecture.id === lecture.id ? { ...styles.cardTitle, color: 'white' } : styles.cardTitle}>
                                                {lecture.name}
                                            </h5>
                                            <div style={selectedLecture.id === lecture.id ? { ...styles.teacherInfo, color: 'rgba(255,255,255,0.8)' } : styles.teacherInfo}>
                                                Teacher: {lecture.teacher.name} {lecture.teacher.surname}
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <span
                                                style={selectedLecture.id === lecture.id ? { ...styles.studentCount, backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' } : styles.studentCount}
                                                className="me-3"
                                            >
                                                {lecture.students.length} Students
                                            </span>
                                            <Button
                                                variant={selectedLecture.id === lecture.id ? "outline-light" : "outline-primary"}
                                                size="sm"
                                                onClick={() => setLecture(lecture)}
                                            >
                                                {selectedLecture.id === lecture.id ? 'Close Details' : 'View Details'}
                                            </Button>
                                        </div>
                                    </Card.Header>

                                    {selectedLecture.id === lecture.id && (
                                        <Card.Body>
                                            <Accordion defaultActiveKey="0">
                                                <Accordion.Item eventKey="0">
                                                    <Accordion.Header>Enrolled Students</Accordion.Header>
                                                    <Accordion.Body className="p-0">
                                                        <ListGroup variant="flush">
                                                            {lecture.students.length === 0 ? (
                                                                <ListGroup.Item className="text-center py-4 text-muted">
                                                                    No students enrolled in this lecture yet.
                                                                </ListGroup.Item>
                                                            ) : (
                                                                lecture.students.map((student) => (
                                                                    <ListGroup.Item
                                                                        key={student.id}
                                                                        className="d-flex justify-content-between align-items-center"
                                                                        style={styles.studentItem}
                                                                        onMouseOver={(e) => e.currentTarget.style.borderLeft = '3px solid #4e73df'}
                                                                        onMouseOut={(e) => e.currentTarget.style.borderLeft = '3px solid transparent'}
                                                                    >
                                                                        <div>
                                                                            <div className="fw-bold">{student.name} {student.surname}</div>
                                                                            <div className="text-muted small">{student.identityNo}</div>
                                                                        </div>
                                                                        <Button
                                                                            variant="outline-danger"
                                                                            size="sm"
                                                                            onClick={() => removeStudent(student.id)}
                                                                        >
                                                                            Remove
                                                                        </Button>
                                                                    </ListGroup.Item>
                                                                ))
                                                            )}
                                                        </ListGroup>
                                                    </Accordion.Body>
                                                </Accordion.Item>
                                            </Accordion>
                                        </Card.Body>
                                    )}
                                </Card>
                            ))
                        )}

                        {pageItems.length > 1 && (
                            <div className="d-flex justify-content-center mt-3">
                                <Pagination>{pageItems}</Pagination>
                            </div>
                        )}
                    </Col>

                    <Col lg={4}>
                        {selectedLecture.id ? (
                            <Card className="shadow-sm">
                                <Card.Header style={styles.cardHeader}>
                                    <h5 style={styles.cardTitle}>Add Students to Lecture</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <strong>Lecture:</strong> {selectedLecture.name}
                                    </div>

                                    {isLoading ? (
                                        <div className="text-center py-3">
                                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                <span className="visually-hidden">Loading...</span>
                                            </div>
                                            <p className="mt-2 small">Loading students...</p>
                                        </div>
                                    ) : Array.isArray(lectureStudents) && lectureStudents.length === 0 ? (
                                        <Alert variant="info">
                                            No available students to add.
                                        </Alert>
                                    ) : (
                                        <ListGroup>
                                            {Array.isArray(lectureStudents) && lectureStudents.map((student) => (
                                                <ListGroup.Item
                                                    key={student.id}
                                                    className="d-flex justify-content-between align-items-center"
                                                    style={styles.studentItem}
                                                    onMouseOver={(e) => e.currentTarget.style.borderLeft = '3px solid #4e73df'}
                                                    onMouseOut={(e) => e.currentTarget.style.borderLeft = '3px solid transparent'}
                                                >
                                                    <div>
                                                        <div className="fw-bold">{student.name} {student.surname}</div>
                                                        <div className="text-muted small">{student.identityNo}</div>
                                                    </div>
                                                    <Button
                                                        variant="success"
                                                        size="sm"
                                                        onClick={() => addStudent(student)}
                                                    >
                                                        Add
                                                    </Button>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="shadow-sm">
                                <Card.Header style={styles.cardHeader}>
                                    <h5 style={styles.cardTitle}>Lecture Information</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="text-center py-5">
                                        <div className="mb-3">
                                            <i className="bi bi-info-circle" style={{ fontSize: '2rem', color: '#4e73df' }}></i>
                                        </div>
                                        <h5>Select a lecture to view details</h5>
                                        <p className="text-muted">
                                            You can add students to a lecture by selecting it from the list.
                                        </p>
                                    </div>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            )}

            <Modal
                show={showModal}
                onHide={handleCloseModal}
                centered
            >
                <Modal.Header closeButton className="bg-light">
                    <Modal.Title>Create New Lecture</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="name">
                            <Form.Label className="fw-bold">Lecture Name</Form.Label>
                            <Form.Control
                                type='text'
                                autoComplete='off'
                                placeholder='Enter lecture name'
                                name='name'
                                value={selectedLecture.name}
                                onChange={(e) => handleInputChange(e)}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="teacherId">
                            <Form.Label className="fw-bold">Teacher</Form.Label>
                            <Form.Select
                                aria-label="Please select teacher"
                                name="teacherId"
                                value={Number(selectedLecture.teacherId)}
                                onChange={(e) => handleInputChange(e)}
                            >
                                <option value={0}>Please select teacher</option>
                                {teachers.map((teacher) => (
                                    <option value={teacher.id} key={teacher.id}>
                                        {teacher.name} {teacher.surname}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={createLecture}
                        disabled={!selectedLecture.name || selectedLecture.teacherId === 0}
                    >
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}