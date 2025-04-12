import React from "react";
import { Container, Navbar, Nav } from "react-bootstrap";
import { Outlet, NavLink } from "react-router-dom";

const styles = {
    navbar: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        backgroundColor: '#ffffff'
    },
    brand: {
        fontWeight: 700,
        color: '#3c6eb7',
        fontSize: '1.25rem'
    },
    navLink: {
        fontSize: '0.95rem',
        padding: '0.5rem 1rem',
        fontWeight: 500,
        color: '#495057'
    },
    activeLink: {
        color: '#3c6eb7',
        fontWeight: 600,
        borderBottom: '2px solid #3c6eb7'
    },
    footer: {
        marginTop: 'auto',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e9ecef',
        padding: '1rem 0'
    },
    mainContainer: {
        minHeight: 'calc(100vh - 140px)',
        paddingTop: '2rem',
        paddingBottom: '2rem'
    }
};

export default function Layout() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar expand="lg" style={styles.navbar} className="py-2">
                <Container>
                    <Navbar.Brand href="/" style={styles.brand}>
                        Lecture Management
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <Nav.Item>
                                <NavLink
                                    to="/"
                                    style={styles.navLink}
                                    className={({ isActive }) =>
                                        isActive ? 'nav-link active' : 'nav-link'
                                    }
                                >
                                    Users
                                </NavLink>
                            </Nav.Item>
                            <Nav.Item>
                                <NavLink
                                    to="/lectures"
                                    style={styles.navLink}
                                    className={({ isActive }) =>
                                        isActive ? 'nav-link active' : 'nav-link'
                                    }
                                >
                                    Lectures
                                </NavLink>
                            </Nav.Item>
                        </Nav>

                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container style={styles.mainContainer}>
                <Outlet />
            </Container>

            <footer style={styles.footer}>
                <Container>
                    <p className="text-center text-muted mb-0">
                        Lecture Management System © {new Date().getFullYear()}
                    </p>
                </Container>
            </footer>
        </div>
    );
}