import { Link } from "react-router-dom";
import Card from "../Card";

const AuthShell = ({ title, subtitle, children, footerLinks = [] }) => {
  return (
    <div className="mx-auto max-w-md">
      <Card title={title}>
        {subtitle && <p className="mb-4 text-sm text-slate-600">{subtitle}</p>}
        {children}
        {footerLinks.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            {footerLinks.map((link) => (
              <Link key={link.to} className="text-blue-700 hover:text-blue-800" to={link.to}>
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuthShell;
