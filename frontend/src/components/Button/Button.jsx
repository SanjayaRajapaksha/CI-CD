export default function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
    >
      {children}
    </button>
  );
}
