const Card = ({ title, children, rightNode }) => {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
