export default function Input({ type = "text", ...props }) {
  return (
    <input
      type={type}
      className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      {...props}
    />
  );
}
