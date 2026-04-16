const Card = ({ title, children, rightNode, className = "" }) => {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {(title || rightNode) && (
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          {rightNode}
        </header>
      )}
      {children}
    </section>
  );
};

export default Card;
