const Spinner = ({ size = "md", text = "Loading..." }) => {
  const sizes = { sm: "h-5 w-5", md: "h-8 w-8", lg: "h-12 w-12" };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10">
      <div
        className={`${sizes[size]} border-4 border-purple-200 border-t-primary rounded-full animate-spin`}
      />
      {text && <p className="text-gray-500 text-sm">{text}</p>}
    </div>
  );
};

export default Spinner;
