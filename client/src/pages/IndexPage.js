import React, { useState } from 'react';
import { Container, Row, Col, Button, Card, Navbar, Nav, ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import './IndexPage.css';
import logo from '../assets/logo.png';

const IndexPage = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');

  const handleLogin = () => {
    navigate('/login');
  };

  const toggleTheme = (val) => {
    setTheme(val);
    document.body.setAttribute('data-theme', val);
  };

  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg={theme === 'light' ? 'light' : 'dark'} variant={theme}>
        <Container>
          <Navbar.Brand className="fw-bold">
            <img
              src={logo}
              alt="Logo"
              height="40"
              className="d-inline-block align-top me-2"
            />
            Mess Management System
          </Navbar.Brand>
          <Nav className="ms-auto">
            <ToggleButtonGroup type="radio" name="theme" value={theme} onChange={toggleTheme}>
              <ToggleButton id="light" value="light" variant="outline-secondary" size="sm">
                ☀ Light
              </ToggleButton>
              <ToggleButton id="dark" value="dark" variant="outline-secondary" size="sm">
                🌙 Dark
              </ToggleButton>
            </ToggleButtonGroup>
          </Nav>
        </Container>
      </Navbar>

      {/* Main Section */}
      <div className="hero-section d-flex align-items-center justify-content-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={8} lg={6}>
              <Card className={`text-center p-4 shadow ${theme === 'dark' ? 'bg-dark text-white' : ''}`}>
                <Card.Body>
                  <h1 className="mb-3 fw-bold">Welcome to B.T Mens' Hostel</h1>
                  <p className="mb-4">
                    A centralized system to manage daily meals, guests, expenses, and residents.
                  </p>
                  <Button variant="primary" size="lg" className="rounded-pill px-5" onClick={handleLogin}>
                    Login
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* About Section */}
      <Container className="my-5">
        <Row className="text-center">
          <Col>
            <h2>Why use our system?</h2>
            <p className="text-muted">
              Reduce paper work, track meals, monitor costs, and enhance hostel mess operations—all digitally.
            </p>
          </Col>
        </Row>
      </Container>

      {/* Footer */}
      <footer className="text-center py-3 border-top">
        <small>&copy; {new Date().getFullYear()} Mess Management System. All rights reserved.</small>
      </footer>
    </>
  );
};

export default IndexPage;
