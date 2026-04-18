const Footer = () => (
  <footer className="bg-dark text-gray-400 text-sm py-8 mt-auto">
    <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      <p>💍 <span className="text-secondary font-semibold">WeddingLawn</span> — Book your perfect venue</p>
      <p>© {new Date().getFullYear()} WeddingLawn. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
