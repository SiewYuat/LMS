import './Footer.css'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>📚 Library Management</h3>
            <p>Your digital gateway to knowledge and learning.</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/books">Book Catalog</a></li>
              <li><a href="/login">Login</a></li>
              <li><a href="/register">Register</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact Info</h4>
            <p>📧 Email: library@example.com</p>
            <p>📞 Phone: (65) 123-4567</p>
            <p>📍 Address: 123 Library St, Book City</p>
          </div>
          
          <div className="footer-section">
            <h4>Library Hours</h4>
            <p>Monday - Friday: 9:00 AM - 8:00 PM</p>
            <p>Saturday: 10:00 AM - 6:00 PM</p>
            <p>Sunday: 12:00 PM - 5:00 PM</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} Library Management System. All rights reserved.</p>
          <p>Built with Spring Boot & React</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer