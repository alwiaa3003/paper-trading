const Loader = ({ label = 'Loading' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-mist">
    <div className="h-8 w-8 rounded-full border-2 border-line border-t-accent animate-spin" />
    <span className="label-eyebrow">{label}…</span>
  </div>
);

export default Loader;
