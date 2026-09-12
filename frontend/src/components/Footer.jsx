import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-ink/10 mt-16 py-6 text-center font-body text-sm text-ink/50">
    <Link to="/contact" className="hover:text-violet">
      Contact us
    </Link>
    <span className="mx-2">·</span>
    <span>ArtieLand — made for artists</span>
  </footer>
);

export default Footer;
